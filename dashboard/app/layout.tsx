import type { Metadata, Viewport } from "next";
import { Geist, Noto_Sans_Sinhala } from "next/font/google";
import { StoreProvider } from "@/lib/store";
import { Toast } from "@/components/ui";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], weight: ["300", "400", "500", "600"], variable: "--font-geist" });
const si = Noto_Sans_Sinhala({ subsets: ["sinhala"], weight: ["400", "500"], variable: "--font-si" });

export const metadata: Metadata = {
  title: "UniKey Teacher",
  description: "Prototype teacher dashboard (fake data)",
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#E3ECFB" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${si.variable}`}>
      <body>
        <StoreProvider>
          <div className="ribbon">
            <b>Prototype</b> · fake class, nothing is saved online
          </div>
          {children}
          <Toast />
        </StoreProvider>
      </body>
    </html>
  );
}
