import {
  BytecodePatternQueryDefaults,
  BytecodePatternExtendedQueryI,
  BytecodePatternQueryI,
} from "./interface.js"


export function prepareBytecodeQueryParameters(param?: BytecodePatternExtendedQueryI | BytecodePatternQueryI) {
  if (!param) param = {}
  param = { ...BytecodePatternQueryDefaults, ...param }

  // convert the code to uppercase, then ascii, padding it with the number of bytes
  if ("code" in param && param.code) {
    if (param.code.toLowerCase().match(/[a-z]/i)) {
      const codeAscii = param.code!.toUpperCase().charCodeAt(0).toString(16);
      param.prefix += "01" + codeAscii
      // 
      // version comes after code... pad with zeros.
      if ("version" in param) {
        if (Number.isInteger(param.version)) param.prefix += "01" + ("00" + param.version!.toString()).slice(-2);
      }
    }


  }
  if ("code" in param) delete param.code
  if ("version" in param) delete param.version
  return param
}
