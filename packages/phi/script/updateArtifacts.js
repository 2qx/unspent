import glob from "glob";
import fs from "fs";
import { compileFile, compileString } from "cashc";
import { getDivideContract } from "./divide.v1.js";

function updateArtifacts() {
  glob("src/contract/**/cash/*.cash", function (err, files) {
    if (err) {
      console.log(err);
    }

    files.forEach((file) => {
      console.log(file);
      updateArtifact(file);
    });
  });
}

function updateArtifact(cashFile) {
  let artifact = compileFile(cashFile);
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

function updateDivideContract(d) {
  let cashFile = `src/contract/divide/cash/divide.${d}.cash`;
  let cashString = getDivideContract(d);
  let artifact = compileString(cashString);
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
    updateDivideContract(d);
  });
}

updateDivideContracts();
updateArtifacts();
