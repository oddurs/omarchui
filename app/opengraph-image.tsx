import { ImageResponse } from "next/og";
import { MarkArt } from "@/lib/og";

export const alt = "Omarchui: Omarchy, tuned";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(<MarkArt size={420} title="Omarchy, tuned." subtitle="One unit, one focus ring, two faces, eighteen colour roles." />, size);
}
