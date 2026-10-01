export function setToken(token: string) {
    if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
    }
}

export function getToken() {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('token');
    }
    return null;
}

export function removeToken() {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user_email');
        localStorage.removeItem('user_name');
        localStorage.removeItem('user_role');
    }
}

export function parseJwt(token: string) {
    try {
        let base64Url = token.split('.')[1];
        if (!base64Url) return null;
        let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4) {
            base64 += '=';
        }

        let jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
}

export function formatLoginName(emailOrName: string): string {
    if (!emailOrName) return '';
    const prefix = emailOrName.includes('@') ? emailOrName.split('@')[0] : emailOrName;
    const formatted = prefix
        .replace(/[._-]+/g, ' ')
        .trim()
        .split(/\s+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    return formatted || prefix;
}

export function getLoggedInUser(fallbackRole?: string): { name: string; email: string } {
    if (typeof window === 'undefined') {
        const def = fallbackRole ? fallbackRole.charAt(0).toUpperCase() + fallbackRole.slice(1) : 'Officer';
        return { name: def, email: '' };
    }

    const storedEmail = (localStorage.getItem('user_email') || '').trim();
    const normalizedEmail = storedEmail.toLowerCase();
    
    // 1. Check specifically remembered name for this account
    if (normalizedEmail) {
        const accountSpecificName = localStorage.getItem(`user_name_${normalizedEmail}`);
        if (accountSpecificName && accountSpecificName.trim()) {
            return { name: accountSpecificName.trim(), email: storedEmail };
        }
    }

    // 2. Check general user_name in localStorage
    const storedName = (localStorage.getItem('user_name') || '').trim();
    if (storedName && storedName.toLowerCase() !== 'officer' && storedName.toLowerCase() !== 'admin' && storedName.toLowerCase() !== 'manufacturer') {
        return { name: storedName, email: storedEmail };
    }

    // 3. Check JWT token payload
    const token = getToken();
    if (token) {
        const payload = parseJwt(token);
        if (payload?.name && payload.name.trim()) {
            return { name: payload.name.trim(), email: payload.email || storedEmail };
        }
        if (payload?.full_name && payload.full_name.trim()) {
            return { name: payload.full_name.trim(), email: payload.email || storedEmail };
        }
        if (payload?.email && !storedEmail) {
            return { name: formatLoginName(payload.email), email: payload.email };
        }
    }

    // 4. Format from email if available
    if (storedEmail) {
        const formatted = formatLoginName(storedEmail);
        return { name: formatted, email: storedEmail };
    }

    // 5. Fallback
    const fallback = fallbackRole ? fallbackRole.charAt(0).toUpperCase() + fallbackRole.slice(1) : 'Officer';
    return { name: fallback, email: '' };
}
