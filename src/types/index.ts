// Professional B2B Debt Collection Platform Types
// GDPR-compliant data structures for case management

export type UserRole = 'CLIENT' | 'AGENT' | 'ADMIN' | 'DPO';

export type UserStatus = 'ACTIVE' | 'PENDING_VERIFICATION' | 'DISABLED' | 'DELETED_SOFT';

export type MfaMethod = 'TOTP' | 'WebAuthn' | 'SMS';

export type UserSource = 'signup' | 'invitation' | 'sso' | 'admin_created';

export interface NotificationPrefs {
  email: boolean;
  push: boolean;
  in_app: boolean;
  sms?: boolean;
}

export interface ExternalIdentity {
  provider: 'google' | 'azuread' | 'apple' | 'okta' | 'saml';
  subject: string;
  email?: string;
  verified?: boolean;
  linked_at: string;
}

export interface SecuritySettings {
  mfa_enabled: boolean;
  mfa_methods: MfaMethod[];
  failed_login_count: number;
  last_login_at?: string;
  locked_until?: string;
  recovery_email?: string;
  recovery_codes?: string[];
}

export interface ComplianceData {
  accepted_terms_at?: string;
  privacy_consent_at?: string;
  terms_version?: string;
  privacy_version?: string;
  marketing_opt_in: boolean;
  gdpr_erasure_at?: string;
}

export type CaseStatus = 'new' | 'in_progress' | 'awaiting_approval' | 'legal_stage' | 'closed';

export type ApprovalType = 'expense' | 'legal_escalation' | 'retrieval' | 'settlement_approval' | 'payment_plan' | 'write_off';

export type ApprovalState = 'pending' | 'approved' | 'rejected';

export type DocumentCategory = 'evidence' | 'correspondence' | 'invoice' | 'other';

export type GdprRequestType = 'SAR' | 'ERASURE' | 'RECTIFICATION' | 'PORTABILITY' | 'OBJECTION';

export type NotificationType = 'case_update' | 'approval_required' | 'document_uploaded' | 'payment_due';

export type ConversationType = 'case' | 'general';

export type MessageType = 'text' | 'system' | 'file';

export interface User {
  // Core (must-have)
  id: string;
  email: string;
  email_verified: boolean;
  password_hash?: string; // Only for admin views, never exposed to frontend normally
  password_version?: string;
  status: UserStatus;
  
  // Identity & profile
  name: string;
  username?: string;
  role: UserRole;
  phone?: string;
  phone_verified: boolean;
  avatar_url?: string;
  
  // Legacy fields (keeping for backward compatibility)
  clientId?: string; // Only for CLIENT role
  department?: string;
  isActive?: boolean;
  permissions?: string[];
  
  // Locale & preferences
  locale: string;
  timezone: string;
  notification_prefs: NotificationPrefs;
  marketing_opt_in: boolean;
  
  // Security & compliance
  security: SecuritySettings;
  compliance: ComplianceData;
  
  // Integrations & SSO
  external_identities: ExternalIdentity[];
  tenant_id?: string;
  groups: string[];
  
  // Lifecycle management
  source: UserSource;
  deactivated_at?: string;
  
  // Audit fields
  createdAt: string;
  updatedAt?: string;
  created_by?: string;
  updated_by?: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: User;
}

export interface Case {
  id: string;
  reference: string;
  clientId: string;
  clientName: string;
  assignedAgentId?: string;
  assignedAgentName?: string;
  debtor: {
    name: string;
    email: string;
    phone?: string;
    address: {
      street?: string;
      city: string;
      postalCode?: string;
      country: string;
    };
  };
  amount: number;
  currency: string;
  originalAmount?: number;
  status: CaseStatus;
  description?: string;
  originalCreditor?: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  lastActionAt?: string;
  tags?: string[];
}

export interface Approval {
  id: string;
  caseId: string;
  caseName: string;
  type: ApprovalType;
  state: ApprovalState;
  requestedBy: string;
  requestedByName: string;
  amount?: number;
  currency?: string;
  description: string;
  clauseId?: string;
  clauseText?: string;
  feeBreakdown?: FeeBreakdown;
  createdAt: string;
  decidedAt?: string;
  decidedBy?: string;
  decisionNotes?: string;
}

export interface FeeBreakdown {
  baseAmount: number;
  percentage: number;
  fixedFee: number;
  vatAmount: number;
  totalFee: number;
  currency: string;
}

export interface Document {
  id: string;
  caseId: string;
  filename: string;
  originalName?: string;
  category: DocumentCategory;
  size?: number;
  mimeType?: string;
  uploadedBy?: string;
  uploadedByName?: string;
  createdAt: string;
  retentionDate?: string;
  version: number;
  isLatest?: boolean;
  downloadUrl?: string;
}

export interface Invoice {
  id: string;
  caseId: string;
  caseName: string;
  clientId: string;
  clientName: string;
  invoiceNumber: string;
  amount: number;
  vatAmount: number;
  totalAmount: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  dueDate: string;
  createdAt: string;
  paidAt?: string;
  pdfUrl?: string;
  items: InvoiceItem[];
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  total: number;
}

export interface GdprRequest {
  id: string;
  type: GdprRequestType;
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'rejected';
  requestedBy: string;
  requestedByName: string;
  dataSubject: string;
  description: string;
  dueDate: string;
  createdAt: string;
  completedAt?: string;
  downloadUrl?: string;
  affectedCases?: string[];
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedEntityId?: string;
  relatedEntityType?: 'case' | 'approval' | 'invoice' | 'gdpr_request';
  createdAt: string;
  readAt?: string;
  actionUrl?: string;
}

export interface CaseEvent {
  id: string;
  caseId: string;
  type: 'status_change' | 'document_upload' | 'approval_request' | 'message_sent' | 'assignment_change';
  title: string;
  description: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface Message {
  id: string;
  caseId: string;
  direction: 'inbound' | 'outbound';
  channel: 'email' | 'sms' | 'letter' | 'phone';
  content: string;
  templateId?: string;
  createdAt: string;
}

export interface CreateCaseRequest {
  debtor: {
    name: string;
    email: string;
    phone?: string;
    address: {
      street?: string;
      city: string;
      postalCode?: string;
      country: string;
    };
  };
  amount: number;
  currency: string;
  description?: string;
  reference: string;
  originalCreditor?: string;
  clientId: string;
}

export interface Tariff {
  id: string;
  name: string;
  description?: string;
  type: 'percentage' | 'fixed' | 'tiered';
  percentage?: number;
  fixedAmount?: number;
  fixedFee?: number;
  currency: string;
  minAmount?: number;
  maxAmount?: number;
  minimumFee?: number;
  maximumFee?: number;
  clauseText: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  tiers?: TariffTier[];
}

export interface TariffTier {
  minAmount: number;
  maxAmount: number | null;
  percentage: number;
}

export interface MessageTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: 'initial_contact' | 'reminder' | 'legal_notice' | 'settlement_offer';
  channel?: 'email' | 'sms' | 'letter' | 'phone';
  locale: string;
  version: number;
  isActive: boolean;
  legalNotice?: string;
  variables?: TemplateVariable[];
  createdAt: string;
  updatedAt?: string;
}

export interface TemplateVariable {
  name: string;
  description: string;
  required: boolean;
  defaultValue?: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  hasNext: boolean;
  nextCursor?: string;
}

export interface ProblemDetails {
  type?: string;
  title: string;
  detail: string;
  status: number;
  instance?: string;
  errors?: Record<string, string[]>;
}

// Filter and Search Types
export interface CaseFilters {
  status?: CaseStatus[];
  clientId?: string;
  assignedAgentId?: string;
  amountMin?: number;
  amountMax?: number;
  createdAfter?: string;
  createdBefore?: string;
  search?: string;
}

export interface DashboardStats {
  totalCases: number;
  activeCases: number;
  pendingApprovals: number;
  overdueInvoices: number;
  totalRecovered: number;
  monthlyRecovered: number;
  averageRecoveryTime: number;
  successRate: number;
}

// Chat System Types
export interface Conversation {
  id: string;
  title?: string;
  type: ConversationType;
  caseId?: string;
  isClientVisible: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  participants?: ConversationParticipant[];
  lastMessage?: ChatMessage;
  unreadCount?: number;
}

export interface ConversationParticipant {
  id: string;
  conversationId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  joinedAt: string;
  lastReadAt?: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  messageType: MessageType;
  isInternal: boolean;
  attachmentUrl?: string;
  attachmentName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateConversationRequest {
  title?: string;
  type: ConversationType;
  caseId?: string;
  isClientVisible: boolean;
  participantIds: string[];
}

export interface CreateMessageRequest {
  conversationId: string;
  content: string;
  messageType?: MessageType;
  isInternal?: boolean;
}