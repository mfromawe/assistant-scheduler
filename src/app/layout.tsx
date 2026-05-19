import type { Metadata } from "next";
import { getDictionary, normalizeLocale } from "@/lib/i18n";
import "./globals.css";

const appLocale = normalizeLocale(process.env.DEFAULT_LOCALE);
const { t } = getDictionary(appLocale);

export const metadata: Metadata = {
  title: "Assistant Scheduler",
  description: t("app.description")
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={appLocale}>
      <body>{children}</body>
    </html>
  );
}
