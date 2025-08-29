// Mock AI Agent for CollectPro Platform
// Simulates intelligent responses for debt collection platform queries

import { AIResponse, AIContext, SuggestedAction } from '@/types/ai';

interface MockResponse {
  keywords: string[];
  response: string;
  confidence: number;
  sources?: string[];
  suggestedActions?: SuggestedAction[];
  followUpQuestions?: string[];
}

const mockResponses: MockResponse[] = [
  // Case Management
  {
    keywords: ['case', 'create', 'new', 'add'],
    response: 'To create a new case in CollectPro, navigate to the Cases section and click "New Case". You\'ll need to provide debtor information, debt amount, and supporting documentation. The system will automatically generate a case reference and assign it based on your configured rules.',
    confidence: 0.95,
    sources: ['Cases Documentation', 'User Guide'],
    suggestedActions: [
      { id: '1', label: 'Create New Case', action: 'navigate', value: '/cases/new', icon: 'Plus' },
      { id: '2', label: 'View Cases List', action: 'navigate', value: '/cases', icon: 'FileText' }
    ],
    followUpQuestions: [
      'How do I assign a case to an agent?',
      'What information is required for case creation?',
      'How do I upload supporting documents?'
    ]
  },
  
  // GDPR Compliance
  {
    keywords: ['gdpr', 'privacy', 'data protection', 'consent', 'erasure'],
    response: 'CollectPro is fully GDPR compliant. You can manage data subject requests through the GDPR Requests section. The platform supports all GDPR rights including access, rectification, erasure, portability, and objection. All data processing is logged for audit purposes.',
    confidence: 0.98,
    sources: ['GDPR Compliance Guide', 'Privacy Policy'],
    suggestedActions: [
      { id: '1', label: 'View GDPR Requests', action: 'navigate', value: '/gdpr-requests', icon: 'Shield' },
      { id: '2', label: 'Data Protection Settings', action: 'navigate', value: '/settings', icon: 'Settings' }
    ],
    followUpQuestions: [
      'How do I handle a data erasure request?',
      'What is the data retention policy?',
      'How do I export personal data?'
    ]
  },
  
  // User Management
  {
    keywords: ['user', 'role', 'permission', 'access', 'admin'],
    response: 'CollectPro uses role-based access control with four main roles: CLIENT (view own cases), AGENT (manage assigned cases), ADMIN (full system access), and DPO (data protection oversight). Admins can manage users through the User Management section.',
    confidence: 0.92,
    sources: ['User Management Guide', 'Security Documentation'],
    suggestedActions: [
      { id: '1', label: 'Manage Users', action: 'navigate', value: '/admin/users', icon: 'Users' },
      { id: '2', label: 'View Profile', action: 'navigate', value: '/profile', icon: 'User' }
    ],
    followUpQuestions: [
      'How do I create a new user account?',
      'What permissions does each role have?',
      'How do I reset a user\'s password?'
    ]
  },
  
  // Financial Management
  {
    keywords: ['invoice', 'payment', 'fee', 'tariff', 'billing'],
    response: 'The platform handles all financial aspects including invoice generation, payment tracking, and fee calculations. Tariffs can be configured with percentage-based, fixed, or tiered pricing structures. All financial data is tracked with full audit trails.',
    confidence: 0.90,
    sources: ['Financial Management Guide', 'Tariff Configuration'],
    suggestedActions: [
      { id: '1', label: 'View Invoices', action: 'navigate', value: '/invoices', icon: 'CreditCard' },
      { id: '2', label: 'Manage Tariffs', action: 'navigate', value: '/admin/tariffs', icon: 'Calculator' }
    ],
    followUpQuestions: [
      'How do I configure collection fees?',
      'How do I record a payment?',
      'How do I generate an invoice?'
    ]
  },
  
  // Workflow and Processes
  {
    keywords: ['workflow', 'process', 'escalation', 'legal', 'approval'],
    response: 'CollectPro follows a structured workflow: Soft Collection → Field Collection → Legal Action → Bailiff Action → Closed. Each phase requires appropriate approvals and documentation. The system tracks all activities and maintains compliance with collection regulations.',
    confidence: 0.94,
    sources: ['Workflow Guide', 'Process Documentation'],
    suggestedActions: [
      { id: '1', label: 'View Approvals', action: 'navigate', value: '/approvals', icon: 'CheckSquare' },
      { id: '2', label: 'Dashboard Overview', action: 'navigate', value: '/dashboard', icon: 'LayoutDashboard' }
    ],
    followUpQuestions: [
      'How do I request legal escalation?',
      'What approvals are required for each phase?',
      'How do I track case progress?'
    ]
  },
  
  // Communication
  {
    keywords: ['message', 'communication', 'email', 'template', 'contact'],
    response: 'The platform provides comprehensive communication tools including message templates, automated notifications, and threaded conversations. All communications are logged for compliance and can be customized based on your requirements.',
    confidence: 0.88,
    sources: ['Communication Guide', 'Template Management'],
    suggestedActions: [
      { id: '1', label: 'View Communications', action: 'navigate', value: '/communications', icon: 'MessageSquare' },
      { id: '2', label: 'Manage Templates', action: 'navigate', value: '/admin/templates', icon: 'FileText' }
    ],
    followUpQuestions: [
      'How do I create a message template?',
      'How do I send bulk communications?',
      'How do I track message delivery?'
    ]
  },
  
  // Technical Support
  {
    keywords: ['help', 'support', 'error', 'bug', 'issue', 'problem'],
    response: 'For technical support, you can access the help documentation, contact your system administrator, or reach out to CollectPro support. The platform includes comprehensive logging and error tracking to help diagnose issues quickly.',
    confidence: 0.85,
    sources: ['Support Documentation', 'Troubleshooting Guide'],
    suggestedActions: [
      { id: '1', label: 'View Settings', action: 'navigate', value: '/settings', icon: 'Settings' },
      { id: '2', label: 'Contact Support', action: 'execute', value: 'mailto:support@collectpro.com', icon: 'Mail' }
    ],
    followUpQuestions: [
      'How do I report a bug?',
      'Where can I find system logs?',
      'How do I contact technical support?'
    ]
  },
  
  // General Platform
  {
    keywords: ['dashboard', 'overview', 'statistics', 'metrics', 'performance'],
    response: 'The dashboard provides a comprehensive overview of your collection activities, including case statistics, recovery rates, pending actions, and performance metrics. The view is customized based on your role and permissions.',
    confidence: 0.93,
    sources: ['Dashboard Guide', 'Analytics Documentation'],
    suggestedActions: [
      { id: '1', label: 'View Dashboard', action: 'navigate', value: '/dashboard', icon: 'LayoutDashboard' },
      { id: '2', label: 'Export Reports', action: 'execute', value: 'export_dashboard', icon: 'Download' }
    ],
    followUpQuestions: [
      'How do I customize my dashboard?',
      'How do I export performance reports?',
      'What metrics are available?'
    ]
  }
];

export class MockAIAgent {
  private context: AIContext;

  constructor(context: AIContext) {
    this.context = context;
  }

  async generateResponse(query: string): Promise<AIResponse> {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const normalizedQuery = query.toLowerCase();
    
    // Find best matching response
    let bestMatch: MockResponse | null = null;
    let bestScore = 0;

    for (const response of mockResponses) {
      const score = this.calculateMatchScore(normalizedQuery, response.keywords);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = response;
      }
    }

    // If no good match found, provide a helpful fallback
    if (!bestMatch || bestScore < 0.3) {
      return this.getFallbackResponse(query);
    }

    // Filter suggested actions based on user permissions
    const filteredActions = bestMatch.suggestedActions?.filter(action => 
      this.canUserAccessAction(action)
    ) || [];

    return {
      content: this.personalizeResponse(bestMatch.response),
      confidence: bestMatch.confidence * bestScore,
      sources: bestMatch.sources,
      suggestedActions: filteredActions,
      followUpQuestions: bestMatch.followUpQuestions
    };
  }

  private calculateMatchScore(query: string, keywords: string[]): number {
    let score = 0;
    const queryWords = query.split(' ');
    
    for (const keyword of keywords) {
      if (query.includes(keyword)) {
        score += 0.8; // Exact match
      } else {
        // Check for partial matches
        for (const word of queryWords) {
          if (word.includes(keyword) || keyword.includes(word)) {
            score += 0.3;
          }
        }
      }
    }
    
    return Math.min(1, score / keywords.length);
  }

  private personalizeResponse(response: string): string {
    // Personalize based on user role
    const roleSpecificInfo = {
      CLIENT: 'As a client, you have access to your cases and invoices.',
      AGENT: 'As a collection agent, you can manage assigned cases and activities.',
      ADMIN: 'As an administrator, you have full system access and management capabilities.',
      DPO: 'As a Data Protection Officer, you can manage GDPR compliance and data privacy.'
    };

    const roleInfo = roleSpecificInfo[this.context.userRole as keyof typeof roleSpecificInfo];
    
    if (roleInfo) {
      return `${response}\n\n${roleInfo}`;
    }
    
    return response;
  }

  private canUserAccessAction(action: SuggestedAction): boolean {
    // Check if user has permission for the suggested action
    const restrictedPaths = {
      '/admin/users': ['ADMIN'],
      '/admin/tariffs': ['ADMIN'],
      '/admin/templates': ['ADMIN'],
      '/gdpr-requests': ['DPO', 'ADMIN'],
      '/cases/new': ['CLIENT', 'ADMIN']
    };

    if (action.action === 'navigate') {
      const requiredRoles = restrictedPaths[action.value as keyof typeof restrictedPaths];
      if (requiredRoles) {
        return requiredRoles.includes(this.context.userRole);
      }
    }

    return true; // Allow by default
  }

  private getFallbackResponse(query: string): AIResponse {
    const fallbackResponses = [
      "I understand you're asking about the CollectPro platform. While I don't have a specific answer for that question, I can help you navigate to the relevant section or connect you with support.",
      "That's an interesting question about the debt collection platform. Let me suggest some resources that might help you find the information you're looking for.",
      "I'm here to help with CollectPro-related questions. Could you provide more details about what you're trying to accomplish?"
    ];

    const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];

    return {
      content: randomResponse,
      confidence: 0.4,
      sources: ['General Help'],
      suggestedActions: [
        { id: '1', label: 'View Dashboard', action: 'navigate', value: '/dashboard', icon: 'LayoutDashboard' },
        { id: '2', label: 'Browse Cases', action: 'navigate', value: '/cases', icon: 'FileText' },
        { id: '3', label: 'Contact Support', action: 'execute', value: 'mailto:support@collectpro.com', icon: 'Mail' }
      ],
      followUpQuestions: [
        'How do I get started with the platform?',
        'What can I do with my current role?',
        'Where can I find help documentation?'
      ]
    };
  }
}

// Factory function to create AI agent with current context
export function createAIAgent(context: AIContext): MockAIAgent {
  return new MockAIAgent(context);
}