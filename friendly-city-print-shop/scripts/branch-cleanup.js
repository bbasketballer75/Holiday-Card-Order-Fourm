#!/usr/bin/env node
const { Octokit } = require('@octokit/rest');
const parseArgs = require('minimist');

const argv = parseArgs(process.argv.slice(2), { boolean: ['dry-run', 'delete-unmerged'], default: { days: 7, 'dry-run': true, 'delete-unmerged': false } });
const DAYS_OLD = Number(argv.days) || 7;
const DRY_RUN = Boolean(argv['dry-run']);
const DELETE_UNMERGED = Boolean(argv['delete-unmerged']);
const PATTERN = argv.pattern || '^(agent|auto|dependabot)/';
const token = process.env.GITHUB_TOKEN;

if (!token) {
    console.error('GITHUB_TOKEN is required to run branch cleanup.');
    process.exit(1);
}

const repoFull = process.env.GITHUB_REPOSITORY;
if (!repoFull) {
    console.error('GITHUB_REPOSITORY is required (owner/repo).');
    process.exit(1);
}

const [owner, repo] = repoFull.split('/');
const octokit = new Octokit({ auth: token });

async function listAllClosedPRs() {
    const results = [];
    for await (const response of octokit.paginate.iterator(octokit.pulls.list, { owner, repo, state: 'closed', per_page: 100 })) {
        results.push(...response.data);
    }
    return results;
}

function olderThanDays(dateStr, days) {
    const d = new Date(dateStr);
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return d.getTime() < cutoff;
}

async function run() {
    console.log(`Branch cleanup: looking for PRs merged > ${DAYS_OLD} days ago (dry-run=${DRY_RUN})`);
    const closedPRs = await listAllClosedPRs();
    const toDelete = closedPRs.filter((pr) => pr.merged_at && olderThanDays(pr.merged_at, DAYS_OLD));
    console.log(`Found ${toDelete.length} merged PRs total; evaluating branches to delete`);

    for (const pr of toDelete) {
        const head = pr.head || {};
        const branch = head.ref;
        const headRepo = head.repo ? head.repo.full_name : null;
        if (!branch) continue;
        if (headRepo !== `${owner}/${repo}`) {
            console.log(`Skipping ${branch} since it lives in ${headRepo}`);
            continue;
        }
        if (branch === 'master' || branch === 'main') {
            console.log(`Skipping default branch ${branch}`);
            continue;
        }

        try {
            // confirm branch exists and not protected
            const branchInfo = await octokit.repos.getBranch({ owner, repo, branch });
            if (branchInfo.data.protected) {
                console.log(`Skipping ${branch} because the branch is protected`);
                continue;
            }
        } catch (err) {
            if (err.status === 404) {
                console.log(`Branch ${branch} not found; skipping`);
                continue;
            }
            console.error(`Error checking branch ${branch}: ${err.message}`);
            continue;
        }

        if (DRY_RUN) {
            console.log(`[DRY-RUN] Would delete branch: ${branch} (merged: ${pr.merged_at})`);
        } else {
            try {
                await octokit.git.deleteRef({ owner, repo, ref: `heads/${branch}` });
                console.log(`Deleted branch: ${branch}`);
            } catch (err) {
                console.error(`Failed to delete branch ${branch}: ${err.message}`);
            }
        }
    }

    console.log('Done');

    if (DELETE_UNMERGED) {
        console.log(`\nNow scanning for unmerged branches matching pattern '${PATTERN}' older than ${DAYS_OLD} days (dry-run=${DRY_RUN})`);
        const patternRegex = new RegExp(PATTERN, 'i');
        // List all branches in the repository
        const branches = [];
        for await (const response of octokit.paginate.iterator(octokit.repos.listBranches, { owner, repo, per_page: 100 })) {
            branches.push(...response.data);
        }

        // Get default branch name
        const repoInfo = await octokit.repos.get({ owner, repo });
        const defaultBranch = repoInfo.data.default_branch;

        const candidates = [];
        for (const b of branches) {
            const branch = b.name;
            if (branch === defaultBranch) continue;
            if (!patternRegex.test(branch)) continue;
            try {
                const commit = await octokit.repos.getCommit({ owner, repo, ref: b.commit.sha });
                const commitDate = commit.data.commit.committer ? commit.data.commit.committer.date : commit.data.commit.author.date;
                if (!olderThanDays(commitDate, DAYS_OLD)) continue;
            } catch (err) {
                console.warn(`Unable to fetch commit info for ${branch}: ${err.message}`);
                continue;
            }

            // Check if there's any PR for this head
            const prs = await octokit.pulls.list({ owner, repo, head: `${owner}:${branch}`, state: 'all', per_page: 100 });
            const hasOpenPR = prs.data.some((pr) => pr.state === 'open');
            if (hasOpenPR) {
                console.log(`Skipping ${branch} because there is an open PR`);
                continue;
            }

            // Check protection
            try {
                const branchInfo = await octokit.repos.getBranch({ owner, repo, branch });
                if (branchInfo.data.protected) {
                    console.log(`Skipping ${branch} because the branch is protected`);
                    continue;
                }
            } catch (err) {
                if (err.status === 404) {
                    console.log(`Branch ${branch} not found; skipping`);
                    continue;
                }
                console.error(`Error checking branch ${branch}: ${err.message}`);
                continue;
            }

            candidates.push(branch);
        }

        if (candidates.length === 0) {
            console.log('No unmerged candidate branches found for deletion.');
        } else {
            for (const branch of candidates) {
                if (DRY_RUN) {
                    console.log(`[DRY-RUN] Would delete unmerged branch: ${branch}`);
                } else {
                    try {
                        await octokit.git.deleteRef({ owner, repo, ref: `heads/${branch}` });
                        console.log(`Deleted unmerged branch: ${branch}`);
                    } catch (err) {
                        console.error(`Failed to delete unmerged branch ${branch}: ${err.message}`);
                    }
                }
            }
        }
    }

}

run().catch((err) => {
    console.error('branch-cleanup failed', err);
    process.exit(1);
});
