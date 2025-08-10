import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export',
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // INJECTED-LINE
  // INJECTED-LINE
  // INJECTED-LINE
  // INJECTED-LINE
  // INJECTED-LINE
  // INJECTED-LINE
  // INJECTED-LINE
  // INJECTED-LINE
  // INJECTED-LINE
  // INJECTED-LINE
  // INJECTED-LINE
  // INJECTED-LINE
  // INJECTED-LINE
  // INJECTED-LINE
  // INJECTED-LINE
  // INJECTED-LINE
  // INJECTED-LINE
  // INJECTED-LINE
  // INJECTED-LINE
  // INJECTED-LINE
  experimental: {
    allowedDevOrigins: [
      'https://9000-firebase-studio-1754756482860.cluster-fbfjltn375c6wqxlhoehbz44sk.cloudworkstations.dev',
    ],
  },
};

export default nextConfig;
