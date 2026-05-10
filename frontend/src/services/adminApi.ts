// src/services/adminApi.ts  (updated — full BI types)
import api from './api';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AdminUser {
  id: number;
  email: string;
  username: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
  procedure_count: number;
}

export interface ProcedureTypeStat {
  id: number;
  name: string;
  total_started: number;
  total_completed: number;
  avg_completion_pct: number;
  avg_days_to_complete?: number;
}

export interface StepStat {
  step_title: string;
  procedure_type: string;
  total: number;
  completed: number;
  blocked: number;
  avg_days_to_complete?: number;
}

export interface TimeSeriesPoint {
  label: string;
  value: number;
}

export interface StepFunnelItem {
  step_order: number;
  step_title: string;
  total: number;
  completed: number;
  blocked: number;
  pending: number;
  in_progress: number;
  completion_rate: number;
}

export interface DocumentTypeStat {
  content_type: string;
  label: string;
  count: number;
  pct: number;
}

export interface UserActivityStat {
  username: string;
  procedure_count: number;
  completed_count: number;
  total_steps_done: number;
  total_docs_uploaded: number;
  last_active?: string;
}

export interface StatusDistribution {
  completed: number;
  in_progress: number;
  pending: number;
  blocked: number;
}

export interface GlobalStats {
  // KPIs
  total_users: number;
  active_users: number;
  total_procedures: number;
  completed_procedures: number;
  total_documents_uploaded: number;
  completion_rate: number;
  avg_days_to_complete?: number;

  // Existing
  procedure_type_stats: ProcedureTypeStat[];
  most_blocked_steps: StepStat[];

  // BI
  users_over_time: TimeSeriesPoint[];
  procedures_over_time: TimeSeriesPoint[];
  step_funnels: StepFunnelItem[];
  document_type_stats: DocumentTypeStat[];
  top_users: UserActivityStat[];
  status_distribution: StatusDistribution;
}

export interface AdminStepPayload {
  order: number;
  title: string;
  description?: string;
  documents_required?: string;
  estimated_days?: number;
}

export interface AdminProcedureTypePayload {
  name: string;
  description?: string;
  icon?: string;
  estimated_days?: number;
  steps?: AdminStepPayload[];
}

// ── API calls ─────────────────────────────────────────────────────────────────

export const adminApi = {
  getStats: async (): Promise<GlobalStats> => {
    const res = await api.get('/admin/stats');
    return res.data;
  },

  getUsers: async (): Promise<AdminUser[]> => {
    const res = await api.get('/admin/users');
    return res.data;
  },

  updateUser: async (id: number, data: { is_active?: boolean; is_admin?: boolean }): Promise<AdminUser> => {
    const res = await api.patch(`/admin/users/${id}`, data);
    return res.data;
  },

  createProcedureType: async (data: AdminProcedureTypePayload) => {
    const res = await api.post('/admin/procedure-types', data);
    return res.data;
  },

  updateProcedureType: async (id: number, data: Partial<AdminProcedureTypePayload>) => {
    const res = await api.patch(`/admin/procedure-types/${id}`, data);
    return res.data;
  },

  deleteProcedureType: async (id: number): Promise<void> => {
    await api.delete(`/admin/procedure-types/${id}`);
  },

  addStep: async (typeId: number, data: AdminStepPayload) => {
    const res = await api.post(`/admin/procedure-types/${typeId}/steps`, data);
    return res.data;
  },

  updateStep: async (stepId: number, data: Partial<AdminStepPayload>) => {
    const res = await api.patch(`/admin/steps/${stepId}`, data);
    return res.data;
  },

  deleteStep: async (stepId: number): Promise<void> => {
    await api.delete(`/admin/steps/${stepId}`);
  },
};