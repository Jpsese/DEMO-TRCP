import React, { useMemo, useState } from 'react';

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import { Button } from '~/components/ui/button';
import { RouterOutput, trpc } from '~/utils/trpc';
import { CreateUserPopover } from '~/components/users/CreateUserPopover';
import { useRouter } from 'next/router';

type PostListOutput = RouterOutput['post']['list'];

interface PostListProps {
  posts: PostListOutput[] | null;
}

export function PostList(props: PostListProps) {
  const { posts: propPosts } = props;
  const utils = trpc.useUtils();
  const router = useRouter();

  const [pages] = useState<number>(50);
  const postQuery = trpc.post.list.useQuery({ limit: pages }, { enabled: !propPosts });

  const { data: fetchedPost, refetch, isLoading, error } = postQuery;

  const posts = propPosts ?? fetchedPost;


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <Table className="w-full">
          <TableCaption className="text-lg font-semibold mb-4 text-gray-700">List of Post</TableCaption>
          <TableHeader>
            <TableRow className="bg-gray-100">
              <TableHead
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</TableHead>
              <TableHead
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Text</TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created
                Date</TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last
                Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {posts?.map((row, index) => (
              <TableRow
                key={row.id}
                onClick={() => router.push(`/post/${row.id}`)}
                className={`hover:bg-gray-50 transition-colors duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                style={{ cursor: 'pointer' }}
              >
                <TableCell
                  className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.title}</TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.text}</TableCell>
                <TableCell
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(row.createdAt).toLocaleDateString()}</TableCell>
                <TableCell
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(row.updatedAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
    ;
}