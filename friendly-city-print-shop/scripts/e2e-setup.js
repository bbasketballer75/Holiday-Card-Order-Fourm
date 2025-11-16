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
    console.log(
      'Supabase environment variables are missing (NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY). Skipping seed.',
    );
    return;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const now = new Date().toISOString();
  const runId = process.env.GITHUB_RUN_ID || `${Date.now()}`;
  const marker = `__E2E__ ${runId}`;

  console.log('Seeding forum_messages table with test data...');
  const messages = [];
  for (let i = 0; i < 3; i++) {
    const text = `${marker} seed ${i} - ${now}`;
    messages.push({ user: 'CI E2E', text });
  }

  const { data, error } = await supabase.from('forum_messages').insert(messages).select('id');
  if (error) {
    console.error('Seed error:', error.message || error);
    process.exit(1);
  }

  const ids = (data || []).map((r) => r.id);
  const out = { marker, ids };
  const tmpDir = path.resolve(__dirname, '../tmp');
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
  fs.writeFileSync(path.join(tmpDir, 'e2e-seed.json'), JSON.stringify(out, null, 2));
  console.log('Seed complete. Inserted IDs:', ids.join(', '));
}

main().catch((err) => {
  console.error('E2E setup failed:', err);
  process.exit(1);
});
