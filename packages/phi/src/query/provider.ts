import axios from "axios";
import {
  BytecodePatternQueryI,
  BytecodePatternQueryDefaults,
  ChaingraphSearchOutputResult,
  HistoryI,
  HistoryQueryI,
  HistoryIDefaults
} from "./interface.js";
import { parseOpReturn } from "../common/map.js"
import { binToHex } from "@bitauth/libauth";


export async function getRecords(
  host: string,
  prefix?: string,
  node = "mainnet",
  limit = 25,
  offset = 0,
  exclude_pattern = "",
  after = 0
) {

  let param = {
    prefix: prefix,
    node: node,
    limit: limit,
    offset: offset,
    exclude_pattern: exclude_pattern,
    after: after
  } 

  param = { ... BytecodePatternQueryDefaults, ...param}

  let response = await getChaingraphUnspentRecords(
    host,
    param
  )
  // transform list of objects to a list of strings
  response = response.map((val: any) => {
    return val.id as string;
  });

  return response;
}

export async function getChaingraphUnspentRecords(
  host: string,
  param: BytecodePatternQueryI
) {

  //@ts-ignore
  if ("code" in param) delete param.code
  //@ts-ignore
  if ("version" in param) delete param.version
  
  const response = await axios({
    url: host,
    method: "post",
    data: {
      query: `query SearchOutputsByLockingBytecodePrefix(
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
          }`,
      variables: param,
    },
  }).catch((e: any) => {
    throw e;
  });

  // raise errors from chaingraph
  if (response.data.error || response.data.errors) {
    if (response.data.error) {
      throw Error(response.data.error);
    } else {
      throw Error(response.data.errors[0].message);
    }
  }
  const results = response.data.data.search_output_prefix.map((r: ChaingraphSearchOutputResult) => {
    let height = r.transaction.block_inclusions[0]?.block.height
    if (typeof height === "string") height = parseInt(height)
    if (r.locking_bytecode.slice(0, 2) === "\\x") {
      return {
        record: r.locking_bytecode.slice(2),
        height: height
      }
    } else {
      return {
        record: r.locking_bytecode,
        height: height
      }
    }
  })

  return results.map((o: any) => {
    return {
      "id": o.record,
      "data": parseOpReturn(o.record),
      "height": o.height
    }
  })
}

export async function getTransaction(host: string, txid: string) {

  const query = `query GetTransactionDetails($txid: bytea!) {
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
  }`

  const response = await axios({
    url: host,
    method: "post",
    data: {
      query: query,
      variables: {
        txid: `\\x${txid}`,
      },
    },
  }).catch((e: any) => {
    throw e;
  });

  // raise errors from chaingraph
  if (response.data.error || response.data.errors) {
    if (response.data.error) {
      throw Error(response.data.error);
    } else {
      throw Error(response.data.errors[0].message);
    }
  }

  return response.data.data;
}

export async function getUnspentOutputs(host: string, lockingBytecode: string) {
  const query = `
  query SearchUnspentOutputsByLockingBytecode($lockingBytecode_literal: _text!) {
    search_output(
      args: { locking_bytecode_hex: $lockingBytecode_literal},
      where: {_not:{spent_by:{value_satoshis:{_gt:0}}}}
    ) {
      output_index
      transaction_hash
      value_satoshis
    }
  }`
  const response = await axios({
    url: host,
    method: "post",
    data: {
      query: query,
      variables: {
        lockingBytecode_literal: `{${lockingBytecode}}`,
      },
    },
  }).catch((e: any) => {
    throw e;
  });

  // raise errors from chaingraph
  if (response.data.error || response.data.errors) {
    if (response.data.error) {
      throw Error(response.data.error);
    } else {
      throw Error(response.data.errors[0].message);
    }
  }

  // TODO cleanup response
  return response.data.data;
}

export async function getLockingBytecode(
  host: string,
  lockingBytecode: string
) {
  const response = await axios({
    url: host,
    method: "post",
    data: {
      query: `query SearchOutputsByLockingBytecode($lockingBytecode_literal: _text!) {
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
      }`,
      variables: {
        lockingBytecode_literal: `{${lockingBytecode}}`,
      },
    },
  }).catch((e: any) => {
    throw e;
  });

  // raise errors from chaingraph
  if (response.data.error || response.data.errors) {
    if (response.data.error) {
      throw Error(response.data.error);
    } else {
      throw Error(response.data.errors[0].message);
    }
  }

  // TODO cleanup response
  return response.data.data;
}

export async function getHistory(host: string,
  lockingBytecode: string | Uint8Array,
  param: HistoryQueryI): Promise<HistoryI[]> {

  if (typeof lockingBytecode !== "string") lockingBytecode = binToHex(lockingBytecode)
  param = { ...HistoryIDefaults, ...param };

  const query = `
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
  `

  const response = await axios({
    url: host,
    method: "POST",
    data: {
      query: query,
      variables: {
        ...param,
        "lockingBytecode": `{${lockingBytecode}}`,
      },
    }
  })

  if (response.data.error || response.data.errors) {
    if (response.data.error) {
      throw Error(response.data.error);
    } else {
      console.log(response.data.errors)
      throw Error(response.data.errors[0].message);
    }
  }

  return response.data.data.search_output.map((o: any) => {
    //console.log(JSON.stringify(o,undefined, 2))
    return {
      hash: o.transaction.hash.slice(2),
      raw: o.transaction.encoded_hex,
      height: parseInt(o.transaction.block_inclusions[0].block.height),
      timestamp: parseInt(o.transaction.block_inclusions[0].block.timestamp),
      spentBy: o.spent_by.map((o: any) => { return o.outpoint.transaction_hash.slice(2) + ":" + o.outpoint.output_index })
    }
  });

}

export async function getRawTransaction(host: string, hash: string, node = "mainnet") {
  const response = await axios({
    url: host,
    method: "POST",
    data: {
      query: `query GetRawTransaction(
    $node: String!
    $hash_literal: bytea!
  ) {
    transaction(
      where: {
        _and: [
          {
            hash:{
              _eq: $hash_literal
            }
          }
          {
            _or: [
              {
                  block_inclusions: {
                    block: { accepted_by: { node: { name: { _regex: $node } } } }
                }
              }
              {
                  node_validations: { node: { name: { _regex: $node } } }
              }
            ]
          }
        ]
      }
    ) {
        encoded_hex
        hash
        block_inclusions {
          block {
            height
          }
        }
    }
  }
  `,
      variables: {
        "node": node,
        "hash_literal": `\\x${hash}`,
      }
    }
  });
  if (response.data.error || response.data.errors) {
    if (response.data.error) {
      throw Error(response.data.error);
    } else {
      console.log(response.data.errors)
      throw Error(response.data.errors[0].message);
    }
  }
  return response.data.data.transaction.map((o: any) => {
    return {
      hash: o.transaction.hash.slice(2),
      raw: o.transaction.encoded_hex,
      height: parseInt(o.transaction.block_inclusions[0].block.height)
    }
  });
}

export async function sendRawTransaction(host: string, hex: string, nodeId: bigint) {
  const mutation = `mutation send($hex : String!, $nodeId: bigint!) {
    send_transaction(
      request:{ encoded_hex: $hex, node_internal_id: $nodeId}
    ){
      transaction_hash
      transmission_success
      transmission_error_message
      validation_success
      validation_error_message
    }
  }`

  const response = await axios({
    url: host,
    method: "POST",
    data: {
      query: mutation,
      variables: {
        "hex": hex,
        "nodeId": nodeId
      },
    }
  })

  if (!response.data.send_transaction.transmission_success || !response.data.send_transaction.validation_success) {
    if (!response.data.send_transaction.transmission_success) {
      throw Error(response.data.send_transaction.transmission_error_message);
    } else {
      throw Error(response.data.send_transaction.validation_error_message);
    }
  }

  return {
    hash: response.data.data.send_transaction.transaction_hash
  };
}