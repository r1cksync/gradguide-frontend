import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs';
import Navbar from '@/components/Navbar';
import ChatWindow from '@/components/ChatWindow';

export default function ChatPage() {
  return (
    <div>
      <SignedIn>
        <Navbar />
        <main className="container mx-auto p-4">
          <h1 className="text-3xl font-bold mb-4">Chat with GradGuide</h1>
          <ChatWindow />
        </main>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </div>
  );
}