import axiosInstance from '@/lib/axios';

export interface IntegrationRecord {
  id: string;
  user_id: string;
  name: string;
  client_id: string;
  client_secret: string;
  redirect_uri: string;
  status: 'connected' | 'disconnected';
  ml_user_id?: string | null;
  nickname?: string | null;
  expires_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateIntegrationPayload {
  user_id: string;
  name: string;
  client_id: string;
  client_secret: string;
  redirect_uri: string;
}

export interface UpdateIntegrationPayload {
  name?: string;
  client_id?: string;
  client_secret?: string;
  redirect_uri?: string;
  status?: IntegrationRecord['status'];
}

export const integrationService = {
  list(userId: string) {
    return axiosInstance.get<{ integrations: IntegrationRecord[] }>('/integrations/ml', {
      params: { user_id: userId },
    });
  },

  create(payload: CreateIntegrationPayload) {
    return axiosInstance.post<{ integration: IntegrationRecord }>('/integrations/ml', payload);
  },

  update(id: string, payload: UpdateIntegrationPayload) {
    return axiosInstance.put<{ integration: IntegrationRecord }>(`/integrations/ml/${id}`, payload);
  },

  remove(id: string) {
    return axiosInstance.delete<{ deleted: boolean }>(`/integrations/ml/${id}`);
  },

  getAuthUrl(id: string, userId: string) {
    return axiosInstance.get<{ auth_url: string }>(`/integrations/ml/${id}/auth-url`, {
      params: { user_id: userId },
    });
  },

  disconnect(id: string, userId: string) {
    // Envia user_id tanto no body quanto como query param para compatibilidade
    return axiosInstance.post<{ integration: IntegrationRecord }>(
      `/integrations/ml/${id}/disconnect`,
      { user_id: userId },
      { params: { user_id: userId } }
    );
  },
};

export default integrationService;
