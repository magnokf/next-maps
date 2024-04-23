import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import CustomMap from "../components/CustomMap";

const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mapa das Unidades do CBMERJ",
  description: "A ferramenta tem o objetivo de ajudar o cidadão a encontrar e sugerir o melhor caminho para as unidades do CBMERJ conforme o serviço a ser solicitado, seja por carro, bicicleta, transporte público ou até mesmo caminhando.",
};

export default async function RootLayout({
  children
}: {children: React.ReactNode}) {
  return (
      <html lang="pt-br">
        <body className={montserrat.className} suppressHydrationWarning={true}>
        {children}
        </body>
      </html>
  );
}