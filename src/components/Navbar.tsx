'use client';

import { SignedIn, UserButton, SignedOut } from '@clerk/nextjs';
import Link from 'next/link';

import { Button } from './ui/button';

const Navbar = () => {
  return (
    <nav className="sticky h-14 inset-x-0 top-0 z-30 w-full max-w-6xl mx-auto">
      <div className="flex h-14 items-center justify-between  border-zinc-200">
        <Link href="/" className="flex z-40 font-semibold">
          <span className="text-lg">TextTalk</span>
        </Link>

        <SignedIn>
          <UserButton />
        </SignedIn>

        <SignedOut>
          <Link href="/sign-in">
            <Button className="cursor-pointer">Login</Button>
          </Link>
        </SignedOut>
      </div>
    </nav>
  );
};

export default Navbar;
