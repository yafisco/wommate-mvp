import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // Désactiver le CSP strict temporairement pour déboguer
    // En production, il faudrait configurer un CSP approprié
  },
};

export default nextConfig;
