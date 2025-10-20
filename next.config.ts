import { withWhopAppConfig } from "@whop/react/next.config";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	images: {
		remotePatterns: [{ hostname: "**" }],
	},
	async redirects() {
		return [
			{
				source: '/',
				destination: '/dashboard',
				permanent: false,
			},
		]
	},
};

export default withWhopAppConfig(nextConfig);
