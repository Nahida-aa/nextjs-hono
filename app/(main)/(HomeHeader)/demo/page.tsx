"use client";

import { useState } from "react";
import { FileUpload } from "~/components/common/file-upload";
import { UploadButton } from "~/lib/utils/uploadthing";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form"
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "~/components/ui/button";
import { DialogFooter } from "~/components/ui/dialog";
import { toast as sonner_toast } from "sonner"
import { SubmitButton } from "~/components/common/submit-button";

const formSchema = z.object({
  // name: z.string().min(1, {
  //   message: "Server name is required."
  // }),
  imageUrl: z.string().min(1, {
    message: "Server image is required."
  })
});

export default function Home() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      // name: "",
      imageUrl: "",
    }
  });
  const isLoading = form.formState.isSubmitting;
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    sonner_toast("You submitted the following values:", {
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(values, null, 2)}</code>
        </pre>
      ),
    })
    try {
      // await axios.post("/api/servers", values);

      form.reset();
      // router.refresh();
      // onClose();
    } catch (error) {
      console.log(error);
    }
  }
  
  const [value, setValue] = useState<string>("");
  const onChange = (url?: string) => {
    console.log("File uploaded to:", url);
    if (url) setValue(url);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <UploadButton
        endpoint="imageUploader"
        onClientUploadComplete={(res) => {
          // Do something with the response
          console.log("Files: ", res);
          alert("Upload Completed");
        }}
        onUploadError={(error: Error) => {
          // Do something with the error.
          alert(`ERROR! ${error.message}`);
        }}
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <section className="space-y-8 px-6">
            <div className="flex items-center justify-center text-center">
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem className="">
                    <FormControl className="">
                      <FileUpload
                        endpoint="imageUploader"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </section>
          <DialogFooter className="px-6 py-4">
            <SubmitButton isLoading={isLoading}>Create</SubmitButton>
          </DialogFooter>
        </form>
      </Form>
      <a href={form.getValues("imageUrl")} download className="ml-4">
        <Button variant="secondary" type="button">下载</Button>
      </a>
      {/* <FileUpload onChange={onChange} endpoint={"imageUploader"} value={value} /> */}
    </main>
  );
}
