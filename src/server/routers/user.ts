import { Prisma } from '@prisma/client';
import { adminProcedure, protectedProcedure, publicProcedure, router } from '~/server/trpc';
import { prisma } from '~/server/prisma';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

const defaultUserSelect = {
  id: true,
  email: true,
  name: true,
  password: true,
  emailVerified: true,
  role: true,
  createdAt: true,
  updatedAt: true,
  posts: true
} satisfies Prisma.UserSelect;


export const userRouter = router({
  me: protectedProcedure
    .input(z.object({
      id: z.string(),
      email: z.string(),
    }))
    .query(async ({ input }) => {
      const user = await prisma.user.findUnique({
        where: {
          id: input.id,
        },
      });
      return user;
    }),
  list: adminProcedure
    .input(z.object({
      pageSize: z.number().int().min(1).max(100),
      cursor: z.string().nullish(),
      direction: z.enum(['forward', 'backward']).default('forward'),
    }))
    .query(async ({ctx,  input }) => {
      const { pageSize, cursor, direction } = input;

      const items = await prisma.user.findMany({
        take: direction === 'backward' ? -(pageSize + 1) : pageSize + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          id: direction === 'backward' ? 'desc' : 'asc',
        },
        select: defaultUserSelect,
      });


      console.log('Fetched items:', items.length);

      let nextCursor: string | undefined = undefined;
      let prevCursor: string | undefined = undefined;

      if (items.length > pageSize) {
        if (direction === 'forward') {
          const nextItem = items.pop()!;
          nextCursor = nextItem.id;
          prevCursor = items[0].id;
        } else {
          const prevItem = items.shift()!;
          prevCursor = prevItem.id;
          nextCursor = items[items.length - 1].id;
        }
      }

      console.log('Cursors:', { nextCursor, prevCursor });

      return {
        items: direction === 'backward' ? items.reverse() : items,
        nextCursor,
        prevCursor,
      };

    }),

  add: adminProcedure
    .input(z.object({
        email: z.string().min(1, { message: 'This field is required' }).email('This is not a valid email'),
        password: z.string().min(1, { message: 'This field is required' }),
        role: z.string().min(1, { message: 'This field is required' }),
      },
    )).mutation(async ({ input }) => {
      const user = await prisma.user.create({
        data: input,
        select: defaultUserSelect,
      });

      return user;
    }),
  findById: protectedProcedure
    .input(z.object(
      { id: z.string().min(1) },
    ))
    .query(async ({ input }) => {
      const user = await prisma.user.findUnique({
        where: {
          id: input.id,
        },
        select: defaultUserSelect,
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `user not found with ${input.id}`,
        });
      }

      return user;
    }),

  update: adminProcedure
    .input(z.object({
      id: z.string().min(1),
      name: z.string().nullish(),
      role: z.string().min(1),
    }))
    .mutation(async ({ input }) => {
      const { id, name, role } = input;
      const userUpdate = await prisma.user.update({
        where: {
          id: id,
        },
        data: {
          name: name,
          role: role,
        },
      });

      return userUpdate;
    }),

  delete: adminProcedure
    .input(z.object({
      id: z.string()
    }))
    .mutation(async ({input}) => {
      const {id} = input;
      const userDelete = await prisma.user.delete({
        where: {
          id: id
        }
      });

      return userDelete
    })
});