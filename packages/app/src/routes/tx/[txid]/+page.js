export const prerender = true;
export const ssr = false;

/** @type {import('./$types').PageLoad} */
export function load({ params }) {
  return {
    txid: params.txid    
  };
}