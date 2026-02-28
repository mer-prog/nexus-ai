import type { Metadata } from "next";
import { cookies } from "next/headers";
import { defaultLocale } from "@/i18n/config";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nexus AI — SaaS Dashboard",
  description: "AI-integrated SaaS management dashboard",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const lang = cookieStore.get("locale")?.value ?? defaultLocale;

  return (
    <html lang={lang} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
