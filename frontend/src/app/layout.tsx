import type { Metadata } from "next";
import "./globals.css";
import { AppThemeProvider } from "./theme-provider";

export const metadata: Metadata = {
  title: "Supply Chain Management System",
  description: "Sign up and login foundation for the supply chain dashboard"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AppThemeProvider>{children}</AppThemeProvider>
      </body>
    </html>
  );
}
