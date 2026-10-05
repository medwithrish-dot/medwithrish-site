import type { Metadata } from "next";
import { getProductSiteUrl } from "@/utils/site-url";
import { getMedicForestEntitlements } from "@/utils/medicforest/premium-access";
import { FeatureAccessProvider } from "./_components/FeatureAccessProvider";

export const metadata: Metadata = {
  metadataBase: new URL(getProductSiteUrl()),
  title: "MedicForest",
  description:
    "Medical school Med interview practice, free questions and personalised admissions tutoring.",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/brand/medicforest-tree-mark.png",
    apple: "/brand/medicforest-tree-mark.png",
  },
  openGraph: {
    title: "MedicForest",
    description:
      "Medical school Med interview practice, free questions and personalised admissions tutoring.",
    url: "/",
    siteName: "MedicForest",
    type: "website",
  },
};

export default async function MedicForestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <FeatureAccessProvider entitlements={await getMedicForestEntitlements()}>{children}</FeatureAccessProvider>;
}
