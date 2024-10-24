/** @type {import('next').NextConfig} */

const isProd = process.env.NODE_ENV === "production"

const nextConfig = {
  // Add leading slash to assetPrefix
  assetPrefix: isProd ? "/OpenPAYGO-js" : "",
  basePath: isProd ? "/OpenPAYGO-js" : "",
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
