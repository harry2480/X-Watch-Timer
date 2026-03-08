import React, { useEffect, useState } from 'react';

export const Overlay: React.FC = () => {
    const [seconds, setSeconds] = useState(0);
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const fetchTime = () => {
            chrome.runtime.sendMessage({ type: 'GET_TIME' }, (response) => {
                if (chrome.runtime.lastError) {
                    // Extension context might be invalid or disconnected
                    return;
                }
                if (response && typeof response.totalSeconds === 'number') {
                    setSeconds(response.totalSeconds);
                }
            });
        };

        fetchTime();
        const intervalId = setInterval(fetchTime, 1000);

        return () => clearInterval(intervalId);
    }, []);

    if (!visible) {
        return (
            <div
                onClick={() => setVisible(true)}
                className="fixed top-4 right-4 z-[2147483647] bg-blue-500 text-white p-2 rounded-full cursor-pointer shadow-lg hover:bg-blue-600 transition-colors opacity-80"
            >
                <span className="text-sm">⏱</span>
            </div>
        );
    }

    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    return (
        <div
            className="fixed top-4 right-4 z-[2147483647] bg-white border border-gray-200 text-gray-800 px-4 py-2 rounded-lg shadow-xl font-sans text-sm font-medium flex items-center space-x-2 cursor-pointer hover:bg-gray-50 transition-colors opacity-95"
            onClick={() => setVisible(false)}
        >
            <span className="text-blue-500 font-bold tracking-tighter cursor-pointer select-none">X</span>
            <span className="select-none">
                本日のX時間: {h > 0 ? `${h}h ` : ''}{m}m {s}s
            </span>
        </div>
    );
};
