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
    core.setFailed(`Error parsing FIXES (${fixesStr}) as JSON: ${e}`);
    return;
  }

  console.log("FIXES", fixes);

  if (!process.env.GITHUB_TOKEN) {
    core.setFailed("No GITHUB_TOKEN found in environment");
    return;
  }

  const octokit = gh.getOctokit(process.env.GITHUB_TOKEN);

  const jobs = await octokit.rest.actions.getJobForWorkflowRun({
    repo: gh.context.repo.repo,
    owner: gh.context.repo.owner,
    job_id: gh.context.runId,
  });
  console.log("JOBS", jobs);
}

run();
