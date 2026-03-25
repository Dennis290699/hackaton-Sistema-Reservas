export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

class ApiClient {
    private getHeaders(): HeadersInit {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('admin_token');
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        return headers;
    }

    private async handleResponse<T>(response: Response): Promise<T> {
        if (!response.ok) {
            if (response.status === 401) {
                // Handle unauthorized (e.g., redirect to login or clear token)
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('admin_token');
                    window.location.href = '/login';
                }
            }
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `API Error: ${response.statusText}`);
        }

        // Some endpoints might return 204 No Content
        if (response.status === 204) {
            return {} as T;
        }

        return response.json();
    }

    public async get<T>(url: string): Promise<T> {
        const response = await fetch(`${API_BASE_URL}${url}`, {
            method: 'GET',
            headers: this.getHeaders(),
        });
        return this.handleResponse<T>(response);
    }

    public async post<T>(url: string, body: unknown): Promise<T> {
        const response = await fetch(`${API_BASE_URL}${url}`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(body),
        });
        return this.handleResponse<T>(response);
    }

    public async patch<T>(url: string, body: unknown): Promise<T> {
        const response = await fetch(`${API_BASE_URL}${url}`, {
            method: 'PATCH',
            headers: this.getHeaders(),
            body: JSON.stringify(body),
        });
        return this.handleResponse<T>(response);
    }

    public async put<T>(url: string, body: unknown): Promise<T> {
        const response = await fetch(`${API_BASE_URL}${url}`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(body),
        });
        return this.handleResponse<T>(response);
    }

    public async delete<T>(url: string): Promise<T> {
        const response = await fetch(`${API_BASE_URL}${url}`, {
            method: 'DELETE',
            headers: this.getHeaders(),
        });
        return this.handleResponse<T>(response);
    }
}

export const api = new ApiClient();
