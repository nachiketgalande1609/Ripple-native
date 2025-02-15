import { create } from "zustand";

type NotificationState = {
    unreadMessagesCount: number;
    unreadNotificationsCount: number;
    setUnreadMessagesCount: (count: number) => void;
    setUnreadNotificationsCount: (count: number) => void;
    incrementUnreadMessages: () => void;
    incrementUnreadNotifications: () => void;
    resetUnreadMessages: () => void;
    resetUnreadNotifications: () => void;
};

const useNotificationMessagesStore = create<NotificationState>((set) => ({
    unreadMessagesCount: 0,
    unreadNotificationsCount: 0,

    setUnreadMessagesCount: (count) => set({ unreadMessagesCount: count }),
    setUnreadNotificationsCount: (count) => set({ unreadNotificationsCount: count }),

    incrementUnreadMessages: () => set((state) => ({ unreadMessagesCount: state.unreadMessagesCount + 1 })),

    incrementUnreadNotifications: () => set((state) => ({ unreadNotificationsCount: state.unreadNotificationsCount + 1 })),

    resetUnreadMessages: () => set({ unreadMessagesCount: 0 }),
    resetUnreadNotifications: () => set({ unreadNotificationsCount: 0 }),
}));

export default useNotificationMessagesStore;
