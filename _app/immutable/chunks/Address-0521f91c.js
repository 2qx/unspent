import{g as y,i as E}from"./main-e697cf58.js";import{S as C,i as q,s as B,e as v,b as p,f as l,g as O,t as d,d as S,h as u,k as T,w as _,l as L,m as P,x as f,y as $,ab as I,N as z,J as A,z as m,O as D,a as w,c as x,q as h,r as g,u as N}from"./index-ce7c59fc.js";import{W as R,B as U,T as W,C as G,d as J}from"./AddressBlockie-8c4b7c84.js";import{t as V}from"./SvelteToast.svelte_svelte_type_style_lang-eaef27a2.js";async function re(r,e,t,a=25,n=0){e=e||"6a04"+E,t=t||"mainnet";let s=await y({url:r,method:"post",data:{query:`query SearchOutputsByLockingBytecodePrefix($prefix: String!, $node: String!, $exclude_pattern: String!, $limit:Int, $offset:Int) {
              search_output_prefix(
                args: { locking_bytecode_prefix_hex: $prefix }
                distinct_on: locking_bytecode,
                limit: $limit,
                offset: $offset,
                where: {
                  _and: [
                    {
                     locking_bytecode_pattern: {
                      _nlike: $exclude_pattern
                    }  
                    }, 
                    {
                      _or: [
                        {
                          transaction: {
                            block_inclusions: {
                              block: { accepted_by: { node: { name: { _regex: $node } } } }
                            }
                          }
                        }
                        {
                          transaction: {
                            node_validations: { node: { name: { _regex: $node } } }
                          }
                        }
                      ]
                    }
                  ]
                }
              ) {
                locking_bytecode_pattern,
                locking_bytecode
              }
            }`,variables:{prefix:e,exclude_pattern:"6a0401010102010717",node:t,limit:a,offset:n}}}).catch(c=>{throw c});if(s.data.error||s.data.errors)throw s.data.error?Error(s.data.error):Error(s.data.errors[0].message);let i=s.data.data.search_output_prefix;return i=i.map(c=>c.locking_bytecode),i=i.map(c=>c.replace("\\x","")),i}async function ne(r,e){let t=await y({url:r,method:"post",data:{query:`query GetTransactionDetails($txid: bytea!) {
        transaction(where: { hash: { _eq:
          $txid
        } } ) {
          block_inclusions {
            transaction_index
            block {
              height # etc.
            }
          }
          data_carrier_outputs {
            locking_bytecode # etc.
          }
          encoded_hex
          fee_satoshis
          hash
          identity_output {
            spent_by {
              input_index # etc.
              transaction {
                hash
              }
            }
          }
          input_count
          input_value_satoshis
          inputs {
            input_index
            outpoint_index
            outpoint_transaction_hash
            redeem_bytecode_pattern
            sequence_number
            unlocking_bytecode
            unlocking_bytecode_pattern
            value_satoshis
          }
          is_coinbase
          locktime
          node_validations {
            validated_at
            node {
              name
            }
          }
          output_count
          output_value_satoshis
          outputs {
            locking_bytecode
            locking_bytecode_pattern
            output_index
            spent_by {
              input_index
              transaction {
                hash
              }
            }
          }
          signing_output {
            spent_by {
              input_index # etc.
              transaction {
                hash
              }
            }
          }
          size_bytes
          version
        }
      }`,variables:{txid:`\\x${e}`}}}).catch(a=>{throw a});if(t.data.error||t.data.errors)throw t.data.error?Error(t.data.error):Error(t.data.errors[0].message);return t.data.data}async function se(r,e){let t=await y({url:r,method:"post",data:{query:`query SearchUnspentOutputsByLockingBytecode($lockingBytecode_literal: _text!) {
        search_output(
          args: { locking_bytecode_hex: $lockingBytecode_literal},
          where: {_not:{spent_by:{value_satoshis:{_gt:0}}}}
        ) {
          output_index
          transaction_hash
          value_satoshis
        }
      }`,variables:{lockingBytecode_literal:`{${e}}`}}}).catch(a=>{throw a});if(t.data.error||t.data.errors)throw t.data.error?Error(t.data.error):Error(t.data.errors[0].message);return t.data.data}const j=async r=>{if("clipboard"in navigator)await navigator.clipboard.writeText(r);else{const e=document.createElement("input");e.type="text",e.disabled=!0,e.style.setProperty("position","fixed"),e.style.setProperty("z-index","-100"),e.style.setProperty("pointer-events","none"),e.style.setProperty("opacity","0"),e.value=r,document.body.appendChild(e),e.click(),e.select(),document.execCommand("copy"),document.body.removeChild(e)}},F=(r,e)=>{async function t(){if(e)try{await j(e),r.dispatchEvent(new CustomEvent("svelte-copy",{detail:e}))}catch(a){r.dispatchEvent(new CustomEvent("svelte-copy:error",{detail:a}))}}return r.addEventListener("click",t,!0),{update:a=>e=a,destroy:()=>r.removeEventListener("click",t,!0)}};function k(r){let e,t,a,n,o,s;return t=new R({props:{$$slots:{default:[X]},$$scope:{ctx:r}}}),{c(){e=T("div"),_(t.$$.fragment)},l(i){e=L(i,"DIV",{});var c=P(e);f(t.$$.fragment,c),c.forEach(u)},m(i,c){p(i,e,c),$(t,e,null),n=!0,o||(s=[I(a=F.call(null,e,r[0])),z(e,"svelte-copy",r[1])],o=!0)},p(i,c){const b={};c&5&&(b.$$scope={dirty:c,ctx:i}),t.$set(b),a&&A(a.update)&&c&1&&a.update.call(null,i[0])},i(i){n||(l(t.$$.fragment,i),n=!0)},o(i){d(t.$$.fragment,i),n=!1},d(i){i&&u(e),m(t),o=!1,D(s)}}}function H(r){let e;return{c(){e=h(r[0])},l(t){e=g(t,r[0])},m(t,a){p(t,e,a)},p(t,a){a&1&&N(e,t[0])},d(t){t&&u(e)}}}function K(r){let e;return{c(){e=h("content_copy")},l(t){e=g(t,"content_copy")},m(t,a){p(t,e,a)},d(t){t&&u(e)}}}function M(r){let e,t,a,n;return e=new G({props:{$$slots:{default:[H]},$$scope:{ctx:r}}}),a=new J({props:{class:"material-icons",$$slots:{default:[K]},$$scope:{ctx:r}}}),{c(){_(e.$$.fragment),t=w(),_(a.$$.fragment)},l(o){f(e.$$.fragment,o),t=x(o),f(a.$$.fragment,o)},m(o,s){$(e,o,s),p(o,t,s),$(a,o,s),n=!0},p(o,s){const i={};s&5&&(i.$$scope={dirty:s,ctx:o}),e.$set(i);const c={};s&4&&(c.$$scope={dirty:s,ctx:o}),a.$set(c)},i(o){n||(l(e.$$.fragment,o),l(a.$$.fragment,o),n=!0)},o(o){d(e.$$.fragment,o),d(a.$$.fragment,o),n=!1},d(o){m(e,o),o&&u(t),m(a,o)}}}function Q(r){let e;return{c(){e=h("Copy address to clipboard")},l(t){e=g(t,"Copy address to clipboard")},m(t,a){p(t,e,a)},d(t){t&&u(e)}}}function X(r){let e,t,a,n;return e=new U({props:{style:"height:fit-content;",color:"secondary",variant:"outlined",$$slots:{default:[M]},$$scope:{ctx:r}}}),a=new W({props:{$$slots:{default:[Q]},$$scope:{ctx:r}}}),{c(){_(e.$$.fragment),t=w(),_(a.$$.fragment)},l(o){f(e.$$.fragment,o),t=x(o),f(a.$$.fragment,o)},m(o,s){$(e,o,s),p(o,t,s),$(a,o,s),n=!0},p(o,s){const i={};s&5&&(i.$$scope={dirty:s,ctx:o}),e.$set(i);const c={};s&4&&(c.$$scope={dirty:s,ctx:o}),a.$set(c)},i(o){n||(l(e.$$.fragment,o),l(a.$$.fragment,o),n=!0)},o(o){d(e.$$.fragment,o),d(a.$$.fragment,o),n=!1},d(o){m(e,o),o&&u(t),m(a,o)}}}function Y(r){let e,t,a=r[0]&&k(r);return{c(){a&&a.c(),e=v()},l(n){a&&a.l(n),e=v()},m(n,o){a&&a.m(n,o),p(n,e,o),t=!0},p(n,[o]){n[0]?a?(a.p(n,o),o&1&&l(a,1)):(a=k(n),a.c(),l(a,1),a.m(e.parentNode,e)):a&&(O(),d(a,1,1,()=>{a=null}),S())},i(n){t||(l(a),t=!0)},o(n){d(a),t=!1},d(n){a&&a.d(n),n&&u(e)}}}function Z(r,e,t){let{address:a}=e;const n=()=>V.push("Address copied to clipboard");return r.$$set=o=>{"address"in o&&t(0,a=o.address)},[a,n]}class ie extends C{constructor(e){super(),q(this,e,Z,Y,B,{address:0})}}export{ie as A,se as a,ne as b,F as c,re as g};
//# sourceMappingURL=Address-0521f91c.js.map
