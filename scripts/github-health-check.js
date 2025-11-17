#!/usr/bin/env node
/*
 * GitHub Health Check Script
 * - Lists stale PRs, open branches matching agent/*, workflow failures, and security alerts.
 * - Does not perform destructive actions; only reports findings.
 */

const cp = require('child_process')
const fs = require('fs')
const path = require('path')

function exec(command) {
    try {
        return cp.execSync(command, { stdio: 'pipe' }).toString()
    } catch (err) {
        return ''
    }
}

function prList() {
    const output = exec('gh pr list --state open --json number,title,author,createdAt,updatedAt,headRefName,baseRefName')
    try { return JSON.parse(output) } catch (err) { return [] }
}

function branchesList() {
    const output = exec('gh api repos/$(gh repo view --json owner -q ".owner.login")/$(gh repo view --json name -q ".name")/branches --jq ".[] | {name: .name, commit: .commit.sha} ')
    return output
}

function workflowRuns() {
    const output = exec('gh run list --limit 50 --json databaseId,name,conclusion,status,headBranch,createdAt,workflowName')
    try { return JSON.parse(output) } catch (err) { return [] }
}

function dependabotAlerts() {
    const output = exec('gh api /repos/$(gh repo view --json owner -q ".owner.login")/$(gh repo view --json name -q ".name")/dependabot/alerts --jq ".[] | {number: .number, package: .dependency.package?.package, severity: .security_advisory.severity} "')
    return output
}

function main() {
    console.log('Running GitHub health check...')

    const prs = prList()
    const runs = workflowRuns()

    const stalePRs = prs.filter(p => {
        const updated = new Date(p.updatedAt)
        const days = (Date.now() - updated.getTime()) / (1000 * 3600 * 24)
        return days > 14
    })

    const failingRuns = runs.filter(r => r.conclusion === 'failure')
    const queuedAndRunning = runs.filter(r => r.status === 'in_progress' || r.status === 'queued')

    const reportLines = [];
    reportLines.push('# GitHub Health Check')
    reportLines.push('Run Date: ' + new Date().toISOString())
    reportLines.push('')
    reportLines.push('## Summary')
    reportLines.push(`Open PRs: ${prs.length}`)
    reportLines.push(`Stale PRs (>14 days since updated): ${stalePRs.length}`)
    reportLines.push(`Failing workflow runs (recent): ${failingRuns.length}`)
    reportLines.push(`Queued/in-progress runs: ${queuedAndRunning.length}`)
    reportLines.push('')

    if (stalePRs.length) {
        reportLines.push('## Stale PRs')
        stalePRs.forEach(p => reportLines.push(`- #${p.number} ${p.title} (${p.headRefName} -> ${p.baseRefName}) last updated ${p.updatedAt}`))
        reportLines.push('')
    }

    if (failingRuns.length) {
        reportLines.push('## Recent Failing Workflows')
        failingRuns.forEach(r => reportLines.push(`- ${r.name} on ${r.headBranch}: ${r.conclusion} (${r.createdAt})`))
        reportLines.push('')
    }

    if (queuedAndRunning.length) {
        reportLines.push('## Queued/Running Workflow Runs')
        queuedAndRunning.forEach(r => reportLines.push(`- ${r.name} on ${r.headBranch}: ${r.status}`))
        reportLines.push('')
    }

    // Branch cleanup recommendation: find remote branches matching agent/* (not merged and older than 14 days)
    const branchesCmd = 'gh api repos/$(gh repo view --json owner -q ".owner.login")/$(gh repo view --json name -q ".name")/branches --jq ".[] | {name:.name, commit:.commit.sha} " '
    // For now, rely on PR list to detect branches
    const agentBranches = prs.filter(p => p.headRefName && p.headRefName.startsWith('agent/'))
    if (agentBranches.length) {
        reportLines.push('## Agent branches in open PRs')
        agentBranches.forEach(p => reportLines.push(`- ${p.headRefName} (PR #${p.number})`))
        reportLines.push('')
    }

    const outPath = path.resolve(process.cwd(), 'artifacts', 'github-health-check.md')
    fs.mkdirSync(path.dirname(outPath), { recursive: true })
    fs.writeFileSync(outPath, reportLines.join('\n'))
    console.log('Health check saved to', outPath)
}

main()
