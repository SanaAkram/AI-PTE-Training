import type { Metadata } from "next";
import { Baloo_2, Nunito_Sans, Noto_Nastaliq_Urdu } from "next/font/google";
import { AudioRateProvider } from "@/lib/hooks/useAudioRate";
import "./globals.css";

const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});
const nunito = Nunito_Sans({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});
const nastaliq = Noto_Nastaliq_Urdu({
  variable: "--font-nastaliq",
  subsets: ["arabic"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "انگریزی سفر · Angrezi Safar",
  description: "Mubeen's real PTE training platform — Speaking, Writing, Reading, Listening.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${baloo.variable} ${nunito.variable} ${nastaliq.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg text-ink">
        <AudioRateProvider>{children}</AudioRateProvider>
      </body>
    </html>
  );
}
