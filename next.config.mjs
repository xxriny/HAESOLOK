/** @type {import('next').NextConfig} */
const nextConfig = {
  // LanceDB, Xenova/transformers 는 네이티브 바이너리를 포함하므로
  // Webpack 번들링에서 제외하고 Node.js require() 로 직접 로드
  experimental: {
    serverComponentsExternalPackages: [
      "@lancedb/lancedb",
      "@xenova/transformers",
      "sharp",
      "onnxruntime-node",
    ],
  },
};

export default nextConfig;
