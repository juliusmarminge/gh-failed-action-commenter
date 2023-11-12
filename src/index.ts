import * as gh from "@actions/github";
import * as core from "@actions/core";

async function run() {
  console.log("Hello World!");

  const fixesStr =
    core.getInput("FIXES", { required: false, trimWhitespace: true }) || "{}";

  let fixes: Record<string, string>;
  try {
    fixes = JSON.parse(fixesStr);
  } catch (e) {
    core.setFailed(`Error parsing FIXES as JSON: ${e}`);
    return;
  }

  console.log("FIXES", fixes);
}

run();
