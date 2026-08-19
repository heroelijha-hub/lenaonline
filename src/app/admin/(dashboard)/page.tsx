import { redirect } from 'next/navigation';

export default function AdminDashboardPage() {
  // Rediriger vers la page des commandes par défaut
  redirect('/admin/orders');
}
