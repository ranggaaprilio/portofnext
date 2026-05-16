/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["images.unsplash.com", "assets.aceternity.com"],
  },
  async rewrites() {
    return {
      afterFiles: [
        {
          source: "/devtools",
          destination: "/devtools/index.html",
        },
        {
          source: "/devtools/:path*",
          destination: "/devtools/index.html",
        },
      ],
    };
  },
};

export default nextConfig;
