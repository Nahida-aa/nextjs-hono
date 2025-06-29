'use client';
import { ShadcnAvatar } from '~/components/common/avatar';
import { Form, FormControl, FormField, FormItem, FormLabel } from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { User_whenAddFriend, UserLsWithCount_whenAddFriend } from '~/lib/db/q/user/friend';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast as sonner_toast } from "sonner"
import { SubmitButton } from '~/components/common/submit-button';
import { NotificationUser } from '~/lib/routes/friend/notification';
import { useRouter } from 'next/navigation';

const FormSchema = z.object({
  // 备注\别名
  alias: z.string(),
})
export const ClientMain =  ({
  name,
}: {
  name: string
}) => {
  const defaultValues = {
    alias: "",
  }
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema), defaultValues,
  })
  const isLoading = form.formState.isSubmitting
  const router = useRouter()
  async function onSubmit(data: z.infer<typeof FormSchema>) {
    // 如果没有修改过值，就不提交
    if (JSON.stringify(data) == JSON.stringify(defaultValues)) {
      sonner_toast.warning("没有修改过值")
    }
    sonner_toast("You submitted the following values:", {
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    })
    router.push(`/chat/${name}`)
  }
  const [userData, setUserData] = useState<NotificationUser | null>(null)
  useEffect(() => {
    const sender = sessionStorage.getItem(`/user/friend/add/${name}/setting`);
    if (sender) {
      const user = JSON.parse(sender) as NotificationUser
      setUserData(user);
    }
  }, []);
  if (!userData) {
    return <div>loading...</div>
  }
  const img_src = userData?.image ?? `https://avatar.vercel.sh/${name}`
  return <main className='max-w-[400px] mx-auto'>
    <div className="flex gap-4 pb-6">
      <ShadcnAvatar src={img_src} size={14} className='size-14' />
      <span className="text-xl">
        {name} 
      </span>
    </div>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-4">
        <FormField 
          control={form.control}
          name="alias"
          render={({ field }) => (
            <FormItem className='space-y-3'>
              <FormLabel>备注</FormLabel>
              <FormControl className='w-full flex'>
                <Input
                  placeholder='输入备注'
                  className="resize-none bg-muted focus-visible:ring-0"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <div className='flex justify-end'>
          <SubmitButton isLoading={isLoading} className='w-full'>
            Success
          </SubmitButton>
        </div>
      </form>
    </Form>
  </main>
}
