import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nexo | Dashboard de proyectos",
  description: "Laboratorio 11 de Desarrollo Web Avanzado",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
