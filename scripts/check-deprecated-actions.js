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
    const files = fs.readdirSync(path.resolve('.github', 'workflows')).filter(((f) => f.endsWith('.yml') || f.endsWith('.yaml')))
    const uses = []
    files.forEach((f) => {
        const p = path.join('.github', 'workflows', f)
        if (!fs.existsSync(p)) return
        const content = fs.readFileSync(p, 'utf8')
        const re = /uses:\s*([\w-]+)\/([\w-]+)@([\w.-\/]+)/g
        let m
        while ((m = re.exec(content))) {
            uses.push({ owner: m[1], repo: m[2], ref: m[3], file: f })
        }
    })
    return uses
}

// Recursively scan action definitions to gather nested uses
async function fetchActionUsesRecursive(owner, repo, ref, visited = new Set()) {
    const key = `${owner}/${repo}@${ref}`
    if (visited.has(key)) return []
    visited.add(key)
    const actionContent = fetchActionFile(owner, repo, ref)
    if (!actionContent) return []
    const re = /uses:\s*([\w-]+)\/([\w-]+)@([\w.-\/]+)/g
    const found = []
    let m
    while ((m = re.exec(actionContent))) {
        const foundOwner = m[1]
        const foundRepo = m[2]
        const foundRef = m[3]
        found.push({ owner: foundOwner, repo: foundRepo, ref: foundRef })
        const nested = await fetchActionUsesRecursive(foundOwner, foundRepo, foundRef, visited)
        found.push(...nested)
    }
    return found
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

function fetchRepoTree(owner, repo, ref) {
    const gh = cp.execFileSync('gh', ['api', `repos/${owner}/${repo}/git/trees/${ref}?recursive=1`], { stdio: 'pipe' }).toString()
    try { return JSON.parse(gh) } catch (err) { return null }
}

function fetchRaw(owner, repo, ref, path_) {
    const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${ref}/${path_}`
    try { return cp.execFileSync('curl', ['-fsSL', rawUrl], { stdio: 'pipe' }).toString() } catch (err) { return null }
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
        // direct usage check
        if (content.includes('actions/upload-artifact@v3') || content.includes('upload-artifact@v3')) {
            results.push({ key, found: true, reason: 'direct' })
            continue
        }
        // recursive check: nested uses within the action
        const nested = []
        try {
            // Using a Promise wrapper to allow async recursion from a non-async block
            const nestedUses = await(async () => await fetchActionUsesRecursive(owner, repo, ref))()
            nested.push(...nestedUses)
        } catch (err) {
            // ignore
        }
        const nestedKeys = nested.map((n) => `${n.owner}/${n.repo}@${n.ref}`)
        // Remove duplicates
        const uniqueNestedKeys = Array.from(new Set(nestedKeys))
        let nestedFound = false
        for (const nk of uniqueNestedKeys) {
            const [no, nrref] = nk.split('/')
            const [nr, nref] = nrref.split('@')
            const nestedContent = fetchActionFile(no, nr, nref)
            if (!nestedContent) continue
            if (nestedContent.includes('actions/upload-artifact@v3') || nestedContent.includes('upload-artifact@v3')) {
                results.push({ key, found: true, reason: 'nested', nested: nk })
                nestedFound = true
                break
            }
        }
        if (!nestedFound) {
            // If the nested 'uses' didn't find the deprecated string, scan the repository tree for any yaml files containing upload-artifact@v3
            try {
                const tree = fetchRepoTree(owner, repo, ref)
                if (tree && tree.tree && Array.isArray(tree.tree)) {
                    const candidates = tree.tree.filter((t) => t.path && (t.path.endsWith('.yml') || t.path.endsWith('.yaml'))) || []
                    for (const c of candidates.slice(0, 200)) { // cap to 200 files
                        const raw = fetchRaw(owner, repo, ref, c.path)
                        if (!raw) continue
                        if (raw.includes('actions/upload-artifact@v3') || raw.includes('upload-artifact@v3')) {
                            results.push({ key, found: true, reason: 'repo-yaml', nested: `${owner}/${repo}@${ref}:${c.path}` })
                            nestedFound = true
                            break
                        }
                    }
                }
            } catch (err) {
                // ignore fetch failures
            }
        }
        if (!nestedFound) results.push({ key, found: false })
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
