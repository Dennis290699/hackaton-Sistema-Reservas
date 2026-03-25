import api from './api';

export interface SystemSetting {
    key: string;
    value: any;
    description: string;
}

export const SettingsService = {
    getSettings: async (): Promise<SystemSetting[]> => {
        const response = await api.get<SystemSetting[]>('/settings');
        return response.data;
    }
};
