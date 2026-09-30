import { pageUser } from '@/lib/auth';
import { PortalShell } from '@/components/app-shell';
export default async function Layout({ children }: { children: React.ReactNode }) {
  return <PortalShell user={await pageUser('client')}>{children}</PortalShell>;
}
