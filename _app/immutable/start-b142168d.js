import{S as Me,i as Xe,s as Ye,a as Qe,e as B,c as Ze,b as G,g as ce,t as J,d as fe,f as F,h as K,j as et,o as be,k as tt,l as nt,m as rt,n as we,p as C,q as at,r as ot,u as st,v as H,w as M,x as Le,y as X,z as Y,A as xe}from"./chunks/index-f7ae3298.js";import{g as Be,f as Je,s as z,a as ve,i as it}from"./chunks/singletons-c968b277.js";import{s as lt}from"./chunks/paths-f4cc45d5.js";const ct=function(){const e=document.createElement("link").relList;return e&&e.supports&&e.supports("modulepreload")?"modulepreload":"preload"}(),ft=function(n,e){return new URL(n,e).href},Fe={},N=function(e,t,l){return!t||t.length===0?e():Promise.all(t.map(s=>{if(s=ft(s,l),s in Fe)return;Fe[s]=!0;const d=s.endsWith(".css"),a=d?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${s}"]${a}`))return;const f=document.createElement("link");if(f.rel=d?"stylesheet":ct,d||(f.as="script",f.crossOrigin=""),f.href=s,document.head.appendChild(f),d)return new Promise((_,m)=>{f.addEventListener("load",_),f.addEventListener("error",()=>m(new Error(`Unable to preload CSS for ${s}`)))})})).then(()=>e())};function ut(n,e){return n==="/"||e==="ignore"?n:e==="never"?n.endsWith("/")?n.slice(0,-1):n:e==="always"&&!n.endsWith("/")?n+"/":n}function dt(n){for(const e in n)n[e]=n[e].replace(/%23/g,"#").replace(/%3[Bb]/g,";").replace(/%2[Cc]/g,",").replace(/%2[Ff]/g,"/").replace(/%3[Ff]/g,"?").replace(/%3[Aa]/g,":").replace(/%40/g,"@").replace(/%26/g,"&").replace(/%3[Dd]/g,"=").replace(/%2[Bb]/g,"+").replace(/%24/g,"$");return n}const pt=["href","pathname","search","searchParams","toString","toJSON"];function ht(n,e){const t=new URL(n);for(const l of pt){let s=t[l];Object.defineProperty(t,l,{get(){return e(),s},enumerable:!0,configurable:!0})}return t[Symbol.for("nodejs.util.inspect.custom")]=(l,s,d)=>d(n,s),mt(t),t}function mt(n){Object.defineProperty(n,"hash",{get(){throw new Error("Cannot access event.url.hash. Consider using `$page.url.hash` inside a component instead")}})}function _t(n){let e=5381;if(typeof n=="string"){let t=n.length;for(;t;)e=e*33^n.charCodeAt(--t)}else if(ArrayBuffer.isView(n)){const t=new Uint8Array(n.buffer,n.byteOffset,n.byteLength);let l=t.length;for(;l;)e=e*33^t[--l]}else throw new TypeError("value must be a string or TypedArray");return(e>>>0).toString(36)}const Se=window.fetch;window.fetch=(n,e)=>{if((n instanceof Request?n.method:(e==null?void 0:e.method)||"GET")!=="GET"){const l=new URL(n instanceof Request?n.url:n.toString(),document.baseURI).href;le.delete(l)}return Se(n,e)};const le=new Map;function gt(n,e,t){let s=`script[data-sveltekit-fetched][data-url=${JSON.stringify(n instanceof Request?n.url:n)}]`;(t==null?void 0:t.body)&&(typeof t.body=="string"||ArrayBuffer.isView(t.body))&&(s+=`[data-hash="${_t(t.body)}"]`);const d=document.querySelector(s);if(d!=null&&d.textContent){const{body:a,...f}=JSON.parse(d.textContent),_=d.getAttribute("data-ttl");return _&&le.set(e,{body:a,init:f,ttl:1e3*Number(_)}),Promise.resolve(new Response(a,f))}return Se(n,t)}function wt(n,e){const t=le.get(n);if(t){if(performance.now()<t.ttl)return new Response(t.body,t.init);le.delete(n)}return Se(n,e)}const yt=/^(\.\.\.)?(\w+)(?:=(\w+))?$/;function bt(n){const e=[],t=[];let l=!0;return{pattern:n===""?/^\/$/:new RegExp(`^${n.split(/(?:\/|$)/).filter(vt).map((d,a,f)=>{const _=decodeURIComponent(d),m=/^\[\.\.\.(\w+)(?:=(\w+))?\]$/.exec(_);if(m)return e.push(m[1]),t.push(m[2]),"(?:/(.*))?";const y=a===f.length-1;return _&&"/"+_.split(/\[(.+?)\]/).map(($,R)=>{if(R%2){const j=yt.exec($);if(!j)throw new Error(`Invalid param: ${$}. Params and matcher names can only have underscores and alphanumeric characters.`);const[,V,q,D]=j;return e.push(q),t.push(D),V?"(.*?)":"([^/]+?)"}return y&&$.includes(".")&&(l=!1),$.normalize().replace(/%5[Bb]/g,"[").replace(/%5[Dd]/g,"]").replace(/#/g,"%23").replace(/\?/g,"%3F").replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}).join("")}).join("")}${l?"/?":""}$`),names:e,types:t}}function vt(n){return!/^\([^)]+\)$/.test(n)}function Et(n,e,t,l){const s={};for(let d=0;d<e.length;d+=1){const a=e[d],f=t[d],_=n[d+1]||"";if(f){const m=l[f];if(!m)throw new Error(`Missing "${f}" param matcher`);if(!m(_))return}s[a]=_}return s}function kt(n,e,t,l){const s=new Set(e);return Object.entries(t).map(([f,[_,m,y]])=>{const{pattern:$,names:R,types:j}=bt(f),V={id:f,exec:q=>{const D=$.exec(q);if(D)return Et(D,R,j,l)},errors:[1,...y||[]].map(q=>n[q]),layouts:[0,...m||[]].map(a),leaf:d(_)};return V.errors.length=V.layouts.length=Math.max(V.errors.length,V.layouts.length),V});function d(f){const _=f<0;return _&&(f=~f),[_,n[f]]}function a(f){return f===void 0?f:[s.has(f),n[f]]}}function Rt(n){let e,t,l;var s=n[0][0];function d(a){return{props:{data:a[2],form:a[1]}}}return s&&(e=H(s,d(n))),{c(){e&&M(e.$$.fragment),t=B()},l(a){e&&Le(e.$$.fragment,a),t=B()},m(a,f){e&&X(e,a,f),G(a,t,f),l=!0},p(a,f){const _={};if(f&4&&(_.data=a[2]),f&2&&(_.form=a[1]),s!==(s=a[0][0])){if(e){ce();const m=e;J(m.$$.fragment,1,0,()=>{Y(m,1)}),fe()}s?(e=H(s,d(a)),M(e.$$.fragment),F(e.$$.fragment,1),X(e,t.parentNode,t)):e=null}else s&&e.$set(_)},i(a){l||(e&&F(e.$$.fragment,a),l=!0)},o(a){e&&J(e.$$.fragment,a),l=!1},d(a){a&&K(t),e&&Y(e,a)}}}function Lt(n){let e,t,l;var s=n[0][0];function d(a){return{props:{data:a[2],$$slots:{default:[St]},$$scope:{ctx:a}}}}return s&&(e=H(s,d(n))),{c(){e&&M(e.$$.fragment),t=B()},l(a){e&&Le(e.$$.fragment,a),t=B()},m(a,f){e&&X(e,a,f),G(a,t,f),l=!0},p(a,f){const _={};if(f&4&&(_.data=a[2]),f&523&&(_.$$scope={dirty:f,ctx:a}),s!==(s=a[0][0])){if(e){ce();const m=e;J(m.$$.fragment,1,0,()=>{Y(m,1)}),fe()}s?(e=H(s,d(a)),M(e.$$.fragment),F(e.$$.fragment,1),X(e,t.parentNode,t)):e=null}else s&&e.$set(_)},i(a){l||(e&&F(e.$$.fragment,a),l=!0)},o(a){e&&J(e.$$.fragment,a),l=!1},d(a){a&&K(t),e&&Y(e,a)}}}function St(n){let e,t,l;var s=n[0][1];function d(a){return{props:{data:a[3],form:a[1]}}}return s&&(e=H(s,d(n))),{c(){e&&M(e.$$.fragment),t=B()},l(a){e&&Le(e.$$.fragment,a),t=B()},m(a,f){e&&X(e,a,f),G(a,t,f),l=!0},p(a,f){const _={};if(f&8&&(_.data=a[3]),f&2&&(_.form=a[1]),s!==(s=a[0][1])){if(e){ce();const m=e;J(m.$$.fragment,1,0,()=>{Y(m,1)}),fe()}s?(e=H(s,d(a)),M(e.$$.fragment),F(e.$$.fragment,1),X(e,t.parentNode,t)):e=null}else s&&e.$set(_)},i(a){l||(e&&F(e.$$.fragment,a),l=!0)},o(a){e&&J(e.$$.fragment,a),l=!1},d(a){a&&K(t),e&&Y(e,a)}}}function Ke(n){let e,t=n[5]&&ze(n);return{c(){e=tt("div"),t&&t.c(),this.h()},l(l){e=nt(l,"DIV",{id:!0,"aria-live":!0,"aria-atomic":!0,style:!0});var s=rt(e);t&&t.l(s),s.forEach(K),this.h()},h(){we(e,"id","svelte-announcer"),we(e,"aria-live","assertive"),we(e,"aria-atomic","true"),C(e,"position","absolute"),C(e,"left","0"),C(e,"top","0"),C(e,"clip","rect(0 0 0 0)"),C(e,"clip-path","inset(50%)"),C(e,"overflow","hidden"),C(e,"white-space","nowrap"),C(e,"width","1px"),C(e,"height","1px")},m(l,s){G(l,e,s),t&&t.m(e,null)},p(l,s){l[5]?t?t.p(l,s):(t=ze(l),t.c(),t.m(e,null)):t&&(t.d(1),t=null)},d(l){l&&K(e),t&&t.d()}}}function ze(n){let e;return{c(){e=at(n[6])},l(t){e=ot(t,n[6])},m(t,l){G(t,e,l)},p(t,l){l&64&&st(e,t[6])},d(t){t&&K(e)}}}function $t(n){let e,t,l,s,d;const a=[Lt,Rt],f=[];function _(y,$){return y[0][1]?0:1}e=_(n),t=f[e]=a[e](n);let m=n[4]&&Ke(n);return{c(){t.c(),l=Qe(),m&&m.c(),s=B()},l(y){t.l(y),l=Ze(y),m&&m.l(y),s=B()},m(y,$){f[e].m(y,$),G(y,l,$),m&&m.m(y,$),G(y,s,$),d=!0},p(y,[$]){let R=e;e=_(y),e===R?f[e].p(y,$):(ce(),J(f[R],1,1,()=>{f[R]=null}),fe(),t=f[e],t?t.p(y,$):(t=f[e]=a[e](y),t.c()),F(t,1),t.m(l.parentNode,l)),y[4]?m?m.p(y,$):(m=Ke(y),m.c(),m.m(s.parentNode,s)):m&&(m.d(1),m=null)},i(y){d||(F(t),d=!0)},o(y){J(t),d=!1},d(y){f[e].d(y),y&&K(l),m&&m.d(y),y&&K(s)}}}function Pt(n,e,t){let{stores:l}=e,{page:s}=e,{components:d}=e,{form:a}=e,{data_0:f=null}=e,{data_1:_=null}=e;et(l.page.notify);let m=!1,y=!1,$=null;return be(()=>{const R=l.page.subscribe(()=>{m&&(t(5,y=!0),t(6,$=document.title||"untitled page"))});return t(4,m=!0),R}),n.$$set=R=>{"stores"in R&&t(7,l=R.stores),"page"in R&&t(8,s=R.page),"components"in R&&t(0,d=R.components),"form"in R&&t(1,a=R.form),"data_0"in R&&t(2,f=R.data_0),"data_1"in R&&t(3,_=R.data_1)},n.$$.update=()=>{n.$$.dirty&384&&l.page.set(s)},[d,a,f,_,m,y,$,l,s]}class Ot extends Me{constructor(e){super(),Xe(this,e,Pt,$t,Ye,{stores:7,page:8,components:0,form:1,data_0:2,data_1:3})}}const At={},ue=[()=>N(()=>import("./chunks/0-73a7bc09.js"),["chunks/0-73a7bc09.js","chunks/_layout-063794c6.js","components/pages/_layout.svelte-ecacdd4a.js","assets/_layout-584cbebf.css","chunks/index-f7ae3298.js","chunks/stores-0f3bdd36.js","chunks/singletons-c968b277.js","chunks/paths-f4cc45d5.js","chunks/SvelteToast.svelte_svelte_type_style_lang-240fbb91.js","assets/SvelteToast-7ee95128.css"],import.meta.url),()=>N(()=>import("./chunks/1-56e3b809.js"),["chunks/1-56e3b809.js","components/error.svelte-edee39e3.js","chunks/index-f7ae3298.js","chunks/stores-0f3bdd36.js","chunks/singletons-c968b277.js","chunks/paths-f4cc45d5.js"],import.meta.url),()=>N(()=>import("./chunks/2-254b0c24.js"),["chunks/2-254b0c24.js","chunks/_page-1937cd90.js","components/pages/_page.md-1f14cc0e.js","chunks/index-f7ae3298.js"],import.meta.url),()=>N(()=>import("./chunks/3-bd638bba.js"),["chunks/3-bd638bba.js","chunks/_page-4a8b86bb.js","components/pages/202212_fundraiser/_page.svelte-b2483d55.js","assets/_page-fb9bf928.css","chunks/index-f7ae3298.js","chunks/paths-f4cc45d5.js","chunks/loader-store-c42dab68.js","chunks/AddressQrCode.svelte_svelte_type_style_lang-b5ee4e3d.js","assets/AddressQrCode-2ebe7a60.css","chunks/index-2678c27e.js","chunks/Confetti-b6399d1f.js","assets/Confetti-bb2300fe.css"],import.meta.url),()=>N(()=>import("./chunks/4-2119b5e8.js"),["chunks/4-2119b5e8.js","chunks/_page-a46f7184.js","components/pages/contract/_page.svelte-aef580e4.js","assets/_page-976f3e3c.css","chunks/index-f7ae3298.js","chunks/Contract-2d1e3251.js","assets/Contract-ef42f051.css","chunks/paths-f4cc45d5.js","chunks/Address-be118724.js","chunks/index-2678c27e.js","chunks/AddressBlockie-e436f220.js","assets/AddressBlockie-0322f3ae.css","chunks/SvelteToast.svelte_svelte_type_style_lang-240fbb91.js","assets/SvelteToast-7ee95128.css","chunks/Confetti-b6399d1f.js","assets/Confetti-bb2300fe.css","chunks/loader-store-c42dab68.js","chunks/AddressQrCode-232a6f15.js","chunks/AddressQrCode.svelte_svelte_type_style_lang-b5ee4e3d.js","assets/AddressQrCode-2ebe7a60.css","chunks/map-0259bd57.js"],import.meta.url),()=>N(()=>import("./chunks/5-83dd93fc.js"),["chunks/5-83dd93fc.js","components/pages/create/_page.svelte-21ba936c.js","assets/_page-b1e75889.css","chunks/index-f7ae3298.js","chunks/AddressQrCode.svelte_svelte_type_style_lang-b5ee4e3d.js","assets/AddressQrCode-2ebe7a60.css","chunks/index-2678c27e.js","chunks/Option-96b1b4ed.js","chunks/paths-f4cc45d5.js","chunks/AddressBlockie-e436f220.js","assets/AddressBlockie-0322f3ae.css","chunks/NotchedOutline-7792c1db.js","chunks/Subheader-7c29c433.js","chunks/Contract-2d1e3251.js","assets/Contract-ef42f051.css","chunks/Address-be118724.js","chunks/SvelteToast.svelte_svelte_type_style_lang-240fbb91.js","assets/SvelteToast-7ee95128.css","chunks/Confetti-b6399d1f.js","assets/Confetti-bb2300fe.css","chunks/loader-store-c42dab68.js","chunks/AddressQrCode-232a6f15.js","chunks/HelperText-b6746d39.js"],import.meta.url),()=>N(()=>import("./chunks/6-d69899aa.js"),["chunks/6-d69899aa.js","chunks/_page-5bbc1f4b.js","components/pages/earn/_page.svelte-8cdeed8e.js","assets/_page-11b70e6a.css","chunks/index-f7ae3298.js","chunks/AddressQrCode.svelte_svelte_type_style_lang-b5ee4e3d.js","assets/AddressQrCode-2ebe7a60.css","chunks/index-2678c27e.js","chunks/Option-96b1b4ed.js","chunks/paths-f4cc45d5.js","chunks/AddressBlockie-e436f220.js","assets/AddressBlockie-0322f3ae.css","chunks/NotchedOutline-7792c1db.js","chunks/Subheader-7c29c433.js","chunks/IconButton-d374fa53.js","chunks/loader-store-c42dab68.js","chunks/map-0259bd57.js","chunks/Address-be118724.js","chunks/SvelteToast.svelte_svelte_type_style_lang-240fbb91.js","assets/SvelteToast-7ee95128.css","chunks/Subtitle-2b7967f9.js","chunks/Contract-2d1e3251.js","assets/Contract-ef42f051.css","chunks/Confetti-b6399d1f.js","assets/Confetti-bb2300fe.css","chunks/AddressQrCode-232a6f15.js"],import.meta.url),()=>N(()=>import("./chunks/7-02cb5c8c.js"),["chunks/7-02cb5c8c.js","chunks/_page-07e2eb81.js","components/pages/explorer/_page.svelte-3874733c.js","chunks/index-f7ae3298.js","chunks/Subtitle-2b7967f9.js","chunks/index-2678c27e.js","chunks/paths-f4cc45d5.js","chunks/loader-store-c42dab68.js","chunks/Address-be118724.js","chunks/AddressBlockie-e436f220.js","assets/AddressBlockie-0322f3ae.css","chunks/SvelteToast.svelte_svelte_type_style_lang-240fbb91.js","assets/SvelteToast-7ee95128.css","chunks/Subheader-7c29c433.js"],import.meta.url),()=>N(()=>import("./chunks/8-73aa399c.js"),["chunks/8-73aa399c.js","chunks/_page-d7949575.js","components/pages/settings/_page.svelte-63180980.js","assets/_page-d1c33fdc.css","chunks/index-f7ae3298.js","chunks/paths-f4cc45d5.js","chunks/AddressQrCode.svelte_svelte_type_style_lang-b5ee4e3d.js","assets/AddressQrCode-2ebe7a60.css","chunks/index-2678c27e.js","chunks/IconButton-d374fa53.js","chunks/AddressBlockie-e436f220.js","assets/AddressBlockie-0322f3ae.css","chunks/HelperText-b6746d39.js","chunks/NotchedOutline-7792c1db.js","chunks/AddressQrCode-232a6f15.js"],import.meta.url)],It=[],Ut={"":[2],"202212_fundraiser":[3],contract:[4],create:[5],earn:[6],explorer:[7],settings:[8]},Tt={handleError:({error:n})=>{console.error(n)}};class Ee{constructor(e,t){this.status=e,typeof t=="string"?this.body={message:t}:t?this.body=t:this.body={message:`Error: ${e}`}}toString(){return JSON.stringify(this.body)}}class Ge{constructor(e,t){this.status=e,this.location=t}}const jt="/__data.js";async function Dt(n){var e;for(const t in n)if(typeof((e=n[t])==null?void 0:e.then)=="function")return Object.fromEntries(await Promise.all(Object.entries(n).map(async([l,s])=>[l,await s])));return n}const He="sveltekit:scroll",x="sveltekit:index",oe=kt(ue,It,Ut,At),ke=ue[0],Re=ue[1];ke();Re();let te={};try{te=JSON.parse(sessionStorage[He])}catch{}function ye(n){te[n]=ve()}function Vt({target:n,base:e,trailing_slash:t}){var Ne;const l=[];let s=null;const d={before_navigate:[],after_navigate:[]};let a={branch:[],error:null,url:null},f=!1,_=!1,m=!0,y=!1,$=!1,R,j=(Ne=history.state)==null?void 0:Ne[x];j||(j=Date.now(),history.replaceState({...history.state,[x]:j},"",location.href));const V=te[j];V&&(history.scrollRestoration="manual",scrollTo(V.x,V.y));let q=!1,D,$e,ne;async function Pe(){ne=ne||Promise.resolve(),await ne,ne=null;const r=new URL(location.href),c=me(r,!0);s=null,await Ae(c,r,[])}async function de(r,{noscroll:c=!1,replaceState:u=!1,keepfocus:o=!1,state:i={}},p,h){return typeof r=="string"&&(r=new URL(r,Be(document))),_e({url:r,scroll:c?ve():null,keepfocus:o,redirect_chain:p,details:{state:i,replaceState:u},nav_token:h,accepted:()=>{},blocked:()=>{},type:"goto"})}async function Oe(r){const c=me(r,!1);if(!c)throw new Error("Attempted to prefetch a URL that does not belong to this app");return s={id:c.id,promise:Te(c)},s.promise}async function Ae(r,c,u,o,i={},p){var E,v;$e=i;let h=r&&await Te(r);if(h||(h=await Ve(c,null,ee(new Error(`Not found: ${c.pathname}`),{url:c,params:{},routeId:null}),404)),c=(r==null?void 0:r.url)||c,$e!==i)return!1;if(h.type==="redirect")if(u.length>10||u.includes(c.pathname))h=await re({status:500,error:ee(new Error("Redirect loop"),{url:c,params:{},routeId:null}),url:c,routeId:null});else return de(new URL(h.location,c).href,{},[...u,c.pathname],i),!1;else((v=(E=h.props)==null?void 0:E.page)==null?void 0:v.status)>=400&&await z.updated.check()&&await ae(c);if(l.length=0,$=!1,y=!0,o&&o.details){const{details:w}=o,b=w.replaceState?0:1;w.state[x]=j+=b,history[w.replaceState?"replaceState":"pushState"](w.state,"",c)}if(s=null,_){a=h.state,h.props.page&&(h.props.page.url=c);const w=ie();R.$set(h.props),w()}else Ie(h);if(o){const{scroll:w,keepfocus:b}=o;if(!b){const L=document.body,P=L.getAttribute("tabindex");L.tabIndex=-1,L.focus({preventScroll:!0}),setTimeout(()=>{var O;(O=getSelection())==null||O.removeAllRanges()}),P!==null?L.setAttribute("tabindex",P):L.removeAttribute("tabindex")}if(await xe(),m){const L=c.hash&&document.getElementById(c.hash.slice(1));w?scrollTo(w.x,w.y):L?L.scrollIntoView():scrollTo(0,0)}}else await xe();m=!0,h.props.page&&(D=h.props.page),p&&p(),y=!1}function Ie(r){var i,p;a=r.state;const c=document.querySelector("style[data-sveltekit]");c&&c.remove(),D=r.props.page;const u=ie();R=new Ot({target:n,props:{...r.props,stores:z},hydrate:!0}),u();const o={from:null,to:se("to",{params:a.params,routeId:(p=(i=a.route)==null?void 0:i.id)!=null?p:null,url:new URL(location.href)}),type:"load"};d.after_navigate.forEach(h=>h(o)),_=!0}async function Q({url:r,params:c,branch:u,status:o,error:i,route:p,form:h}){var P;const E=u.filter(Boolean),v={type:"loaded",state:{url:r,params:c,branch:u,error:i,route:p},props:{components:E.map(O=>O.node.component)}};h!==void 0&&(v.props.form=h);let w={},b=!D;for(let O=0;O<E.length;O+=1){const U=E[O];w={...w,...U.data},(b||!a.branch.some(T=>T===U))&&(v.props[`data_${O}`]=w,b=b||Object.keys((P=U.data)!=null?P:{}).length>0)}if(b||(b=Object.keys(D.data).length!==Object.keys(w).length),!a.url||r.href!==a.url.href||a.error!==i||h!==void 0||b){v.props.page={error:i,params:c,routeId:p&&p.id,status:o,url:r,form:h,data:b?w:D.data};const O=(U,T)=>{Object.defineProperty(v.props.page,U,{get:()=>{throw new Error(`$page.${U} has been replaced by $page.url.${T}`)}})};O("origin","origin"),O("path","pathname"),O("query","searchParams")}return v}async function pe({loader:r,parent:c,url:u,params:o,routeId:i,server_data_node:p}){var w,b,L,P,O;let h=null;const E={dependencies:new Set,params:new Set,parent:!1,url:!1},v=await r();if((w=v.shared)!=null&&w.load){let U=function(...S){for(const g of S){const{href:k}=new URL(g,u);E.dependencies.add(k)}};const T={routeId:i,params:new Proxy(o,{get:(S,g)=>(E.params.add(g),S[g])}),data:(b=p==null?void 0:p.data)!=null?b:null,url:ht(u,()=>{E.url=!0}),async fetch(S,g){let k;S instanceof Request?(k=S.url,g={body:S.method==="GET"||S.method==="HEAD"?void 0:await S.blob(),cache:S.cache,credentials:S.credentials,headers:S.headers,integrity:S.integrity,keepalive:S.keepalive,method:S.method,mode:S.mode,redirect:S.redirect,referrer:S.referrer,referrerPolicy:S.referrerPolicy,signal:S.signal,...g}):k=S;const I=new URL(k,u).href;return U(I),_?wt(I,g):gt(k,I,g)},setHeaders:()=>{},depends:U,parent(){return E.parent=!0,c()}};Object.defineProperties(T,{props:{get(){throw new Error("@migration task: Replace `props` with `data` stuff https://github.com/sveltejs/kit/discussions/5774#discussioncomment-3292693")},enumerable:!1},session:{get(){throw new Error("session is no longer available. See https://github.com/sveltejs/kit/discussions/5883")},enumerable:!1},stuff:{get(){throw new Error("@migration task: Remove stuff https://github.com/sveltejs/kit/discussions/5774#discussioncomment-3292693")},enumerable:!1}}),h=(L=await v.shared.load.call(null,T))!=null?L:null,h=h?await Dt(h):null}return{node:v,loader:r,server:p,shared:(P=v.shared)!=null&&P.load?{type:"data",data:h,uses:E}:null,data:(O=h!=null?h:p==null?void 0:p.data)!=null?O:null}}function Ue(r,c,u,o){if($)return!0;if(!u)return!1;if(u.parent&&c||u.url&&r)return!0;for(const i of u.params)if(o[i]!==a.params[i])return!0;for(const i of u.dependencies)if(l.some(p=>p(new URL(i))))return!0;return!1}function he(r,c){var u,o;return(r==null?void 0:r.type)==="data"?{type:"data",data:r.data,uses:{dependencies:new Set((u=r.uses.dependencies)!=null?u:[]),params:new Set((o=r.uses.params)!=null?o:[]),parent:!!r.uses.parent,url:!!r.uses.url}}:(r==null?void 0:r.type)==="skip"&&c!=null?c:null}async function Te({id:r,invalidating:c,url:u,params:o,route:i}){var S;if((s==null?void 0:s.id)===r)return s.promise;const{errors:p,layouts:h,leaf:E}=i,v=[...h,E];p.forEach(g=>g==null?void 0:g().catch(()=>{})),v.forEach(g=>g==null?void 0:g[1]().catch(()=>{}));let w=null;const b=a.url?r!==a.url.pathname+a.url.search:!1,L=v.reduce((g,k,I)=>{var Z;const A=a.branch[I],W=!!(k!=null&&k[0])&&((A==null?void 0:A.loader)!==k[1]||Ue(b,g.some(Boolean),(Z=A.server)==null?void 0:Z.uses,o));return g.push(W),g},[]);if(L.some(Boolean)){try{w=await We(u,L)}catch(g){return re({status:500,error:ee(g,{url:u,params:o,routeId:i.id}),url:u,routeId:i.id})}if(w.type==="redirect")return w}const P=w==null?void 0:w.nodes;let O=!1;const U=v.map(async(g,k)=>{var Z;if(!g)return;const I=a.branch[k],A=P==null?void 0:P[k];if((!A||A.type==="skip")&&g[1]===(I==null?void 0:I.loader)&&!Ue(b,O,(Z=I.shared)==null?void 0:Z.uses,o))return I;if(O=!0,(A==null?void 0:A.type)==="error")throw A;return pe({loader:g[1],url:u,params:o,routeId:i.id,parent:async()=>{var Ce;const qe={};for(let ge=0;ge<k;ge+=1)Object.assign(qe,(Ce=await U[ge])==null?void 0:Ce.data);return qe},server_data_node:he(A===void 0&&g[0]?{type:"skip"}:A!=null?A:null,I==null?void 0:I.server)})});for(const g of U)g.catch(()=>{});const T=[];for(let g=0;g<v.length;g+=1)if(v[g])try{T.push(await U[g])}catch(k){if(k instanceof Ge)return{type:"redirect",location:k.location};let I=500,A;P!=null&&P.includes(k)?(I=(S=k.status)!=null?S:I,A=k.error):k instanceof Ee?(I=k.status,A=k.body):A=ee(k,{params:o,url:u,routeId:i.id});const W=await je(g,T,p);return W?await Q({url:u,params:o,branch:T.slice(0,W.idx).concat(W.node),status:I,error:A,route:i}):await Ve(u,i.id,A,I)}else T.push(void 0);return await Q({url:u,params:o,branch:T,status:200,error:null,route:i,form:c?void 0:null})}async function je(r,c,u){for(;r--;)if(u[r]){let o=r;for(;!c[o];)o-=1;try{return{idx:o+1,node:{node:await u[r](),loader:u[r],data:{},server:null,shared:null}}}catch{continue}}}async function re({status:r,error:c,url:u,routeId:o}){var w;const i={},p=await ke();let h=null;if(p.server)try{const b=await We(u,[!0]);if(b.type!=="data"||b.nodes[0]&&b.nodes[0].type!=="data")throw 0;h=(w=b.nodes[0])!=null?w:null}catch{(u.origin!==location.origin||u.pathname!==location.pathname||f)&&await ae(u)}const E=await pe({loader:ke,url:u,params:i,routeId:o,parent:()=>Promise.resolve({}),server_data_node:he(h)}),v={node:await Re(),loader:Re,shared:null,server:null,data:null};return await Q({url:u,params:i,branch:[E,v],status:r,error:c,route:null})}function me(r,c){if(De(r))return;const u=decodeURI(r.pathname.slice(e.length)||"/");for(const o of oe){const i=o.exec(u);if(i){const p=new URL(r.origin+ut(r.pathname,t)+r.search+r.hash);return{id:p.pathname+p.search,invalidating:c,route:o,params:dt(i),url:p}}}}function De(r){return r.origin!==location.origin||!r.pathname.startsWith(e)}async function _e({url:r,scroll:c,keepfocus:u,redirect_chain:o,details:i,type:p,delta:h,nav_token:E,accepted:v,blocked:w}){var U,T,S,g;let b=!1;const L=me(r,!1),P={from:se("from",{params:a.params,routeId:(T=(U=a.route)==null?void 0:U.id)!=null?T:null,url:a.url}),to:se("to",{params:(S=L==null?void 0:L.params)!=null?S:null,routeId:(g=L==null?void 0:L.route.id)!=null?g:null,url:r}),type:p};h!==void 0&&(P.delta=h);const O={...P,cancel:()=>{b=!0}};if(d.before_navigate.forEach(k=>k(O)),b){w();return}ye(j),v(),_&&z.navigating.set(P),await Ae(L,r,o,{scroll:c,keepfocus:u,details:i},E,()=>{d.after_navigate.forEach(k=>k(P)),z.navigating.set(null)})}async function Ve(r,c,u,o){return r.origin===location.origin&&r.pathname===location.pathname&&!f?await re({status:o,error:u,url:r,routeId:c}):await ae(r)}function ae(r){return location.href=r.href,new Promise(()=>{})}return{after_navigate:r=>{be(()=>(d.after_navigate.push(r),()=>{const c=d.after_navigate.indexOf(r);d.after_navigate.splice(c,1)}))},before_navigate:r=>{be(()=>(d.before_navigate.push(r),()=>{const c=d.before_navigate.indexOf(r);d.before_navigate.splice(c,1)}))},disable_scroll_handling:()=>{(y||!_)&&(m=!1)},goto:(r,c={})=>de(r,c,[]),invalidate:r=>{if(r===void 0)throw new Error("`invalidate()` (with no arguments) has been replaced by `invalidateAll()`");if(typeof r=="function")l.push(r);else{const{href:c}=new URL(r,location.href);l.push(u=>u.href===c)}return Pe()},invalidateAll:()=>($=!0,Pe()),prefetch:async r=>{const c=new URL(r,Be(document));await Oe(c)},prefetch_routes:async r=>{const u=(r?oe.filter(o=>r.some(i=>o.exec(i))):oe).map(o=>Promise.all([...o.layouts,o.leaf].map(i=>i==null?void 0:i[1]())));await Promise.all(u)},apply_action:async r=>{if(r.type==="error"){const c=new URL(location.href),{branch:u,route:o}=a;if(!o)return;const i=await je(a.branch.length,u,o.errors);if(i){const p=await Q({url:c,params:a.params,branch:u.slice(0,i.idx).concat(i.node),status:500,error:r.error,route:o});a=p.state;const h=ie();R.$set(p.props),h()}}else if(r.type==="redirect")de(r.location,{},[]);else{const c={form:r.data,page:{...D,form:r.data,status:r.status}},u=ie();R.$set(c),u()}},_start_router:()=>{history.scrollRestoration="manual",addEventListener("beforeunload",o=>{var h,E;let i=!1;const p={from:se("from",{params:a.params,routeId:(E=(h=a.route)==null?void 0:h.id)!=null?E:null,url:a.url}),to:null,type:"unload",cancel:()=>i=!0};d.before_navigate.forEach(v=>v(p)),i?(o.preventDefault(),o.returnValue=""):history.scrollRestoration="auto"}),addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden"){ye(j);try{sessionStorage[He]=JSON.stringify(te)}catch{}}});const r=o=>{const{url:i,options:p}=Je(o);if(i&&p.prefetch){if(De(i))return;Oe(i)}};let c;const u=o=>{clearTimeout(c),c=setTimeout(()=>{var i;(i=o.target)==null||i.dispatchEvent(new CustomEvent("sveltekit:trigger_prefetch",{bubbles:!0}))},20)};addEventListener("touchstart",r),addEventListener("mousemove",u),addEventListener("sveltekit:trigger_prefetch",r),addEventListener("click",o=>{if(o.button||o.which!==1||o.metaKey||o.ctrlKey||o.shiftKey||o.altKey||o.defaultPrevented)return;const{a:i,url:p,options:h}=Je(o);if(!i||!p)return;const E=i instanceof SVGAElement;if(!E&&!(p.protocol==="https:"||p.protocol==="http:"))return;const v=(i.getAttribute("rel")||"").split(/\s+/);if(i.hasAttribute("download")||v.includes("external")||h.reload||(E?i.target.baseVal:i.target))return;const[w,b]=p.href.split("#");if(b!==void 0&&w===location.href.split("#")[0]){q=!0,ye(j),a.url=p,z.page.set({...D,url:p}),z.page.notify();return}_e({url:p,scroll:h.noscroll?ve():null,keepfocus:!1,redirect_chain:[],details:{state:{},replaceState:p.href===location.href},accepted:()=>o.preventDefault(),blocked:()=>o.preventDefault(),type:"link"})}),addEventListener("popstate",o=>{if(o.state){if(o.state[x]===j)return;const i=o.state[x]-j;_e({url:new URL(location.href),scroll:te[o.state[x]],keepfocus:!1,redirect_chain:[],details:null,accepted:()=>{j=o.state[x]},blocked:()=>{history.go(-i)},type:"popstate",delta:i})}}),addEventListener("hashchange",()=>{q&&(q=!1,history.replaceState({...history.state,[x]:++j},"",location.href))});for(const o of document.querySelectorAll("link"))o.rel==="icon"&&(o.href=o.href);addEventListener("pageshow",o=>{o.persisted&&z.navigating.set(null)})},_hydrate:async({status:r,error:c,node_ids:u,params:o,routeId:i,data:p,form:h})=>{var w;f=!0;const E=new URL(location.href);let v;try{const b=u.map(async(L,P)=>{const O=p[P];return pe({loader:ue[L],url:E,params:o,routeId:i,parent:async()=>{const U={};for(let T=0;T<P;T+=1)Object.assign(U,(await b[T]).data);return U},server_data_node:he(O)})});v=await Q({url:E,params:o,branch:await Promise.all(b),status:r,error:c,form:h,route:(w=oe.find(L=>L.id===i))!=null?w:null})}catch(b){if(b instanceof Ge){await ae(new URL(b.location,location.href));return}v=await re({status:b instanceof Ee?b.status:500,error:ee(b,{url:E,params:o,routeId:i}),url:E,routeId:i})}Ie(v)}}}let Nt=1;async function We(n,e){const t=new URL(n);t.pathname=n.pathname.replace(/\/$/,"")+jt,t.searchParams.set("__invalid",e.map(s=>s?"y":"n").join("")),t.searchParams.set("__id",String(Nt++)),await N(()=>import(t.href),[],import.meta.url);const l=window.__sveltekit_data;return delete window.__sveltekit_data,l}function ee(n,e){var t;return n instanceof Ee?n.body:(t=Tt.handleError({error:n,event:e}))!=null?t:{message:e.routeId!=null?"Internal Error":"Not Found"}}const qt=["hash","href","host","hostname","origin","pathname","port","protocol","search","searchParams","toString","toJSON"];function se(n,e){for(const t of qt)Object.defineProperty(e,t,{get(){throw new Error(`The navigation shape changed - ${n}.${t} should now be ${n}.url.${t}`)},enumerable:!1});return e}function ie(){return()=>{}}async function Jt({env:n,hydrate:e,paths:t,target:l,trailing_slash:s}){lt(t);const d=Vt({target:l,base:t.base,trailing_slash:s});it({client:d}),e?await d._hydrate(e):d.goto(location.href,{replaceState:!0}),d._start_router()}export{Jt as start};
//# sourceMappingURL=start-b142168d.js.map
