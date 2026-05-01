import { createRequestHandler } from 'react-router';

//region Inicializacao React Router
declare module 'react-router' {
	export interface AppLoadContext {
		cloudflare: {
			env: Env;
			ctx: ExecutionContext;
		};
	}
}

const requestHandler = createRequestHandler(
	() => import('virtual:react-router/server-build'),
	import.meta.env.MODE
);
//endregion

/**
 * Cloudflare Worker Entry Point
 */
export default {
	async fetch(request, env, ctx) {
		return requestHandler(request, {
			cloudflare: { env, ctx }
		});
	},
} satisfies ExportedHandler<Env>;
