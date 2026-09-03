// MetronIQ Frontend API Client

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

/**
 * Enhanced fetch wrapper replacing hard-coded window.localStorage 
 * with a structured token injection and secure fallback mechanism.
 */
export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  
  // Safe JWT token extraction mapping securely across Client/Server Boundaries.
  let token = null;

  if (typeof window !== 'undefined') {
      // Client-side extraction
      token = sessionStorage.getItem('metroniq_token');
  } else {
      // Server-side (React Server Components) cookie evaluation placeholder
      // For full Stage 7 Auth, `next/headers` cookies().get('token') will mount here.
      token = process.env.INTERNAL_DEV_TOKEN || null; 
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    if (response.status === 401) {
       console.warn("Unauthorized access - Please re-authenticate");
    }
    if (!response.ok) {
        console.warn(`API Error: ${response.status} on ${endpoint}`);
        return null;
    }
    return await response.json();
  } catch (error) {
    console.warn(`Network Error on ${endpoint}. Verify Backend is running.`);
    return null; 
  }
}

export const DashboardService = {
  getSummary: () => fetchAPI('/dashboard/summary'),
};

export const RuleService = {
  getRules: () => fetchAPI('/rules/'),
  simulateRule: (payload: Record<string, unknown>) => fetchAPI('/rules/simulate', { method: 'POST', body: JSON.stringify(payload) }),
};

export const InspectionService = {
  getInspections: () => fetchAPI('/inspections/'),
};

export const AuthService = {
  login: async (credentials: Record<string, string>) => {
     console.log("Authenticating against Backend...", credentials);
     return fetchAPI('/auth/login', { method: 'POST', body: JSON.stringify(credentials) });
  },
  logout: () => {
    if (typeof window !== 'undefined') {
       sessionStorage.removeItem('metroniq_token');
       window.location.reload();
    }
  }
}