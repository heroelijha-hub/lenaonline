import { getAdminSessions } from '@/actions/chat';
import AdminChatClient from './AdminChatClient';

export default async function AdminChatPage() {
  const initialSessions = await getAdminSessions();

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Support Chat</h1>
        <p className="text-gray-500">Répondez aux questions de vos clients en direct.</p>
      </div>

      <AdminChatClient initialSessions={initialSessions} />
    </>
  );
}
