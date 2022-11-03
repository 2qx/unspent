import { CodeType, nameMap } from "./constant.js";
import { Artifact } from "@cashscript/utils";

export async function getArtifactsAsync(
  code: CodeType,
  version: number,
  subset?: number
): Promise<Artifact> {
  if (!(code in nameMap)) throw Error(`Unrecognized contract code ${code}`);

  let scriptModuleName = `./${nameMap[code]}/cash/v${version}`;
  if (subset) scriptModuleName += `.${subset}`;
  scriptModuleName += ".js";

  let script;
  script = await import(scriptModuleName);

  if ("artifact" in script) {
    return script.artifact as Artifact;
  } else {
    throw Error(`Couldn't find contract ${code}v${version}`);
  }
}
