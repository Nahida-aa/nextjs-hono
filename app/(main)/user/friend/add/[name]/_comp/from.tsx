'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast as sonner_toast } from "sonner"
import { Form, FormControl, FormField, FormItem, FormLabel } from '~/components/ui/form'
import { Textarea } from '~/components/ui/textarea'
import { Button } from '~/components/ui/button'
import { SubmitButton } from '~/components/common/submit-button'
import { useRouter } from 'next/navigation'

const FormSchema = z.object({
  content: z.string().min(1, {
    message: "query must be at least 1 characters.",
  }),
})
export const ClientFrom = ({
  receiver_id,
}:{
  receiver_id: string
}) => {
  const router = useRouter()
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      content: "我是",
    },
  })
  const isLoading = form.formState.isSubmitting

  const handle_sendFriendReq = async (data: z.infer<typeof FormSchema>) => {
    try {
      const res = await fetch("/api/hono/user/friend/request/send", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ receiver_id, content: data.content }),
      });
      const result = await res.json();
      if (res.ok) {
        sonner_toast.success("添加成功", {
          description: (
            <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
              <code className="text-white">{JSON.stringify(result, null, 2)}</code>
            </pre>
          ),
        })
        router.back()
      } else {
        sonner_toast.warning(`An error occurred: ${result.message}`)
      }
    } catch (error: any) {
      console.error(error);
      sonner_toast.error(`An error occurred: ${error.message}`)
    }
  };
  async function onSubmit(data: z.infer<typeof FormSchema>) {
    sonner_toast("You submitted the following values:", {
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify({receiver_id, ...data}, null, 2)}</code>
        </pre>
      ),
    })
    await handle_sendFriendReq(data)
  }
  return <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-4">
      <FormField 
        control={form.control}
        name="content"
        render={({ field }) => (
          <FormItem className='space-y-3'>
            <FormLabel>填写验证信息(发送过去的第一句话)</FormLabel>
            <FormControl className='w-full flex'>
              <Textarea
                className="resize-none bg-muted focus-visible:ring-0"
                {...field}
              />
            </FormControl>
          </FormItem>
        )}
      />
      <div className='flex justify-end'>
        <SubmitButton isLoading={isLoading} className='w-full'>Send</SubmitButton>
      </div>
    </form>
  </Form>
}
