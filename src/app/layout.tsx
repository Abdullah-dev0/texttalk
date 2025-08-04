import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/react";
import { Inter } from "next/font/google";

import Providers from "@/components/Providers";
import "simplebar-react/dist/simplebar.min.css";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { cn, constructMetadata } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata = constructMetadata();

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<ClerkProvider afterMultiSessionSingleSignOutUrl="/">
			<html lang="en" className="light">
				<Providers>
					<body className={cn("min-h-screen font-sans antialiased grainy", inter.className)}>
						<Toaster duration={3000} richColors />
						{children}
						<Analytics />
					</body>
				</Providers>
			</html>
		</ClerkProvider>
	);
}
