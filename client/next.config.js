/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "http", hostname: "localhost" },
    ],
  },
  // Every page here requires a valid session (see ProtectedRoute), so we
  // tell the browser not to cache the HTML response itself. This is a
  // second layer of defense on top of the bfcache check in ProtectedRoute:
  // even a fresh request for a protected URL after logout won't be served
  // from a cached copy that was rendered while the user was still logged in.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, must-revalidate" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
