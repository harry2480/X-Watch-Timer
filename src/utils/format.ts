export const formatTime = (totalSeconds: number): string => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    const pad = (num: number) => num.toString().padStart(2, '0');

    if (h > 0) {
        return `${h}h ${pad(m)}m ${pad(s)}s`;
    }
    return `${pad(m)}m ${pad(s)}s`;
};
