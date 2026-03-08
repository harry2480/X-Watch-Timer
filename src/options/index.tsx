import React from 'react';
import { createRoot } from 'react-dom/client';
import '../styles/tailwind.css';

const Options = () => (
    <div className="p-8 font-sans bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-bold mb-4 text-blue-600">X Watch Timer Settings</h1>
        <p className="text-gray-600 mb-8">設定はポップアップメニューから行えます。</p>
    </div>
);

const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(<Options />);
}
