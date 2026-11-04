import Navbar from '@/components/Navbar';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="max-w-6xl mx-auto lg:px-0 px-7">
      <Navbar />
      {children}
    </main>
  );
}
