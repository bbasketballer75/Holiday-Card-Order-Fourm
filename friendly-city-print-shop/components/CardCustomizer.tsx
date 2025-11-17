import React, { useState } from 'react';
import Image from 'next/image';

export default function CardCustomizer({
    template,
    initialText = '',
    initialImage = '',
    onSave,
    onCancel,
}: {
    template: { title: string; description: string; imageUrl?: string | null };
    initialText?: string;
    initialImage?: string;
    onSave: (_custom: { text: string; image: string }) => void;
    onCancel: () => void;
}) {
    const [text, setText] = useState(initialText);
    // Removed unused image state
    const [preview, setPreview] = useState(initialImage);

    function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = ev => setPreview(ev.target?.result as string);
            reader.readAsDataURL(file);
        }
    }

    return (
        <div className="card-holiday p-8 animate-in fade-in space-y-6">
            <h2 className="text-2xl font-bold text-holiday-green mb-4">Customize Your Card</h2>
            <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1 flex flex-col items-center">
                    <div className="relative w-64 h-40 bg-holiday-cream rounded-lg shadow-md mb-4 flex items-center justify-center">
                        {preview ? (
                            <Image src={preview} alt="Custom" fill className="object-cover rounded-lg" />
                        ) : template.imageUrl ? (
                            <Image src={template.imageUrl} alt={template.title} fill className="object-cover rounded-lg" />
                        ) : (
                            <span className="text-6xl opacity-30">🎁</span>
                        )}
                        <div className="absolute bottom-2 left-2 right-2 text-center">
                            <input
                                type="text"
                                value={text}
                                onChange={e => setText(e.target.value)}
                                className="input-holiday w-full text-center text-lg font-bold"
                                placeholder="Edit your greeting..."
                            />
                        </div>
                    </div>
                    <label className="block font-bold text-holiday-green mb-2">Upload/Replace Image</label>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="input-holiday" />
                </div>
                <div className="flex-1 flex flex-col gap-4">
                    <label className="block font-bold text-holiday-green mb-2">Message Text</label>
                    <textarea
                        className="textarea-holiday"
                        value={text}
                        onChange={e => setText(e.target.value)}
                        rows={4}
                        placeholder="Write a special holiday message..."
                    />
                    <div className="flex gap-4 mt-4">
                        <button type="button" className="btn-holiday-secondary flex-1" onClick={onCancel}>
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="btn-holiday flex-1"
                            onClick={() => onSave({ text, image: preview || initialImage })}
                        >
                            Save Design
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
