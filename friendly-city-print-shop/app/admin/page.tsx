'use client';

import TemplateUploader from '../../components/TemplateUploader';
import { supabase } from '../../lib/supabaseClient';
import { useState } from 'react';

export default function AdminPage() {
  const [message, setMessage] = useState('');

  const clearSession = async () => {
    if (!supabase) {
      setMessage('Supabase not initialized.');
      return;
    }
    const { error } = await supabase.auth.signOut();
    if (error) {
      setMessage('Error clearing session: ' + error.message);
    } else {
      setMessage('Authentication session cleared successfully.');
    }
  };

  return (
    <section className="py-8">
      <h1 className="text-2xl font-bold mb-4">Admin</h1>
      <p className="text-sm text-muted-foreground/70 mb-6">Manage orders and templates below.</p>

      <div className="grid grid-cols-1 gap-6">
        <div className="card p-6">
          <h2 className="text-xl font-bold mb-4">Developer Tools</h2>
          <button onClick={clearSession} className="btn btn-secondary">
            Clear Authentication Session
          </button>
          {message && <p className="mt-4 text-sm">{message}</p>}
        </div>
        <TemplateUploader />
      </div>
    </section>
  );
}
