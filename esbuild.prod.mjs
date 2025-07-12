import esbuild from "esbuild";
import sveltePlugin from "esbuild-svelte";
import sveltePreprocess from "svelte-preprocess";
import fs from "fs";

// NOTE: Chrome and Firefox Manifest V3 implementations differ
// So two seperate builds are still required
// Specify which to build with args or both will be built
let [buildChrome, buildFirefox] = [false, false];
const args = process.argv.slice(2);
for (const arg of args) {
  if (arg === "chrome") buildChrome = true;
  if (arg === "firefox") buildFirefox = true;
}
if (!buildChrome && !buildFirefox) {
  buildChrome = true;
  buildFirefox = true;
}

// Builds directories
const build_chrome_dir = "build-chrome";
const build_firefox_dir = "build-firefox";

// Make sure build directories exist
if (buildChrome && !fs.existsSync(build_chrome_dir)) {
  fs.mkdirSync(build_chrome_dir);
}
if (buildFirefox && !fs.existsSync(build_firefox_dir)) {
  fs.mkdirSync(build_firefox_dir);
}

// Copy assets and manifests
if (buildChrome) {
  fs.copyFileSync("manifest-chrome.json", `${build_chrome_dir}/manifest.json`);
  fs.cpSync("docs", `${build_chrome_dir}/docs/`, { recursive: true });
  fs.cpSync("fonts", `${build_chrome_dir}/fonts/`, { recursive: true });
}
if (buildFirefox) {
  fs.copyFileSync(
    "manifest-firefox.json",
    `${build_firefox_dir}/manifest.json`,
  );
  fs.cpSync("docs", `${build_firefox_dir}/docs/`, { recursive: true });
  fs.cpSync("fonts", `${build_firefox_dir}/fonts/`, { recursive: true });
}

const options = {
  entryPoints: [
    "src/background.ts",
    "src/vn/tracker_inject.ts",
    "src/mokuro/mokuro_inject.ts",
    "src/ttu/ttu_inject.ts",
    "src/stats/stats_inject.ts",
    "src/settings/settings_inject.ts",
    "src/fonts.ts",
  ],
  mainFields: ["svelte", "browser", "module", "main"],
  bundle: true,
  minify: true,
  target: ["chrome118", "firefox118"],
  plugins: [sveltePlugin({ preprocess: sveltePreprocess({ postcss: true }) })],
};

try {
  console.log("Starting production build...");

  const builds = [];

  if (buildChrome) {
    console.log("Building Chrome extension...");
    builds.push(esbuild.build({ ...options, outdir: build_chrome_dir }));
  }

  if (buildFirefox) {
    console.log("Building Firefox extension...");
    builds.push(esbuild.build({ ...options, outdir: build_firefox_dir }));
  }

  await Promise.all(builds);

  console.log("Production build completed successfully!");

  // Log build output info
  if (buildChrome) {
    console.log(`Chrome build output: ${build_chrome_dir}/`);
  }
  if (buildFirefox) {
    console.log(`Firefox build output: ${build_firefox_dir}/`);
  }

} catch (error) {
  console.error("Build failed:", error);
  process.exit(1);
}
