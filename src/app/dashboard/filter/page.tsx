import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs';
import Navbar from '@/components/Navbar';
import FilterForm from '@/components/FilterForm';

export default function FilterPage() {
  return (
    <div>
      <SignedIn>
        <Navbar />
        <main className="container mx-auto p-4">
          <h1 className="text-3xl font-bold mb-4">Filter Colleges</h1>
          <FilterForm />
        </main>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </div>
  );
}