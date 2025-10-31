import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hedgie — Your Web3 Buddy on Telegram",
  description: "Create wallets, send crypto, launch tokens, and gift NFTs — all inside Telegram with Hedgie, powered by Hedera.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

