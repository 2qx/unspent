const DELIMITER = ",";

const DefaultOptions = {
  version: 2,
  network: "mainnet",
};

// '62616e6b'
const PROTOCOL_ID = "7574786f";
const _PROTOCOL_ID = "0x" + PROTOCOL_ID;

const DUST_UTXO_THRESHOLD = 576n;

const SPECIALS = [
  "76a914509789660476e48359451991c10968805c442e6588ac",
  "76a91409cc161e7bc3fb887aeb843e7914129aa095fae188ac",
  "76a914790d87551f650cc3de316882f6e75536b2119eac88ac",
  "76a914a4c3dc6d60b596f2a8b08336d5da963c24a8ba4588ac",
  "76a91452ac06f8a36dcc7ec0e0fdfbc944e00050da37df88ac",
]

export {
  DELIMITER,
  DefaultOptions,
  PROTOCOL_ID,
  _PROTOCOL_ID,
  DUST_UTXO_THRESHOLD,
  SPECIALS
};
