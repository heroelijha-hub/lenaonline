import { getSupervisionData } from '@/actions/supervision';
import SupervisionClient from './SupervisionClient';

export const dynamic = 'force-dynamic';

export default async function AdminSupervisionPage() {
  const initialData = await getSupervisionData();

  return (
    <div className="max-w-7xl mx-auto">
      <SupervisionClient initialData={initialData} />
    </div>
  );
}
