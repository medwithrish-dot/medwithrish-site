import type { Metadata } from "next";
import { Suspense } from "react";
import { Analytics } from "@vercel/analytics/next";
import RouteLoadingBar from "@/components/RouteLoadingBar";
import { getPublicSiteUrl } from "@/utils/site-url";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(getPublicSiteUrl()),
  title: "MedWithRish",
  description:
    "Medical and dental school admissions guides, Med interview preparation, tutoring and application resources from MedWithRish.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col font-sans">
        <Suspense fallback={null}>
          <RouteLoadingBar />
        </Suspense>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
