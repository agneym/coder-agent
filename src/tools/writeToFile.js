import fs from "node:fs";
import path from "node:path";

export function writeToFile(filePath, fileContent) {
  fs.writeFileSync(
    path.join("/Users/agney/code/run-throughs", filePath),
    fileContent
  );
  return `File at ${filePath} written successfully`;
}
