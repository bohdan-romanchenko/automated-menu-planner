import "~/styles/globals.css";
import { Theme, ThemePanel } from "@radix-ui/themes";
import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import "@radix-ui/themes/styles.css";

export const metadata: Metadata = {
  title: "Kitchen Inventory",
  description: "Track your kitchen ingredients",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.variable}>
      <body>
        <Theme
          appearance="light"
          accentColor="lime"
          grayColor="slate"
          radius="none"
          scaling="95%"
          className="print:!block"
        >
          {children}
          <ThemePanel defaultOpen={false} className="print-hide" />
        </Theme>
      </body>
    </html>
  );
}
