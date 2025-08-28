# CollectPro - Professional Debt Collection Platform (Cases 2.0)

A comprehensive B2B debt collection platform with enhanced case management, workflows, activities, finance tracking, and GDPR compliance.

## 🚀 What's New in Cases 2.0

### Enhanced Case Management
- **Rich Workflows**: Soft → Field → Legal → Bailiff → Closed phases
- **Zone Management**: PreLegal, Legal, Bailiff zones with escalation approvals
- **Activity Tracking**: Comprehensive logging with SLA monitoring
- **Promise to Pay**: Full PTP lifecycle with kept/broken tracking
- **Financial Management**: Detailed breakdown with payment recording
- **Document Management**: Upload, versioning, and retention policies
- **Threaded Messaging**: Internal and client-visible communications

### Professional Features
- **Role-Based Access**: CLIENT, AGENT, ADMIN, DPO with granular permissions
- **Bulk Operations**: Multi-case assignment, labeling, and escalations
- **Saved Views**: Custom filter combinations for quick access
- **SLA Monitoring**: Overdue activity alerts and due date tracking
- **Audit Trail**: Complete case history with detailed event logging
- **GDPR Compliance**: Data retention policies and privacy controls

### .NET Migration Ready
- **PascalCase DTOs**: All data contracts ready for ASP.NET Core
- **OpenAPI Specification**: Complete API contract in `api-contract/openapi.yaml`
- **Mock API Adapter**: Single source of truth in `src/lib/api/casesApi.ts`
- **Type Safety**: Comprehensive TypeScript types in `src/types/cases.d.ts`

## 🏗️ Architecture

### Frontend Stack
- **React 18** with TypeScript
- **Vite** for development and building
- **Tailwind CSS** with custom design system
- **shadcn/ui** components
- **React Router** for navigation
- **React Query** for state management

### Data Layer
- **Mock API Adapter**: `src/lib/api/casesApi.ts`
- **TypeScript Types**: `src/types/cases.d.ts`
- **In-Memory Store**: No external dependencies
- **Deterministic IDs**: Consistent mock data generation

### API Contract
- **OpenAPI 3.0**: Complete specification for .NET backend
- **RESTful Design**: Standard HTTP methods and status codes
- **Consistent Responses**: Standardized error handling and pagination
- **PascalCase Properties**: .NET-friendly naming conventions

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Modern web browser

### Installation
```bash
# Clone the repository
git clone https://github.com/newappdaf-droid/DebtFromBolt.git
cd DebtFromBolt

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Configuration
Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

## 📋 Demo Credentials

Use these credentials to explore different user roles:

- **Client**: `client@example.com` / `password123`
- **Agent**: `agent@example.com` / `password123`
- **Admin**: `admin@example.com` / `password123`
- **DPO**: `dpo@example.com` / `password123`

## 🎯 Key Features

### Case Management
- **Multi-Phase Workflow**: Soft → Field → Legal → Bailiff → Closed
- **Zone-Based Processing**: PreLegal, Legal, Bailiff with approval gates
- **Smart Filtering**: Query, phase, zone, assignee, label, date range filters
- **Bulk Operations**: Multi-case assignment, labeling, escalation requests
- **Saved Views**: Store and recall custom filter combinations

### Activity & SLA Management
- **Activity Types**: Call, SMS, Email, Visit, Verification, Dispute, PTP, Other
- **Outcome Tracking**: Reached, NoAnswer, Promise, Paid, Dispute status
- **SLA Monitoring**: Due date tracking with overdue alerts
- **Promise to Pay**: Full lifecycle from creation to kept/broken status

### Financial Management
- **Comprehensive Breakdown**: Principal, fees, penalties, interest
- **Payment Recording**: Multiple methods with external references
- **Recovery Tracking**: Real-time progress and rate calculations
- **Currency Support**: EUR, USD, GBP with proper formatting

### Document Management
- **Type Classification**: Invoice, PoA, Court Filing, Proof of Payment, ID, Other
- **Upload Workflow**: Initialize → Upload → Commit pattern
- **Version Control**: Document versioning and history
- **Retention Policies**: GDPR-compliant data lifecycle management

### Communication System
- **Threaded Messages**: Organized conversation threads
- **Attachment Support**: File attachments with indicators
- **Read Status**: Message read tracking
- **@Mentions**: Team member notification system

## 🔧 Development

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── case/           # Case-specific components
│   ├── ui/             # shadcn/ui components
│   └── layout/         # Layout components
├── lib/
│   └── api/            # API adapters and mock implementations
├── pages/              # Route components
├── types/              # TypeScript type definitions
└── contexts/           # React contexts
```

### Key Files
- `src/lib/api/casesApi.ts` - Main API adapter with mock implementation
- `src/types/cases.d.ts` - .NET-ready type definitions
- `api-contract/openapi.yaml` - Complete API specification
- `src/pages/Cases.tsx` - Enhanced case list with filtering
- `src/pages/CaseDetail.tsx` - Comprehensive case detail view

### Mock Data
The application includes comprehensive mock data:
- **250+ Cases** with diverse phases, zones, and statuses
- **300+ Activities** with mixed types and outcomes
- **100+ Messages** in threaded conversations
- **50+ Documents** with various types and versions
- **50+ Payments** with different methods and currencies
- **30+ Escalation Requests** in various states

## 🔄 .NET Migration Notes

### Ready for Backend Integration
1. **API Contract**: Complete OpenAPI specification ready for ASP.NET Core
2. **Data Models**: PascalCase DTOs match C# conventions
3. **Endpoints**: RESTful design with standard HTTP patterns
4. **Error Handling**: Consistent error envelope structure
5. **Authentication**: JWT-ready with role-based access control

### Migration Checklist
- [ ] Set up ASP.NET Core Web API project
- [ ] Import OpenAPI specification
- [ ] Implement Entity Framework models
- [ ] Create controllers matching API contract
- [ ] Set up authentication and authorization
- [ ] Configure database and migrations
- [ ] Update frontend API base URL

### Environment Variables
```bash
VITE_API_BASE_URL=http://localhost:5000  # Update for .NET backend
VITE_USE_MOCK=false                      # Disable mocks for real API
```

## 📊 Features by Role

### Client Users
- View own cases and financial status
- Create new cases
- Track payment progress
- Access case communications
- Request escalations

### Collection Agents
- Manage assigned cases
- Log activities and outcomes
- Record payments and PTPs
- Communicate with debtors
- Request phase escalations

### Administrators
- Full system access
- User management
- Approve escalations
- Configure tariffs and templates
- System analytics

### Data Protection Officers
- GDPR request management
- Data retention oversight
- Privacy compliance monitoring
- Audit trail access

## 🛡️ Security & Compliance

- **GDPR Compliant**: Built-in privacy controls and data retention
- **Role-Based Access**: Granular permissions system
- **Audit Trail**: Complete activity logging
- **Data Minimization**: Configurable retention policies
- **Secure Authentication**: JWT-based with refresh tokens

## 📈 Performance

- **Optimized Rendering**: React 18 with concurrent features
- **Efficient Filtering**: Client-side filtering with server-side pagination ready
- **Responsive Design**: Mobile-first approach with desktop enhancements
- **Fast Navigation**: React Router with code splitting

## 🤝 Contributing

This project is ready for .NET backend integration. The frontend is feature-complete with mock data and can be extended as needed.

### Development Workflow
1. All data flows through `src/lib/api/casesApi.ts`
2. Types are defined in `src/types/cases.d.ts`
3. UI components are modular and reusable
4. Mock data provides realistic testing scenarios

---

**Built with BOLT** | **Ready for .NET** | **Enterprise Grade**