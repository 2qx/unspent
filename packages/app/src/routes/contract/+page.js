export async function load({ url }) {
	let opReturn = url.searchParams.get('opReturn') || undefined;
	let serialized = url.searchParams.get('serialized') || undefined;
	return { opReturn, serialized };
}
