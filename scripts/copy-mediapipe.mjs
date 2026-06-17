import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "public", "mediapipe");

const packages = [{ name: "@mediapipe/face_mesh", dest: "face_mesh" }];

function getInstalledVersion(packageName) {
  const packageJsonPath = join(root, "node_modules", packageName, "package.json");
  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
  return packageJson.version;
}

function shouldCopy() {
  const markerPath = join(publicDir, ".versions.json");

  if (!existsSync(markerPath)) {
    return true;
  }

  try {
    const marker = JSON.parse(readFileSync(markerPath, "utf8"));
    return packages.some(({ name }) => marker[name] !== getInstalledVersion(name));
  } catch {
    return true;
  }
}

function copyPackages() {
  mkdirSync(publicDir, { recursive: true });

  const versions = {};

  for (const { name, dest } of packages) {
    const source = join(root, "node_modules", name);
    const target = join(publicDir, dest);

    if (!existsSync(source)) {
      throw new Error(`Missing MediaPipe package: ${name}. Run npm install first.`);
    }

    rmSync(target, { recursive: true, force: true });
    cpSync(source, target, { recursive: true });
    versions[name] = getInstalledVersion(name);
    console.log(`Copied ${name} -> public/mediapipe/${dest}`);
  }

  writeFileSync(join(publicDir, ".versions.json"), JSON.stringify(versions, null, 2));
}

if (shouldCopy()) {
  copyPackages();
} else {
  console.log("MediaPipe assets already up to date in public/mediapipe");
}
