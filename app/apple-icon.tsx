import { ImageResponse } from "next/og";
import { MarkArt } from "@/lib/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(<MarkArt size={180} />, size);
}
