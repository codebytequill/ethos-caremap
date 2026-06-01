import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const dist = join(root, "dist");

const filesToCopy = ["index.html", "styles.css", "app.js", "README.md", "CHANGELOG.md"];
const foldersToCopy = ["assets"];

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

for (const file of filesToCopy) {
  await cp(join(root, file), join(dist, file));
}

for (const folder of foldersToCopy) {
  await cp(join(root, folder), join(dist, folder), { recursive: true });
}

await writeFile(join(dist, ".nojekyll"), "");

console.log("Built Ethos CareMap static site in dist/");
