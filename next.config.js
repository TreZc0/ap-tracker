/** @import { NextConfig } from 'next' */
/** @type {NextConfig} */
const nextConfig = {
  output: 'export', // Outputs a Single-Page Application (SPA)
  distDir: 'build', // Changes the build output directory to `build`
  assetPrefix: './',
}
 
export default nextConfig