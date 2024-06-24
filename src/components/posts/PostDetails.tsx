import { useToast } from '~/components/ui/use-toast';
import { useState } from 'react';
import { RouterOutput, trpc } from '~/utils/trpc';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { DeleteDialog } from '~/components/utils/DeleteDialog';
import { useRouter } from 'next/router';

type PostByIdOutput = RouterOutput['post']['findById'];

export function PostDetails(props: { post: PostByIdOutput }) {
  const { post } = props;
  const { toast } = useToast();
  const router = useRouter();
  const [deleteDialog, setDeleteDialog] = useState<boolean>(false);
  const [enableEdit, setEnableEdit] = useState<boolean>(false);
  const utils = trpc.useUtils();
  const formSchema = z.object({
    title: z.string(),
    postText: z.string(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: post.title,
      postText: post.text,
    },
  });

  const updatePost = trpc.post.update.useMutation({
    async onSuccess() {
      await utils.post.findById.refetch();
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await updatePost.mutateAsync({ id: post.id, text: values.postText, title: values.title });
      toast({
        description: 'Successfully updated post details',
      });
    } catch (err) {
      console.error(err, 'Failed to update post');
      toast({
        variant: 'destructive',
        title: 'Error updating post details',
      });
    } finally {
      setEnableEdit(false);
    }
  }

  const deletePost = trpc.post.delete.useMutation({
    async onSuccess() {
      router.push('/users/manage-posts');
    },
  });

  const handleDelete = async () => {
    try {
      await deletePost.mutateAsync({ id: post.id });
    } catch (err) {
      console.log(err, 'Error deleting post');
    }
  };

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 max-w-md mx-auto bg-white shadow-md rounded-lg p-8">
          <div className="grid grid-cols-1 gap-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Title</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={!enableEdit}
                      className={`mt-1 block w-full rounded-md ${!enableEdit ? 'bg-gray-100' : 'bg-white'}`}
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-500 mt-1" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="postText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Text</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={!enableEdit}
                      className={`mt-1 block w-full rounded-md ${!enableEdit ? 'bg-gray-100' : 'bg-white'}`}
                    />
                  </FormControl>
                  <FormMessage className="text-xs text-red-500 mt-1" />
                </FormItem>
              )}
            />
          </div>

          <div className="mt-6 space-y-2 text-sm text-gray-600">
            <p>Created On: {new Date(post.createdAt).toLocaleString()}</p>
            <p>Updated On: {new Date(post.updatedAt).toLocaleString()}</p>
          </div>

          <div className="mt-8 flex justify-end space-x-4">
            {enableEdit ? (
              <>
                <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                  Submit
                </Button>
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    setEnableEdit(false);
                    form.reset();
                  }}
                  variant="outline"
                  className="border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-100"
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  setEnableEdit(true);
                }}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
              >
                Edit
              </Button>
            )}
          </div>
          <div>
            {enableEdit ? (
              <Button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                      onClick={() => setDeleteDialog(true)}
              >DELETE POST</Button>
            ) : (<></>)}
          </div>
        </form>
      </Form>
      <DeleteDialog isOpen={deleteDialog} onClose={() => setDeleteDialog(false)} onConfirm={handleDelete}/>
    </div>
  );
}