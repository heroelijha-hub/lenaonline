import { getTranslations } from 'next-intl/server';
import { getAdminSessions } from '@/actions/chat';
import AdminChatClient from './AdminChatClient';

export default async function AdminChatPage() {
  const t = await getTranslations('AdminChat');
  const initialSessions = await getAdminSessions();

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
        <p className="text-gray-500">{t('subtitle')}</p>
      </div>

      <AdminChatClient initialSessions={initialSessions} />
    </>
  );
}
