import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form';
import { trpc } from '~/utils/trpc';
import { useState } from 'react';

export function CreatePost() {
  const [isOpen, setIsOpen] = useState(false);

  const utils = trpc.useUtils();
  const addPost = trpc.post.add.useMutation({
    async onSuccess() {
      await utils.post.list.invalidate();
    },
  });
  const formSchema = z.object({
    title: z.string().min(1, 'This field is required'),
    postText: z.string().min(1, 'This field is required'),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      postText: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await addPost.mutateAsync({ title: values.title, text: values.postText });
      setIsOpen(false);
      form.reset()
    } catch (err) {
      console.error(err, 'Failed to add post');
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Create Post</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Post</DialogTitle>
          <DialogDescription>
            Create your own post here
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Meditation" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="postText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Text</FormLabel>
                  <FormControl>
                    <Input placeholder="Meditation by Marcus Aurelius" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={addPost.isPending}>Submit</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}