// src/services/notificationApi.ts
import api from './api';
import type { NotificationSummary } from '../types/procedure';

export const notificationApi = {
  /** Fetch all notifications (with unread count) */
  getAll: async (unreadOnly = false): Promise<NotificationSummary> => {
    const res = await api.get('/notifications', { params: { unread_only: unreadOnly } });
    return res.data;
  },

  /** Mark one notification as read */
  markRead: async (id: number): Promise<void> => {
    await api.patch(`/notifications/${id}/read`);
  },

  /** Mark all notifications as read */
  markAllRead: async (): Promise<void> => {
    await api.patch('/notifications/read-all');
  },

  /** Set or clear a step deadline */
  setDueDate: async (
    procedureId: number,
    stepId: number,
    dueDate: string | null,
  ): Promise<void> => {
    await api.patch(
      `/procedures/my/${procedureId}/steps/${stepId}/due-date`,
      { due_date: dueDate },
    );
  },
};
