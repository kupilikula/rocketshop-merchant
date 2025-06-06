
export const formatPhone = (phone) => {
    // Return as is if not a string (e.g., null, undefined)
    if (typeof phone !== 'string') {
        return phone;
    }

    const trimmedNumber = phone.trim();

    // If it's an empty string after trimming, return it as an empty string
    if (trimmedNumber.length === 0) {
        return "";
    }

    // If it's not empty and doesn't start with '+', prepend '+'
    if (!trimmedNumber.startsWith('+')) {
        return `+91${trimmedNumber}`;
    }

    // If it already starts with '+', or is just '+', return the trimmed version
    return trimmedNumber;
};

export function isValidE164Phone(phone) {
    if (!phone) return false;
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
}


export function isValidEmail(email) {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}