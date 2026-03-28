import { useAdmin } from '@/contexts/AdminContext';
import { AdminLogin } from '@/components/admin/AdminLogin';
import Home from '@/pages/Home';

export default function Admin() {
  const { isAdmin } = useAdmin();
  return isAdmin ? <Home /> : <AdminLogin />;
}
