// TODO Packaging problem; Target -> Node.js

import * as fs from 'fs';
import * as path from 'path';
import { NBT } from './nbt'
import { read } from './nbt-reader'

export function readFile(file: string, littleEndian?: boolean): NBT {
  let resolveFile = path.resolve(file);
  let buffer = fs.readFileSync(resolveFile);
  return read(new Int8Array(buffer), littleEndian);
}

// TODO: writeFile, gzip, pako etc..
