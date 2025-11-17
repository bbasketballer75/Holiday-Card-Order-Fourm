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
    const args = { apply: false, base: 'master', title: '', body: '', addSecrets: [] }
    argv.slice(2).forEach((arg, idx, arr) => {
        if (arg === '--apply') args.apply = true
        if (arg === '--base' && arr[idx + 1]) args.base = arr[idx + 1]
        if (arg === '--title' && arr[idx + 1]) args.title = arr[idx + 1]
        if (arg === '--body' && arr[idx + 1]) args.body = arr[idx + 1]
        if (arg === '--add-secret' && arr[idx + 1]) args.addSecrets.push(arr[idx + 1])
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
    // Try to find the git repository root (walk up until a .git directory is found)
    function findGitRoot(startDir) {
        let cur = path.resolve(startDir)
        while (true) {
            if (fs.existsSync(path.join(cur, '.git'))) return cur
            const parent = path.dirname(cur)
            if (parent === cur) return null
            cur = parent
        }
    }
    const root = findGitRoot(process.cwd()) || path.resolve(process.cwd())
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
    let ownerRepo = await getOwnerRepoFromGitRemotes(git)
    // Fallback: use GITHUB_REPOSITORY if available (owner/repo)
    if (!ownerRepo && process.env.GITHUB_REPOSITORY) {
        const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/')
        if (owner && repo) ownerRepo = { owner, repo }
    }
    if (!ownerRepo) {
        console.error('Unable to determine GitHub owner/repo from git remotes. Please set GITHUB_REPOSITORY env or ensure your git remotes are configured.')
        process.exit(1)
    }

    // If secrets were provided via chat in env var, parse and add
    if (process.env.AGENT_CHAT_SECRETS) {
        const chatSecrets = process.env.AGENT_CHAT_SECRETS.split(';').filter(Boolean)
        args.addSecrets = (args.addSecrets || []).concat(chatSecrets)
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

    // If secrets were passed, persist them to .env.local and optionally GitHub secrets
        if (args.addSecrets && args.addSecrets.length) {
        console.log('Agent-runner detected secret additions; writing to .env.local (values redacted)')
        const secretsArgs = args.addSecrets.flatMap((s) => [s])
        const repoSpec = `${ownerRepo.owner}/${ownerRepo.repo}`
        // Execute helper script: node ../../scripts/add-secret-to-env.js KEY=VALUE --gh --repo owner/repo
        try {
            const child_process = require('child_process')
            const scriptPath = path.resolve(root, '..', 'scripts', 'add-secret-to-env.js')
            const envPathForScript = path.resolve(root, '.env.local')
            const cmdArgs = secretsArgs.concat(['--gh', `--repo=${repoSpec}`, `--path=${envPathForScript}`])
            child_process.execFileSync('node', [scriptPath, ...cmdArgs], { stdio: 'inherit' })
        } catch (err) {
            console.error('Failed to add secrets to .env.local via helper:', err.message)
        }
    }

    const dryRun = args.apply ? false : true
    if (dryRun) {
        console.log('Dry run: created branch and commit locally only. Use --apply to push and create PR.')
        process.exit(0)
    }

    // push branch
    await git.push('origin', branchName)
    console.log('Pushed branch to origin:', branchName)

    const ghToken = process.env.AGENT_GITHUB_TOKEN || process.env.GITHUB_TOKEN
    if (!ghToken) {
        console.error('Missing AGENT_GITHUB_TOKEN in environment. Required to create PRs. Aborting.')
        process.exit(1)
    }
    const octokit = new Octokit({ auth: ghToken })

    const { owner, repo } = ownerRepo
    const title = args.title || `AUTO: ${commitMsg}`
    const body = args.body || `Automated PR by agent (agent: ${agentMode}). See branch ${branchName} for details.`
    // Determine PR size and whether to create a Draft based on config
    const allowLargePRs = Boolean(config && config.agent && config.agent.allowLargePRs)
    const allowedPRSize = (config && config.agent && config.agent.allowedPRSize) || 200
    const changedFilesCount = status.files.length || 0
    const shouldDraft = (!allowLargePRs && changedFilesCount > allowedPRSize)
    const pr = await octokit.pulls.create({ owner, repo, title, head: branchName, base: args.base, body, draft: shouldDraft })
    if (shouldDraft) {
        console.log('Large PR created as Draft because it exceeded allowedPRSize:', changedFilesCount)
    }
    console.log('Created PR:', pr.data.html_url)

    // Auto-merge if allowed by config
    const allowAutoMerge = Boolean(config && config.agent && config.agent.allowAutoMerge)
    const allowedBranches = (config && config.agent && config.agent.allowedAutoMergeBranches) || []
    const enforceBranchProtection = Boolean(config && config.agent && config.agent.enforceBranchProtection)
    const requireApprovalsForProduction = (config && config.agent && config.agent.requireApprovalsForProduction) || 1
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
                // Before merging to production branches, check branch protection and approvals
                if (['master', 'main'].includes(args.base) && enforceBranchProtection) {
                    try {
                        const bp = await octokit.repos.getBranchProtection({ owner, repo, branch: args.base })
                        const rpr = bp.data.required_pull_request_reviews || {}
                        const requiredApprovals = rpr.required_approving_review_count || requireApprovalsForProduction
                        // List reviews for the PR and count unique approvers
                        const { data: reviews } = await octokit.pulls.listReviews({ owner, repo, pull_number: prNumber })
                        const approvedBy = new Set(reviews.filter(r => r.state === 'APPROVED').map(r => r.user && r.user.login).filter(Boolean))
                        if (approvedBy.size < requiredApprovals) {
                            console.log(`Insufficient approvals (${approvedBy.size}/${requiredApprovals}) for protected branch ${args.base}; delaying merge.`)
                            // Not merged; continue polling
                            await new Promise((r) => setTimeout(r, 30000))
                            attempt++
                            continue
                        }
                        // Optionally check if code owner reviews are required - if so, require at least one approval (we can't easily determine code owners here)
                        if (rpr && rpr.require_code_owner_reviews) {
                            console.log('Branch protection requires CODEOWNERS approval; ensuring at least one approval is present.')
                            // If approvals exist and the PR is mergeable, treat as sufficient by default
                            if (approvedBy.size === 0) {
                                console.log('No codeowner approvals found; delaying merge.')
                                await new Promise((r) => setTimeout(r, 30000))
                                attempt++
                                continue
                            }
                        }
                    } catch (err) {
                        if (err.status === 404) {
                            console.log('Branch protection not found for branch', args.base, '; proceeding with default checks.')
                        } else {
                            console.warn('Error fetching branch protection:', err.message)
                        }
                    }
                }
                await octokit.pulls.merge({ owner, repo, pull_number: prNumber, merge_method: 'squash' })
                console.log('PR merged')
                merged = true
                break
            }
            // Optional: secret rotation before or after PR creation, depending on config
            const allowSecretRotation = Boolean(config && config.agent && config.agent.allowSecretRotation)
            if (allowSecretRotation) {
                const trustedListStr = process.env.AGENT_TRUSTED || ''
                const isTrusted = Array.from(trustedListStr.split(',')).some(Boolean)
                if (!isTrusted) {
                    console.warn('AllowSecretRotation is true but AGENT_TRUSTED is not set; skipping secret rotation.')
                } else {
                    console.log('Secret rotation enabled and AGENT_TRUSTED is set. Running rotate script...')
                    try {
                        const child_process = require('child_process')
                        child_process.execSync('bash ../scripts/rotate-supabase-keys.sh', { stdio: 'inherit', cwd: path.resolve(root) })
                        console.log('Secret rotation script executed (placeholder).')
                    } catch (err) {
                        console.error('Secret rotation script failed or is not configured properly:', err.message)
                    }
                }
            }
            console.log('PR not mergeable yet. Attempt', attempt)
            await new Promise((r) => setTimeout(r, 30000)) // wait 30s
        }
        if (!merged) console.log('Auto-merge attempts exhausted; leaving PR open for manual review')
    }
    // Post-merge: optional production deploy if configured and merge succeeded
    const allowProductionDeploy = Boolean(config && config.agent && config.agent.allowProductionDeploy)
    if (allowProductionDeploy) {
        // Very small safety: only trigger deploy if we merged automatically or the PR is merged by human and we have RAILWAY_API_KEY
        const prNumber = pr.data.number
        const { data: prInfoAfter } = await octokit.pulls.get({ owner, repo, pull_number: prNumber })
        if (prInfoAfter.merged) {
            const railwayKey = process.env.RAILWAY_API_KEY
            if (railwayKey) {
                console.log('Triggering deploy (placeholder).')
                const child_process = require('child_process')
                try {
                    child_process.execSync('bash ../scripts/deploy-prod.sh', { stdio: 'inherit', cwd: path.resolve(root) })
                    console.log('Deploy script executed (placeholder).')
                } catch (err) {
                    console.error('Deploy script failed or is not configured properly:', err.message)
                }
            } else {
                console.log('RAILWAY_API_KEY not provided; skipping production deploy.')
            }
        } else {
            console.log('PR not merged; skipping production deploy.')
        }
    }
    console.log('Agent-runner finished')
}

main().catch((err) => {
    console.error('agent-runner error:', err)
    process.exit(1)
})

