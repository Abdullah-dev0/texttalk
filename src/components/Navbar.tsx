'use client';

import { Show, UserButton } from '@clerk/nextjs';
import Link from 'next/link';

import { Button } from './ui/button';

const Navbar = () => {
  return (
    <nav className="sticky h-14 inset-x-0 top-0 z-30 w-full max-w-6xl mx-auto">
      <div className="flex h-14 items-center justify-between  border-zinc-200">
        <Link href="/" className="flex z-40 font-semibold">
          <span className="text-lg">TextTalk</span>
        </Link>

        <Show when="signed-in">
          <UserButton />
        </Show>

        <Show when="signed-out">
          <Link href="/sign-in">
            <Button className="cursor-pointer">Login</Button>
          </Link>
        </Show>
      </div>
    </nav>
  );
};

export default Navbar;
