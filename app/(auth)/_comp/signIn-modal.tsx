"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form"

import { Input } from '~/components/ui/input';
// import { Label } from '~/components/ui/label';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { useEffect, useState } from "react";
// import { useTransition } from "react"; // const [isPending, startTransition] = useTransition() // 或许很有用, 不使用可能有问题, 但是我怀疑是 react 的问题
import { SubmitButton } from "~/components/common/submit-button";
import {  hono_sign_in, server_sign_in } from "../actions";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
// import { signIn } from "../auth";
import { toast as sonner_toast } from "sonner"

export const sign_in_schema = z.object({
  nameOrEmail: z.string().min(1, "Name or email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})
export function SignIn_Modal() {
  // const [isMounted, setIsMounted] = useState(false) // 13 版本的 React 有 bug，需要这样处理
  // useEffect(() => {
  //   setIsMounted(true)
  // }, [])
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const router = useRouter();
  
  const form = useForm({
    resolver: zodResolver(sign_in_schema),
    defaultValues: {
      nameOrEmail: '',
      password: '',
    }
  })

  const isLoading = form.formState.isSubmitting
  console.log(`isLoading: ${isLoading}`)
  // const [isSuccessful, setIsSuccessful] = useState(false);

  const onSubmit = async (values: z.infer<typeof sign_in_schema>) => {
    try {
      console.log(`app/(auth)/_comp/signIn-modal.tsx: 开始登录: ${JSON.stringify(values.nameOrEmail)}`)
      // const result = await server_sign_in(values)
      const result = await hono_sign_in(values)
      console.log(`app/(auth)/_comp/signIn-modal.tsx: 登录成功: ${JSON.stringify(values.nameOrEmail)}`)
      sonner_toast.success(`Welcome back, ${values.nameOrEmail}!`)
      router.push('/')
    } catch (error: any) {
      console.error(error)
      sonner_toast.error(`An error occurred: ${error.message}`)
    }
  }

  // if (!isMounted) return null // 13 版本的 React 有 bug，需要这样处理
  return (
    <Dialog defaultOpen  onOpenChange={() => router.push('/')}>
      <DialogContent onInteractOutside={(event) => {
        event.preventDefault() // 避免在点击外部时关闭对话框
      }}
        className="flex flex-col gap-4 px-4 sm:px-16"
      >
        <DialogHeader>
          <DialogTitle className="text-center">Sign In</DialogTitle>
          <DialogDescription className="text-center">
            Sign in to your account to continue
          </DialogDescription>
        </DialogHeader>
        <Form {...form} >
          <form action="" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="nameOrEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="name">Name or Email</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        id="nameOrEmail"
                        type="text"
                        placeholder="Enter name or email"
                        required
                        className="bg-muted/30"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage {...field} />
                  </FormItem>
                )}
              />
              <FormField 
                name="password"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="password">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                      <Input
                        disabled={isLoading}
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter password"
                        required
                        className="bg-muted/30"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                      </div>
                    </FormControl>
                    <FormMessage {...field} />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="">
              <SubmitButton isLoading={isLoading}> Sign in</SubmitButton>
            </DialogFooter>
          </form>
        </Form>
        <p className="text-center text-sm text-gray-600 mt-4 dark:text-zinc-400">
          {"Don't have an account? "}
          <Link
            href="/sign-up"
            className="font-semibold text-gray-800 hover:underline dark:text-zinc-200"
          >
            Sign up
          </Link>
        </p>
      </DialogContent>
    </Dialog>
  );
}
