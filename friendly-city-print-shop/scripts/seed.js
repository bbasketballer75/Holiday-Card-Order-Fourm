const { createClient } = require('@supabase/supabase-js');

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error(
    'NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required to run the seed script.',
  );
  console.error(
    'Create a Supabase project and set environment variables in .env.local. The SERVICE_ROLE_KEY is used for seeding.',
  );
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

async function main() {
  console.log('Seeding templates...');
  const templates = [
    {
      title: 'Snowy Pine',
      description: 'A cozy snowy theme with pine trees.',
      price: 1.49,
      image_url: '/templates/snowy-pine.svg',
    },
    {
      title: 'Modern Minimal',
      description: 'Sleek and modern -- great for business cards.',
      price: 1.79,
      image_url: '/templates/modern-minimal.svg',
    },
    {
      title: 'Classic Wreath',
      description: 'Traditional wreath design with gold foil accents.',
      price: 1.99,
      image_url: '/templates/classic-wreath.svg',
    },
  ];

  for (const t of templates) {
    const { data, error } = await supabase.from('templates').insert([t]).select().single();
    if (error) {
      console.error('Insert error', error.message);
    } else {
      console.log('Inserted:', data.id || data);
    }
  }

  console.log('Seeding forum messages...');
  const forumMessages = [
    {
      user: 'Admin',
      text: 'Welcome to the Friendly City forum! Ask any questions about templates and orders here.',
    },
    { user: 'Visitor', text: 'Hi there! I love the Snowy Pine option.' },
  ];

  for (const m of forumMessages) {
    const { data, error } = await supabase.from('forum_messages').insert([m]).select().single();
    if (error) {
      console.error('Forum insert error', error.message);
    } else {
      console.log('Inserted forum message:', data.id || data);
    }
  }

  console.log('Done');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
