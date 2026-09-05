const nextConfig = {
  serverExternalPackages: ['node-edge-tts', 'ws'],
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true }
};
export default nextConfig;
