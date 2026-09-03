import os

api_path = r"C:\Users\balag\.gemini\antigravity\scratch\MetronIQ\apps\web\src\lib\api.ts"

api_content = """
// MetronIQ Frontend API Client

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

/**
 * Enhanced fetch wrapper replacing hard-coded window.localStorage 
 * with a structured token injection and secure fallback mechanism.
 */
export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  
  // Safe JWT token extraction mapping to Next.js Client Boundaries
  // For production SSR, this should map to next/headers cookies() instead.
  if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('metroniq_token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    if (response.status === 401) {
       console.warn("Unauthorized access - Please re-authenticate");
       // Logic to trigger layout modal or redirect to /login goes here
    }
    if (!response.ok) {
        console.warn(`API Error: ${response.status} on ${endpoint}`);
        return null;
    }
    return await response.json();
  } catch (error) {
    console.warn(`Network Server Offline on ${endpoint}. Falling back to cached shell.`);
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
     // Stub for future backend mapped login
     console.log("Authenticating against Stage 5 Backend...", credentials);
     return fetchAPI('/auth/login', { method: 'POST', body: JSON.stringify(credentials) });
  },
  logout: () => {
    if (typeof window !== 'undefined') {
       sessionStorage.removeItem('metroniq_token');
       window.location.reload();
    }
  }
}
"""

with open(api_path, "w") as f:
    f.write(api_content.strip())
print("Fixed api.ts JWT auth structure")
