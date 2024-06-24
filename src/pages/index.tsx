import { trpc } from '../utils/trpc';
import type { NextPageWithLayout } from './_app';
import type { inferProcedureInput } from '@trpc/server';
import Link from 'next/link';
import { Fragment, useEffect } from 'react';
import type { AppRouter } from '~/server/routers/_app';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

const IndexPage: NextPageWithLayout = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/api/auth/signin');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  return <div>Redirecting...</div>;
};
export default IndexPage;
