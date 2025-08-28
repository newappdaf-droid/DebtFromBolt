// Professional B2B Debt Collection Platform - Cases 2.0 Types
// .NET-ready DTOs with PascalCase properties for future ASP.NET Core backend

export type CasePhase = "Soft" | "Field" | "Legal" | "Bailiff" | "Closed";
export type CaseZone = "PreLegal" | "Legal" | "Bailiff";
export type CaseType = "B2C" | "B2B";
export type ActivityType = "Call" | "SMS" | "Email" | "Visit" | "Verification" | "Dispute" | "PTP" | "Other";
export type ActivityOutcome = "Reached" | "NoAnswer" | "WrongNumber" | "Paid" | "Promise" | "BrokenPromise" | "DisputeOpen" | "DisputeClosed" | "Other";
export type EscalationStatus = "Pending" | "Approved" | "Rejected";
export type CaseStatus = "PendingAcceptance" | "Active" | "Refused" | "Closed";
export type Priority = "Low" | "Medium" | "High";
export type Currency = "EUR" | "USD" | "GBP";
export type PaymentMethod = "Bank" | "Cash" | "Card" | "Other";
export type DocumentType = "Invoice" | "PoA" | "CourtFiling" | "ProofOfPayment" | "ID" | "Other";
export type HistoryType = "Created" | "FieldChanged" | "Assignment" | "Message" | "Activity" | "Payment" | "Document" | "Escalation" | "PhaseChange" | "Note";
export type PtpStatus = "Open" | "Kept" | "Broken";

export interface CaseSummary {
  CaseId: string;
  CaseNumber: string;
  Phase: CasePhase;
  Zone: CaseZone;
  Status: CaseStatus;
  AssignedToUserId?: string;
  Priority?: Priority;
  OpenedAt: string;
  AcceptedAt?: string;
  ClosedAt?: string;
  Labels: string[];
}

export interface CaseFinance {
  CaseId: string;
  Currency: Currency;
  Principal: number;
  Fees: number;
  Penalties: number;
  Interest: number;
  PaymentsTotal: number;
  NotAllocatedTotal: number;
  OpenToPay: number;
  UpdatedAt: string;
}

export interface CaseHeader extends CaseSummary {
  PortfolioId: string;
  ClientId: string;
  CreditorId?: string;
  SendingPartnerId?: string;
  DebtorId: string;
  CaseType: CaseType;
  ProcessType?: string;
  CommissionPct?: number;
}

export interface CaseHistoryItem {
  HistoryId: string;
  CaseId: string;
  When: string;
  WhoUserId?: string;
  Type: HistoryType;
  Title?: string;
  Body?: string;
  RefTable?: string;
  RefId?: string;
}

export interface CaseMessage {
  MessageId: string;
  CaseId: string;
  ThreadId: string;
  FromOrgId?: string;
  FromUserId?: string;
  ToOrgId?: string;
  Body: string;
  HasAttachments: boolean;
  ReadAt?: string;
  CreatedAt: string;
}

export interface CaseActivity {
  ActivityId: string;
  CaseId: string;
  Type: ActivityType;
  Outcome?: ActivityOutcome;
  Note?: string;
  DueAt?: string;
  CreatedBy?: string;
  CreatedAt: string;
}

export interface PromiseToPay {
  PtpId: string;
  CaseId: string;
  PromisedAmount: number;
  DueDate: string;
  Status: PtpStatus;
  CreatedAt: string;
  ClosedAt?: string;
}

export interface Payment {
  PaymentId: string;
  CaseId: string;
  Amount: number;
  Currency: Currency;
  PaidAt: string;
  Method?: PaymentMethod;
  ExternalRef?: string;
  CreatedAt: string;
}

export interface CaseDocument {
  DocumentId: string;
  CaseId: string;
  Type: DocumentType;
  FileName: string;
  MimeType: string;
  StorageKey: string;
  Size: number;
  Version: number;
  RetentionPolicyCode?: string;
  UploadedBy?: string;
  UploadedAt: string;
  Hash?: string;
}

export interface EscalationRequest {
  EscalationId: string;
  CaseId: string;
  FromPhase: CasePhase;
  ToPhase: CasePhase;
  RequestedBy: string;
  Reason?: string;
  Status: EscalationStatus;
  DecidedBy?: string;
  DecidedAt?: string;
}

export interface PhaseChange {
  PhaseChangeId: string;
  CaseId: string;
  FromPhase: CasePhase;
  ToPhase: CasePhase;
  ChangedBy: string;
  ChangedAt: string;
  EscalationId?: string;
}

export interface Assignment {
  AssignmentId: string;
  CaseId: string;
  AssignedToUserId: string;
  AssignedByUserId?: string;
  AssignedAt: string;
}

export interface CaseFilters {
  Query?: string;
  ClientId?: string;
  PortfolioId?: string;
  Phase?: CasePhase;
  Zone?: CaseZone;
  Assignee?: string;
  Label?: string;
  DateFrom?: string;
  DateTo?: string;
  Page?: number;
  Size?: number;
}

// Dictionary Types
export interface Dictionary {
  Code: string;
  Name: string;
  Active: boolean;
}

export interface CaseTypeDictionary extends Dictionary {
  Code: CaseType;
}

export interface ZoneDictionary extends Dictionary {
  Code: CaseZone;
}

export interface PhaseDictionary extends Dictionary {
  Code: CasePhase;
}

export interface ActivityTypeDictionary extends Dictionary {
  Code: ActivityType;
}

export interface DocumentTypeDictionary extends Dictionary {
  Code: DocumentType;
}

export interface PaymentMethodDictionary extends Dictionary {
  Code: PaymentMethod;
}

export interface LabelDictionary extends Dictionary {
  Color?: string;
  Description?: string;
}

// API Response Types
export interface CaseListResponse {
  Items: CaseSummary[];
  Total: number;
}

export interface CaseDetailResponse {
  Header: CaseHeader;
  Finance: CaseFinance;
}

export interface ApiSuccessResponse {
  Success: boolean;
  AcceptedAt?: string;
  Reason?: string;
}

export interface ApiErrorResponse {
  Error: {
    Code: string;
    Message: string;
  };
}

// Request Types
export interface CreateCaseRequest {
  PortfolioId: string;
  ClientId: string;
  DebtorId: string;
  CaseType: CaseType;
  ProcessType?: string;
  CommissionPct?: number;
  Principal: number;
  Currency: Currency;
  Labels?: string[];
}

export interface AssignCaseRequest {
  AssignedToUserId: string;
}

export interface ChangeZoneRequest {
  Zone: CaseZone;
}

export interface CreateEscalationRequest {
  ToPhase: CasePhase;
  Reason?: string;
}

export interface CreateMessageRequest {
  Body: string;
  HasAttachments?: boolean;
}

export interface CreateActivityRequest {
  Type: ActivityType;
  Outcome?: ActivityOutcome;
  Note?: string;
  DueAt?: string;
}

export interface CreatePtpRequest {
  PromisedAmount: number;
  DueDate: string;
}

export interface ClosePtpRequest {
  Status: "Kept" | "Broken";
}

export interface CreatePaymentRequest {
  Amount: number;
  Currency: Currency;
  PaidAt: string;
  Method?: PaymentMethod;
  ExternalRef?: string;
}

export interface DocumentUploadInitRequest {
  FileName: string;
  MimeType: string;
  Size: number;
  Type: DocumentType;
}

export interface DocumentUploadInitResponse {
  UploadUrl: string;
  StorageKey: string;
}

export interface DocumentCommitRequest {
  StorageKey: string;
}

export interface ImportCasesRequest {
  // Meta only for now
  FileName: string;
  RowCount: number;
}

export interface ImportCasesResponse {
  RowsAccepted: number;
  RowsRejected: number;
  Issues: string[];
}

// Saved Views
export interface SavedView {
  ViewId: string;
  Name: string;
  Filters: CaseFilters;
  CreatedAt: string;
  UpdatedAt: string;
}