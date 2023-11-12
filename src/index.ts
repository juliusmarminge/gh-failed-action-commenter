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

  if (!process.env.GITHUB_TOKEN) {
    core.setFailed("No GITHUB_TOKEN found in environment");
    return;
  }
  const octokit = gh.getOctokit(process.env.GITHUB_TOKEN);

  const [packageLock, pnpmLock, yarnLock, bunLock] = await Promise.allSettled([
    octokit.rest.repos.getContent({
      repo: gh.context.repo.repo,
      owner: gh.context.repo.owner,
      path: "package-lock.json",
    }),
    octokit.rest.repos.getContent({
      repo: gh.context.repo.repo,
      owner: gh.context.repo.owner,
      path: "pnpm-lock.yaml",
    }),
    octokit.rest.repos.getContent({
      repo: gh.context.repo.repo,
      owner: gh.context.repo.owner,
      path: "yarn.lock",
    }),
    octokit.rest.repos.getContent({
      repo: gh.context.repo.repo,
      owner: gh.context.repo.owner,
      path: "bun.lock",
    }),
  ]);

  console.log(packageLock);
  console.log(pnpmLock);
  console.log(yarnLock);
  console.log(bunLock);

  const jobs = await octokit.rest.actions.listJobsForWorkflowRun({
    repo: gh.context.repo.repo,
    owner: gh.context.repo.owner,
    run_id: gh.context.runId,
  });

  let shouldComment = false;
  let commentBody = `Hello @${gh.context.actor},\n\n`;
  commentBody += "The following jobs failed and must be fixed:\n\n";

  for (const job of jobs.data.jobs) {
    const { name, conclusion } = job;
    const fix = fixes[name];

    if (conclusion === "failure") {
      shouldComment = true;
      commentBody += `- [ ] ${name}`;
      if (fix) {
        commentBody += `. This check can be fixed by running '${fix}')`;
      }
      commentBody += "\n";
    }
  }

  if (!shouldComment) {
    console.log("No jobs failed, skipping comment");
    return;
  }

  await octokit.rest.issues.createComment({
    repo: gh.context.repo.repo,
    owner: gh.context.repo.owner,
    issue_number: gh.context.issue.number,
    body: commentBody,
  });
}

run();
