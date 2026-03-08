export interface TimerData {
    todayDate: string;
    totalSeconds: number;
    history: Record<string, number>;
    threshold: number; // in seconds
    lastThresholdNotified: number;
}

export const DEFAULT_DATA: TimerData = {
    todayDate: new Date().toLocaleDateString('ja-JP'),
    totalSeconds: 0,
    history: {},
    threshold: 30 * 60, // 30 minutes default
    lastThresholdNotified: 0,
};

export const getStorageData = async (): Promise<TimerData> => {
    return new Promise((resolve) => {
        chrome.storage.local.get(DEFAULT_DATA as any, (items) => {
            resolve(items as unknown as TimerData);
        });
    });
};

export const setStorageData = async (data: Partial<TimerData>): Promise<void> => {
    return new Promise((resolve) => {
        chrome.storage.local.set(data, () => {
            resolve();
        });
    });
};
