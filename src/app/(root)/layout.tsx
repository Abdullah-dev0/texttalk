import Navbar from '@/components/Navbar';
import '@uploadthing/react/styles.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main>
      <Navbar />
      {children}
    </main>
  );
}
