import { useRouter } from 'next/router';
import Link from 'next/link';
import { signIn, useSession, signOut } from 'next-auth/react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  if (status === 'unauthenticated') {
    router.push('/');
    return null;
  }

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-md">
        <nav className="mt-5">
          <button type="button" onClick={handleSignOut}
                  className="block px-4 py-2 text-gray-600 hover:bg-gray-200">
            Logout
          </button>
          <Link href="/admin/ManageUsersPage" className="block px-4 py-2 text-gray-600 hover:bg-gray-200">
            Manage Users
          </Link>
        </nav>
      </aside>
      <main className="flex-1 p-10">
        {children}
      </main>
    </div>
  );
}