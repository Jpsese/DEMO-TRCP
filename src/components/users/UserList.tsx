import React, { useEffect, useMemo, useState } from 'react';

import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender, ColumnDef,
} from '@tanstack/react-table';
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

type UserByIdOutput = RouterOutput['user']['findById'];

export function UserList() {
  const [pagination, setPagination] = React.useState({
    pageSize: 5,
    pageIndex: 0,
  });
  const [pageSize] = useState(5);
  const [cursor, setCursor] = useState<string | null>(null);
  const [direction, setDirection] = useState<string>('forward');
  const utils = trpc.useUtils();
  const router = useRouter();

  const userQuery = trpc.user.list.useInfiniteQuery(
    {
      pageSize,
      cursor,
      direction,
    },
    {
      getNextPageParam(lastPage) {
        return lastPage.nextCursor;
      },
      getPreviousPageParam(firstPage) {
        return firstPage.prevCursor;
      },
    },
  );

  const { data, fetchNextPage, fetchPreviousPage, hasNextPage, hasPreviousPage, refetch, isLoading, error } = userQuery;


  const flatData = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [userQuery.data],
  );

  const handleNextPage = async () => {
    setDirection('forward');
    const lastPage = data?.pages[data.pages.length - 1];
    setCursor(lastPage?.nextCursor ?? null);
    await refetch();
  };

  const handlePreviousPage = async () => {
    setDirection('backward');
    const firstPage = data?.pages[0];
    setCursor(firstPage?.prevCursor ?? null);
    await refetch();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <Table className="w-full">
          <TableCaption className="text-lg font-semibold mb-4 text-gray-700">List of Users</TableCaption>
          <TableHeader>
            <TableRow className="bg-gray-100">
              <TableHead
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</TableHead>
              <TableHead
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email
                Verified</TableHead>
              <TableHead
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created
                Date</TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last
                Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {flatData.map((row, index) => (
              <TableRow
                key={row.id}
                onClick={() => router.push(`/admin/users/${row.id}`)}
                className={`hover:bg-gray-50 transition-colors duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                style={{ cursor: 'pointer' }}
              >
                <TableCell
                  className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.name}</TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.email}</TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <span
                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${row.emailVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {row.emailVerified ? 'Yes' : 'No'}
              </span>
                </TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.role}</TableCell>
                <TableCell
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(row.createdAt).toLocaleDateString()}</TableCell>
                <TableCell
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(row.updatedAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="flex-1 flex justify-between sm:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={!hasPreviousPage}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Previous
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={!hasNextPage}
          >
            Next Page
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={!hasNextPage}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Next
          </Button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div className="flex flex-box justify-between">
            {/* Uncomment and adjust when pagination is implemented
        <p className="text-sm text-gray-700">
          Showing <span className="font-medium">{pagination.pageIndex * pagination.pageSize + 1}</span> to{' '}
          <span className="font-medium">{Math.min((pagination.pageIndex + 1) * pagination.pageSize, totalCount)}</span> of{' '}
          <span className="font-medium">{totalCount}</span> results
        </p>
        */}
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={!hasPreviousPage}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              Previous Page
            </Button>
            {/* Uncomment and adjust when pagination is implemented
          {Array.from({ length: totalPages }).map((_, index) => (
            <Button
              key={index}
              variant={pagination.pageIndex === index ? 'default' : 'outline'}
              size="sm"
              onClick={() => handlePageChange(index)}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {index + 1}
            </Button>
          ))}
          */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={!hasNextPage}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              Next Page
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
    ;
}