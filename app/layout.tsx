import './globals.css';
import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: { default: 'ClínicaVet | Areeiro', template: '%s | ClínicaVet' },
  description:
    'Aplicação local de formação: uma clínica, os seus pacientes e a base SQL que os liga.',
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-PT">
      <body>{children}</body>
    </html>
  );
}
