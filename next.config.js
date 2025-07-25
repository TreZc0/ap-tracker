// This file must be left as a .js file for the GitHub workflow to properly update it
/** @import { NextConfig } from 'next' */
/** @type {NextConfig} */
const nextConfig = {
    output: "export", // Outputs a Single-Page Application (SPA)
    distDir: "build", // Changes the build output directory to `build`
    assetPrefix: "./", //comment out for local server builds to work with hot reload
};

export default nextConfig;
