import React from 'react';
import { createRoot } from 'react-dom/client';
import { Overlay } from './Overlay';
import '../styles/tailwind.css';

const container = document.createElement('div');
container.id = 'x-watch-timer-root';
document.body.appendChild(container);

const root = createRoot(container);
root.render(<Overlay />);
