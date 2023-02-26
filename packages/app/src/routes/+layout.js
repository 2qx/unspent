export const prerender = true;
export const ssr = false;
export async function load({ url }) {
	let splash = false;
	if (url.pathname === '/') splash = true;
	let isLocal =
		url.hostname.includes('localhost') || url.hostname.includes('127.0.0.1') ? true : false;
	let isDevelopment = url.hostname.includes('unspent.dev') ? true : false;
	return { splash, isLocal, isDevelopment };
}
