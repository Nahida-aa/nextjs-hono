// "use client";
// import {
//   Form,
//   FormControl,
//   FormDescription,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "~/components/ui/form"

// import { Input } from '~/components/ui/input';
// import { Label } from '~/components/ui/label';
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod"
// import { z } from "zod";

// const formSchema = z.object({
//   name: z.string().min(1, "Name is required"),
//   password: z.string().min(6, "Password must be at least 6 characters"),
// })
// export function AuthForm({
//   action,
//   children,
//   defaultEmail = '',
// }: {
//   action: NonNullable<
//     string | ((formData: FormData) => void | Promise<void>) | undefined
//   >;
//   children: React.ReactNode;
//   defaultEmail?: string;
// }) {
//   const form = useForm({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       name: '',
//       password: '',
//     }
//   })

//   const isLoading = form.formState.isSubmitting

//   const onSubmit = async (values: z.infer<typeof formSchema>) => {
//     try {
//       await action(values)
//     } catch (error) {
//       console.error(error)
//     }
//   }
//   return (
//     <Form {...form} action={action} className="flex flex-col gap-4 px-4 sm:px-16">
//       <form action="" onSubmit={form.handleSubmit(onSubmit)}>

//       </form>
//       <div className="flex flex-col gap-2">
//         <Label
//           htmlFor="email"
//           className="text-zinc-600 font-normal dark:text-zinc-400"
//         >
//           Email Address
//         </Label>

//         <Input
//           id="email"
//           name="email"
//           className="bg-muted text-md md:text-sm"
//           type="email"
//           placeholder="user@acme.com"
//           autoComplete="email"
//           required
//           autoFocus
//           defaultValue={defaultEmail}
//         />
//       </div>

//       <div className="flex flex-col gap-2">
//         <Label
//           htmlFor="password"
//           className="text-zinc-600 font-normal dark:text-zinc-400"
//         >
//           Password
//         </Label>

//         <Input
//           id="password"
//           name="password"
//           className="bg-muted text-md md:text-sm"
//           type="password"
//           required
//         />
//       </div>

//       {children}
//     </Form>
//   );
// }
