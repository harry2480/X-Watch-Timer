import React, { useEffect, useState } from 'react';
import { getStorageData, setStorageData, TimerData } from '../utils/storage';
import { formatTime } from '../utils/format';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

export const Popup: React.FC = () => {
    const [data, setData] = useState<TimerData | null>(null);
    const [realTimeSeconds, setRealTimeSeconds] = useState(0);
    const [threshold, setThreshold] = useState(30 * 60);

    useEffect(() => {
        // initial fetch
        getStorageData().then(d => {
            setData(d);
            setThreshold(d.threshold);
        });

        const interval = setInterval(() => {
            chrome.runtime.sendMessage({ type: 'GET_TIME' }, (response) => {
                if (!chrome.runtime.lastError && response?.totalSeconds !== undefined) {
                    setRealTimeSeconds(response.totalSeconds);
                }
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    if (!data) return <div className="p-4 w-64 text-center">Loading...</div>;

    const handleReset = async () => {
        if (confirm('本日の記録をリセットしますか？')) {
            const newData = { ...data, totalSeconds: 0 };
            await setStorageData(newData);
            chrome.runtime.sendMessage({ type: 'RESET_TIME' });
            setRealTimeSeconds(0);
            setData(newData);
        }
    };

    const handleSaveSettings = async () => {
        await setStorageData({ threshold });
        setData({ ...data, threshold });
        alert('設定を保存しました。');
    };

    const handleExportCSV = () => {
        const csvContent = "data:text/csv;charset=utf-8,"
            + "Date,Seconds\n"
            + Object.entries(data.history).map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "x_timer_history.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const historyLabels = Object.keys(data.history).slice(-7);
    const historyData = historyLabels.map(k => data.history[k] / 60); // In minutes

    const chartData = {
        labels: historyLabels.length ? historyLabels : ['データなし'],
        datasets: [
            {
                label: '利用時間 (分)',
                data: historyLabels.length ? historyData : [0],
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                tension: 0.1,
            },
        ],
    };

    return (
        <div className="w-[400px] p-4 bg-gray-50 text-gray-800 font-sans">
            <header className="mb-4 text-center border-b pb-2">
                <h1 className="text-lg font-bold text-blue-600">X Watch Timer</h1>
            </header>

            <div className="mb-6 p-4 bg-white rounded-lg shadow-sm text-center">
                <div className="text-sm text-gray-500 mb-1">本日の利用時間</div>
                <div className="text-3xl font-mono font-bold text-gray-800 mb-4">
                    {formatTime(realTimeSeconds)}
                </div>
                <button
                    onClick={handleReset}
                    className="px-4 py-1 text-sm bg-red-50 text-red-600 border border-red-200 rounded hover:bg-red-100 transition-colors"
                >
                    リセット
                </button>
            </div>

            <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
                <h2 className="text-sm font-bold text-gray-700 mb-2 border-b pb-1">設定</h2>
                <div className="flex items-center justify-between mb-4 mt-3 text-sm">
                    <label className="text-gray-600">通知の閾値:</label>
                    <select
                        value={threshold}
                        onChange={(e) => setThreshold(Number(e.target.value))}
                        className="border p-1 rounded min-w-[120px]"
                    >
                        <option value={0}>通知しない</option>
                        <option value={15 * 60}>15分</option>
                        <option value={30 * 60}>30分</option>
                        <option value={60 * 60}>1時間</option>
                        <option value={120 * 60}>2時間</option>
                    </select>
                </div>
                <button
                    onClick={handleSaveSettings}
                    className="w-full py-2 bg-blue-500 text-white rounded font-bold hover:bg-blue-600 transition-colors shadow-sm mb-2"
                >
                    保存
                </button>
                <button
                    onClick={handleExportCSV}
                    className="w-full py-2 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors shadow-sm border border-gray-300"
                >
                    CSVエクスポート
                </button>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
                <h2 className="text-sm font-bold text-gray-700 mb-2 border-b pb-1">過去7日間の履歴</h2>
                <div className="h-[200px]">
                    <Line
                        data={chartData}
                        options={{
                            maintainAspectRatio: false,
                            plugins: { legend: { display: false } },
                            scales: { y: { beginAtZero: true } }
                        }}
                    />
                </div>
            </div>
        </div>
    );
};
