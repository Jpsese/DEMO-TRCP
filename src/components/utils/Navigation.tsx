'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { signOut, useSession } from 'next-auth/react';

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '~/components/ui/navigation-menu';

export function Navigation() {
  const router = useRouter();
  const { data: session } = useSession();

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/');
  };

  return (
    <NavigationMenu className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <NavigationMenuList className="flex items-center justify-between w-full">

        {session && (
          <>
            <NavigationMenuItem>
              <Link href="/profile" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Profile
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>

            {session?.user?.role === 'admin' ? (
              <NavigationMenuItem>
                <Link href="/admin/manage-users" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Manage Users
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            ) : (
              <NavigationMenuItem>
                <Link href="/users/manage-posts" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Manage Posts
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            )}

            <NavigationMenuItem>
              <button
                onClick={handleSignOut}
                className={`${navigationMenuTriggerStyle()} bg-red-500 text-white hover:bg-red-600`}
              >
                Sign Out
              </button>
            </NavigationMenuItem>
          </>
        )}
      </NavigationMenuList>
    </NavigationMenu>
  );
}