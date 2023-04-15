import fs from "fs";

export function writeToFile(filePath, fileContent) {
  fs.writeFileSync(filePath, fileContent);
  return `File at ${filePath} written successfully`;
}
