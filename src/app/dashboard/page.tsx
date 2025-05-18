import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function Dashboard() {
  return (
    <div>
      <SignedIn>
        <Navbar />
        <main className="container mx-auto p-4">
          <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/dashboard/chat"
              className="p-4 border rounded-lg text-center hover:bg-blue-50"
            >
              <h2 className="text-xl font-semibold">Chat with GradGuide</h2>
              <p>Ask about colleges, placements, or anything else!</p>
            </Link>
            <Link
              href="/dashboard/filter"
              className="p-4 border rounded-lg text-center hover:bg-blue-50"
            >
              <h2 className="text-xl font-semibold">Filter Colleges</h2>
              <p>Find colleges based on your exam ranks.</p>
            </Link>
          </div>
        </main>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </div>
  );
}