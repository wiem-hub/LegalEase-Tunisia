// services/procedureApi.ts
import api from './api';
import type { ProcedureType, UserProcedure, UserStepProgress, StepStatus } from '../types/procedure';

export const procedureApi = {
  /** Get all available procedure templates */
  getTypes: async (): Promise<ProcedureType[]> => {
    const res = await api.get('/procedures/types');
    return res.data;
  },

  /** Get the current user's active procedures */
  getMyProcedures: async (): Promise<UserProcedure[]> => {
    const res = await api.get('/procedures/my');
    return res.data;
  },

  /** Get a single user procedure by id */
  getMyProcedure: async (id: number): Promise<UserProcedure> => {
    const res = await api.get(`/procedures/my/${id}`);
    return res.data;
  },

  /** Start a new procedure */
  startProcedure: async (procedure_type_id: number, title?: string): Promise<UserProcedure> => {
    const res = await api.post('/procedures/my', { procedure_type_id, title });
    return res.data;
  },

  /** Update a step's status */
  updateStep: async (
    procedure_id: number,
    step_id: number,
    status: StepStatus,
    notes?: string,
  ): Promise<UserStepProgress> => {
    const res = await api.patch(`/procedures/my/${procedure_id}/steps/${step_id}`, {
      status,
      notes,
    });
    return res.data;
  },

  /** Export user's progress as PDF */
  exportProgressPDF: async (): Promise<Blob> => {
    const res = await api.get('/procedures/export-pdf', {
      responseType: 'blob',
    });
    return res.data;
  },
};