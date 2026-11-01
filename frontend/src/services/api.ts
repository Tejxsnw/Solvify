import {
  FinancialInput,
  PredictionResult,
  AnalysisRecord,
  ScenarioResponse,
  User,
  FinancialRatios
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

class ApiService {
  private token: string | null = localStorage.getItem('solvify_token');

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('solvify_token', token);
    } else {
      localStorage.removeItem('solvify_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMsg = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errJson = await response.json();
        if (errJson.detail) {
          errorMsg = typeof errJson.detail === 'string' ? errJson.detail : JSON.stringify(errJson.detail);
        }
      } catch (e) {
        // use default errorMsg
      }
      throw new Error(errorMsg);
    }

    return response.json();
  }

  // Auth
  async register(name: string, email: string, password: string):Promise<{ access_token: string; user: User }> {
    const res = await this.request<{ access_token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    this.setToken(res.access_token);
    return res;
  }

  async login(email: string, password: string): Promise<{ access_token: string; user: User }> {
    const res = await this.request<{ access_token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(res.access_token);
    return res;
  }

  async getMe(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  async googleAuth(credential: string): Promise<{ access_token: string; user: User }> {
    const res = await this.request<{ access_token: string; user: User }>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential }),
    });
    this.setToken(res.access_token);
    return res;
  }

  async demoLogin(): Promise<{ access_token: string; user: User }> {
    const res = await this.request<{ access_token: string; user: User }>('/auth/demo', {
      method: 'POST',
    });
    this.setToken(res.access_token);
    return res;
  }

  logout() {
    this.setToken(null);
  }

  // Prediction & Analyses
  async predict(data: FinancialInput): Promise<PredictionResult> {
    return this.request<PredictionResult>('/predictions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createAnalysis(data: FinancialInput, saveToHistory: boolean = true): Promise<AnalysisRecord> {
    return this.request<AnalysisRecord>('/analyses', {
      method: 'POST',
      body: JSON.stringify({ financial_data: data, save_to_history: saveToHistory }),
    });
  }

  async getAnalyses(): Promise<AnalysisRecord[]> {
    return this.request<AnalysisRecord[]>('/analyses');
  }

  async getAnalysisById(id: string): Promise<AnalysisRecord> {
    return this.request<AnalysisRecord>(`/analyses/${id}`);
  }

  async deleteAnalysis(id: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/analyses/${id}`, {
      method: 'DELETE',
    });
  }

  async compareAnalyses(analysisIds: string[]): Promise<any> {
    return this.request('/analyses/compare', {
      method: 'POST',
      body: JSON.stringify(analysisIds),
    });
  }

  // Scenarios
  async simulateScenario(analysisId: string, changes: Record<string, number>, name?: string, saveScenario: boolean = false): Promise<ScenarioResponse> {
    return this.request<ScenarioResponse>(`/analyses/${analysisId}/scenarios`, {
      method: 'POST',
      body: JSON.stringify({
        name: name || 'Simulation Scenario',
        changes,
        save_scenario: saveScenario,
      }),
    });
  }

  // Uploads
  async uploadCSV(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    const headers: Record<string, string> = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE}/uploads/financial-data`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || 'CSV Upload failed');
    }
    return response.json();
  }

  // Reports
  async generateReport(analysisId: string): Promise<{ report_id: string; download_url: string; file_size_kb: number }> {
    return this.request(`/analyses/${analysisId}/report`, {
      method: 'POST',
    });
  }

  getDownloadReportUrl(reportId: string): string {
    return `${API_BASE}/reports/${reportId}/download`;
  }

  // AI Assistant
  async chatAssistant(message: string, contextSnapshot?: any, conversationId?: string): Promise<any> {
    return this.request('/assistant/chat', {
      method: 'POST',
      body: JSON.stringify({
        message,
        context_snapshot: contextSnapshot,
        conversation_id: conversationId,
      }),
    });
  }
}

export const api = new ApiService();
