import type { Metadata } from "next";
import { VisionWaitlist } from "@/components/vision-waitlist";

export const metadata: Metadata = {
  title: "Vision of Life — EYEBREED",
  description: "Join the EYEBREED Vision of Life pre-order list.",
};

export default function VisionPage() {
  return <VisionWaitlist />;
}
