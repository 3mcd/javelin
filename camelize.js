import { resolve, extname } from "path";
import { readdir, readFile, writeFile } from "fs/promises";

async function* getFiles(dir, exclude) {
  const dirents = await readdir(dir, { withFileTypes: true });
  for (const dirent of dirents) {
    const res = resolve(dir, dirent.name);
    if (exclude.test(res)) continue;
    if (dirent.isDirectory()) {
      yield* getFiles(res, exclude);
    } else {
      yield res;
    }
  }
}

const camelize = (str) =>
  str.replace(/"[^"]+"|(_[a-z])/g, (match, group) => {
    if (!group) return match;
    else return group[1].toUpperCase();
  });

const exclude = /(\.changeset)/g;

for await (const filePath of getFiles(".", exclude)) {
  let ext = extname(filePath);
  if (ext === ".ts" || ext === ".md") {
    let fileContents = await readFile(filePath);
    let camelizedFileContents = camelize(fileContents.toString());
    await writeFile(filePath, camelizedFileContents);
  }
}
