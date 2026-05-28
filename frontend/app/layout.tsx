import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Crediclass - Estudo Financeiro',
  description: 'Dashboard de Grupos - Crediclass',
  viewport: 'width=device-width, initial-scale=1',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-slate-950 text-slate-200">
        {children}
      </body>
    </html>
  );
}
