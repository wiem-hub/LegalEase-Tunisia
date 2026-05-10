// src/services/documentApi.ts
import api from './api';
import type { StepDocument } from '../types/procedure';

export const documentApi = {
  /** Upload a file to a step (multipart/form-data) */
  upload: async (progressId: number, file: File): Promise<StepDocument> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post(`/documents/steps/${progressId}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  /** List all documents for a step */
  list: async (progressId: number): Promise<StepDocument[]> => {
    const res = await api.get(`/documents/steps/${progressId}`);
    return res.data;
  },

  /** Trigger a file download (opens browser save dialog) */
  download: (docId: number, filename: string): void => {
    const token = localStorage.getItem('access_token');
    const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';
    const url = `${baseUrl}/documents/${docId}/download`;

    // Create a temporary anchor with auth header workaround via fetch + blob
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.blob())
      .then((blob) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        a.click();
        URL.revokeObjectURL(a.href);
      });
  },

  /** Delete a document */
  delete: async (docId: number): Promise<void> => {
    await api.delete(`/documents/${docId}`);
  },
};
