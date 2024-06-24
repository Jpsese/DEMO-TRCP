import { NextPageWithLayout } from '~/pages/_app';
import { useRouter } from 'next/router';
import { trpc } from '~/utils/trpc';
import { UserDetails } from '~/components/users/UserDetails';
import NextError from 'next/error';
import Link from 'next/link';


const UserViewPage: NextPageWithLayout = () => {
  const router = useRouter();
  const userId = router.query.id as string;

  const userQuery = trpc.user.findById.useQuery({ id: userId });
  if (userQuery.error) {
    return <NextError statusCode={userQuery.error.data?.httpStatus ?? 500}
                      title={userQuery.error.message} />;
  }

  const { data } = userQuery;
  
  if(!data) {
    return <NextError statusCode={404}
                      title={"User not found"}/>
  }

  return (
    <div>
      <UserDetails user={data} enableDeveloper={false} />
    </div>
  );
};

export default UserViewPage;