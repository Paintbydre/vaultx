import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { WhopProvider } from "@/components/WhopProvider";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "VaultX - Secure File Delivery",
	description: "Professional file hosting and download tracking platform",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<WhopProvider>{children}</WhopProvider>
			</body>
		</html>
	);
}
