import { pageUser } from '@/lib/auth';
import { AppShell } from '@/components/app-shell';
export default async function Layout({ children }: { children: React.ReactNode }) {
  return <AppShell user={await pageUser('staff')}>{children}</AppShell>;
}
