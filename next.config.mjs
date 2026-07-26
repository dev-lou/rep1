/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow Cloudinary images
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
  // Disable powered-by header
  poweredByHeader: false,
  // React strict mode for development
  reactStrictMode: true,
  // Allow HMR from network IP (kiosk accesses via 192.168.0.113)
  allowedDevOrigins: ["192.168.0.113"],
};

export default nextConfig;
