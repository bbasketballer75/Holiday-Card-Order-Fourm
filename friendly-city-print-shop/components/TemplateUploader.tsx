'use client';

import { useEffect, useState, ChangeEvent } from 'react';
import { Template } from '../types';
import { supabase } from '../lib/supabaseClient';

export default function TemplateUploader() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!supabase) return;
      const { data } = await supabase.from('templates').select('id, title, image_url');
      setTemplates(
        (data || []).map((item) => ({
          id: item.id,
          title: item.title,
          description: '',
          price: 1.99,
          image_url: item.image_url,
        })),
      );
      if (data && data.length > 0 && !selected) setSelected(data[0].id);
    };
    load();
  }, [selected]);

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
  };

  const upload = async () => {
    if (!file || !selected) return;
    setUploading(true);
    setMessage(null);

    // Convert to base64
    const dataUrl = await new Promise<string>((res, rej) => {
      const reader = new FileReader();
      reader.onload = () => res(reader.result as string);
      reader.onerror = rej;
      reader.readAsDataURL(file);
    });

    try {
      const resp = await fetch('/api/upload-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId: selected, filename: file.name, data: dataUrl }),
      });
      const json = await resp.json();
      if (resp.ok) {
        setMessage('Upload successful');
        // Refresh list
        if (!supabase) {
          setMessage('Upload succeeded but Supabase client not available to refresh list');
        } else {
          const { data } = await supabase.from('templates').select('id, title, image_url');
          setTemplates(
            (data || []).map((item) => ({
              id: item.id,
              title: item.title,
              description: '',
              price: 1.99,
              image_url: item.image_url,
            })),
          );
        }
      } else {
        setMessage(json?.error || 'Upload failed');
      }
    } catch (err) {
      setMessage('Upload failed');
    } finally {
      setUploading(false);
      setFile(null);
    }
  };

  return (
    <div className="card p-6">
      <h2 className="text-xl font-bold mb-4">Template Image Uploader</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Upload images for templates (saved to Supabase storage).
      </p>

      <div className="space-y-3">
        <label className="block font-bold">Choose template</label>
        <select
          value={selected ?? ''}
          onChange={(e) => setSelected(e.target.value)}
          className="input w-full"
        >
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title}
            </option>
          ))}
        </select>

        <div>
          <label className="block font-bold mt-4">Select image</label>
          <input type="file" accept="image/*" onChange={handleFile} />
        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={upload}
            disabled={!file || !selected || uploading}
            className="btn btn-primary"
          >
            {uploading ? 'Uploading...' : 'Upload Image'}
          </button>
          <button
            onClick={() => {
              setFile(null);
              setMessage(null);
            }}
            className="btn btn-secondary"
          >
            Clear
          </button>
        </div>

        {message && <p className="text-sm mt-3">{message}</p>}
      </div>
    </div>
  );
}
