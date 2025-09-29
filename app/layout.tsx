
import "./../styles/globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Căutător de Articole",
  description: "Caută știri și articole, filtrează și exportă.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ro">
      <body className="bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}
