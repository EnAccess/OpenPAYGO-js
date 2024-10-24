/** @type {import('next').NextConfig} */
const nextConfig = {
  assetPrefix: process.env.NODE_ENV === "production" ? "/OpenPAYGO-js" : "",
  basePath: process.env.NODE_ENV === "production" ? "/OpenPAYGO-js" : "",
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
}

export default nextConfig
