import gameReleaseVersions from '~/constants/gameReleaseVersions.json'
import gameReleaseVersionsStrList from '~/constants/gameReleaseVersionsStrList.json'
import JSZip from "jszip";
import yaml from "js-yaml";
import toml from "toml"; 
import { satisfies } from "semver"; // 使用 semver.satisfies 函数检查版本号
import { GameVersion } from '~/constants/types';
import { DBProj } from '~/lib/routes/project/list';

const versionType = (version_number: string) => {
  if (version_number.includes("alpha")) {
    return "alpha";
  } else if (
    version_number.includes("beta") ||
    version_number.match(/[^A-z](rc)[^A-z]/) || // includes `rc`
    version_number.match(/[^A-z](pre)[^A-z]/) // includes `pre`
  ) {
    return "beta";
  } else {
    return "release";
  }
}

export const analyzeMCFile = async (file: File) => {
  const zip = await JSZip.loadAsync(file);
  const manifest = await zip.file("META-INF/MANIFEST.MF")?.async("string");
  return {
    manifest,
  };
};


type Dependency = {
  modId: string;
  versionRange: string;
};
type GetGameVersionsPrams = {
  rangeStr: string;
  gameVersions: string[];
}
const getGameVersionsMatchingMavenRange = ({rangeStr, gameVersions}: GetGameVersionsPrams) => {
  if (!rangeStr) {
    return [];
  }
  const ranges: string[] = [];

  while (rangeStr.startsWith("[") || rangeStr.startsWith("(")) {
    let index = rangeStr.indexOf(")");
    const index2 = rangeStr.indexOf("]");
    if (index === -1 || (index2 !== -1 && index2 < index)) {
      index = index2;
    }
    if (index === -1) break;
    ranges.push(rangeStr.substring(0, index + 1));
    rangeStr = rangeStr.substring(index + 1).trim();
    if (rangeStr.startsWith(",")) {
      rangeStr = rangeStr.substring(1).trim();
    }
  }

  if (rangeStr) {
    ranges.push(rangeStr);
  }

  const LESS_THAN_EQUAL = /^\(,(.*)]$/;
  const LESS_THAN = /^\(,(.*)\)$/;
  const EQUAL = /^\[(.*)]$/;
  const GREATER_THAN_EQUAL = /^\[(.*),\)$/;
  const GREATER_THAN = /^\((.*),\)$/;
  const BETWEEN = /^\((.*),(.*)\)$/;
  const BETWEEN_EQUAL = /^\[(.*),(.*)]$/;
  const BETWEEN_LESS_THAN_EQUAL = /^\((.*),(.*)]$/;
  const BETWEEN_GREATER_THAN_EQUAL = /^\[(.*),(.*)\)$/;

  const semverRanges:string[] = [];

  for (const range of ranges) {
    let result;
    if ((result = range.match(LESS_THAN_EQUAL))) {
      semverRanges.push(`<=${result[1]}`);
    } else if ((result = range.match(LESS_THAN))) {
      semverRanges.push(`<${result[1]}`);
    } else if ((result = range.match(EQUAL))) {
      semverRanges.push(`${result[1]}`);
    } else if ((result = range.match(GREATER_THAN_EQUAL))) {
      semverRanges.push(`>=${result[1]}`);
    } else if ((result = range.match(GREATER_THAN))) {
      semverRanges.push(`>${result[1]}`);
    } else if ((result = range.match(BETWEEN))) {
      semverRanges.push(`>${result[1]} <${result[2]}`);
    } else if ((result = range.match(BETWEEN_EQUAL))) {
      semverRanges.push(`>=${result[1]} <=${result[2]}`);
    } else if ((result = range.match(BETWEEN_LESS_THAN_EQUAL))) {
      semverRanges.push(`>${result[1]} <=${result[2]}`);
    } else if ((result = range.match(BETWEEN_GREATER_THAN_EQUAL))) {
      semverRanges.push(`>=${result[1]} <${result[2]}`);
    }
  }
  return getGameVersionsMatchingSemverRange(semverRanges, gameVersions);
}
const getGameVersionsMatchingSemverRange = (range: string[], gameReleaseVersions: string[]) => {
  if (!range) return [];
  
  const ranges = Array.isArray(range) ? range : [range];
  return gameReleaseVersions.filter((version) => {
    const semverVersion = version.split(".").length === 2 ? `${version}.0` : version; // add patch version if missing (e.g. 1.16 -> 1.16.0)
    return ranges.some((v) => satisfies(semverVersion, v));
  });
}
type InferReleaseInfoParams = {
  file: File;
  project: DBProj;
}
type Metadata = {
  version: string;
  quilt_loader: {
    version: string;
    depends: { id: string; versions: string[] }[];
  };
  depends: { minecraft: string[] };
  mods: { version: string }[];
  dependencies: { [key: string]: Dependency[] };
  mcversion: string;
};

type ReleaseInfo = {
  name: string;
  version_number?: string;
  loaders: string[];
  version_type?: string;
  game_versions: string[];
};

// const getVersionsRange = (versionA:string, versionB:string, versions:string[]) => {
//   const startingIndex = versions.findIndex((x) => x === versionA);
//   const endingIndex = versions.findIndex((x) => x === versionB);

//   if (startingIndex === -1 || endingIndex === -1) throw new Error("Invalid version range: one or both versions not found in the list.");
//   if (startingIndex < endingIndex) throw new Error("Invalid version range: starting version is lower than ending version.");
//   return versions.slice(endingIndex, startingIndex + 1).reverse();
// }

export const inferReleaseInfo = async ({file, project}: InferReleaseInfoParams): Promise<ReleaseInfo> => {

  const inferFunctions = {
    // NeoForge
    "META-INF/neoforge.mods.toml": async (fileText: string) => {
      const metadata = toml.parse(fileText);
      if (!metadata.mods || metadata.mods.length === 0) {
        return {};
      }

      const neoForgeDependency = (Object.values(metadata.dependencies) as Dependency[])
        .flat()
        .find((dependency) => dependency.modId === "neoforge");

      if (!neoForgeDependency) return {};

      // https://docs.neoforged.net/docs/gettingstarted/versioning/#neoforge
      const mcVersionRange = neoForgeDependency.versionRange
        .replace("-beta", "")
        .replace(/(\d+)(?:\.(\d+))?(?:\.(\d+)?)?/g, (_match, major, minor) => {
          return `1.${major}${minor ? "." + minor : ""}`;
        });
      const gameVersions = getGameVersionsMatchingMavenRange(
        {rangeStr: mcVersionRange, gameVersions: gameReleaseVersionsStrList,});

      const versionNum = metadata.mods[0].version;
      return {
        name: `${project.name} ${versionNum}`,
        version_number: versionNum,
        loaders: ["neoforge"],
        version_type: versionType(versionNum),
        game_versions: gameVersions,
      };
    },
    // Forge 1.13+
    "META-INF/mods.toml": async (fileText: string, zip: JSZip) => {
      const metadata = toml.parse(fileText);

      if (metadata.mods && metadata.mods.length > 0) {
        let versionNum = metadata.mods[0].version;

        // ${file.jarVersion} -> Implementation-Version from manifest
        const manifestFile = zip.file("META-INF/MANIFEST.MF");
        if (
          // eslint-disable-next-line no-template-curly-in-string
          metadata.mods[0].version.includes("${file.jarVersion}") &&
          manifestFile !== null
        ) {
          const manifestText = await manifestFile.async("text");
          const regex = /Implementation-Version: (.*)$/m;
          const match = manifestText.match(regex);
          if (match) {
            // eslint-disable-next-line no-template-curly-in-string
            versionNum = versionNum.replace("${file.jarVersion}", match[1]);
          }
        }

        let gameVersions:string[] = [];
        const mcDependencies = (Object.values(metadata.dependencies) as Dependency[])
          .flat()
          .filter((dependency) => dependency.modId === "minecraft");

        if (mcDependencies.length > 0) {
          gameVersions = getGameVersionsMatchingMavenRange({
            rangeStr: mcDependencies[0].versionRange,
            gameVersions: gameReleaseVersionsStrList,
          });
        }

        return {
          name: `${project.name} ${versionNum}`,
          version_number: versionNum,
          version_type: versionType(versionNum),
          loaders: ["forge"],
          game_versions: gameVersions,
        };
      } else {
        return {};
      }
    },
    // Old Forge
    "mcmod.info": async(fileText: string) => {
      const metadata = JSON.parse(fileText);

      return {
        name: metadata.version ? `${project.name} ${metadata.version}` : "",
        version_number: metadata.version,
        version_type: versionType(metadata.version),
        loaders: ["forge"],
        game_versions: gameReleaseVersionsStrList.filter((version) =>
          version.startsWith(metadata.mcversion),
        ),
      };
    },
    // Fabric
    "fabric.mod.json": async(fileText: string) => {
      const metadata = JSON.parse(fileText);

      return {
        name: `${project.name} ${metadata.version}`,
        version_number: metadata.version,
        loaders: ["fabric"],
        version_type: versionType(metadata.version),
        game_versions: metadata.depends
          ? getGameVersionsMatchingSemverRange(metadata.depends.minecraft, gameReleaseVersionsStrList)
          : [],
      };
    },
    // Quilt
    "quilt.mod.json": async(fileText: string) => {
      const metadata = JSON.parse(fileText);

      return {
        name: `${project.name} ${metadata.quilt_loader.version}`,
        version_number: metadata.quilt_loader.version,
        loaders: ["quilt"],
        version_type: versionType(metadata.quilt_loader.version),
        game_versions: metadata.quilt_loader.depends
          ? getGameVersionsMatchingSemverRange(
              metadata.quilt_loader.depends.find((x) => x.id === "minecraft")
                ? metadata.quilt_loader.depends.find((x) => x.id === "minecraft").versions
                : [],
                gameReleaseVersionsStrList,
            )
          : [],
      };
    },
    // Bukkit + Other Forks
    "plugin.yml": async(fileText: string) => {
      const metadata = yaml.load(fileText) as Metadata;

      return {
        name: `${project.name} ${metadata.version}`,
        version_number: metadata.version,
        version_type: versionType(metadata.version),
        // We don't know which fork of Bukkit users are using
        loaders: [],
        game_versions: gameReleaseVersionsStrList
          .filter(
            (x) => x.startsWith(metadata["api-version"]),
          ),
      };
    },
    // Paper 1.19.3+
    "paper-plugin.yml": async(fileText: string) => {
      const metadata = yaml.load(fileText) as Metadata;

      return {
        name: `${project.name} ${metadata.version}`,
        version_number: metadata.version,
        version_type: versionType(metadata.version),
        loaders: ["paper"],
        game_versions: gameReleaseVersionsStrList
          .filter((x) => x.startsWith(metadata["api-version"]))
      };
    },
    // Bungeecord + Waterfall
    "bungee.yml": async(fileText:string) => {
      const metadata = yaml.load(fileText) as Metadata;

      return {
        name: `${project.name} ${metadata.version}`,
        version_number: metadata.version,
        version_type: versionType(metadata.version),
        loaders: ["bungeecord"],
      };
    },
    // Velocity
    "velocity-plugin.json": async(fileText:string) => {
      const metadata = JSON.parse(fileText);

      return {
        name: `${project.name} ${metadata.version}`,
        version_number: metadata.version,
        version_type: versionType(metadata.version),
        loaders: ["velocity"],
      };
    },
    // Modpacks
    "modrinth.index.json": async(fileText) => {
      const metadata = JSON.parse(fileText);

      const loaders:string[] = [];
      if ("forge" in metadata.dependencies) {
        loaders.push("forge");
      }
      if ("neoforge" in metadata.dependencies) {
        loaders.push("neoforge");
      }
      if ("fabric-loader" in metadata.dependencies) {
        loaders.push("fabric");
      }
      if ("quilt-loader" in metadata.dependencies) {
        loaders.push("quilt");
      }

      return {
        name: `${project.name} ${metadata.versionId}`,
        version_number: metadata.versionId,
        version_type: versionType(metadata.versionId),
        loaders,
        game_versions: gameReleaseVersionsStrList
          .filter((x) => x === metadata.dependencies.minecraft),
      };
    },
    // Resource Packs + Data Packs
    "pack.mcmeta": async(fileText) => {
      const metadata = JSON.parse(fileText);

      const getRange = (versionA:string, versionB:string) => {
        const startingIndex = gameReleaseVersionsStrList.findIndex((x) => x === versionA);
        const endingIndex = gameReleaseVersionsStrList.findIndex((x) => x === versionB);
        if (startingIndex === -1 || endingIndex === -1) throw new Error("Invalid version range: one or both versions not found in the list.");
        if (startingIndex < endingIndex) throw new Error("Invalid version range: starting version is lower than ending version.");
        return gameReleaseVersionsStrList.slice(endingIndex, startingIndex + 1).reverse();
      }

      const loaders:string[] = [];
      let newGameVersions:string[] = [];

      if (project.type === "mod") {
        loaders.push("datapack");

        switch (metadata.pack.pack_format) {
          case 4:
            newGameVersions = getRange("1.13", "1.14.4");
            break;
          case 5:
            newGameVersions = getRange("1.15", "1.16.1");
            break;
          case 6:
            newGameVersions = getRange("1.16.2", "1.16.5");
            break;
          case 7:
            newGameVersions = getRange("1.17", "1.17.1");
            break;
          case 8:
            newGameVersions = getRange("1.18", "1.18.1");
            break;
          case 9:
            newGameVersions.push("1.18.2");
            break;
          case 10:
            newGameVersions = getRange("1.19", "1.19.3");
            break;
          case 11:
            newGameVersions = getRange("23w03a", "23w05a");
            break;
          case 12:
            newGameVersions.push("1.19.4");
            break;
          default:
        }
      }

      if (project.type === "resource_pack") {
        loaders.push("minecraft");

        switch (metadata.pack.pack_format) {
          case 1:
            newGameVersions = getRange("1.6.1", "1.8.9");
            break;
          case 2:
            newGameVersions = getRange("1.9", "1.10.2");
            break;
          case 3:
            newGameVersions = getRange("1.11", "1.12.2");
            break;
          case 4:
            newGameVersions = getRange("1.13", "1.14.4");
            break;
          case 5:
            newGameVersions = getRange("1.15", "1.16.1");
            break;
          case 6:
            newGameVersions = getRange("1.16.2", "1.16.5");
            break;
          case 7:
            newGameVersions = getRange("1.17", "1.17.1");
            break;
          case 8:
            newGameVersions = getRange("1.18", "1.18.2");
            break;
          case 9:
            newGameVersions = getRange("1.19", "1.19.2");
            break;
          case 11:
            newGameVersions = getRange("22w42a", "22w44a");
            break;
          case 12:
            newGameVersions.push("1.19.3");
            break;
          case 13:
            newGameVersions.push("1.19.4");
            break;
          case 14:
            newGameVersions = getRange("23w14a", "23w16a");
            break;
          case 15:
            newGameVersions = getRange("1.20", "1.20.1");
            break;
          case 16:
            newGameVersions.push("23w31a");
            break;
          case 17:
            newGameVersions = getRange("23w32a", "1.20.2-pre1");
            break;
          case 18:
            newGameVersions.push("1.20.2");
            break;
          case 19:
            newGameVersions.push("23w42a");
            break;
          case 20:
            newGameVersions = getRange("23w43a", "23w44a");
            break;
          case 21:
            newGameVersions = getRange("23w45a", "23w46a");
            break;
          case 22:
            newGameVersions = getRange("1.20.3", "1.20.4");
            break;
          case 24:
            newGameVersions = getRange("24w03a", "24w04a");
            break;
          case 25:
            newGameVersions = getRange("24w05a", "24w05b");
            break;
          case 26:
            newGameVersions = getRange("24w06a", "24w07a");
            break;
          case 28:
            newGameVersions = getRange("24w09a", "24w10a");
            break;
          case 29:
            newGameVersions.push("24w11a");
            break;
          case 30:
            newGameVersions.push("24w12a");
            break;
          case 31:
            newGameVersions = getRange("24w13a", "1.20.5-pre3");
            break;
          case 32:
            newGameVersions = getRange("1.20.5", "1.20.6");
            break;
          case 33:
            newGameVersions = getRange("24w18a", "24w20a");
            break;
          case 34:
            newGameVersions = getRange("1.21", "1.21.1");
            break;
          case 35:
            newGameVersions.push("24w33a");
            break;
          case 36:
            newGameVersions = getRange("24w34a", "24w35a");
            break;
          case 37:
            newGameVersions.push("24w36a");
            break;
          case 38:
            newGameVersions.push("24w37a");
            break;
          case 39:
            newGameVersions = getRange("24w38a", "24w39a");
            break;
          case 40:
            newGameVersions.push("24w40a");
            break;
          case 41:
            newGameVersions = getRange("1.21.2-pre1", "1.21.2-pre2");
            break;
          case 42:
            newGameVersions = getRange("1.21.2", "1.21.3");
            break;
          case 43:
            newGameVersions.push("24w44a");
            break;
          case 44:
            newGameVersions.push("24w45a");
            break;
          case 45:
            newGameVersions.push("24w46a");
            break;
          case 46:
            newGameVersions.push("1.21.4");
            break;
          default:
        }
      }

      return {
        loaders,
        game_versions: newGameVersions,
      };
    },
  };

  const zip = await JSZip.loadAsync(file);

  for (const fileName in inferFunctions) {
    const file = zip.file(fileName);
    if (file) {
      const fileText = await file.async("text");
      return await inferFunctions[fileName](fileText, zip);
    }
  }
  console.log("No file matched");
  return {
    name: file.name,
    loaders: [],
    game_versions: [],
  };
};

