import Link from 'next/link';

const year = new Date().getFullYear();

const links = [
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
  { href: '/contact', label: 'Contact' },
];

const Footer = () => {
  return (
    <footer className="mt-32 border-t bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/40">
      <div className="py-10">
        <div className="flex flex-col items-center justify-between gap-6 text-center text-sm text-muted-foreground md:flex-row md:text-left">
          <p>&copy; {year} TextTalk. All rights reserved.</p>
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="hover:text-foreground transition-colors"
              >
                {l.label}
              </Link>
            ))}
            <a
              href="https://github.com/Abdullah-dev0"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              GitHub
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
