/**
 *
 * This is an example router, you can delete this file and then update `../pages/api/trpc/[trpc].tsx`
 */
import { router, publicProcedure, protectedProcedure } from '../trpc';
import type { Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { prisma } from '~/server/prisma';

/**
 * Default selector for Post.
 * It's important to always explicitly say which fields you want to return in order to not leak extra information
 * @link https://github.com/prisma/prisma/issues/9353
 */
const defaultPostSelect = {
  id: true,
  title: true,
  text: true,
  createdAt: true,
  updatedAt: true,
  userId: true,
} satisfies Prisma.PostSelect;

export const postRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100),
        cursor: z.string().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const posts = await prisma.post.findMany({
        select: defaultPostSelect,
        where: {
          userId: ctx.session.user.id,
        },
        take: input.limit,
        orderBy: {
          createdAt: 'desc',
        },
      });

      return posts;
    }),
  findById: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      //Let's find the real user to append in the post
      const user = await prisma.user.findUnique({
        where: {
          id: ctx?.session?.user.id,
        },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `User not found`,
        });
      }

      const { id } = input;
      const post = await prisma.post.findUnique({
        where: { id: id, userId: user.id },
        select: defaultPostSelect,
      });
      if (!post) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `No post with id '${id}'`,
        });
      }
      return post;
    }),
  add: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(32),
        text: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      //Let's find the real user to append in the post
      const user = await prisma.user.findUnique({
        where: {
          id: ctx.session.user.id,
        },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `User not found`,
        });
      }

      const post = await prisma.post.create({
        data: {
          userId: ctx.session.user.id,
          ...input,
        },
        select: defaultPostSelect,
      });
      return post;
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() })).mutation(async ({ input }) => {
      const postDelete = await prisma.post.delete({
        where: {
          id: input.id,
        },
      });
      return postDelete;
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      title: z.string(),
      text: z.string(),
    }))
    .mutation(async ({ input }) => {
      const postUpdate = await prisma.post.update({
        where: {
          id: input.id,
        },
        data: {
          title: input.title,
          text: input.text,
        },
      });

      return postUpdate;
    }),
});
