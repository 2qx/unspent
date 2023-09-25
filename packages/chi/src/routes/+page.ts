// since there's no dynamic data here, we can prerender
// it so that it gets served as a static asset in production
export const ssr = false;
export const prerender = true;

export async function load({ url }) { 
	let q = url.searchParams.get('q') || undefined;
	let addr = url.searchParams.get('addr') || undefined;
	return { q, addr };
}