'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { v4 as uuidv4 } from 'uuid';
import { sendChatMessage } from '@/lib/api';
import { ChatMessage, ChatResponse } from '@/lib/types';
import { FaPaperPlane } from 'react-icons/fa';
import axios from 'axios';

export default function ChatWindow() {
  const { userId, getToken, isLoaded } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>(() => localStorage.getItem('sessionId') || uuidv4());
  const [sessions, setSessions] = useState<{ session_id: string, created_at: string, last_message: string, last_updated: string }[]>([]);

  // Persist sessionId and fetch sessions
  useEffect(() => {
    localStorage.setItem('sessionId', sessionId);
    console.log('ChatWindow - User ID:', userId);
    console.log('ChatWindow - Session ID:', sessionId);
    console.log('ChatWindow - Backend URL:', process.env.NEXT_PUBLIC_BACKEND_URL);

    const fetchSessions = async () => {
      if (!userId || !isLoaded) return;
      try {
        const token = await getToken();
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chatbot/sessions/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSessions(response.data.sessions);
      } catch (err) {
        console.error('Failed to fetch sessions:', err);
      }
    };
    fetchSessions();
  }, [userId, sessionId, isLoaded]);

  // Load session messages
  const loadSession = async (selectedSessionId: string) => {
    setSessionId(selectedSessionId);
    localStorage.setItem('sessionId', selectedSessionId);
    setIsLoading(true);
    try {
      const token = await getToken();
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chatbot/messages/${userId}/${selectedSessionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data.messages);
    } catch (err) {
      console.error('Failed to load session messages:', err);
      setError('Failed to load session messages');
    } finally {
      setIsLoading(false);
    }
  };

  const startNewSession = () => {
    const newSessionId = uuidv4();
    setSessionId(newSessionId);
    setMessages([]);
    localStorage.setItem('sessionId', newSessionId);
  };

  const handleSend = async () => {
    if (!input.trim() || !userId || !isLoaded) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages([...messages, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const token = await getToken();
      console.log('Sending chat message:', { messages: [userMessage], userId, sessionId, token });
      const response: ChatResponse = await sendChatMessage([userMessage], userId, sessionId, token);
      setMessages([...messages, userMessage, { role: 'assistant', content: response.response }]);
    } catch (error: any) {
      console.error('ChatWindow error:', error);
      setError(`Failed to get response: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isLoaded) return <div>Loading...</div>;
  if (!userId) return <div>Please sign in to use the chat.</div>;

  return (
    <div className="flex flex-col h-[600px] border rounded-lg shadow-lg">
      <div className="p-4 border-b flex justify-between items-center">
        <span>Chat Session: {sessionId.slice(0, 8)}</span>
        <div>
          <select
            onChange={(e) => loadSession(e.target.value)}
            value={sessionId}
            className="mr-2 p-2 border rounded"
          >
            <option value={sessionId}>Current Session</option>
            {sessions.map((session) => (
              <option key={session.session_id} value={session.session_id}>
                {session.last_message?.slice(0, 20) || 'Session'} ({new Date(session.created_at).toLocaleDateString()})
              </option>
            ))}
          </select>
          <button
            onClick={startNewSession}
            className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            New Session
          </button>
        </div>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((msg, index) => (
          <div key={index} className={`mb-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
            <span
              className={`inline-block p-2 rounded-lg ${
                msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'
              }`}
            >
              {msg.content}
            </span>
          </div>
        ))}
        {isLoading && <div className="text-center">Loading...</div>}
        {error && <div className="text-red-500 text-center">{error}</div>}
      </div>
      <div className="p-4 border-t flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 p-2 border rounded-l-lg focus:outline-none"
          placeholder="Ask about colleges (e.g., What is the average placement for IIT Delhi CSE?)"
          disabled={isLoading}
        />
        <button
          onClick={handleSend}
          className="p-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 disabled:bg-gray-400"
          disabled={isLoading}
        >
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
}