/**
 * Adds seed data to your db
 *
 * @link https://www.prisma.io/docs/guides/database/seed-database
 */
import { PrismaClient } from '@prisma/client';
// import bcrypt from 'bcrypt'


const prisma = new PrismaClient();

async function main() {
  await createUser();
}

async function createUser() {
  // const password = bcrypt.hash(process.env.SUPER_ADMIN_PASSWORD ?? "" as string, 12);
  const password = process.env.SUPER_ADMIN_PASSWORD;
  const email = process.env.SUPER_ADMIN_USERNAME;

  const firstPostId = '5c03994c-fc16-47e0-bd02-d218a370a078';

  const post = {
    create: {
      id: firstPostId,
      title: 'First Post',
      text: 'This is an example post generated from `prisma/seed.ts`',
    },
  };

  await prisma.user.upsert({
    where: {
      email: email,
    },
    create: {
      email: email,
      password: password,
      role: 'admin',
      posts: post,
    },
    update: {},
  });


}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
