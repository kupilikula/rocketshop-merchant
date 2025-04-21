// Function to format date as DD/MM/YYYY
const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
};

// Function to format time as HH:MM AM/PM
const formatTime = (date) => {
    return date.toLocaleString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
};

const formatDateTime = (date) => {
    const dateStr = formatDate(date);
    const timeStr = formatTime(date);
    return `${dateStr} ${timeStr}`;
};

const isSameDay = (d1, d2) => d1.toDateString() === d2.toDateString();

const isToday = (d) => {
    const today = new Date();
    return isSameDay(d, today);
};
const isThisWeek = (start, end) => {
    const now = new Date();

    const startOfWeek = new Date(now);
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday as start
    startOfWeek.setDate(diff);

    const endOfWeek = now;

    return isSameDay(start, startOfWeek) && isSameDay(end, endOfWeek);
};

const isThisMonth = (start, end) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = now;

    return isSameDay(start, startOfMonth) && isSameDay(end, endOfMonth);
};

const isThisYear = (start, end) => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const endOfYear = now;

    return isSameDay(start, startOfYear) && isSameDay(end, endOfYear);
};

const getStartOfWeek = (d) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday (0)
    return new Date(date.setDate(diff));
};

const normalizeDateRange = (start, end) => {
    const normalizedStart = new Date(start);
    normalizedStart.setHours(0, 0, 0, 0);

    const normalizedEnd = new Date(end);
    normalizedEnd.setHours(23, 59, 59, 999);

    return {start: normalizedStart, end: normalizedEnd};
};


export { formatDate, formatTime, formatDateTime, isSameDay, isToday, isThisWeek, isThisMonth, isThisYear, getStartOfWeek, normalizeDateRange };

// Example usage:
// const date = new Date();
// console.log(formatDate(date)); // Output: DD/MM/YYYY (e.g., "25/03/2024")
// console.log(formatTime(date)); // Output: HH:MM AM/PM (e.g., "07:00 PM")