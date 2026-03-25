import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Reservation } from '@/services/lab.service';

interface NotificationState {
    notifications: Reservation[];
    dismissedIds: number[];
    unreadCount: number;
    addNotifications: (newReservations: Reservation[]) => void;
    removeNotification: (id: number) => void;
    clearAllNotifications: () => void;
    clearUnread: () => void;
}

export const useNotificationStore = create<NotificationState>()(
    persist(
        (set) => ({
            notifications: [],
            dismissedIds: [],
            unreadCount: 0,
            addNotifications: (newReservations) => set((state) => {
                // Prevent duplicates by checking if it exists in state or if it was permanently dismissed
                const uniqueNew = newReservations.filter(
                    (newRes) => 
                        !state.notifications.some((existing) => existing.id === newRes.id) &&
                        !state.dismissedIds.includes(newRes.id)
                );

                if (uniqueNew.length === 0) return state;

                return {
                    notifications: [...uniqueNew, ...state.notifications],
                    unreadCount: state.unreadCount + uniqueNew.length,
                };
            }),
            removeNotification: (id) => set((state) => ({
                notifications: state.notifications.filter(n => n.id !== id),
                dismissedIds: [...new Set([...state.dismissedIds, id])]
            })),
            clearAllNotifications: () => set((state) => ({ 
                dismissedIds: [...new Set([...state.dismissedIds, ...state.notifications.map(n => n.id)])],
                notifications: [] 
            })),
            clearUnread: () => set({ unreadCount: 0 }),
        }),
        {
            name: 'admin-notifications-storage',
        }
    )
);
