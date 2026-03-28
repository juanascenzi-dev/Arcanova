import { useAdmin } from '@/contexts/AdminContext';
import { AdminLogin } from '@/components/admin/AdminLogin';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

export default function Admin() {
  const { isAdmin } = useAdmin();
  return isAdmin ? <AdminDashboard /> : <AdminLogin />;
}
