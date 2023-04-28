import{A as q,D as I,F as S,G as R,M as A,P as O,R as P,T as D,h as y,B as N,d as x,e as f,E as L,N as M,g as G,i as b}from"./main-58a4910a.js";import{S as F,i as U,s as H,e as C,b as p,f as l,g as W,t as d,d as J,h as u,k as Q,w as _,l as V,m as j,x as h,y as m,ab as K,N as X,J as Y,z as $,O as Z,a as E,c as T,q as w,r as v,u as z}from"./index-ce7c59fc.js";import{W as tt,B as et,T as nt,C as ot,d as at}from"./AddressBlockie-83542714.js";import{t as rt}from"./SvelteToast.svelte_svelte_type_style_lang-1bc84498.js";const k={A:q,D:I,F:S,G:R,M:A,P:O,R:P,T:D},st={A:"annuity",D:"divide",F:"faucet",G:"gate",M:"mine",P:"perpetuity",R:"record",T:"timelock"};function ct(a){typeof a=="string"&&(a=y(a));const t=N.parseOpReturn(a);return{name:st[t.code],opReturn:a,...t}}function vt(a,t){typeof a=="string"&&(a=y(a));const n=x(a),e=f(n[1]),r=String.fromCharCode(parseInt(e,16));return k[r].fromOpReturn(a,t)}function Ct(a,t){typeof a=="string"&&(a=y(a));const n=x(a),e=f(n[1]),r=String.fromCharCode(parseInt(e,16));return k[r].getExecutorAllowance(a,t)}async function Bt(a,t=M.MAINNET,n,e){typeof a=="string"&&(a=y(a));const r=x(a),o=f(r[1]),s=String.fromCharCode(parseInt(o,16));n||(n=new L(t)),e||(e=await n.getBlockHeight());try{return await k[s].getSpendableBalance(a,t,n,e)}catch{return console.log(`error getting balance for ${f(a)}`),0n}}function Et(a,t){const n=a[0];try{return k[n].fromString(a,t)}catch(e){console.warn(`Couldn't parse serialized contract, ${e}`);return}}const it={prefix:"6a04"+G,node:"mainnet",limit:50,offset:0,exclude_pattern:"",after:0},lt={node:"mainnet",limit:500,offset:0,after:0};async function Tt(a,t,n="mainnet",e=25,r=0,o="",s=0){let c={prefix:t,node:n,limit:e,offset:r,exclude_pattern:o,after:s};c={...it,...c};let i=await ut(a,c);return i=i.map(g=>g.id),i}async function ut(a,t){"code"in t&&delete t.code,"version"in t&&delete t.version;const n=await b({url:a,method:"post",data:{query:`query SearchOutputsByLockingBytecodePrefix(
      $prefix: String!
      $node: String!
      $exclude_pattern: String
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
          }`,variables:t}}).catch(r=>{throw r});if(n.data.error||n.data.errors)throw n.data.error?Error(n.data.error):Error(n.data.errors[0].message);return n.data.data.search_output_prefix.map(r=>{let o=r.transaction.block_inclusions[0]?.block.height;return typeof o=="string"&&(o=parseInt(o)),r.locking_bytecode.slice(0,2)==="\\x"?{record:r.locking_bytecode.slice(2),height:o}:{record:r.locking_bytecode,height:o}}).map(r=>({id:r.record,data:ct(r.record),height:r.height}))}async function qt(a,t){const e=await b({url:a,method:"post",data:{query:`query GetTransactionDetails($txid: bytea!) {
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
  }`,variables:{txid:`\\x${t}`}}}).catch(r=>{throw r});if(e.data.error||e.data.errors)throw e.data.error?Error(e.data.error):Error(e.data.errors[0].message);return e.data.data}async function It(a,t){const e=await b({url:a,method:"post",data:{query:`
  query SearchUnspentOutputsByLockingBytecode($lockingBytecode_literal: _text!) {
    search_output(
      args: { locking_bytecode_hex: $lockingBytecode_literal},
      where: {_not:{spent_by:{value_satoshis:{_gt:0}}}}
    ) {
      output_index
      transaction_hash
      value_satoshis
    }
  }`,variables:{lockingBytecode_literal:`{${t}}`}}}).catch(r=>{throw r});if(e.data.error||e.data.errors)throw e.data.error?Error(e.data.error):Error(e.data.errors[0].message);return e.data.data}async function St(a,t,n){typeof t!="string"&&(t=f(t)),n={...lt,...n};const r=await b({url:a,method:"POST",data:{query:`
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
  `,variables:{...n,lockingBytecode:`{${t}}`}}});if(r.data.error||r.data.errors)throw r.data.error?Error(r.data.error):(console.log(r.data.errors),Error(r.data.errors[0].message));return r.data.data.search_output.map(o=>({hash:o.transaction.hash.slice(2),raw:o.transaction.encoded_hex,height:parseInt(o.transaction.block_inclusions[0].block.height),timestamp:parseInt(o.transaction.block_inclusions[0].block.timestamp),spentBy:o.spent_by.map(s=>s.outpoint.transaction_hash.slice(2)+":"+s.outpoint.output_index)}))}const dt=async a=>{if("clipboard"in navigator)await navigator.clipboard.writeText(a);else{const t=document.createElement("input");t.type="text",t.disabled=!0,t.style.setProperty("position","fixed"),t.style.setProperty("z-index","-100"),t.style.setProperty("pointer-events","none"),t.style.setProperty("opacity","0"),t.value=a,document.body.appendChild(t),t.click(),t.select(),document.execCommand("copy"),document.body.removeChild(t)}},pt=(a,t)=>{async function n(){if(t)try{await dt(t),a.dispatchEvent(new CustomEvent("svelte-copy",{detail:t}))}catch(e){a.dispatchEvent(new CustomEvent("svelte-copy:error",{detail:e}))}}return a.addEventListener("click",n,!0),{update:e=>t=e,destroy:()=>a.removeEventListener("click",n,!0)}};function B(a){let t,n,e,r,o,s;return n=new tt({props:{$$slots:{default:[$t]},$$scope:{ctx:a}}}),{c(){t=Q("div"),_(n.$$.fragment)},l(c){t=V(c,"DIV",{});var i=j(t);h(n.$$.fragment,i),i.forEach(u)},m(c,i){p(c,t,i),m(n,t,null),r=!0,o||(s=[K(e=pt.call(null,t,a[0])),X(t,"svelte-copy",a[1])],o=!0)},p(c,i){const g={};i&5&&(g.$$scope={dirty:i,ctx:c}),n.$set(g),e&&Y(e.update)&&i&1&&e.update.call(null,c[0])},i(c){r||(l(n.$$.fragment,c),r=!0)},o(c){d(n.$$.fragment,c),r=!1},d(c){c&&u(t),$(n),o=!1,Z(s)}}}function ft(a){let t;return{c(){t=w(a[0])},l(n){t=v(n,a[0])},m(n,e){p(n,t,e)},p(n,e){e&1&&z(t,n[0])},d(n){n&&u(t)}}}function _t(a){let t;return{c(){t=w("content_copy")},l(n){t=v(n,"content_copy")},m(n,e){p(n,t,e)},d(n){n&&u(t)}}}function ht(a){let t,n,e,r;return t=new ot({props:{$$slots:{default:[ft]},$$scope:{ctx:a}}}),e=new at({props:{class:"material-icons",$$slots:{default:[_t]},$$scope:{ctx:a}}}),{c(){_(t.$$.fragment),n=E(),_(e.$$.fragment)},l(o){h(t.$$.fragment,o),n=T(o),h(e.$$.fragment,o)},m(o,s){m(t,o,s),p(o,n,s),m(e,o,s),r=!0},p(o,s){const c={};s&5&&(c.$$scope={dirty:s,ctx:o}),t.$set(c);const i={};s&4&&(i.$$scope={dirty:s,ctx:o}),e.$set(i)},i(o){r||(l(t.$$.fragment,o),l(e.$$.fragment,o),r=!0)},o(o){d(t.$$.fragment,o),d(e.$$.fragment,o),r=!1},d(o){$(t,o),o&&u(n),$(e,o)}}}function mt(a){let t;return{c(){t=w("Copy address to clipboard")},l(n){t=v(n,"Copy address to clipboard")},m(n,e){p(n,t,e)},d(n){n&&u(t)}}}function $t(a){let t,n,e,r;return t=new et({props:{style:"height:fit-content;",color:"secondary",variant:"outlined",$$slots:{default:[ht]},$$scope:{ctx:a}}}),e=new nt({props:{$$slots:{default:[mt]},$$scope:{ctx:a}}}),{c(){_(t.$$.fragment),n=E(),_(e.$$.fragment)},l(o){h(t.$$.fragment,o),n=T(o),h(e.$$.fragment,o)},m(o,s){m(t,o,s),p(o,n,s),m(e,o,s),r=!0},p(o,s){const c={};s&5&&(c.$$scope={dirty:s,ctx:o}),t.$set(c);const i={};s&4&&(i.$$scope={dirty:s,ctx:o}),e.$set(i)},i(o){r||(l(t.$$.fragment,o),l(e.$$.fragment,o),r=!0)},o(o){d(t.$$.fragment,o),d(e.$$.fragment,o),r=!1},d(o){$(t,o),o&&u(n),$(e,o)}}}function gt(a){let t,n,e=a[0]&&B(a);return{c(){e&&e.c(),t=C()},l(r){e&&e.l(r),t=C()},m(r,o){e&&e.m(r,o),p(r,t,o),n=!0},p(r,[o]){r[0]?e?(e.p(r,o),o&1&&l(e,1)):(e=B(r),e.c(),l(e,1),e.m(t.parentNode,t)):e&&(W(),d(e,1,1,()=>{e=null}),J())},i(r){n||(l(e),n=!0)},o(r){d(e),n=!1},d(r){e&&e.d(r),r&&u(t)}}}function yt(a,t,n){let{address:e}=t;const r=()=>rt.push("Address copied to clipboard");return a.$$set=o=>{"address"in o&&n(0,e=o.address)},[e,r]}class Rt extends F{constructor(t){super(),U(this,t,yt,gt,H,{address:0})}}export{Rt as A,it as B,Ct as a,Bt as b,pt as c,St as d,ut as e,It as f,Tt as g,qt as h,vt as o,ct as p,Et as s};
//# sourceMappingURL=Address-d72ba089.js.map
