export const prerender = true;
export const ssr = false;
export async function load({ fetch }) {
	const res = await fetch(`./stats.json`);
	const series = await res.json();

	return { series };
}