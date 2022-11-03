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
  node = node ? node : "bchn";
  let response = await axios({
    url: host,
    method: "post",
    data: {
      query: `query SearchOutputsByLockingBytecodePrefix($prefix: String!, $node: String!, $limit:Int, $offset:Int) {
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
            }`,
      variables: {
        prefix: prefix,
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
