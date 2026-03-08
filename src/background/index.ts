import { getStorageData, setStorageData, TimerData } from '../utils/storage';

let sessionStartTime: number | null = null;
let currentTrackingData: TimerData | null = null;
let trackingTabId: number | null = null;

const isXDomain = (url?: string) => {
    if (!url) return false;
    try {
        const { hostname } = new URL(url);
        return hostname === 'x.com' || hostname === 'twitter.com' || hostname.endsWith('.x.com') || hostname.endsWith('.twitter.com');
    } catch (e) {
        return false;
    }
};

const checkDayReset = async (data: TimerData): Promise<TimerData> => {
    const currentDate = new Date().toLocaleDateString('ja-JP');
    if (data.todayDate !== currentDate) {
        const history = { ...data.history, [data.todayDate]: data.totalSeconds };
        const keys = Object.keys(history).sort();
        if (keys.length > 7) {
            delete history[keys[0]];
        }
        const newData: TimerData = {
            ...data,
            todayDate: currentDate,
            totalSeconds: 0,
            history,
            lastThresholdNotified: 0,
        };
        await setStorageData(newData);
        return newData;
    }
    return data;
};

const checkThreshold = (data: TimerData) => {
    if (data.threshold > 0 && data.totalSeconds >= data.threshold && data.lastThresholdNotified < data.threshold) {
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icon.png', // need to provide a default icon
            title: 'X Timer',
            message: `X利用が${Math.floor(data.threshold / 60)}時間を超えました。休憩しませんか？`
        });
        data.lastThresholdNotified = data.threshold;
        setStorageData({ lastThresholdNotified: data.lastThresholdNotified });
    }
};

const startSession = async () => {
    if (sessionStartTime) return;
    const data = await getStorageData();
    currentTrackingData = await checkDayReset(data);
    sessionStartTime = Date.now();
};

const endSession = async () => {
    if (!sessionStartTime || !currentTrackingData) return;
    const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
    currentTrackingData.totalSeconds += elapsed;
    checkThreshold(currentTrackingData);
    await setStorageData({ totalSeconds: currentTrackingData.totalSeconds });
    sessionStartTime = null;
    currentTrackingData = null;
};

const updateTrackingState = () => {
    chrome.windows.getCurrent((window) => {
        if (!window.focused) {
            endSession();
            return;
        }
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length === 0) {
                endSession();
                return;
            }
            const tab = tabs[0];
            if (isXDomain(tab.url)) {
                trackingTabId = tab.id!;
                startSession();
            } else {
                trackingTabId = null;
                endSession();
            }
        });
    });
};

chrome.tabs.onActivated.addListener(updateTrackingState);
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') updateTrackingState();
});
chrome.windows.onFocusChanged.addListener(updateTrackingState);
chrome.idle.onStateChanged.addListener((state) => {
    if (state === 'active') {
        updateTrackingState();
    } else {
        endSession();
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'GET_TIME') {
        getStorageData().then(data => {
            let seconds = data.totalSeconds;
            if (sessionStartTime) {
                seconds += Math.floor((Date.now() - sessionStartTime) / 1000);
            }
            sendResponse({ totalSeconds: seconds });
        });
        return true;
    }
    if (message.type === 'RESET_TIME') {
        sessionStartTime = Date.now();
        if (currentTrackingData) {
            currentTrackingData.totalSeconds = 0;
            currentTrackingData.lastThresholdNotified = 0;
        }
        sendResponse({ success: true });
        return true;
    }
});

updateTrackingState();
