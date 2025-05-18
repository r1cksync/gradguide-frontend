import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function Home() {
  return (
    <div>
      <Navbar />
      <main className="container mx-auto p-4 text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to GradGuide</h1>
        <p className="text-lg mb-6">
          Helping Indian B.Tech students find the right college based on their entrance exam ranks.
        </p>
        <Link
          href="/sign-in"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Get Started
        </Link>
      </main>
    </div>
  );
}