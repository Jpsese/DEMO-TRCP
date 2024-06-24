/* eslint-disable @typescript-eslint/no-unused-vars */
import type * as trpcNext from '@trpc/server/adapters/next';
import { Session } from 'next-auth';
import { getServerSession } from 'next-auth';
import { authOptions } from '~/pages/api/auth/[...nextauth]';


// eslint-disable-next-line @typescript-eslint/no-empty-interface

interface UserSession {
  user: {
    name: string | null,
    email: string,
    image: string | null,
    id: string,
    role: string
  }
  expires: string
}
interface CreateContextOptions {
  session: UserSession | null
}

/**
 * Inner function for `createContext` where we create the context.
 * This is useful for testing when we don't want to mock Next.js' request/response
 */
export async function createContextInner(_opts: CreateContextOptions) {

  return {
    session: _opts.session,
  };
}

export type Context = Awaited<ReturnType<typeof createContextInner>>;

/**
 * Creates context for an incoming request
 * @link https://trpc.io/docs/v11/context
 */
export async function createContext(
  opts: trpcNext.CreateNextContextOptions,
): Promise<Context> {
  // for API-response caching see https://trpc.io/docs/v11/caching
  const session = await getServerSession(opts.req, opts.res, authOptions);
  const contextInner = await createContextInner({ session });
  return contextInner;
}
