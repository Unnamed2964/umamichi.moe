import { handle } from '@astrojs/cloudflare/handler';
import { handleProbeRequest } from './lib/probe-decoys';

const worker = {
	async fetch(request: Request, env: unknown, ctx: unknown) {
		const probeResponse = handleProbeRequest(request);

		if (probeResponse) {
			return probeResponse;
		}

		return handle(request, env as never, ctx);
	},
};

export default worker;