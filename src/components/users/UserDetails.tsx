import { RouterOutput, trpc } from '~/utils/trpc';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Button } from '~/components/ui/button';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useToast } from '~/components/ui/use-toast';
import { DeleteDialog } from '~/components/utils/DeleteDialog';
import { PostList } from '~/components/posts/PostList';
import { useRouter } from 'next/router';

type UserByIdOutput = RouterOutput['user']['findById'];

export function UserDetails(props: { user: UserByIdOutput, enableDeveloper: boolean }) {
  const { user, enableDeveloper } = props;
  const { toast } = useToast();
  const [deleteDialog, setDeleteDialog] = useState<boolean>(false);
  const [enableEdit, setEnableEdit] = useState<boolean>(false);
  const router = useRouter();
  const utils = trpc.useUtils();
  const formSchema = z.object({
    email: z.string().nullish(),
    name: z.string().nullish(),
    role: z.string().min(1, 'This field is required'),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: user.email,
      name: user.name,
      role: user.role,
    },
  });

  const updateUser = trpc.user.update.useMutation({
    async onSuccess() {
      await utils.user.findById.refetch();
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await updateUser.mutateAsync({ id: user.id, ...values });
      toast({
        description: 'Successfully updated user details',
      });
    } catch (err) {
      console.error(err, 'Failed to update user');
      toast({
        variant: 'destructive',
        title: 'Error updating user details',
      });
    } finally {
      setEnableEdit(false);
    }
  }

  const deleteUser = trpc.user.delete.useMutation({
    async onSuccess() {
      router.push('/admin/manage-users');
    },
  });

  const handleDelete = async () => {
    try {
      await deleteUser.mutateAsync({ id: user.id });
    } catch (err) {
      console.log(err, 'Error deleting user');
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="jdumo1201@gmail.com"
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John Doe"
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
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={!enableEdit}
                  >
                    <FormControl>
                      <SelectTrigger
                        className={`mt-1 block w-full rounded-md ${!enableEdit ? 'bg-gray-100' : 'bg-white'}`}>
                        <SelectValue placeholder="Select a role for the user" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-xs text-red-500 mt-1" />
                </FormItem>
              )}
            />
          </div>

          <div className="mt-6 space-y-2 text-sm text-gray-600">
            <p>Created On: {new Date(user.createdAt).toLocaleString()}</p>
            <p>Updated On: {new Date(user.updatedAt).toLocaleString()}</p>
            <p>Email Verified: {user.emailVerified ? 'Yes' : 'No'}</p>
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
              >DELETE USER</Button>
            ) : (<></>)}
          </div>
        </form>
      </Form>
      <DeleteDialog isOpen={deleteDialog}
                    onClose={() => setDeleteDialog(false)}
                    onConfirm={() => {
                      setDeleteDialog(false);
                      handleDelete();
                    }}
      />
      <Button>View Post</Button>
      <PostList posts={user.posts} />
    </div>
  );
}