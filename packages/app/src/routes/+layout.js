export const prerender = true;
export const ssr = false;
export async function load({url}) {
  let splash = false
  if(url.pathname === "/") splash = true
  return {splash}
}