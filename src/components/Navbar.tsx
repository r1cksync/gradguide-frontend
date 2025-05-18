import { UserButton, SignedIn, SignedOut } from '@clerk/nextjs';
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          GradGuide
        </Link>
        <div className="space-x-4">
          <SignedIn>
            <Link href="/dashboard" className="hover:underline">
              Dashboard
            </Link>
            <Link href="/dashboard/chat" className="hover:underline">
              Chat
            </Link>
            <Link href="/dashboard/filter" className="hover:underline">
              Filter
            </Link>
            <UserButton />
          </SignedIn>
          <SignedOut>
            <Link href="/sign-in" className="hover:underline">
              Sign In
            </Link>
            <Link href="/sign-up" className="hover:underline">
              Sign Up
            </Link>
          </SignedOut>
        </div>
      </div>
    </nav>
  );
}