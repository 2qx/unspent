import axios from 'axios';
import { COINGECKO_CHART, CHAINGRAPH } from './config.js';

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function getBlockHistory(start: number) {

  let resp = await getBlockTimestamps(
    CHAINGRAPH,
    0,
    1000,
    start
  )
  await sleep(100);
  return resp
}


export async function getBlockTimestamps(host: string, offset: number, limit: number, start: number) {
  const query = `
  query GetBlockTimestamps($limit: Int, $offset: Int, $start:bigint) {
    block(
      limit: $limit, 
      offset: $offset,
      where: {
        _and: [
          { height: { _gt: $start } }
          { accepted_by: { node: { name: { _is_null: false } } } }
        ]
      }
    ) {
      height
      timestamp
    }
  }
  `
  const response = await axios({
    url: host,
    method: "post",
    data: {
      query: query,
      variables: {
        limit: limit,
        offset: offset,
        start: start
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
  return response.data.data.block.map((x: any) => {
    return {
      timestamp: new Date(parseInt(x.timestamp) * 1000),
      height: parseInt(x.height)
    }
  });
}

export async function getBalanceHistory(lockingBytecode: string) {
  return await getBalanceHistoryRaw(CHAINGRAPH,
    lockingBytecode,
    0,
    50
  )
}

export async function getBalanceHistoryRaw(host: string, lockingBytecode: string, offset: number, limit: number) {
  const query = `
  query GetTransactionHistory(
    $lockingBytecode: String!
    $limit: Int
    $offset: Int
  ) {
      search_output_prefix(
        args: { locking_bytecode_prefix_hex: $lockingBytecode }
      limit: $limit
      offset: $offset
      order_by: { transaction: { internal_id: desc } }
    ) {
      transaction {
        hash
        outputs{
          output_index
          value_satoshis
          locking_bytecode
        }
        block_inclusions {
          block {
            height
          }
        }
      }
    }
  }      
  
  `
  const response = await axios({
    url: host,
    method: "post",
    data: {
      query: query,
      variables: {
        limit: limit,
        offset: offset,
        lockingBytecode: lockingBytecode.substring(0, 44)
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
  let matchingOutputs = response.data.data.search_output_prefix.map((tx: any) => {
    let output = tx.transaction.outputs.filter((o: any) => o.locking_bytecode.includes(lockingBytecode) > 0)[0]
    return {
      id: tx.transaction.hash.substring(3) + ":" + output.output_index,
      value: parseInt(output.value_satoshis),
      height: parseInt(tx.transaction.block_inclusions[0].block.height),
      locking_bytecode: lockingBytecode
    }
  }
  )

  return matchingOutputs


}


// https://api.coingecko.com/api/v3/coins/bitcoin-cash/market_chart/range?vs_currency=usd&from=1501546841&to=
//1705191932803
//1705191641&precision=2
export async function getPriceHistory() {

  const response = await axios.get(COINGECKO_CHART, {
    params: {
      vs_currency: "usd",
      from: "1501546841",
      to: Date.now() / 1000

    }
  }).catch((e: any) => {
    throw e;
  });

  return response.data.prices.map((x: any) => {
    return {
      timestamp: new Date(x[0]),
      value: x[1]
    }
  });
}