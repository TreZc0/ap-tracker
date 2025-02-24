// https://nextjs.org/docs/app/building-your-application/upgrading/from-create-react-app
import type { NextConfig } from 'next'
 
const nextConfig: NextConfig = {
  output: 'export', // Outputs a Single-Page Application (SPA)
  distDir: 'build', // Changes the build output directory to `build`
  basePath: '/ap-tracker'
}
 
export default nextConfig