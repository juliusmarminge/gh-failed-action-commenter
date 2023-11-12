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

  const jobs = await octokit.rest.actions.listJobsForWorkflowRun({
    repo: gh.context.repo.repo,
    owner: gh.context.repo.owner,
    run_id: gh.context.runId,
  });

  let shouldComment = false;
  let commentBody = `Hello @${gh.context.actor},\n\n`;
  commentBody += "The following jobs failed:\n\n";

  for (const job of jobs.data.jobs) {
    const { name, conclusion } = job;
    const fix = fixes[name];
    if (!fix) continue;

    if (conclusion === "failure") {
      shouldComment = true;
      commentBody += `- [ ] [${name}](Fixable by running '${fix}')\n`;
    }
  }

  if (!shouldComment) {
    console.log("No jobs failed, skipping comment");
    return;
  }

  console.log("Jobs failed, commenting");

  await octokit.rest.issues.createComment({
    repo: gh.context.repo.repo,
    owner: gh.context.repo.owner,
    issue_number: gh.context.issue.number,
    body: commentBody,
  });
}

run();
