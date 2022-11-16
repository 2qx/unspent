import{w as u}from"./paths-9eea2b01.js";import{i as s,j as _}from"./AddressBlockie-ffc02784.js";const c=u(void 0);async function p(e){c.set(e),setTimeout(async()=>await e.load().then(()=>c.set(void 0)),500)}async function y(e,a,t,o=25,d=0){a=a||"6a04"+_,t=t||"bchn";let r=await s({url:e,method:"post",data:{query:`query SearchOutputsByLockingBytecodePrefix($prefix: String!, $node: String!, $limit:Int, $offset:Int) {
              search_output_prefix(
                args: { locking_bytecode_prefix_hex: $prefix }
                distinct_on: locking_bytecode,
                limit: $limit,
                offset: $offset,
                where: {
                  transaction: {
                    block_inclusions: {
                      block: { accepted_by: { node: { name: { _eq: $node } } } }
                    }
                  }
                }
              ) {
                locking_bytecode
              }
            }`,variables:{prefix:a,node:t,limit:o,offset:d}}}).catch(i=>{throw i});if(r.data.error||r.data.errors)throw r.data.error?Error(r.data.error):Error(r.data.errors[0].message);let n=r.data.data.search_output_prefix;return n=n.map(i=>i.locking_bytecode),n=n.map(i=>i.replace("\\x","")),n}async function b(e,a){let t=await s({url:e,method:"post",data:{query:`query GetTransactionDetails($txid: bytea!) {
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
      }`,variables:{txid:`\\x${a}`}}}).catch(o=>{throw o});if(t.data.error||t.data.errors)throw t.data.error?Error(t.data.error):Error(t.data.errors[0].message);return t.data.data}async function g(e,a){let t=await s({url:e,method:"post",data:{query:`query SearchOutputsByLockingBytecode($lockingBytecode_literal: _text!) {
        search_output(
          args: {
            locking_bytecode_hex: $lockingBytecode_literal
          }
        ) {
          locking_bytecode
          output_index
          transaction_hash
          value_satoshis
          spent_by {
            input_index
            transaction {
              hash
            }
          }
        }
      }`,variables:{lockingBytecode_literal:`{${a}}`}}}).catch(o=>{throw o});if(t.data.error||t.data.errors)throw t.data.error?Error(t.data.error):Error(t.data.errors[0].message);return t.data.data}export{g as a,b,y as g,p as l};
//# sourceMappingURL=provider-f2f98646.js.map
