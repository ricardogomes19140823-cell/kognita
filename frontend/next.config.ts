import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export", // Gera arquivos estáticos (HTML/CSS/JS) em vez de servidor Node
  images: {
    unoptimized: true, // Necessário para exportação estática
  },
};

export default nextConfig;
