import { NextPageWithLayout } from '~/pages/_app';
import { UserList } from '~/components/users/UserList';
import AdminLayout from '~/components/AdminLayout';
import Link from 'next/link';
import { CreateUserPopover } from '~/components/users/CreateUserPopover';
import React from 'react';

const ManageUsersPage: NextPageWithLayout = () => {
  return (
    <div>
      <UserList />
      <div>
        <CreateUserPopover />
      </div>
    </div>
  );
};
ManageUsersPage.getLayout = (page) => <AdminLayout>{page}</AdminLayout>;

export default ManageUsersPage;