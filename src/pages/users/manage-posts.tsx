import { NextPageWithLayout } from '~/pages/_app';
import { UserList } from '~/components/users/UserList';
import Link from 'next/link';
import { PostList } from '~/components/posts/PostList';
import { CreatePost } from '~/components/posts/CreatePost';

const ManagePostsPage: NextPageWithLayout = () => {
  return (
    <div>
      <PostList posts={null} />
      <div>
        <CreatePost/>
      </div>
    </div>
  );
};

export default ManagePostsPage;