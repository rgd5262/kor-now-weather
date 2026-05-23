import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WeatherWise KR",
  description: "한국 날씨와 야외활동 추천을 한 화면에서 확인하세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full scroll-smooth">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
