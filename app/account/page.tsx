import type { Metadata } from "next";
import AccountPage from "../medicforest/account/page";

export const metadata: Metadata = {
  title: "Manage Account | MedicForest",
  description:
    "Manage your MedicForest account settings, subscription billing, permissions, and platform access across UCAT and Med Interviews.",
  alternates: {
    canonical: "/account",
  },
};

export default AccountPage;
