const { resolve } = require("path");
const { rollup } = require("rollup");
const rollupTSPlugin = require("@rollup/plugin-typescript");
var fs = require("fs");

async function test() {
  // IMPORTANT: The issue only happens if it's the same instance of rollup/plugin-typescript
  // Hence, generating one instance and using it twice below.
  const tsPlugin = rollupTSPlugin({ outputToFilesystem: false });

  const rollupConfig = {
    input: resolve("test.ts"),
    plugins: [tsPlugin],
  };

  const rollupOutputOptions = { format: "cjs", exports: "auto" };

  try {
    const firstBundle = await rollup(rollupConfig);
    const firstBundleOutput = await firstBundle.generate(rollupOutputOptions);
    const firstBundleCode = firstBundleOutput.output[0].code;

    // Mutating the source file
    fs.appendFileSync("test.ts", '\nexport const TEST = "1";');

    const secondBundle = await rollup(rollupConfig);
    const secondBundleOutput = await secondBundle.generate(rollupOutputOptions);
    const secondBundleCode = secondBundleOutput.output[0].code;

    if (firstBundleCode === secondBundleCode) {
      console.error(
        "Error: output code should be different after test.ts mutation"
      );
      // console.log(`firstBundleCode\n----\n${firstBundleCode}\n----\n`);
      // console.log(`secondBundleCode\n----\n${secondBundleCode}\n----\n`);
    } else {
      console.log("Success!");
    }
  } finally {
    fs.copyFile("original.ts", "test.ts", (err) => {
      if (err) {
        console.log("Error restoring main.ts:", err);
      }
    });
  }
}

function main() {
  test().then(() => {
    console.log("Done");
  });
}
main();
