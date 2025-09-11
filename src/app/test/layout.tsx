import type { Metadata } from "next";
import "./main.css";

export const metadata: Metadata = {
  title: "测试页",
  description: "test page",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="container">
      <main>{children}</main>
    </div>
  );
}
