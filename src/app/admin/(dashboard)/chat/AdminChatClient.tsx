'use client';

import { useState, useEffect, useRef } from 'react';
import { getAdminSessions, sendMessage, closeSession, getSessionMessages } from '@/actions/chat';
import { ChatSender, ChatMessage, ChatSession } from '@prisma/client';

export default function AdminChatClient({ initialSessions }: { initialSessions: any[] }) {
  const [sessions, setSessions] = useState(initialSessions);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Poll for sessions (left sidebar)
  useEffect(() => {
    const interval = setInterval(async () => {
      const freshSessions = await getAdminSessions();
      setSessions(freshSessions);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch and poll messages for active session
  useEffect(() => {
    if (!activeSessionId) return;

    const fetchMessages = async () => {
      const msgs = await getSessionMessages(activeSessionId);
      setMessages(msgs);
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [activeSessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeSessionId) return;

    const tempMsg = {
      id: 'temp-' + Date.now(),
      sessionId: activeSessionId,
      sender: ChatSender.ADMIN,
      content: newMessage,
      createdAt: new Date(),
    } as ChatMessage;

    setMessages([...messages, tempMsg]);
    setNewMessage('');

    const savedMsg = await sendMessage(activeSessionId, ChatSender.ADMIN, tempMsg.content);
    setMessages(prev => prev.map(m => m.id === tempMsg.id ? savedMsg : m));
  };

  const handleClose = async () => {
    if (!activeSessionId) return;
    if (confirm("Are you sure you want to close this conversation?")) {
      await closeSession(activeSessionId);
      setActiveSessionId(null);
      setSessions(await getAdminSessions());
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex h-[600px]">
      {/* Sidebar: Sessions List */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col bg-gray-50">
        <div className="p-4 border-b border-gray-200 bg-white">
          <h2 className="font-bold text-gray-900">Active Conversations</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {sessions.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSessionId(s.id)}
              className={`w-full text-left p-4 border-b border-gray-100 hover:bg-orange-50 transition ${activeSessionId === s.id ? 'bg-orange-100' : ''}`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium text-sm text-gray-900">
                  {s.guestName ? s.guestName : `Guest ${s.guestId.substring(0, 6)}`}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${s.status === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}>
                  {s.status}
                </span>
              </div>
              {s.guestEmail && (
                <p className="text-xs text-orange-600 mb-1 truncate">{s.guestEmail}</p>
              )}
              <p className="text-xs text-gray-500 truncate">
                {s.messages?.[0]?.content || 'No messages'}
              </p>
            </button>
          ))}
          {sessions.length === 0 && (
            <div className="p-4 text-sm text-gray-500 text-center">No conversations.</div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {activeSessionId ? (
          <>
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white">
              <div>
                <h3 className="font-bold text-gray-900">
                  {sessions.find(s => s.id === activeSessionId)?.guestName || 'Visiteur'}
                </h3>
                {sessions.find(s => s.id === activeSessionId)?.guestEmail && (
                  <p className="text-sm text-gray-500">{sessions.find(s => s.id === activeSessionId)?.guestEmail}</p>
                )}
              </div>
              <button onClick={handleClose} className="text-sm text-red-600 hover:text-red-700 font-medium">
                Fermer la session
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-4">
              {messages.map((msg) => {
                const isAdmin = msg.sender === ChatSender.ADMIN;
                return (
                  <div key={msg.id} className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                      isAdmin ? 'bg-orange-600 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-900 rounded-bl-none'
                    }`}>
                      {msg.content}
                    </div>
                    <span className="text-xs text-gray-400 mt-1">
                      {new Date(msg.createdAt).toLocaleString()}
                    </span>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-white border-t border-gray-200">
              <form onSubmit={handleSend} className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Write a reply..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-md font-medium transition disabled:opacity-50"
                >
                  Envoyer
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 flex-col">
            <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            <p>Select a conversation to start</p>
          </div>
        )}
      </div>
    </div>
  );
}
