#!/usr/bin/env node
const { Octokit } = require('@octokit/rest');
const parseArgs = require('minimist');

const argv = parseArgs(process.argv.slice(2), { boolean: ['dry-run'], default: { days: 7, 'dry-run': true } });
const DAYS_OLD = Number(argv.days) || 7;
const DRY_RUN = Boolean(argv['dry-run']);
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
}

run().catch((err) => {
    console.error('branch-cleanup failed', err);
    process.exit(1);
});
