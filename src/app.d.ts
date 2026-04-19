// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

declare global {
	// Augment the auto-generated Env with secrets not tracked in wrangler.jsonc
	interface Env {
		QUOTES_API_TOKEN?: string;
		ADMIN_PASSWORD?: string;
		GITHUB_TOKEN?: string;
	}
	namespace App {
		interface Platform {
			env: Env;
			ctx: ExecutionContext;
			caches: CacheStorage;
			cf?: IncomingRequestCfProperties
		}

		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
	}
}

export {};
