import { defineMiddleware } from 'astro:middleware';
import { handleProbeRequest } from './lib/probe-decoys';

export const onRequest = defineMiddleware(async (context, next) => {
	const probeResponse = handleProbeRequest(context.request);

	if (probeResponse) {
		return probeResponse;
	}

	return next();
});