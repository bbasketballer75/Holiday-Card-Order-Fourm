#!/usr/bin/env node
/*
 * Minimal agent-runner to support opt-in 'Agenic' automation.
 * - Dry-run by default; pass --apply to perform changes (push, create PR, merge if allowed)
 * - Reads .agentconfig.yml or AGENT_MODE env
 * - Uses AGENT_GITHUB_TOKEN for GitHub API operations
 */

const fs = require('fs')
const path = require('path')
const os = require('os')
const { Octokit } = require('@octokit/rest')
const simpleGit = require('simple-git')
const yaml = require('yaml')

function parseArgs(argv) {
    const args = { apply: false, base: 'master', title: '', body: '' }
    argv.slice(2).forEach((arg, idx, arr) => {
        if (arg === '--apply') args.apply = true
        if (arg === '--base' && arr[idx + 1]) args.base = arr[idx + 1]
        if (arg === '--title' && arr[idx + 1]) args.title = arr[idx + 1]
        if (arg === '--body' && arr[idx + 1]) args.body = arr[idx + 1]
    })
    return args
}

async function getOwnerRepoFromGitRemotes(git) {
    try {
        const remotes = await git.getRemotes(true)
        const origin = remotes.find((r) => r.name === 'origin') || remotes[0]
        if (!origin) return null
        const url = origin.refs.fetch
        // url formats: git@github.com:owner/repo.git or https://github.com/owner/repo.git
        const ssh = url.match(/git@github.com:(.*)\/(.*)\.git/)
        if (ssh) return { owner: ssh[1], repo: ssh[2] }
        const https = url.match(/https?:\/\/github.com\/(.*)\/(.*)\.git/)
        if (https) return { owner: https[1], repo: https[2] }
        return null
    } catch (err) {
        return null
    }
}

async function main() {
    const args = parseArgs(process.argv)
    const root = path.resolve(process.cwd())
    const configPath = path.join(root, '.agentconfig.yml')
    let config = null
    if (fs.existsSync(configPath)) {
        config = yaml.parse(fs.readFileSync(configPath, 'utf8'))
    }
    const envMode = process.env.AGENT_MODE
    const agentMode = (envMode || (config && config.agent && config.agent.mode)) || 'conservative'
    if (agentMode !== 'agenic') {
        console.log(`Agent mode is '${agentMode}'. Exiting. To enable agenic mode set AGENT_MODE=agenic or .agentconfig.yml mode: agenic`)
        process.exit(0)
    }

    const git = simpleGit(root)
    const ownerRepo = await getOwnerRepoFromGitRemotes(git)
    if (!ownerRepo) {
        console.error('Unable to determine GitHub owner/repo from git remotes.')
        process.exit(1)
    }

    const status = await git.status()
    if (status.files.length === 0) {
        console.log('No changes to commit. Agent routine ending.')
        process.exit(0)
    }

    const branchName = `agent/auto-${Date.now()}`
    console.log('Creating branch:', branchName)
    await git.checkoutLocalBranch(branchName)
    await git.add('./*')
    const commitMsg = `agent: automated update (${new Date().toISOString()})`
    await git.commit(commitMsg)

    const dryRun = args.apply ? false : true
    if (dryRun) {
        console.log('Dry run: created branch and commit locally only. Use --apply to push and create PR.')
        process.exit(0)
    }

    // push branch
    await git.push('origin', branchName)
    console.log('Pushed branch to origin:', branchName)

    const ghToken = process.env.AGENT_GITHUB_TOKEN
    if (!ghToken) {
        console.error('Missing AGENT_GITHUB_TOKEN in environment. Required to create PRs. Aborting.')
        process.exit(1)
    }
    const octokit = new Octokit({ auth: ghToken })

    const { owner, repo } = ownerRepo
    const title = args.title || `AUTO: ${commitMsg}`
    const body = args.body || `Automated PR by agent (agent: ${agentMode}). See branch ${branchName} for details.`
    const pr = await octokit.pulls.create({ owner, repo, title, head: branchName, base: args.base, body })
    console.log('Created PR:', pr.data.html_url)

    // Auto-merge if allowed by config
    const allowAutoMerge = Boolean(config && config.agent && config.agent.allowAutoMerge)
    const allowedBranches = (config && config.agent && config.agent.allowedAutoMergeBranches) || []
    const isAllowedBranch = allowedBranches.some((b) => b === args.base || (b.endsWith('*') && args.base.startsWith(b.replace('*', ''))))
    if (allowAutoMerge && isAllowedBranch) {
        console.log('Agent configured to auto-merge into', args.base)
        // Wait for CI checks to be green - simplistic: poll combined status
        const prNumber = pr.data.number
        let maxAttempts = 10
        let attempt = 0
        let merged = false
        while (attempt < maxAttempts && !merged) {
            attempt++
            const { data: prInfo } = await octokit.pulls.get({ owner, repo, pull_number: prNumber })
            if (prInfo.mergeable && prInfo.mergeable_state === 'clean') {
                console.log('Merging PR now...')
                await octokit.pulls.merge({ owner, repo, pull_number: prNumber, merge_method: 'squash' })
                console.log('PR merged')
                merged = true
                break
            }
            console.log('PR not mergeable yet. Attempt', attempt)
            await new Promise((r) => setTimeout(r, 30000)) // wait 30s
        }
        if (!merged) console.log('Auto-merge attempts exhausted; leaving PR open for manual review')
    }
    console.log('Agent-runner finished')
}

main().catch((err) => {
    console.error('agent-runner error:', err)
    process.exit(1)
})

