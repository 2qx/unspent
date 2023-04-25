const DELIMITER = ",";

const DefaultOptions = {
  version: 1,
  network: "mainnet",
};

// '62616e6b'
const PROTOCOL_ID = "7574786f";
const _PROTOCOL_ID = "0x" + PROTOCOL_ID;

const DUST_UTXO_THRESHOLD = 546n;

export {
  DELIMITER,
  DefaultOptions,
  PROTOCOL_ID,
  _PROTOCOL_ID,
  DUST_UTXO_THRESHOLD,
};
