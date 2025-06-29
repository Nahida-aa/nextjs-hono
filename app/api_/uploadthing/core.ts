import { server_auth } from "~/app/(auth)/auth";
import { createUploadthing, UTFiles, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing({
  /**
   * Log out more information about the error, but don't return it to the client
   * @see https://docs.uploadthing.com/errors#error-formatting
   */
  errorFormatter: (err) => {
    console.log("Error uploading file", err.message);
    console.log("  - Above error caused by:", err.cause);

    return { message: err.message };
  },
});

const auth = (req: Request) => ({ id: "fakeId" }); // Fake auth function

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f({
    image: {
      /**
       * For full list of options and defaults, see the File Route API reference
       * @see https://docs.uploadthing.com/file-routes#route-config
       */
      maxFileSize: "4MB",
      maxFileCount: 2,
    },
  })
    // Set permissions and file types for this FileRoute
    .middleware(async ({ req }) => {
      // This code runs on your server before upload
      const auth_session = await server_auth();

      // If you throw, the user will not be able to upload
      if (!auth_session?.user) throw new UploadThingError("Unauthorized");

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: auth_session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for userId:", metadata.userId);

      console.log("file url", file.url);

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { uploadedBy: metadata.userId };
    }),
  videoAndImage: f({
    image: {
      maxFileSize: "32MB",
      maxFileCount: 4,
      acl: "public-read",
    },
    video: {
      maxFileSize: "16MB",
    },
    blob: {
      maxFileSize: "8GB",
      maxFileCount: 2,
    },
  })
    // .input(z.object({ foo: z.string() }))
    .middleware(async({ req, files, input, res }) => {
      // Check some condition based on the incoming requrest
      // if (!req.headers.get("x-some-header")) {
      //   throw new Error("x-some-header is required");
      // }

      console.log("ourFileRouter:middleware", files);
      // (Optional) Label your files with a custom identifier
      const filesWithMyIds = files.map((file, idx) => ({
        ...file,
        // key: `${file}`, // 貌似无效, 因为这里的文件根本就没有 key
        // customId: `${idx}-${randomUUID()}`,
      }));

      // const fileOverrides = files.map((file) => {
      //   const newName = sluggify(file.name);
      //   const myIdentifier = generateId();
      //   return { ...file, name: newName, customId: myIdentifier };
      // });

      // This code runs on your server before upload
      const auth_session = await server_auth();

      // If you throw, the user will not be able to upload
      if (!auth_session?.user) throw new UploadThingError("Unauthorized"); //注意：默认情况下，抛出的 UploadThingError '的消息将发送到客户端的 onError
      const user = auth_session.user;
      
      // Return some metadata to be stored with the file
      return { foo: "bar" as const, userId: user.id, files,  [UTFiles]: filesWithMyIds };
    })
    .onUploadComplete(async({ file, metadata }) => {
      console.log("ourFileRouter: 2: upload completed, file:", file, "metadata:", metadata);
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;


import { UTApi } from "uploadthing/server";
import { randomUUID } from "crypto";
import { z } from "zod";

export const utapi = new UTApi({
  // ...options,
});
