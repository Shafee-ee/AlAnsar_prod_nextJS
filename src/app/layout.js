// src/app/layout.js
import "./globals.css";
import { Inter } from "next/font/google";
import ClientAppWrapper from "../components/ClientAppWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "ALANSARWEEKLY - Your Islamic Guide",
  description: "An Islamic Q&A platform and weekly publication.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* ClientAppWrapper is a client component that includes AuthProvider, Navbar, Footer */}
        <ClientAppWrapper>{children}</ClientAppWrapper>
      </body>
    </html>
  );
}
