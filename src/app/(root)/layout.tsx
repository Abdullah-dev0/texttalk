import Navbar from '@/components/Navbar';
import '@uploadthing/react/styles.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="max-w-7xl mx-auto">
      <Navbar />
      {children}
    </main>
  );
}
