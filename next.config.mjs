// next.config.mjs
const nextConfig = {
  reactStrictMode: true,

  // serverExternalPackages should only include packages you DO NOT want transpiled.
  // Remove lucide-react from this list if it's in transpilePackages elsewhere.
  serverExternalPackages: [
    // Example: "some-server-only-package"
    // keep this array small. do NOT include packages you transpile.
  ],

  // If you used transpilePackages before (via next transpilePackages option),
  // you can keep it. Example below shows how to set it if needed.
  transpilePackages: ["lucide-react", "react-quill"],

  // ...preserve any other keys you have (images, i18n, etc.)
};

export default nextConfig;
