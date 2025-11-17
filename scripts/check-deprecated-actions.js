#!/usr/bin/env node
/*
 * Scans .github/workflows for referenced actions and checks third-party action
 * repositories for use of `actions/upload-artifact@v3` in their action definitions.
 * - Usage: node scripts/check-deprecated-actions.js
 */
const fs = require('fs')
const path = require('path')
const cp = require('child_process')

function listWorkflowActionUses() {
    const files = fs.readdirSync(path.resolve('.github', 'workflows'))
    const uses = []
    files.forEach((f) => {
        const p = path.join('.github', 'workflows', f)
        if (!fs.existsSync(p)) return
        const content = fs.readFileSync(p, 'utf8')
        const re = /uses:\s*([\w-]+)\/([\w-]+)@([\w.-]+)/g
        let m
        while ((m = re.exec(content))) {
            uses.push({ owner: m[1], repo: m[2], ref: m[3], file: f })
        }
    })
    return uses
}

function fetchActionFile(owner, repo, ref) {
    const urls = ['action.yml', 'action.yaml', '.github/action.yml', '.github/action.yaml']
    for (const u of urls) {
        const raw = `https://raw.githubusercontent.com/${owner}/${repo}/${ref}/${u}`
        try {
            const res = cp.execSync(`curl -fsSL ${raw}`, { stdio: 'pipe' }).toString()
            if (res) return res
        } catch (err) {
            // ignore 404s
        }
    }
    return null
}

function main() {
    const uses = listWorkflowActionUses()
    const uniqueUses = {}
    uses.forEach((u) => {
        const key = `${u.owner}/${u.repo}@${u.ref}`
        uniqueUses[key] = { owner: u.owner, repo: u.repo, ref: u.ref }
    })
    const results = []
    for (const key of Object.keys(uniqueUses)) {
        const { owner, repo, ref } = uniqueUses[key]
        console.log('Checking', key)
        const content = fetchActionFile(owner, repo, ref)
        if (!content) {
            results.push({ key, found: false, reason: 'action.yml not found or inaccessible' })
            continue
        }
        if (content.includes('actions/upload-artifact@v3') || content.includes('upload-artifact@v3')) {
            results.push({ key, found: true })
        } else {
            results.push({ key, found: false })
        }
    }
    const flagged = results.filter((r) => r.found)
    console.log('\nCheck complete:')
    console.log(`Total actions scanned: ${results.length}`)
    if (flagged.length) {
        console.log('Deprecated actions found (usage of actions/upload-artifact@v3):')
        flagged.forEach((f) => console.log(' -', f.key))
        process.exit(2)
    }
    console.log('No deprecated actions detected in referenced action definitions.')
}

main()
