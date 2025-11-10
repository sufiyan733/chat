import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { SocketProvider } from "@/context/socketContext";



export const metadata: Metadata = {
  title: "CHAT APP",
  description: "CHAT WITH WHOEVER YOU WANTS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppProvider>
          <SocketProvider>
           {children}
           </SocketProvider>
           </AppProvider>
      </body>
    </html>
  );
}
