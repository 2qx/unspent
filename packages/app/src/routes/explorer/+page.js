export async function load({ url }) {
	let tx = url.searchParams.get('tx') || undefined;
	let cashaddr = url.searchParams.get('cashaddr') || undefined;
	let lockingBytecode = url.searchParams.get('lockingBytecode') || undefined;
	let network = url.searchParams.get('network') || undefined;
	return { tx, cashaddr, lockingBytecode, network };
}
