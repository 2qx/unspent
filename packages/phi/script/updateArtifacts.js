import glob from "glob";
import fs from "fs";
import { compileFile as compileFile07, compileString as compileString07 } from "cashc-0.7";
import { compileFile, compileString } from "cashc";
import { getDivideContract as getV1 } from "./divide.v1.js";
import { getDivideContract as getV2 } from "./divide.v2.js";

function updateArtifacts() {
  glob("src/contract/**/cash/v1.cash", function (err, files) {
    if (err) {
      console.log(err);
    }

    files.forEach((file) => {
      console.log(file);
      updateArtifact(file, compileFile07);
    });
  });


  glob("src/contract/**/cash/v2.cash", function (err, files) {
    if (err) {
      console.log(err);
    }

    files.forEach((file) => {
      console.log(file);
      updateArtifact(file, compileFile);
    });
  });

}

function updateArtifact(cashFile, compiler) {
  let artifact = compiler(cashFile);
  let tsFile = cashFile.replace(".cash", ".ts");
  console.log(tsFile);
  try {
    fs.writeFileSync(
      tsFile,
      "// Automatically Generated\nexport const artifact = "
    );
    fs.appendFileSync(tsFile, JSON.stringify(artifact, null, 2), "utf-8");
    // file written successfully
  } catch (err) {
    console.error(err);
  }
}

function updateDivideContract(d, v) {
  let cashFile = `src/contract/divide/cash/${d}.v${v}.cash`;
  let cashString;
  let artifact;
  if(v==1){
    cashString = getV1(d);
    artifact = compileString07(cashString);
  }else if (v==2){
    cashString = getV2(d);
    artifact = compileString(cashString);
  }else{
    throw("Unrecognized version of Divide contract")
  }

  let tsFile = cashFile.replace(".cash", ".ts");
  console.log(tsFile);
  try {
    fs.writeFileSync(cashFile, cashString, "utf-8");
  } catch (err) {
    console.error(err);
  }
  try {
    fs.writeFileSync(
      tsFile,
      "// Automatically Generated\nexport const artifact = "
    );
    fs.appendFileSync(tsFile, JSON.stringify(artifact, null, 2), "utf-8");
    // file written successfully
  } catch (err) {
    console.error(err);
  }
}

function updateDivideContracts() {
  let divisors = [2, 3, 4];
  divisors.forEach((d) => {
    updateDivideContract(d, 1);
    updateDivideContract(d, 2);
  });
}

updateDivideContracts();
updateArtifacts();
