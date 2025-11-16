import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { templateId, filename, data } = body;
    if (!templateId || !filename || !data) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    // Data URL parsing (data:<mime>;base64,<data>)
    const match = String(data).match(/^data:(.+);base64,(.+)$/);
    if (!match) {
      return NextResponse.json({ error: 'Invalid data URL' }, { status: 400 });
    }
    const mime = match[1];
    const b64 = match[2];
    const buffer = Buffer.from(b64, 'base64');

    const safeFilename = `${templateId}-${Date.now()}-${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const bucket = 'templates';
    const path = safeFilename;

    // Try upload, create bucket if needed
    let uploadRes = await supabase.storage.from(bucket).upload(path, buffer, { contentType: mime });
    if (uploadRes.error) {
      // Attempt to create bucket and retry
      try {
        await supabase.storage.createBucket(bucket, { public: true });
        uploadRes = await supabase.storage.from(bucket).upload(path, buffer, { contentType: mime });
      } catch (e) {
        return NextResponse.json(
          {
            error:
              'Storage upload failed: ' +
              String(uploadRes?.error?.message || uploadRes?.error || 'unknown'),
          },
          { status: 500 },
        );
      }
    }

    if (uploadRes.error) {
      return NextResponse.json(
        { error: 'Storage upload failed: ' + String(uploadRes.error?.message || uploadRes.error) },
        { status: 500 },
      );
    }

    const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(path);
    const publicUrl = publicData?.publicUrl || null;

    if (publicUrl) {
      await supabase.from('templates').update({ image_url: publicUrl }).eq('id', templateId);
    }

    return NextResponse.json({ url: publicUrl });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
