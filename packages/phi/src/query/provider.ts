import axios from "axios";
import { PROTOCOL_ID } from "../common/constant.js";

export async function getRecords(
  host: string,
  prefix?: string,
  node?: string,
  limit = 25,
  offset = 0
) {
  prefix = prefix ? prefix : "6a04" + PROTOCOL_ID;
  node = node ? node : "mainnet";
  let exclude_pattern = "6a0401010102010717"
  let response = await axios({
    url: host,
    method: "post",
    data: {
      query: `query SearchOutputsByLockingBytecodePrefix($prefix: String!, $node: String!, $exclude_pattern: String!, $limit:Int, $offset:Int) {
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
            }`,
      variables: {
        prefix: prefix,
        exclude_pattern: exclude_pattern,
        node: node,
        limit: limit,
        offset: offset,
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

  let results = response.data.data["search_output_prefix"];

  // transform list of objects to a list of strings
  results = results.map((val: any) => {
    return val.locking_bytecode as string;
  });
  results = results.map((x: string) => x.replace("\\x", ""));
  return results;
}


export async function getTransaction(
  host: string,
  txid: string
) {

  let response = await axios({
    url: host,
    method: "post",
    data: {
      query: `query GetTransactionDetails($txid: bytea!) {
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
      }`,
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

export async function getUnspentOutputs(
  host: string,
  lockingBytecode: string
) {

  let response = await axios({
    url: host,
    method: "post",
    data: {
      query: `query SearchUnspentOutputsByLockingBytecode($lockingBytecode_literal: _text!) {
        search_output(
          args: { locking_bytecode_hex: $lockingBytecode_literal},
          where: {_not:{spent_by:{value_satoshis:{_gt:0}}}}
        ) {
          output_index
          transaction_hash
          value_satoshis
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

  return response.data.data;
}

export async function getLockingBytecode(
  host: string,
  lockingBytecode: string
) {

  let response = await axios({
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

  return response.data.data;
}
