import { Poppins } from "next/font/google";
import "./globals.css";
import SessionWrapper from "../sessionwraper/Sessionwrapper";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-poppins",
});

export const metadata = {
  title: "EcoTrack | Smart Waste Management",
  description: "Smart Waste Management for a Cleaner Tomorrow",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={poppins.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="font-poppins bg-appBg text-textPrimary selection:bg-secondary/30">
        <SessionWrapper>{children}</SessionWrapper>
      </body>
    </html>
  );
}
