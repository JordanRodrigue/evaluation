import type { NextConfig } from "next";
import path from "path";

// Derive basePath/assetPrefix from env for GitHub Pages deployments.
// The workflow will set NEXT_PUBLIC_BASE_PATH to "" or "/<repo>".
const envBasePath = process.env.NEXT_PUBLIC_BASE_PATH?.trim();
const computedBasePath = envBasePath && envBasePath !== "/" ? (envBasePath.startsWith("/") ? envBasePath : `/${envBasePath}`) : undefined;
const computedAssetPrefix = computedBasePath ? `${computedBasePath}/` : undefined;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@zama-fhe/relayer-sdk", "@fhevm/mock-utils"],
  experimental: {
    optimizePackageImports: ["@zama-fhe/relayer-sdk"],
  },
  // Static export for GitHub Pages
  output: "export",
  // Use trailingSlash to generate directory-style URLs (about/index.html)
  trailingSlash: true,
  // Only set basePath when provided; keep default in local/dev
  basePath: computedBasePath,
  assetPrefix: computedAssetPrefix,
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    // Ensure subpath import works for mock-utils in the browser bundle
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@fhevm/mock-utils/_esm/fhevm/MockFhevmInstance.js": path.resolve(process.cwd(), "node_modules/@fhevm/mock-utils/_esm/fhevm/MockFhevmInstance.js"),
    };
    return config;
  },
};

export default nextConfig;


