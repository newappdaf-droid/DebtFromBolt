// Professional Cases API Adapter for B2B Debt Collection Platform
// Mock implementation with .NET-ready contracts and PascalCase DTOs

import {
  CaseSummary,
  CaseHeader,
  CaseFinance,
  CaseHistoryItem,
  CaseMessage,
  CaseActivity,
  PromiseToPay,
  Payment,
  CaseDocument,
  EscalationRequest,
  PhaseChange,
  Assignment,
  CaseFilters,
  CaseListResponse,
  CaseDetailResponse,
  ApiSuccessResponse,
  CreateCaseRequest,
  AssignCaseRequest,
  ChangeZoneRequest,
  CreateEscalationRequest,
  CreateMessageRequest,
  CreateActivityRequest,
  CreatePtpRequest,
  ClosePtpRequest,
  CreatePaymentRequest,
  DocumentUploadInitRequest,
  DocumentUploadInitResponse,
  DocumentCommitRequest,
  ImportCasesRequest,
  ImportCasesResponse,
  SavedView
} from '@/types/cases';

// Mock Data Store
class MockDataStore {
  private cases: CaseHeader[] = [];
  private finances: CaseFinance[] = [];
  private history: CaseHistoryItem[] = [];
  private messages: CaseMessage[] = [];
  private activities: CaseActivity[] = [];
  private ptps: PromiseToPay[] = [];
  private payments: Payment[] = [];
  private documents: CaseDocument[] = [];
  private escalations: EscalationRequest[] = [];
  private phaseChanges: PhaseChange[] = [];
  private assignments: Assignment[] = [];
  private savedViews: SavedView[] = [];

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Generate 200+ diverse cases
    for (let i = 1; i <= 250; i++) {
      const caseId = `case_${i.toString().padStart(6, '0')}`;
      const phases = ["Soft", "Field", "Legal", "Bailiff", "Closed"] as const;
      const zones = ["PreLegal", "Legal", "Bailiff"] as const;
      const statuses = ["PendingAcceptance", "Active", "Refused", "Closed"] as const;
      const priorities = ["Low", "Medium", "High"] as const;
      const caseTypes = ["B2C", "B2B"] as const;
      
      const phase = phases[Math.floor(Math.random() * phases.length)];
      const zone = phase === "Closed" ? zones[0] : zones[Math.floor(Math.random() * zones.length)];
      const status = phase === "Closed" ? "Closed" : statuses[Math.floor(Math.random() * statuses.length)];
      
      const openedAt = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString();
      const acceptedAt = status !== "PendingAcceptance" ? new Date(new Date(openedAt).getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : undefined;
      const closedAt = status === "Closed" ? new Date(new Date(acceptedAt || openedAt).getTime() + Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString() : undefined;

      const labels = [];
      const availableLabels = ["HighValue", "Dispute", "VIP", "Elderly", "Vulnerable", "Commercial", "Residential"];
      for (let j = 0; j < Math.floor(Math.random() * 3); j++) {
        const label = availableLabels[Math.floor(Math.random() * availableLabels.length)];
        if (!labels.includes(label)) labels.push(label);
      }

      const caseHeader: CaseHeader = {
        CaseId: caseId,
        CaseNumber: `CN${i.toString().padStart(8, '0')}`,
        Phase: phase,
        Zone: zone,
        Status: status,
        AssignedToUserId: Math.random() > 0.3 ? `agent_${Math.floor(Math.random() * 5) + 1}` : undefined,
        Priority: priorities[Math.floor(Math.random() * priorities.length)],
        OpenedAt: openedAt,
        AcceptedAt: acceptedAt,
        ClosedAt: closedAt,
        Labels: labels,
        PortfolioId: `portfolio_${Math.floor(Math.random() * 10) + 1}`,
        ClientId: `client_${Math.floor(Math.random() * 5) + 1}`,
        CreditorId: `creditor_${Math.floor(Math.random() * 3) + 1}`,
        SendingPartnerId: Math.random() > 0.5 ? `partner_${Math.floor(Math.random() * 3) + 1}` : undefined,
        DebtorId: `debtor_${i}`,
        CaseType: caseTypes[Math.floor(Math.random() * caseTypes.length)],
        ProcessType: Math.random() > 0.5 ? "Standard" : "Express",
        CommissionPct: Math.random() > 0.5 ? Math.floor(Math.random() * 30) + 10 : undefined
      };

      this.cases.push(caseHeader);

      // Generate finance data
      const principal = Math.floor(Math.random() * 50000) + 1000;
      const fees = Math.floor(principal * 0.15);
      const penalties = Math.floor(principal * 0.05);
      const interest = Math.floor(principal * 0.08);
      const paymentsTotal = status === "Closed" ? principal + fees : Math.floor(Math.random() * principal * 0.8);
      
      const finance: CaseFinance = {
        CaseId: caseId,
        Currency: ["EUR", "USD", "GBP"][Math.floor(Math.random() * 3)] as "EUR" | "USD" | "GBP",
        Principal: principal,
        Fees: fees,
        Penalties: penalties,
        Interest: interest,
        PaymentsTotal: paymentsTotal,
        NotAllocatedTotal: Math.floor(Math.random() * 100),
        OpenToPay: Math.max(0, principal + fees + penalties + interest - paymentsTotal),
        UpdatedAt: new Date().toISOString()
      };

      this.finances.push(finance);

      // Generate activities (2-8 per case)
      const activityCount = Math.floor(Math.random() * 7) + 2;
      const activityTypes = ["Call", "SMS", "Email", "Visit", "Verification", "Dispute", "PTP", "Other"] as const;
      const outcomes = ["Reached", "NoAnswer", "WrongNumber", "Paid", "Promise", "BrokenPromise", "DisputeOpen", "DisputeClosed", "Other"] as const;
      
      for (let j = 0; j < activityCount; j++) {
        const activityDate = new Date(new Date(openedAt).getTime() + j * 7 * 24 * 60 * 60 * 1000);
        const dueAt = Math.random() > 0.7 ? new Date(activityDate.getTime() + Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString() : undefined;
        
        const activity: CaseActivity = {
          ActivityId: `activity_${caseId}_${j}`,
          CaseId: caseId,
          Type: activityTypes[Math.floor(Math.random() * activityTypes.length)],
          Outcome: outcomes[Math.floor(Math.random() * outcomes.length)],
          Note: `Activity note for ${activityTypes[Math.floor(Math.random() * activityTypes.length)].toLowerCase()} action`,
          DueAt: dueAt,
          CreatedBy: caseHeader.AssignedToUserId || "system",
          CreatedAt: activityDate.toISOString()
        };
        
        this.activities.push(activity);
      }

      // Generate history items
      const historyTypes = ["Created", "FieldChanged", "Assignment", "Message", "Activity", "Payment", "Document", "Escalation", "PhaseChange", "Note"] as const;
      for (let j = 0; j < Math.floor(Math.random() * 10) + 5; j++) {
        const historyDate = new Date(new Date(openedAt).getTime() + j * 3 * 24 * 60 * 60 * 1000);
        
        const historyItem: CaseHistoryItem = {
          HistoryId: `history_${caseId}_${j}`,
          CaseId: caseId,
          When: historyDate.toISOString(),
          WhoUserId: caseHeader.AssignedToUserId || "system",
          Type: historyTypes[Math.floor(Math.random() * historyTypes.length)],
          Title: `History event ${j + 1}`,
          Body: `Detailed description of history event ${j + 1}`,
          RefTable: Math.random() > 0.5 ? "activities" : undefined,
          RefId: Math.random() > 0.5 ? `ref_${j}` : undefined
        };
        
        this.history.push(historyItem);
      }

      // Generate some payments for closed cases
      if (status === "Closed" && Math.random() > 0.3) {
        const paymentCount = Math.floor(Math.random() * 3) + 1;
        for (let j = 0; j < paymentCount; j++) {
          const paymentDate = new Date(new Date(acceptedAt || openedAt).getTime() + j * 30 * 24 * 60 * 60 * 1000);
          
          const payment: Payment = {
            PaymentId: `payment_${caseId}_${j}`,
            CaseId: caseId,
            Amount: Math.floor(paymentsTotal / paymentCount),
            Currency: finance.Currency,
            PaidAt: paymentDate.toISOString(),
            Method: ["Bank", "Cash", "Card", "Other"][Math.floor(Math.random() * 4)] as "Bank" | "Cash" | "Card" | "Other",
            ExternalRef: `EXT${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
            CreatedAt: paymentDate.toISOString()
          };
          
          this.payments.push(payment);
        }
      }
    }

    // Generate some escalation requests
    for (let i = 0; i < 30; i++) {
      const caseId = this.cases[Math.floor(Math.random() * this.cases.length)].CaseId;
      const phases = ["Soft", "Field", "Legal", "Bailiff"] as const;
      const fromPhase = phases[Math.floor(Math.random() * phases.length)];
      const toPhaseIndex = phases.indexOf(fromPhase) + 1;
      const toPhase = toPhaseIndex < phases.length ? phases[toPhaseIndex] : "Closed";
      
      const escalation: EscalationRequest = {
        EscalationId: `escalation_${i}`,
        CaseId: caseId,
        FromPhase: fromPhase,
        ToPhase: toPhase as "Soft" | "Field" | "Legal" | "Bailiff" | "Closed",
        RequestedBy: `agent_${Math.floor(Math.random() * 5) + 1}`,
        Reason: `Escalation reason for case ${caseId}`,
        Status: ["Pending", "Approved", "Rejected"][Math.floor(Math.random() * 3)] as "Pending" | "Approved" | "Rejected",
        DecidedBy: Math.random() > 0.5 ? "admin_1" : undefined,
        DecidedAt: Math.random() > 0.5 ? new Date().toISOString() : undefined
      };
      
      this.escalations.push(escalation);
    }
  }

  // Getters
  getCases(): CaseHeader[] { return this.cases; }
  getFinances(): CaseFinance[] { return this.finances; }
  getHistory(): CaseHistoryItem[] { return this.history; }
  getMessages(): CaseMessage[] { return this.messages; }
  getActivities(): CaseActivity[] { return this.activities; }
  getPtps(): PromiseToPay[] { return this.ptps; }
  getPayments(): Payment[] { return this.payments; }
  getDocuments(): CaseDocument[] { return this.documents; }
  getEscalations(): EscalationRequest[] { return this.escalations; }
  getPhaseChanges(): PhaseChange[] { return this.phaseChanges; }
  getAssignments(): Assignment[] { return this.assignments; }
  getSavedViews(): SavedView[] { return this.savedViews; }

  // Setters
  addCase(caseHeader: CaseHeader): void { this.cases.push(caseHeader); }
  addFinance(finance: CaseFinance): void { this.finances.push(finance); }
  addHistory(item: CaseHistoryItem): void { this.history.push(item); }
  addMessage(message: CaseMessage): void { this.messages.push(message); }
  addActivity(activity: CaseActivity): void { this.activities.push(activity); }
  addPtp(ptp: PromiseToPay): void { this.ptps.push(ptp); }
  addPayment(payment: Payment): void { this.payments.push(payment); }
  addDocument(document: CaseDocument): void { this.documents.push(document); }
  addEscalation(escalation: EscalationRequest): void { this.escalations.push(escalation); }
  addPhaseChange(change: PhaseChange): void { this.phaseChanges.push(change); }
  addAssignment(assignment: Assignment): void { this.assignments.push(assignment); }
  addSavedView(view: SavedView): void { this.savedViews.push(view); }

  // Update methods
  updateCase(caseId: string, updates: Partial<CaseHeader>): void {
    const index = this.cases.findIndex(c => c.CaseId === caseId);
    if (index !== -1) {
      this.cases[index] = { ...this.cases[index], ...updates };
    }
  }

  updateFinance(caseId: string, updates: Partial<CaseFinance>): void {
    const index = this.finances.findIndex(f => f.CaseId === caseId);
    if (index !== -1) {
      this.finances[index] = { ...this.finances[index], ...updates, UpdatedAt: new Date().toISOString() };
    }
  }

  updateEscalation(escalationId: string, updates: Partial<EscalationRequest>): void {
    const index = this.escalations.findIndex(e => e.EscalationId === escalationId);
    if (index !== -1) {
      this.escalations[index] = { ...this.escalations[index], ...updates };
    }
  }

  updatePtp(ptpId: string, updates: Partial<PromiseToPay>): void {
    const index = this.ptps.findIndex(p => p.PtpId === ptpId);
    if (index !== -1) {
      this.ptps[index] = { ...this.ptps[index], ...updates };
    }
  }
}

// Singleton mock store
const mockStore = new MockDataStore();

// API Adapter Class
export class CasesApiAdapter {
  private baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  // Cases
  async getCases(filters?: CaseFilters): Promise<CaseListResponse> {
    await this.simulateDelay();
    
    let cases = mockStore.getCases();
    
    // Apply filters
    if (filters?.Query) {
      const query = filters.Query.toLowerCase();
      cases = cases.filter(c => 
        c.CaseNumber.toLowerCase().includes(query) ||
        c.CaseId.toLowerCase().includes(query)
      );
    }
    
    if (filters?.ClientId) {
      cases = cases.filter(c => c.ClientId === filters.ClientId);
    }
    
    if (filters?.PortfolioId) {
      cases = cases.filter(c => c.PortfolioId === filters.PortfolioId);
    }
    
    if (filters?.Phase) {
      cases = cases.filter(c => c.Phase === filters.Phase);
    }
    
    if (filters?.Zone) {
      cases = cases.filter(c => c.Zone === filters.Zone);
    }
    
    if (filters?.Assignee) {
      cases = cases.filter(c => c.AssignedToUserId === filters.Assignee);
    }
    
    if (filters?.Label) {
      cases = cases.filter(c => c.Labels.includes(filters.Label!));
    }
    
    if (filters?.DateFrom) {
      cases = cases.filter(c => new Date(c.OpenedAt) >= new Date(filters.DateFrom!));
    }
    
    if (filters?.DateTo) {
      cases = cases.filter(c => new Date(c.OpenedAt) <= new Date(filters.DateTo!));
    }

    // Pagination
    const page = filters?.Page || 1;
    const size = filters?.Size || 20;
    const startIndex = (page - 1) * size;
    const endIndex = startIndex + size;
    const paginatedCases = cases.slice(startIndex, endIndex);

    return {
      Items: paginatedCases.map(c => ({
        CaseId: c.CaseId,
        CaseNumber: c.CaseNumber,
        Phase: c.Phase,
        Zone: c.Zone,
        Status: c.Status,
        AssignedToUserId: c.AssignedToUserId,
        Priority: c.Priority,
        OpenedAt: c.OpenedAt,
        AcceptedAt: c.AcceptedAt,
        ClosedAt: c.ClosedAt,
        Labels: c.Labels
      })),
      Total: cases.length
    };
  }

  async createCase(request: CreateCaseRequest): Promise<CaseHeader> {
    await this.simulateDelay();
    
    const caseId = `case_${Date.now()}`;
    const caseNumber = `CN${Date.now().toString().slice(-8)}`;
    
    const newCase: CaseHeader = {
      CaseId: caseId,
      CaseNumber: caseNumber,
      Phase: "Soft",
      Zone: "PreLegal",
      Status: "PendingAcceptance",
      Priority: "Medium",
      OpenedAt: new Date().toISOString(),
      Labels: request.Labels || [],
      PortfolioId: request.PortfolioId,
      ClientId: request.ClientId,
      DebtorId: request.DebtorId,
      CaseType: request.CaseType,
      ProcessType: request.ProcessType,
      CommissionPct: request.CommissionPct
    };

    const finance: CaseFinance = {
      CaseId: caseId,
      Currency: request.Currency,
      Principal: request.Principal,
      Fees: 0,
      Penalties: 0,
      Interest: 0,
      PaymentsTotal: 0,
      NotAllocatedTotal: 0,
      OpenToPay: request.Principal,
      UpdatedAt: new Date().toISOString()
    };

    mockStore.addCase(newCase);
    mockStore.addFinance(finance);
    
    // Add creation history
    mockStore.addHistory({
      HistoryId: `history_${caseId}_created`,
      CaseId: caseId,
      When: new Date().toISOString(),
      Type: "Created",
      Title: "Case Created",
      Body: `Case ${caseNumber} created`
    });

    return newCase;
  }

  async getCase(caseId: string): Promise<CaseDetailResponse> {
    await this.simulateDelay();
    
    const header = mockStore.getCases().find(c => c.CaseId === caseId);
    const finance = mockStore.getFinances().find(f => f.CaseId === caseId);
    
    if (!header || !finance) {
      throw new Error(`Case ${caseId} not found`);
    }

    return { Header: header, Finance: finance };
  }

  async acceptCase(caseId: string): Promise<ApiSuccessResponse> {
    await this.simulateDelay();
    
    const acceptedAt = new Date().toISOString();
    mockStore.updateCase(caseId, { Status: "Active", AcceptedAt: acceptedAt });
    
    mockStore.addHistory({
      HistoryId: `history_${caseId}_accepted`,
      CaseId: caseId,
      When: acceptedAt,
      Type: "FieldChanged",
      Title: "Case Accepted",
      Body: "Case accepted for processing"
    });

    return { Success: true, AcceptedAt: acceptedAt };
  }

  async refuseCase(caseId: string, reason?: string): Promise<ApiSuccessResponse> {
    await this.simulateDelay();
    
    mockStore.updateCase(caseId, { Status: "Refused" });
    
    mockStore.addHistory({
      HistoryId: `history_${caseId}_refused`,
      CaseId: caseId,
      When: new Date().toISOString(),
      Type: "FieldChanged",
      Title: "Case Refused",
      Body: reason || "Case refused"
    });

    return { Success: true, Reason: reason };
  }

  async assignCase(caseId: string, request: AssignCaseRequest): Promise<Assignment> {
    await this.simulateDelay();
    
    const assignment: Assignment = {
      AssignmentId: `assignment_${caseId}_${Date.now()}`,
      CaseId: caseId,
      AssignedToUserId: request.AssignedToUserId,
      AssignedByUserId: "current_user",
      AssignedAt: new Date().toISOString()
    };

    mockStore.updateCase(caseId, { AssignedToUserId: request.AssignedToUserId });
    mockStore.addAssignment(assignment);
    
    mockStore.addHistory({
      HistoryId: `history_${caseId}_assigned`,
      CaseId: caseId,
      When: assignment.AssignedAt,
      Type: "Assignment",
      Title: "Case Assigned",
      Body: `Case assigned to user ${request.AssignedToUserId}`
    });

    return assignment;
  }

  async updateCaseLabels(caseId: string, labels: string[]): Promise<{ Labels: string[] }> {
    await this.simulateDelay();
    
    mockStore.updateCase(caseId, { Labels: labels });
    
    mockStore.addHistory({
      HistoryId: `history_${caseId}_labels`,
      CaseId: caseId,
      When: new Date().toISOString(),
      Type: "FieldChanged",
      Title: "Labels Updated",
      Body: `Labels updated to: ${labels.join(', ')}`
    });

    return { Labels: labels };
  }

  // Phase & Escalation
  async changeZone(caseId: string, request: ChangeZoneRequest): Promise<ApiSuccessResponse> {
    await this.simulateDelay();
    
    mockStore.updateCase(caseId, { Zone: request.Zone });
    
    mockStore.addHistory({
      HistoryId: `history_${caseId}_zone_change`,
      CaseId: caseId,
      When: new Date().toISOString(),
      Type: "FieldChanged",
      Title: "Zone Changed",
      Body: `Zone changed to ${request.Zone}`
    });

    return { Success: true };
  }

  async createEscalation(caseId: string, request: CreateEscalationRequest): Promise<EscalationRequest> {
    await this.simulateDelay();
    
    const escalation: EscalationRequest = {
      EscalationId: `escalation_${caseId}_${Date.now()}`,
      CaseId: caseId,
      FromPhase: mockStore.getCases().find(c => c.CaseId === caseId)?.Phase || "Soft",
      ToPhase: request.ToPhase,
      RequestedBy: "current_user",
      Reason: request.Reason,
      Status: "Pending"
    };

    mockStore.addEscalation(escalation);
    
    mockStore.addHistory({
      HistoryId: `history_${caseId}_escalation`,
      CaseId: caseId,
      When: new Date().toISOString(),
      Type: "Escalation",
      Title: "Escalation Requested",
      Body: `Escalation to ${request.ToPhase} requested`
    });

    return escalation;
  }

  async approveEscalation(caseId: string, escalationId: string): Promise<PhaseChange> {
    await this.simulateDelay();
    
    const escalation = mockStore.getEscalations().find(e => e.EscalationId === escalationId);
    if (!escalation) throw new Error('Escalation not found');

    mockStore.updateEscalation(escalationId, {
      Status: "Approved",
      DecidedBy: "current_user",
      DecidedAt: new Date().toISOString()
    });

    const phaseChange: PhaseChange = {
      PhaseChangeId: `phase_change_${caseId}_${Date.now()}`,
      CaseId: caseId,
      FromPhase: escalation.FromPhase,
      ToPhase: escalation.ToPhase,
      ChangedBy: "current_user",
      ChangedAt: new Date().toISOString(),
      EscalationId: escalationId
    };

    mockStore.updateCase(caseId, { Phase: escalation.ToPhase });
    mockStore.addPhaseChange(phaseChange);
    
    mockStore.addHistory({
      HistoryId: `history_${caseId}_phase_change`,
      CaseId: caseId,
      When: phaseChange.ChangedAt,
      Type: "PhaseChange",
      Title: "Phase Changed",
      Body: `Phase changed from ${escalation.FromPhase} to ${escalation.ToPhase}`
    });

    return phaseChange;
  }

  async rejectEscalation(caseId: string, escalationId: string): Promise<EscalationRequest> {
    await this.simulateDelay();
    
    mockStore.updateEscalation(escalationId, {
      Status: "Rejected",
      DecidedBy: "current_user",
      DecidedAt: new Date().toISOString()
    });

    const escalation = mockStore.getEscalations().find(e => e.EscalationId === escalationId);
    if (!escalation) throw new Error('Escalation not found');

    mockStore.addHistory({
      HistoryId: `history_${caseId}_escalation_rejected`,
      CaseId: caseId,
      When: new Date().toISOString(),
      Type: "Escalation",
      Title: "Escalation Rejected",
      Body: `Escalation to ${escalation.ToPhase} rejected`
    });

    return escalation;
  }

  // History
  async getCaseHistory(caseId: string, view: 'detailed' | 'compact' = 'detailed'): Promise<CaseHistoryItem[]> {
    await this.simulateDelay();
    
    return mockStore.getHistory()
      .filter(h => h.CaseId === caseId)
      .sort((a, b) => new Date(b.When).getTime() - new Date(a.When).getTime());
  }

  // Messages
  async getCaseMessages(caseId: string): Promise<CaseMessage[]> {
    await this.simulateDelay();
    
    return mockStore.getMessages()
      .filter(m => m.CaseId === caseId)
      .sort((a, b) => new Date(a.CreatedAt).getTime() - new Date(b.CreatedAt).getTime());
  }

  async createMessage(caseId: string, request: CreateMessageRequest): Promise<CaseMessage> {
    await this.simulateDelay();
    
    const message: CaseMessage = {
      MessageId: `message_${caseId}_${Date.now()}`,
      CaseId: caseId,
      ThreadId: `thread_${caseId}`,
      FromUserId: "current_user",
      Body: request.Body,
      HasAttachments: request.HasAttachments || false,
      CreatedAt: new Date().toISOString()
    };

    mockStore.addMessage(message);
    
    mockStore.addHistory({
      HistoryId: `history_${caseId}_message`,
      CaseId: caseId,
      When: message.CreatedAt,
      Type: "Message",
      Title: "Message Sent",
      Body: `Message: ${request.Body.substring(0, 50)}...`
    });

    return message;
  }

  // Activities & PTP
  async getCaseActivities(caseId: string): Promise<CaseActivity[]> {
    await this.simulateDelay();
    
    return mockStore.getActivities()
      .filter(a => a.CaseId === caseId)
      .sort((a, b) => new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime());
  }

  async createActivity(caseId: string, request: CreateActivityRequest): Promise<CaseActivity> {
    await this.simulateDelay();
    
    const activity: CaseActivity = {
      ActivityId: `activity_${caseId}_${Date.now()}`,
      CaseId: caseId,
      Type: request.Type,
      Outcome: request.Outcome,
      Note: request.Note,
      DueAt: request.DueAt,
      CreatedBy: "current_user",
      CreatedAt: new Date().toISOString()
    };

    mockStore.addActivity(activity);
    
    mockStore.addHistory({
      HistoryId: `history_${caseId}_activity`,
      CaseId: caseId,
      When: activity.CreatedAt,
      Type: "Activity",
      Title: `${request.Type} Activity`,
      Body: request.Note || `${request.Type} activity logged`
    });

    return activity;
  }

  async createPtp(caseId: string, request: CreatePtpRequest): Promise<PromiseToPay> {
    await this.simulateDelay();
    
    const ptp: PromiseToPay = {
      PtpId: `ptp_${caseId}_${Date.now()}`,
      CaseId: caseId,
      PromisedAmount: request.PromisedAmount,
      DueDate: request.DueDate,
      Status: "Open",
      CreatedAt: new Date().toISOString()
    };

    mockStore.addPtp(ptp);
    
    mockStore.addHistory({
      HistoryId: `history_${caseId}_ptp`,
      CaseId: caseId,
      When: ptp.CreatedAt,
      Type: "Activity",
      Title: "Promise to Pay Created",
      Body: `Promise to pay ${request.PromisedAmount} by ${request.DueDate}`
    });

    return ptp;
  }

  async closePtp(caseId: string, ptpId: string, request: ClosePtpRequest): Promise<PromiseToPay> {
    await this.simulateDelay();
    
    const closedAt = new Date().toISOString();
    mockStore.updatePtp(ptpId, { Status: request.Status, ClosedAt: closedAt });
    
    const ptp = mockStore.getPtps().find(p => p.PtpId === ptpId);
    if (!ptp) throw new Error('PTP not found');

    mockStore.addHistory({
      HistoryId: `history_${caseId}_ptp_closed`,
      CaseId: caseId,
      When: closedAt,
      Type: "Activity",
      Title: `Promise to Pay ${request.Status}`,
      Body: `Promise to pay marked as ${request.Status.toLowerCase()}`
    });

    return ptp;
  }

  // Finance
  async getCaseFinance(caseId: string): Promise<CaseFinance> {
    await this.simulateDelay();
    
    const finance = mockStore.getFinances().find(f => f.CaseId === caseId);
    if (!finance) throw new Error('Finance data not found');
    
    return finance;
  }

  async createPayment(caseId: string, request: CreatePaymentRequest): Promise<Payment> {
    await this.simulateDelay();
    
    const payment: Payment = {
      PaymentId: `payment_${caseId}_${Date.now()}`,
      CaseId: caseId,
      Amount: request.Amount,
      Currency: request.Currency,
      PaidAt: request.PaidAt,
      Method: request.Method,
      ExternalRef: request.ExternalRef,
      CreatedAt: new Date().toISOString()
    };

    mockStore.addPayment(payment);
    
    // Update finance
    const finance = mockStore.getFinances().find(f => f.CaseId === caseId);
    if (finance) {
      mockStore.updateFinance(caseId, {
        PaymentsTotal: finance.PaymentsTotal + request.Amount,
        OpenToPay: Math.max(0, finance.OpenToPay - request.Amount)
      });
    }
    
    mockStore.addHistory({
      HistoryId: `history_${caseId}_payment`,
      CaseId: caseId,
      When: payment.CreatedAt,
      Type: "Payment",
      Title: "Payment Received",
      Body: `Payment of ${request.Amount} ${request.Currency} received`
    });

    return payment;
  }

  // Documents
  async getCaseDocuments(caseId: string): Promise<CaseDocument[]> {
    await this.simulateDelay();
    
    return mockStore.getDocuments()
      .filter(d => d.CaseId === caseId)
      .sort((a, b) => new Date(b.UploadedAt).getTime() - new Date(a.UploadedAt).getTime());
  }

  async initDocumentUpload(caseId: string, request: DocumentUploadInitRequest): Promise<DocumentUploadInitResponse> {
    await this.simulateDelay();
    
    const storageKey = `documents/${caseId}/${Date.now()}_${request.FileName}`;
    const uploadUrl = `https://mock-storage.example.com/upload/${storageKey}`;
    
    return {
      UploadUrl: uploadUrl,
      StorageKey: storageKey
    };
  }

  async commitDocument(caseId: string, request: DocumentCommitRequest): Promise<CaseDocument> {
    await this.simulateDelay();
    
    const document: CaseDocument = {
      DocumentId: `doc_${caseId}_${Date.now()}`,
      CaseId: caseId,
      Type: "Other", // Would be determined from upload init
      FileName: request.StorageKey.split('/').pop() || 'unknown',
      MimeType: "application/pdf",
      StorageKey: request.StorageKey,
      Size: Math.floor(Math.random() * 1000000) + 10000,
      Version: 1,
      UploadedBy: "current_user",
      UploadedAt: new Date().toISOString(),
      Hash: Math.random().toString(36).substring(2, 15)
    };

    mockStore.addDocument(document);
    
    mockStore.addHistory({
      HistoryId: `history_${caseId}_document`,
      CaseId: caseId,
      When: document.UploadedAt,
      Type: "Document",
      Title: "Document Uploaded",
      Body: `Document ${document.FileName} uploaded`
    });

    return document;
  }

  // Import
  async importCases(request: ImportCasesRequest): Promise<ImportCasesResponse> {
    await this.simulateDelay(2000); // Longer delay for import
    
    // Mock validation results
    const accepted = Math.floor(request.RowCount * 0.85);
    const rejected = request.RowCount - accepted;
    const issues = rejected > 0 ? [
      "Missing required field: DebtorId",
      "Invalid email format",
      "Duplicate case number"
    ] : [];

    return {
      RowsAccepted: accepted,
      RowsRejected: rejected,
      Issues: issues
    };
  }

  // Saved Views
  async getSavedViews(): Promise<SavedView[]> {
    await this.simulateDelay();
    return mockStore.getSavedViews();
  }

  async createSavedView(name: string, filters: CaseFilters): Promise<SavedView> {
    await this.simulateDelay();
    
    const view: SavedView = {
      ViewId: `view_${Date.now()}`,
      Name: name,
      Filters: filters,
      CreatedAt: new Date().toISOString(),
      UpdatedAt: new Date().toISOString()
    };

    mockStore.addSavedView(view);
    return view;
  }

  // Helper method to simulate API delay
  private async simulateDelay(ms: number = 300): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const casesApi = new CasesApiAdapter();