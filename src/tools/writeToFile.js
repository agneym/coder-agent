import fsExtra from "fs-extra/esm";
import path from "node:path";
import { ROOT_FOLDER } from "../constants.js";

export function writeToFile(input) {
  const [filePath, content] = input.split("---");
  fsExtra.outputFileSync(path.join(ROOT_FOLDER, filePath), content);
  return `File at ${filePath} written successfully`;
}
