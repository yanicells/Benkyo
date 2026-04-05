import type { Metadata } from "next";
import { InstallClient } from "@/components/install/install-client";

export const metadata: Metadata = {
  title: "Install Benkyo",
};

export default function InstallPage() {
  return <InstallClient />;
}
