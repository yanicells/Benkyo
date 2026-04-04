import type { Metadata } from "next";
import { ProfileClient } from "@/components/profile/profile-client";
import lessonsData from "@/data/lessons.json";
import type { LessonsData } from "@/lib/types";

export const metadata: Metadata = {
  title: "Profile",
};

export default function ProfilePage() {
  const { lessons } = lessonsData as LessonsData;
  return <ProfileClient lessons={lessons} />;
}
