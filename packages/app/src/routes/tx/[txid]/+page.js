
export const prerender = true;
/** @type {import('./$types').PageLoad} */
export function load({ params }) {
  return {
    txid: params.txid    
  };
}