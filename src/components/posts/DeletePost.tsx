import { useRouter } from 'next/router';
import { trpc } from '../../utils/trpc';
import type { inferProcedureInput } from '@trpc/server';
import type { AppRouter } from '~/server/routers/_app';

const DeleteButton: React.FC = () => {
  const router = useRouter();
  const id = router.query.id as string;


  const deletePost = trpc.post.delete.useMutation({
    async onSuccess() {
      router.push('/');
    },
  })
  const handleDelete = async () => {
    type Input = inferProcedureInput<AppRouter['post']['delete']>;
    const item: Input = {
      id: id as string
    }
    try{
      await deletePost.mutateAsync(item);
    }catch(err){
      console.log("Error on deleting item", err);
    }
  };


  return (
    <button type="button"
            onClick={handleDelete}
            className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900">DELETE
      BUTTON
    </button>
  );
};

export default DeleteButton;