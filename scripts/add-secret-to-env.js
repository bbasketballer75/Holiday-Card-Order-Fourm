#!/usr/bin/env node
/*
 * Add secret(s) to a .env file (default: friendly-city-print-shop/.env.local)
 * Usage examples:
 * - node scripts/add-secret-to-env.js KEY=VALUE
 * - node scripts/add-secret-to-env.js KEY1=VALUE1 KEY2=VALUE2 --path friendly-city-print-shop/.env.local --gh
 * Options:
 * --path <file> : target env file (default friendly-city-print-shop/.env.local)
 * --force       : overwrite existing values
 * --gh          : also add secret as GitHub repo secret using `gh secret set` (requires gh CLI and auth)
 */

const fs = require('fs')
const path = require('path')
const cp = require('child_process')

function parseArgs(argv) {
    const params = { pairs: [], path: null, force: false, gh: false, repo: null }
    const args = argv.slice(2)
    for (let i = 0; i < args.length; i++) {
        const arg = args[i]
        if (arg === '--force') params.force = true
        else if (arg === '--gh') params.gh = true
        else if (arg === '--path' && args[i + 1]) { params.path = args[i + 1]; i++ }
        else if (arg.startsWith('--path=')) params.path = arg.split('=')[1]
        else if (arg.startsWith('--repo=')) params.repo = arg.split('=')[1]
        else if (arg.includes('=')) params.pairs.push(arg)
    }
    if (!params.path) {
        // If current directory is the project subfolder, write to current dir's .env.local
        const cwd = process.cwd()
        const potential = path.join(cwd, 'friendly-city-print-shop')
        if (fs.existsSync(potential)) {
            params.path = path.resolve(cwd, 'friendly-city-print-shop', '.env.local')
        } else {
            // if we're inside friendly-city-print-shop already, use that
            const pwdBase = path.basename(cwd)
            if (pwdBase === 'friendly-city-print-shop') params.path = path.resolve(cwd, '.env.local')
            else params.path = path.resolve(cwd, 'friendly-city-print-shop', '.env.local')
        }
    }
    // Also allow AGENT_CHAT_SECRETS env var in the form: KEY=VALUE;KEY2=VALUE2
    if (!params.pairs.length && process.env.AGENT_CHAT_SECRETS) {
        const entries = process.env.AGENT_CHAT_SECRETS.split(';').filter(Boolean)
        params.pairs.push(...entries)
    }
    return params
}

function redact(value) {
    if (!value) return '***'
    return '***' + value.slice(-4)
}

async function run() {
    const argv = parseArgs(process.argv)
    const envPath = argv.path
    const envDir = path.dirname(envPath)
    if (!fs.existsSync(envDir)) fs.mkdirSync(envDir, { recursive: true })
    let content = ''
    if (fs.existsSync(envPath)) {
        content = fs.readFileSync(envPath, 'utf-8')
    }
    const lines = content.split(/\r?\n/).filter(Boolean)
    const env = {}
    lines.forEach((l) => {
        const idx = l.indexOf('=')
        if (idx > -1) {
            const k = l.slice(0, idx)
            const v = l.slice(idx + 1)
            env[k] = v
        }
    })

    const updates = []
    for (const p of argv.pairs) {
        const [k, ...rest] = p.split('=')
        const v = rest.join('=')
        if (!k) continue
        // If key exists and not force, skip
        if (Object.prototype.hasOwnProperty.call(env, k) && !argv.force) {
            console.log(`Skipping ${k}: already present in ${envPath}`)
            continue
        }
        env[k] = v
        updates.push({ k, v })
    }

    if (updates.length === 0) {
        console.log('No updates applied.')
        return
    }
    // Rebuild file
    const out = Object.entries(env).map(([k, v]) => `${k}=${v}`).join('\n') + '\n'
    fs.writeFileSync(envPath, out, { mode: 0o600 })
    console.log(`Updated ${envPath} with ${updates.length} secrets (values redacted):`)
    updates.forEach((u) => console.log(`  - ${u.k}=${redact(u.v)}`))

    // Add to GitHub secrets if requested
    if (argv.gh) {
        // build repo name
        const repo = argv.repo || process.env.GITHUB_REPOSITORY
        if (!repo) {
            console.error('No repository specified for GitHub secret. Use --repo owner/repo or set GITHUB_REPOSITORY in env.')
            return
        }
        console.log('Setting GitHub repo secrets for:', repo)
        updates.forEach((u) => {
            try {
                // Use gh CLI: gh secret set <name> --body "<value>" --repo <repo>
                cp.execFileSync('gh', ['secret', 'set', u.k, '--body', u.v, '--repo', repo], { stdio: 'inherit' })
                console.log(`GitHub secret ${u.k} set for ${repo} (value not printed)`)
            } catch (err) {
                console.error('Failed to set GitHub secret', u.k, '-', err.message)
            }
        })
    }
}

run().catch((err) => {
    console.error('add-secret-to-env error:', err.message)
    process.exit(1)
})
