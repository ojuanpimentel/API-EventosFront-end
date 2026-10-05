const API_BASE_URL = "http://localhost:3000/api";

async function apiRequest(path, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
            ...(options.body ? { "Content-Type": "application/json" } : {}),
            ...options.headers
        }
    });

    if (!response.ok) {
        const responseText = await response.text();
        let message = responseText;

        try {
            const body = JSON.parse(responseText);
            message = body.error || body.message || responseText;
        } catch {
            message = responseText;
        }

        throw new Error(message || `A API respondeu com status ${response.status}.`);
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}

window.eventosApi = { request: apiRequest };
