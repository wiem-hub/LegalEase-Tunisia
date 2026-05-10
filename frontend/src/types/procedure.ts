// src/types/procedure.ts  (updated — due_date + notification types)

export type StepStatus = 'pending' | 'in_progress' | 'completed' | 'blocked';

export type NotificationType =
  | 'deadline_3days'
  | 'deadline_today'
  | 'deadline_passed'
  | 'step_completed'
  | 'procedure_done';

export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  user_procedure_id?: number;
  created_at: string;
}

export interface NotificationSummary {
  total: number;
  unread: number;
  items: Notification[];
}

export interface StepDocument {
  id: number;
  step_progress_id: number;
  original_filename: string;
  content_type: string;
  file_size: number;
  uploaded_at: string;
}

export interface ProcedureStep {
  id: number;
  procedure_type_id: number;
  order: number;
  title: string;
  description?: string;
  documents_required?: string;
  estimated_days?: number;
}

export interface ProcedureType {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  estimated_days?: number;
  steps: ProcedureStep[];
}

export interface UserStepProgress {
  id: number;
  step_id: number;
  status: StepStatus;
  notes?: string;
  completed_at?: string;
  due_date?: string;           // Phase 4
  step: ProcedureStep;
  documents: StepDocument[];
}

export interface UserProcedure {
  id: number;
  procedure_type_id: number;
  title?: string;
  started_at: string;
  completed_at?: string;
  is_active: boolean;
  procedure_type: ProcedureType;
  step_progress: UserStepProgress[];
  completion_percentage: number;
  current_step_order?: number;
}
