import{S as N,i as T,s as j,e as A,b as C,B as G,h as m,o as F,k as w,l as B,m as I,n as V,E as c,ag as H,p as f}from"./index-fc27b2c0.js";function O(i,e,n){const t=i.slice();return t[18]=e[n],t}function R(i){let e,n={length:i[6]},t=[];for(let a=0;a<n.length;a+=1)t[a]=E(O(i,n,a));return{c(){e=w("div");for(let a=0;a<t.length;a+=1)t[a].c();this.h()},l(a){e=B(a,"DIV",{class:!0});var s=I(e);for(let o=0;o<t.length;o+=1)t[o].l(s);s.forEach(m),this.h()},h(){V(e,"class","confetti-holder svelte-io58ff"),c(e,"rounded",i[9]),c(e,"cone",i[10]),c(e,"no-gravity",i[11])},m(a,s){C(a,e,s);for(let o=0;o<t.length;o+=1)t[o].m(e,null)},p(a,s){if(s&20991){n={length:a[6]};let o;for(o=0;o<n.length;o+=1){const u=O(a,n,o);t[o]?t[o].p(u,s):(t[o]=E(u),t[o].c(),t[o].m(e,null))}for(;o<t.length;o+=1)t[o].d(1);t.length=n.length}s&512&&c(e,"rounded",a[9]),s&1024&&c(e,"cone",a[10]),s&2048&&c(e,"no-gravity",a[11])},d(a){a&&m(e),H(t,a)}}}function E(i){let e;return{c(){e=w("div"),this.h()},l(n){e=B(n,"DIV",{class:!0,style:!0}),I(e).forEach(m),this.h()},h(){V(e,"class","confetti svelte-io58ff"),f(e,"--fall-distance",i[8]),f(e,"--size",i[0]+"px"),f(e,"--color",i[14]()),f(e,"--skew",r(-45,45)+"deg,"+r(-45,45)+"deg"),f(e,"--rotation-xyz",r(-10,10)+", "+r(-10,10)+", "+r(-10,10)),f(e,"--rotation-deg",r(0,360)+"deg"),f(e,"--translate-y-multiplier",r(i[2][0],i[2][1])),f(e,"--translate-x-multiplier",r(i[1][0],i[1][1])),f(e,"--scale",.1*r(2,10)),f(e,"--transition-duration",i[4]?`calc(${i[3]}ms * var(--scale))`:`${i[3]}ms`),f(e,"--transition-delay",r(i[5][0],i[5][1])+"ms"),f(e,"--transition-iteration-count",i[4]?"infinite":i[7]),f(e,"--x-spread",1-i[12])},m(n,t){C(n,e,t)},p(n,t){t&256&&f(e,"--fall-distance",n[8]),t&1&&f(e,"--size",n[0]+"px"),t&4&&f(e,"--translate-y-multiplier",r(n[2][0],n[2][1])),t&2&&f(e,"--translate-x-multiplier",r(n[1][0],n[1][1])),t&24&&f(e,"--transition-duration",n[4]?`calc(${n[3]}ms * var(--scale))`:`${n[3]}ms`),t&32&&f(e,"--transition-delay",r(n[5][0],n[5][1])+"ms"),t&144&&f(e,"--transition-iteration-count",n[4]?"infinite":n[7]),t&4096&&f(e,"--x-spread",1-n[12])},d(n){n&&m(e)}}}function J(i){let e,n=!i[13]&&R(i);return{c(){n&&n.c(),e=A()},l(t){n&&n.l(t),e=A()},m(t,a){n&&n.m(t,a),C(t,e,a)},p(t,[a]){t[13]?n&&(n.d(1),n=null):n?n.p(t,a):(n=R(t),n.c(),n.m(e.parentNode,e))},i:G,o:G,d(t){n&&n.d(t),t&&m(e)}}}function r(i,e){return Math.random()*(e-i)+i}function K(i,e,n){let{size:t=10}=e,{x:a=[-.5,.5]}=e,{y:s=[.25,1]}=e,{duration:o=2e3}=e,{infinite:u=!1}=e,{delay:g=[0,50]}=e,{colorRange:d=[0,360]}=e,{colorArray:h=[]}=e,{amount:k=50}=e,{iterationCount:_=1}=e,{fallDistance:z="100px"}=e,{rounded:b=!1}=e,{cone:D=!1}=e,{noGravity:S=!1}=e,{xSpread:M=.15}=e,{destroyOnComplete:y=!0}=e,v=!1;F(()=>{!y||u||_=="infinite"||setTimeout(()=>n(13,v=!0),(o+g[1])*_)});function q(){return h.length?h[Math.round(Math.random()*(h.length-1))]:`hsl(${Math.round(r(d[0],d[1]))}, 75%, 50%`}return i.$$set=l=>{"size"in l&&n(0,t=l.size),"x"in l&&n(1,a=l.x),"y"in l&&n(2,s=l.y),"duration"in l&&n(3,o=l.duration),"infinite"in l&&n(4,u=l.infinite),"delay"in l&&n(5,g=l.delay),"colorRange"in l&&n(15,d=l.colorRange),"colorArray"in l&&n(16,h=l.colorArray),"amount"in l&&n(6,k=l.amount),"iterationCount"in l&&n(7,_=l.iterationCount),"fallDistance"in l&&n(8,z=l.fallDistance),"rounded"in l&&n(9,b=l.rounded),"cone"in l&&n(10,D=l.cone),"noGravity"in l&&n(11,S=l.noGravity),"xSpread"in l&&n(12,M=l.xSpread),"destroyOnComplete"in l&&n(17,y=l.destroyOnComplete)},[t,a,s,o,u,g,k,_,z,b,D,S,M,v,q,d,h,y]}class P extends N{constructor(e){super(),T(this,e,K,J,j,{size:0,x:1,y:2,duration:3,infinite:4,delay:5,colorRange:15,colorArray:16,amount:6,iterationCount:7,fallDistance:8,rounded:9,cone:10,noGravity:11,xSpread:12,destroyOnComplete:17})}}export{P as C};
//# sourceMappingURL=Confetti-e22f0931.js.map
