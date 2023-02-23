import{g as s,i as _}from"./index-3840ff38.js";async function l(r,e,t,o=25,c=0){e=e||"6a04"+_,t=t||"mainnet";let a=await s({url:r,method:"post",data:{query:`query SearchOutputsByLockingBytecodePrefix($prefix: String!, $node: String!, $exclude_pattern: String!, $limit:Int, $offset:Int) {
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
            }`,variables:{prefix:e,exclude_pattern:"6a0401010102010717",node:t,limit:o,offset:c}}}).catch(i=>{throw i});if(a.data.error||a.data.errors)throw a.data.error?Error(a.data.error):Error(a.data.errors[0].message);let n=a.data.data.search_output_prefix;return n=n.map(i=>i.locking_bytecode),n=n.map(i=>i.replace("\\x","")),n}async function p(r,e){let t=await s({url:r,method:"post",data:{query:`query GetTransactionDetails($txid: bytea!) {
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
      }`,variables:{txid:`\\x${e}`}}}).catch(o=>{throw o});if(t.data.error||t.data.errors)throw t.data.error?Error(t.data.error):Error(t.data.errors[0].message);return t.data.data}async function h(r,e){let t=await s({url:r,method:"post",data:{query:`query SearchUnspentOutputsByLockingBytecode($lockingBytecode_literal: _text!) {
        search_output(
          args: { locking_bytecode_hex: $lockingBytecode_literal},
          where: {_not:{spent_by:{value_satoshis:{_gt:0}}}}
        ) {
          output_index
          transaction_hash
          value_satoshis
        }
      }`,variables:{lockingBytecode_literal:`{${e}}`}}}).catch(o=>{throw o});if(t.data.error||t.data.errors)throw t.data.error?Error(t.data.error):Error(t.data.errors[0].message);return t.data.data}export{h as a,p as b,l as g};
//# sourceMappingURL=provider-7a564028.js.map
