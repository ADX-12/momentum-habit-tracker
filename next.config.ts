const isGithubActions = process.env.GITHUB_ACTIONS || false;
const repoName = 'momentum-habit-tracker';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: isGithubActions ? `/${repoName}` : '',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Allow recharts and other ESM packages
  transpilePackages: ['recharts'],
};

export default nextConfig;
