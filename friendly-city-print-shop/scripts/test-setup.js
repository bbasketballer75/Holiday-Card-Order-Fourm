#!/usr/bin/env node
/* eslint-disable */
/* eslint-env node */

// Test script to verify production readiness
const { createClient } = require('@supabase/supabase-js');

async function testSetup() {
  console.log('🧪 Testing Friendly City Print Shop Setup...\n');

  // Check environment variables
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'STRIPE_PUBLISHABLE_KEY',
    'STRIPE_SECRET_KEY',
  ];

  console.log('📋 Checking environment variables...');
  const missing = requiredEnvVars.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.log('❌ Missing environment variables:', missing.join(', '));
    console.log('   Please set them in .env.local\n');
  } else {
    console.log('✅ All required environment variables are set\n');
  }

  // Test Supabase connection
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.log('🔗 Testing Supabase connection...');
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      );

      // Test templates table
      const { data: templates, error: templatesError } = await supabase
        .from('templates')
        .select('*')
        .limit(1);

      if (templatesError) {
        console.log('❌ Templates table error:', templatesError.message);
      } else {
        console.log(`✅ Templates table accessible (${templates?.length || 0} records found)`);
      }

      // Test forum_messages table
      const { data: messages, error: messagesError } = await supabase
        .from('forum_messages')
        .select('*')
        .limit(1);

      if (messagesError) {
        console.log('❌ Forum messages table error:', messagesError.message);
      } else {
        console.log(`✅ Forum messages table accessible (${messages?.length || 0} records found)`);
      }

      console.log('');
    } catch (error) {
      console.log('❌ Supabase connection failed:', error.message);
      console.log('');
    }
  } else {
    console.log('⏭️  Skipping Supabase tests (missing credentials)\n');
  }

  // Test Stripe (basic key format check)
  if (process.env.STRIPE_PUBLISHABLE_KEY && process.env.STRIPE_SECRET_KEY) {
    console.log('💳 Checking Stripe configuration...');
    const pubKey = process.env.STRIPE_PUBLISHABLE_KEY;
    const secKey = process.env.STRIPE_SECRET_KEY;

    if (pubKey.startsWith('pk_test_') || pubKey.startsWith('pk_live_')) {
      console.log('✅ Stripe publishable key format is valid');
    } else {
      console.log('❌ Invalid Stripe publishable key format');
    }

    if (secKey.startsWith('sk_test_') || secKey.startsWith('sk_live_')) {
      console.log('✅ Stripe secret key format is valid');
    } else {
      console.log('❌ Invalid Stripe secret key format');
    }

    const isLive = pubKey.startsWith('pk_live_') || secKey.startsWith('sk_live_');
    console.log(isLive ? '🔴 LIVE MODE - Be careful!' : '🧪 TEST MODE - Safe for development');
    console.log('');
  } else {
    console.log('⏭️  Skipping Stripe tests (missing keys)\n');
  }

  console.log('🎉 Setup test complete!');
  console.log('Run `npm run build` to verify the application builds successfully.');
}

testSetup().catch(console.error);
