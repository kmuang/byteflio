
import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ByteFolio | Developer Terminal Portfolio',
  description: 'An interactive command-line interface portfolio built with Next.js and Tailwind CSS.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen bg-background overflow-hidden">
        {children}
      </body>
    </html>
  );
}
