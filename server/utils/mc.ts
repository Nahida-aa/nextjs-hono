import { GameVersion } from "~/constants/types";

export const filterReleaseVersions = (versions: GameVersion[]): GameVersion[] => {
  return versions.filter(version => version.version_type === 'release');
};
export const releaseVersions2strList = (versions: GameVersion[]): string[] => {
  return versions.map(version => version.version);
}