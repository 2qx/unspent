// since there's no dynamic data here, we can prerender
// it so that it gets served as a static asset in production
export const ssr = false;
export const prerender = true;

export async function load({ url }) { 
	let q = url.searchParams.get('q') || undefined;
  let p = url.searchParams.get('p') || undefined;
	let cashaddr = url.searchParams.get('cashaddr') || undefined;
	let lockingBytecode = url.searchParams.get('lockingBytecode') || undefined;
	let base58 = url.searchParams.get('base58') || undefined;
	return { q, p, cashaddr, lockingBytecode, base58 };
}