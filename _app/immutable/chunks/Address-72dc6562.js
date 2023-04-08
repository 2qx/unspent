import{A as I,D as S,F as T,M as R,P as A,R as O,h as y,B as P,d as x,e as f,E as D,N,g as M,i as b}from"./main-7d6e46e9.js";import{S as L,i as F,s as U,e as C,b as p,f as l,g as H,t as d,d as G,h as u,k as W,w as _,l as J,m as Q,x as h,y as m,ab as V,N as j,J as K,z as $,O as X,a as E,c as q,q as w,r as v,u as Y}from"./index-ce7c59fc.js";import{W as Z,B as z,T as tt,C as et,d as nt}from"./AddressBlockie-10f90900.js";import{t as ot}from"./SvelteToast.svelte_svelte_type_style_lang-1bc84498.js";const k={A:I,D:S,F:T,M:R,P:A,R:O},at={A:"annuity",D:"divide",F:"faucet",M:"mine",P:"perpetuity",R:"record"};function rt(a){typeof a=="string"&&(a=y(a));const t=P.parseOpReturn(a);return{name:at[t.code],opReturn:a,...t}}function xt(a,t){typeof a=="string"&&(a=y(a));const n=x(a),e=f(n[1]),r=String.fromCharCode(parseInt(e,16));return k[r].fromOpReturn(a,t)}function wt(a,t){typeof a=="string"&&(a=y(a));const n=x(a),e=f(n[1]),r=String.fromCharCode(parseInt(e,16));return k[r].getExecutorAllowance(a,t)}async function vt(a,t=N.MAINNET,n,e){typeof a=="string"&&(a=y(a));const r=x(a),o=f(r[1]),s=String.fromCharCode(parseInt(o,16));n||(n=new D(t)),e||(e=await n.getBlockHeight());try{return await k[s].getSpendableBalance(a,t,n,e)}catch{return console.log(`error getting balance for ${f(a)}`),0}}function Ct(a,t){const n=a[0];try{return k[n].fromString(a,t)}catch(e){console.warn(`Couldn't parse serialized contract, ${e}`);return}}const st={prefix:"6a04"+M,node:"mainnet",limit:50,offset:0,exclude_pattern:"6a0401010102010717",after:0},ct={node:"mainnet",limit:500,offset:0,after:0};async function Bt(a,t,n="mainnet",e=25,r=0,o="6a0401010102010717",s=0){let c={prefix:t,node:n,limit:e,offset:r,exclude_pattern:o,after:s};c={...st,...c};let i=await it(a,c);return i=i.map(g=>g.id),i}async function it(a,t){const n=await b({url:a,method:"post",data:{query:`query SearchOutputsByLockingBytecodePrefix(
      $prefix: String!
      $node: String!
      $exclude_pattern: String!
      $limit: Int
      $offset: Int
      $after: bigint
    ) {
            search_output_prefix(
              args: { locking_bytecode_prefix_hex: $prefix }
              distinct_on: locking_bytecode,
              limit: $limit,
              offset: $offset,
              where: {
                _and: [
                  { locking_bytecode_pattern: {  _nlike: $exclude_pattern } }
                  {
                    transaction: {
                      block_inclusions: { block: { height: { _gt: $after } } }
                    }
                  }
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
              locking_bytecode,
              transaction{
                block_inclusions{
                  block{
                    height
                  }
                }
              }
            }
          }`,variables:t}}).catch(r=>{throw r});if(n.data.error||n.data.errors)throw n.data.error?Error(n.data.error):Error(n.data.errors[0].message);return n.data.data.search_output_prefix.map(r=>{var s;let o=(s=r.transaction.block_inclusions[0])==null?void 0:s.block.height;return typeof o=="string"&&(o=parseInt(o)),r.locking_bytecode.slice(0,2)==="\\x"?{record:r.locking_bytecode.slice(2),height:o}:{record:r.locking_bytecode,height:o}}).map(r=>({id:r.record,data:rt(r.record),height:r.height}))}async function Et(a,t){const e=await b({url:a,method:"post",data:{query:`query GetTransactionDetails($txid: bytea!) {
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
  }`,variables:{txid:`\\x${t}`}}}).catch(r=>{throw r});if(e.data.error||e.data.errors)throw e.data.error?Error(e.data.error):Error(e.data.errors[0].message);return e.data.data}async function qt(a,t){const e=await b({url:a,method:"post",data:{query:`
  query SearchUnspentOutputsByLockingBytecode($lockingBytecode_literal: _text!) {
    search_output(
      args: { locking_bytecode_hex: $lockingBytecode_literal},
      where: {_not:{spent_by:{value_satoshis:{_gt:0}}}}
    ) {
      output_index
      transaction_hash
      value_satoshis
    }
  }`,variables:{lockingBytecode_literal:`{${t}}`}}}).catch(r=>{throw r});if(e.data.error||e.data.errors)throw e.data.error?Error(e.data.error):Error(e.data.errors[0].message);return e.data.data}async function It(a,t,n){typeof t!="string"&&(t=f(t)),n={...ct,...n};const r=await b({url:a,method:"POST",data:{query:`
  query GetTransactionHistory(
    $node: String!
    $lockingBytecode: _text!
    $after: bigint
    $limit: Int
    $offset: Int
  ) {
    search_output(
      args: {
        locking_bytecode_hex: $lockingBytecode
      }
      where: {
        _and: [
          {
            transaction: {
              block_inclusions: { block: { height: { _gt: $after } } }
            }
          }
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
      limit: $limit
      offset: $offset
      order_by: { transaction: { internal_id: desc } }
    ) {
      transaction {
        encoded_hex
        hash
        block_inclusions {
          block {
            height
            timestamp
          }
        }
      }
      spent_by {
        outpoint {
          transaction_hash
          output_index
        }
      }
    }
  }      
  `,variables:{...n,lockingBytecode:`{${t}}`}}});if(r.data.error||r.data.errors)throw r.data.error?Error(r.data.error):(console.log(r.data.errors),Error(r.data.errors[0].message));return r.data.data.search_output.map(o=>({hash:o.transaction.hash.slice(2),raw:o.transaction.encoded_hex,height:parseInt(o.transaction.block_inclusions[0].block.height),timestamp:parseInt(o.transaction.block_inclusions[0].block.timestamp),spentBy:o.spent_by.map(s=>s.outpoint.transaction_hash.slice(2)+":"+s.outpoint.output_index)}))}const lt=async a=>{if("clipboard"in navigator)await navigator.clipboard.writeText(a);else{const t=document.createElement("input");t.type="text",t.disabled=!0,t.style.setProperty("position","fixed"),t.style.setProperty("z-index","-100"),t.style.setProperty("pointer-events","none"),t.style.setProperty("opacity","0"),t.value=a,document.body.appendChild(t),t.click(),t.select(),document.execCommand("copy"),document.body.removeChild(t)}},ut=(a,t)=>{async function n(){if(t)try{await lt(t),a.dispatchEvent(new CustomEvent("svelte-copy",{detail:t}))}catch(e){a.dispatchEvent(new CustomEvent("svelte-copy:error",{detail:e}))}}return a.addEventListener("click",n,!0),{update:e=>t=e,destroy:()=>a.removeEventListener("click",n,!0)}};function B(a){let t,n,e,r,o,s;return n=new Z({props:{$$slots:{default:[ht]},$$scope:{ctx:a}}}),{c(){t=W("div"),_(n.$$.fragment)},l(c){t=J(c,"DIV",{});var i=Q(t);h(n.$$.fragment,i),i.forEach(u)},m(c,i){p(c,t,i),m(n,t,null),r=!0,o||(s=[V(e=ut.call(null,t,a[0])),j(t,"svelte-copy",a[1])],o=!0)},p(c,i){const g={};i&5&&(g.$$scope={dirty:i,ctx:c}),n.$set(g),e&&K(e.update)&&i&1&&e.update.call(null,c[0])},i(c){r||(l(n.$$.fragment,c),r=!0)},o(c){d(n.$$.fragment,c),r=!1},d(c){c&&u(t),$(n),o=!1,X(s)}}}function dt(a){let t;return{c(){t=w(a[0])},l(n){t=v(n,a[0])},m(n,e){p(n,t,e)},p(n,e){e&1&&Y(t,n[0])},d(n){n&&u(t)}}}function pt(a){let t;return{c(){t=w("content_copy")},l(n){t=v(n,"content_copy")},m(n,e){p(n,t,e)},d(n){n&&u(t)}}}function ft(a){let t,n,e,r;return t=new et({props:{$$slots:{default:[dt]},$$scope:{ctx:a}}}),e=new nt({props:{class:"material-icons",$$slots:{default:[pt]},$$scope:{ctx:a}}}),{c(){_(t.$$.fragment),n=E(),_(e.$$.fragment)},l(o){h(t.$$.fragment,o),n=q(o),h(e.$$.fragment,o)},m(o,s){m(t,o,s),p(o,n,s),m(e,o,s),r=!0},p(o,s){const c={};s&5&&(c.$$scope={dirty:s,ctx:o}),t.$set(c);const i={};s&4&&(i.$$scope={dirty:s,ctx:o}),e.$set(i)},i(o){r||(l(t.$$.fragment,o),l(e.$$.fragment,o),r=!0)},o(o){d(t.$$.fragment,o),d(e.$$.fragment,o),r=!1},d(o){$(t,o),o&&u(n),$(e,o)}}}function _t(a){let t;return{c(){t=w("Copy address to clipboard")},l(n){t=v(n,"Copy address to clipboard")},m(n,e){p(n,t,e)},d(n){n&&u(t)}}}function ht(a){let t,n,e,r;return t=new z({props:{style:"height:fit-content;",color:"secondary",variant:"outlined",$$slots:{default:[ft]},$$scope:{ctx:a}}}),e=new tt({props:{$$slots:{default:[_t]},$$scope:{ctx:a}}}),{c(){_(t.$$.fragment),n=E(),_(e.$$.fragment)},l(o){h(t.$$.fragment,o),n=q(o),h(e.$$.fragment,o)},m(o,s){m(t,o,s),p(o,n,s),m(e,o,s),r=!0},p(o,s){const c={};s&5&&(c.$$scope={dirty:s,ctx:o}),t.$set(c);const i={};s&4&&(i.$$scope={dirty:s,ctx:o}),e.$set(i)},i(o){r||(l(t.$$.fragment,o),l(e.$$.fragment,o),r=!0)},o(o){d(t.$$.fragment,o),d(e.$$.fragment,o),r=!1},d(o){$(t,o),o&&u(n),$(e,o)}}}function mt(a){let t,n,e=a[0]&&B(a);return{c(){e&&e.c(),t=C()},l(r){e&&e.l(r),t=C()},m(r,o){e&&e.m(r,o),p(r,t,o),n=!0},p(r,[o]){r[0]?e?(e.p(r,o),o&1&&l(e,1)):(e=B(r),e.c(),l(e,1),e.m(t.parentNode,t)):e&&(H(),d(e,1,1,()=>{e=null}),G())},i(r){n||(l(e),n=!0)},o(r){d(e),n=!1},d(r){e&&e.d(r),r&&u(t)}}}function $t(a,t,n){let{address:e}=t;const r=()=>ot.push("Address copied to clipboard");return a.$$set=o=>{"address"in o&&n(0,e=o.address)},[e,r]}class St extends L{constructor(t){super(),F(this,t,$t,mt,U,{address:0})}}export{St as A,st as B,wt as a,vt as b,ut as c,It as d,it as e,qt as f,Bt as g,Et as h,xt as o,rt as p,Ct as s};
//# sourceMappingURL=Address-72dc6562.js.map
