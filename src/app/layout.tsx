import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";


export const metadata: Metadata = {
  title: "Fishiary",
  description: "Fishiary es una plataforma para gestionar tus viajes de pesca y registros de capturas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        
      </head>
      <body className="min-h-screen" suppressHydrationWarning={true}>
        <div className="bg-image" suppressHydrationWarning={true}>
          <ThemeProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </ThemeProvider>
        </div>
      </body>
    </html>
  );
}
