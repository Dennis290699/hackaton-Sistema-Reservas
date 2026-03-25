import { api } from './api';

export interface SystemSetting {
    key: string;
    value: any;
    description: string;
}

export const SettingsService = {
    getSettings: async (): Promise<SystemSetting[]> => {
        return api.get<SystemSetting[]>('/settings');
    },

    updateSetting: async (key: string, value: any): Promise<SystemSetting> => {
        return api.put<SystemSetting>(`/settings/${key}`, { value });
    },

    purgeHistory: async (targetStatuses: string[]): Promise<{ message: string, deleted_rows: number }> => {
        return api.post<{ message: string, deleted_rows: number }>('/settings/purge-history', { targetStatuses });
    }
};
