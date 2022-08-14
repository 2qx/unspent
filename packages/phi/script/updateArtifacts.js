import glob from 'glob';
import fs from 'fs';
import { compileFile } from 'cashc';

function updateArtifacts() {
    glob('src/contract/**/cash/*.cash', function (err, files) {
        if (err) {
            console.log(err);
        }

        files.forEach(file => {
            console.log(file);
            updateArtifact(file);
        });
    });

}

function updateArtifact(cashFile){
     let artifact = compileFile(cashFile)
     let tsFile = cashFile.replace("\.cash","\.ts")
     console.log(tsFile)
     try {
        fs.writeFileSync(tsFile, "// Automatically Generated\nexport const artifact = ");
        fs.appendFileSync(tsFile, JSON.stringify(artifact, null, 2) , 'utf-8');
        // file written successfully
      } catch (err) {
        console.error(err);
      }

}


updateArtifacts();
// fs.appendFile('file.log', content, err => {
//     if (err) {
//       console.error(err);
//     }
//     // done!
//   });