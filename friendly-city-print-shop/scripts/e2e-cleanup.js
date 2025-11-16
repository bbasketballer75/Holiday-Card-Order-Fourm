#!/usr/bin/env node
/* eslint-disable */
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function main() {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.log('Supabase environment variables are missing. Skipping cleanup.');
    return;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const tmpDir = path.resolve(__dirname, '../tmp');
  const seedFile = path.join(tmpDir, 'e2e-seed.json');
  if (!fs.existsSync(seedFile)) {
    console.log('No seed file found; attempting to remove any __E2E__ markers older than 3 days');
    const { error } = await supabase
      .from('forum_messages')
      .delete()
      .ilike('text', '%__E2E__%')
      .lte('created_at', new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString());
    if (error) console.warn('Cleanup warning:', error.message || error);
    else console.log('Cleanup: removed old E2E rows');
    return;
  }

  const payload = JSON.parse(fs.readFileSync(seedFile, 'utf-8'));
  const ids = payload.ids || [];
  if (ids.length === 0) {
    console.log('No seeded IDs found; aborting cleanup');
    return;
  }

  const { error } = await supabase.from('forum_messages').delete().in('id', ids);
  if (error) {
    console.error('Cleanup error:', error.message || error);
    process.exit(1);
  }

  fs.unlinkSync(seedFile);
  console.log('Cleanup complete. Removed IDs:', ids.join(', '));
}

main().catch((err) => {
  console.error('E2E cleanup error:', err);
  process.exit(1);
});
