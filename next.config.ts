import type { NextConfig } from "next";

const withNextIntl = require('next-intl/plugin')('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  turbopack: {},
};

export default withNextIntl(nextConfig);
