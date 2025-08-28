// Professional B2B Client Onboarding Process
// Comprehensive multi-step application with legal compliance and GDPR framework

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Building2, User, Shield, FileText, CheckCircle, ArrowLeft, ArrowRight,
  Upload, Download, Eye, AlertTriangle, Phone, Mail, MapPin, Globe,
  CreditCard, Scale, Users, Calendar, TrendingUp, Award, Lock,
  Briefcase, Target, Database, Clock, Settings, Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Form data interface
interface OnboardingFormData {
  // Company Information
  companyName: string;
  businessType: string;
  incorporationCountry: string;
  registrationNumber: string;
  vatNumber: string;
  taxId: string;
  industry: string;
  businessDescription: string;
  websiteUrl: string;
  
  // Business Address
  businessAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  
  // Business Profile
  annualRevenueRange: string;
  employeeCountRange: string;
  yearsInBusiness: number;
  expectedMonthlyCases: number;
  expectedAverageCaseValue: number;
  primaryDebtorTypes: string[];
  
  // Primary Contact
  primaryContactName: string;
  primaryContactEmail: string;
  primaryContactPhone: string;
  primaryContactJobTitle: string;
  
  // Secondary Contact
  secondaryContactName: string;
  secondaryContactEmail: string;
  secondaryContactPhone: string;
  secondaryContactJobTitle: string;
  
  // GDPR Representative
  gdprRepresentativeName: string;
  gdprRepresentativeEmail: string;
  gdprRepresentativePhone: string;
  
  // Data Protection Officer
  dpoName: string;
  dpoEmail: string;
  dpoPhone: string;
  
  // Banking Information
  bankName: string;
  bankCountry: string;
  bankIban: string;
  bankSwift: string;
  accountHolderName: string;
  
  // Legal Agreements
  termsAccepted: boolean;
  privacyPolicyAccepted: boolean;
  serviceAgreementAccepted: boolean;
  
  // GDPR Consents
  gdprConsents: {
    purpose: string;
    lawfulBasis: string;
    consentGiven: boolean;
  }[];
  
  // Application Notes
  applicantNotes: string;
}

const STEPS = [
  { id: 'company', title: 'Company Information', icon: Building2 },
  { id: 'contacts', title: 'Contact Details', icon: User },
  { id: 'business', title: 'Business Profile', icon: Briefcase },
  { id: 'banking', title: 'Banking Details', icon: CreditCard },
  { id: 'gdpr', title: 'GDPR Compliance', icon: Shield },
  { id: 'agreements', title: 'Legal Agreements', icon: FileText },
  { id: 'documents', title: 'Document Verification', icon: Upload },
  { id: 'review', title: 'Review & Submit', icon: CheckCircle }
];

const COUNTRIES = [
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'BE', name: 'Belgium' },
  { code: 'AT', name: 'Austria' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'US', name: 'United States' },
];

const BUSINESS_TYPES = [
  { value: 'sole_proprietorship', label: 'Sole Proprietorship' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'limited_liability', label: 'Limited Liability Company' },
  { value: 'corporation', label: 'Corporation' },
  { value: 'other', label: 'Other' }
];

const INDUSTRIES = [
  'Financial Services', 'Healthcare', 'Technology', 'Manufacturing',
  'Retail', 'Construction', 'Professional Services', 'Real Estate',
  'Transportation', 'Education', 'Government', 'Non-Profit', 'Other'
];

const REVENUE_RANGES = [
  'Under €100K', '€100K - €500K', '€500K - €1M', '€1M - €5M',
  '€5M - €10M', '€10M - €50M', 'Over €50M'
];

const EMPLOYEE_RANGES = [
  '1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'
];

const DEBTOR_TYPES = [
  'B2B Commercial', 'B2C Consumer', 'Government/Public Sector', 
  'Healthcare', 'Financial Services', 'Mixed Portfolio'
];

const GDPR_PURPOSES = [
  { value: 'debt_collection', label: 'Debt Collection Services', required: true },
  { value: 'client_management', label: 'Client Relationship Management', required: true },
  { value: 'communication', label: 'Business Communications', required: true },
  { value: 'legal_compliance', label: 'Legal and Regulatory Compliance', required: true },
  { value: 'analytics', label: 'Business Analytics and Reporting', required: false }
];

const LAWFUL_BASIS_OPTIONS = [
  { 
    value: 'contract', 
    label: 'Performance of Contract',
    description: 'Processing necessary for contract performance or pre-contractual steps'
  },
  { 
    value: 'legal_obligation', 
    label: 'Legal Obligation',
    description: 'Processing required to comply with legal obligations'
  },
  { 
    value: 'legitimate_interests', 
    label: 'Legitimate Interests',
    description: 'Processing necessary for legitimate business interests'
  }
];

// Legal document content
const TERMS_OF_SERVICE = `
COLLECTPRO TERMS OF SERVICE

1. DEFINITIONS
"Service" means the debt collection platform and related services provided by CollectPro.
"Client" means the business entity entering into this agreement.
"Debtor" means individuals or entities owing money to the Client.

2. SERVICE PROVISION
2.1 CollectPro will provide professional debt collection services in accordance with applicable laws.
2.2 Services include case management, debtor communication, legal escalation, and reporting.
2.3 All collection activities will comply with local debt collection regulations.

3. CLIENT OBLIGATIONS
3.1 Client warrants that all submitted debts are valid and legally enforceable.
3.2 Client must provide accurate debtor information and supporting documentation.
3.3 Client agrees to cooperate with collection efforts and provide requested information.

4. FEES AND PAYMENT
4.1 Collection fees are calculated according to the agreed tariff structure.
4.2 Fees are payable upon successful collection or as otherwise agreed.
4.3 Additional costs may apply for legal proceedings or specialized services.

5. DATA PROTECTION
5.1 Both parties will comply with applicable data protection laws including GDPR.
5.2 Personal data will be processed only for legitimate collection purposes.
5.3 Data retention periods will be observed as per regulatory requirements.

6. LIMITATION OF LIABILITY
6.1 CollectPro's liability is limited to the fees paid for services.
6.2 CollectPro is not liable for debtor insolvency or inability to pay.

7. TERMINATION
7.1 Either party may terminate with 30 days written notice.
7.2 Outstanding obligations survive termination.

By accepting these terms, you acknowledge that you have read, understood, and agree to be bound by these terms and conditions.
`;

const PRIVACY_POLICY = `
COLLECTPRO PRIVACY POLICY

1. INTRODUCTION
This Privacy Policy explains how CollectPro processes personal data in connection with our debt collection services.

2. DATA CONTROLLER
CollectPro Ltd acts as data controller for client data and as data processor for debtor data on behalf of clients.

3. DATA WE COLLECT
3.1 Client Data: Company information, contact details, banking information
3.2 Debtor Data: Contact information, financial data, communication records
3.3 Technical Data: IP addresses, browser information, usage analytics

4. LAWFUL BASIS FOR PROCESSING
4.1 Contract performance for service delivery
4.2 Legal obligations for regulatory compliance
4.3 Legitimate interests for business operations

5. DATA SHARING
5.1 Data may be shared with legal representatives, courts, and regulatory bodies
5.2 Third-party service providers under strict confidentiality agreements
5.3 No data is sold or used for marketing purposes

6. DATA RETENTION
6.1 Client data: Retained for duration of business relationship plus 7 years
6.2 Debtor data: Retained as per client instructions and legal requirements
6.3 Communication records: 3 years from last contact

7. YOUR RIGHTS
7.1 Access to your personal data
7.2 Rectification of inaccurate data
7.3 Erasure in certain circumstances
7.4 Data portability
7.5 Object to processing

8. SECURITY MEASURES
8.1 Encryption of data in transit and at rest
8.2 Access controls and authentication
8.3 Regular security audits and monitoring

9. INTERNATIONAL TRANSFERS
Data may be transferred to countries with adequate protection or under appropriate safeguards.

10. CONTACT INFORMATION
Data Protection Officer: dpo@collectpro.com
For privacy inquiries: privacy@collectpro.com
`;

const SERVICE_AGREEMENT = `
COLLECTPRO SERVICE AGREEMENT

1. SCOPE OF SERVICES
1.1 Debt Collection Services
- Pre-legal collection activities
- Debtor contact and negotiation
- Payment plan arrangements
- Settlement negotiations

1.2 Legal Services (where applicable)
- Legal demand letters
- Court proceedings initiation
- Enforcement actions
- Legal representation

1.3 Technology Platform
- Case management system
- Real-time reporting and analytics
- Secure document storage
- Communication tracking

2. SERVICE LEVELS
2.1 Standard Service
- Initial contact within 48 hours
- Weekly progress updates
- Monthly detailed reporting
- Standard collection procedures

2.2 Premium Service
- Initial contact within 24 hours
- Daily progress updates
- Real-time reporting access
- Expedited legal escalation

3. FEE STRUCTURE
3.1 Collection Fees
- Percentage-based fees on recovered amounts
- Minimum and maximum fee thresholds
- No upfront costs for standard cases

3.2 Legal Fees
- Court filing fees
- Legal representation costs
- Enforcement action expenses

3.3 Additional Services
- Skip tracing services
- Asset investigation
- International collection

4. PERFORMANCE STANDARDS
4.1 Collection Targets
- Industry-standard recovery rates
- Defined timeframes for each phase
- Quality assurance monitoring

4.2 Compliance Standards
- Full regulatory compliance
- GDPR data protection
- Industry best practices

5. REPORTING AND TRANSPARENCY
5.1 Regular Reporting
- Case status updates
- Financial summaries
- Performance metrics

5.2 Platform Access
- 24/7 online portal access
- Real-time case tracking
- Document management

6. TERMINATION
6.1 Either party may terminate with 30 days notice
6.2 Outstanding cases will be completed or transferred
6.3 Final reporting and account settlement

By accepting this agreement, you confirm your understanding and acceptance of these service terms.
`;

export default function Onboarding() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  
  const [currentStep, setCurrentStep] = useState(0);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<OnboardingFormData>({
    // Company Information
    companyName: '',
    businessType: '',
    incorporationCountry: 'DE',
    registrationNumber: '',
    vatNumber: '',
    taxId: '',
    industry: '',
    businessDescription: '',
    websiteUrl: '',
    
    // Business Address
    businessAddress: {
      street: '',
      city: '',
      postalCode: '',
      country: 'DE'
    },
    
    // Business Profile
    annualRevenueRange: '',
    employeeCountRange: '',
    yearsInBusiness: 0,
    expectedMonthlyCases: 0,
    expectedAverageCaseValue: 0,
    primaryDebtorTypes: [],
    
    // Primary Contact
    primaryContactName: '',
    primaryContactEmail: email,
    primaryContactPhone: '',
    primaryContactJobTitle: '',
    
    // Secondary Contact
    secondaryContactName: '',
    secondaryContactEmail: '',
    secondaryContactPhone: '',
    secondaryContactJobTitle: '',
    
    // GDPR Representative
    gdprRepresentativeName: '',
    gdprRepresentativeEmail: '',
    gdprRepresentativePhone: '',
    
    // Data Protection Officer
    dpoName: '',
    dpoEmail: '',
    dpoPhone: '',
    
    // Banking Information
    bankName: '',
    bankCountry: 'DE',
    bankIban: '',
    bankSwift: '',
    accountHolderName: '',
    
    // Legal Agreements
    termsAccepted: false,
    privacyPolicyAccepted: false,
    serviceAgreementAccepted: false,
    
    // GDPR Consents
    gdprConsents: GDPR_PURPOSES.map(purpose => ({
      purpose: purpose.value,
      lawfulBasis: 'contract',
      consentGiven: purpose.required
    })),
    
    // Application Notes
    applicantNotes: ''
  });

  const validateStep = (stepIndex: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (stepIndex) {
      case 0: // Company Information
        if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
        if (!formData.businessType) newErrors.businessType = 'Business type is required';
        if (!formData.incorporationCountry) newErrors.incorporationCountry = 'Incorporation country is required';
        if (!formData.industry) newErrors.industry = 'Industry is required';
        if (!formData.businessDescription.trim()) newErrors.businessDescription = 'Business description is required';
        break;
        
      case 1: // Contact Details
        if (!formData.primaryContactName.trim()) newErrors.primaryContactName = 'Primary contact name is required';
        if (!formData.primaryContactEmail.trim()) newErrors.primaryContactEmail = 'Primary contact email is required';
        if (!formData.primaryContactJobTitle.trim()) newErrors.primaryContactJobTitle = 'Job title is required';
        if (!formData.businessAddress.street.trim()) newErrors['businessAddress.street'] = 'Street address is required';
        if (!formData.businessAddress.city.trim()) newErrors['businessAddress.city'] = 'City is required';
        if (!formData.businessAddress.country) newErrors['businessAddress.country'] = 'Country is required';
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (formData.primaryContactEmail && !emailRegex.test(formData.primaryContactEmail)) {
          newErrors.primaryContactEmail = 'Please enter a valid email address';
        }
        break;
        
      case 2: // Business Profile
        if (!formData.annualRevenueRange) newErrors.annualRevenueRange = 'Annual revenue range is required';
        if (!formData.employeeCountRange) newErrors.employeeCountRange = 'Employee count is required';
        if (!formData.yearsInBusiness || formData.yearsInBusiness < 0) newErrors.yearsInBusiness = 'Years in business is required';
        if (!formData.expectedMonthlyCases || formData.expectedMonthlyCases < 1) newErrors.expectedMonthlyCases = 'Expected monthly cases is required';
        if (!formData.expectedAverageCaseValue || formData.expectedAverageCaseValue < 1) newErrors.expectedAverageCaseValue = 'Expected average case value is required';
        if (formData.primaryDebtorTypes.length === 0) newErrors.primaryDebtorTypes = 'Please select at least one debtor type';
        break;
        
      case 3: // Banking Details
        if (!formData.bankName.trim()) newErrors.bankName = 'Bank name is required';
        if (!formData.bankCountry) newErrors.bankCountry = 'Bank country is required';
        if (!formData.bankIban.trim()) newErrors.bankIban = 'IBAN is required';
        if (!formData.accountHolderName.trim()) newErrors.accountHolderName = 'Account holder name is required';
        break;
        
      case 4: // GDPR Compliance
        if (!formData.gdprRepresentativeName.trim()) newErrors.gdprRepresentativeName = 'GDPR representative name is required';
        if (!formData.gdprRepresentativeEmail.trim()) newErrors.gdprRepresentativeEmail = 'GDPR representative email is required';
        break;
        
      case 5: // Legal Agreements
        if (!formData.termsAccepted) newErrors.termsAccepted = 'You must accept the Terms of Service';
        if (!formData.privacyPolicyAccepted) newErrors.privacyPolicyAccepted = 'You must accept the Privacy Policy';
        if (!formData.serviceAgreementAccepted) newErrors.serviceAgreementAccepted = 'You must accept the Service Agreement';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(STEPS.length - 1, prev + 1));
    } else {
      toast.error('Please fix the form errors before continuing');
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof OnboardingFormData] as any),
          [child]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }

    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleDebtorTypeToggle = (type: string) => {
    const currentTypes = formData.primaryDebtorTypes;
    if (currentTypes.includes(type)) {
      handleInputChange('primaryDebtorTypes', currentTypes.filter(t => t !== type));
    } else {
      handleInputChange('primaryDebtorTypes', [...currentTypes, type]);
    }
  };

  const handleGdprConsentChange = (purposeValue: string, field: string, value: any) => {
    const updatedConsents = formData.gdprConsents.map(consent =>
      consent.purpose === purposeValue
        ? { ...consent, [field]: value }
        : consent
    );
    handleInputChange('gdprConsents', updatedConsents);
  };

  const saveApplication = async () => {
    try {
      const applicationData = {
        company_name: formData.companyName,
        business_type: formData.businessType,
        incorporation_country: formData.incorporationCountry,
        registration_number: formData.registrationNumber || null,
        vat_number: formData.vatNumber || null,
        tax_id: formData.taxId || null,
        industry: formData.industry,
        business_description: formData.businessDescription,
        website_url: formData.websiteUrl || null,
        business_address: formData.businessAddress,
        annual_revenue_range: formData.annualRevenueRange,
        employee_count_range: formData.employeeCountRange,
        years_in_business: formData.yearsInBusiness,
        expected_monthly_cases: formData.expectedMonthlyCases,
        expected_average_case_value: formData.expectedAverageCaseValue,
        primary_debtor_types: formData.primaryDebtorTypes,
        primary_contact_name: formData.primaryContactName,
        primary_contact_email: formData.primaryContactEmail,
        primary_contact_phone: formData.primaryContactPhone || null,
        primary_contact_job_title: formData.primaryContactJobTitle,
        secondary_contact_name: formData.secondaryContactName || null,
        secondary_contact_email: formData.secondaryContactEmail || null,
        secondary_contact_phone: formData.secondaryContactPhone || null,
        secondary_contact_job_title: formData.secondaryContactJobTitle || null,
        gdpr_representative_name: formData.gdprRepresentativeName,
        gdpr_representative_email: formData.gdprRepresentativeEmail,
        gdpr_representative_phone: formData.gdprRepresentativePhone || null,
        dpo_name: formData.dpoName || null,
        dpo_email: formData.dpoEmail || null,
        dpo_phone: formData.dpoPhone || null,
        bank_name: formData.bankName,
        bank_country: formData.bankCountry,
        bank_iban: formData.bankIban,
        bank_swift: formData.bankSwift || null,
        account_holder_name: formData.accountHolderName,
        terms_accepted: formData.termsAccepted,
        terms_accepted_at: formData.termsAccepted ? new Date().toISOString() : null,
        terms_version: '1.0',
        privacy_policy_accepted: formData.privacyPolicyAccepted,
        privacy_policy_accepted_at: formData.privacyPolicyAccepted ? new Date().toISOString() : null,
        privacy_policy_version: '1.0',
        service_agreement_accepted: formData.serviceAgreementAccepted,
        service_agreement_accepted_at: formData.serviceAgreementAccepted ? new Date().toISOString() : null,
        service_agreement_version: '1.0',
        applicant_notes: formData.applicantNotes || null,
        status: 'draft'
      };

      if (applicationId) {
        // Update existing application
        const { error } = await supabase
          .from('client_applications')
          .update(applicationData)
          .eq('id', applicationId);
        
        if (error) throw error;
      } else {
        // Create new application
        const { data, error } = await supabase
          .from('client_applications')
          .insert(applicationData)
          .select()
          .single();
        
        if (error) throw error;
        setApplicationId(data.id);
      }
    } catch (error) {
      console.error('Error saving application:', error);
      throw error;
    }
  };

  const submitApplication = async () => {
    if (!validateStep(currentStep)) {
      toast.error('Please fix all form errors before submitting');
      return;
    }

    setIsSubmitting(true);

    try {
      // Save application data
      await saveApplication();

      // Submit application for review
      const { error: submitError } = await supabase
        .from('client_applications')
        .update({
          status: 'submitted',
          submitted_at: new Date().toISOString()
        })
        .eq('id', applicationId);

      if (submitError) throw submitError;

      // Save GDPR consents
      const consentData = formData.gdprConsents.map(consent => ({
        application_id: applicationId,
        purpose: consent.purpose,
        lawful_basis: consent.lawfulBasis,
        consent_given: consent.consentGiven,
        consent_text: `Consent for ${consent.purpose} processing under ${consent.lawfulBasis} lawful basis`,
        consent_version: '1.0',
        ip_address: null, // Would be captured in real implementation
        user_agent: navigator.userAgent
      }));

      const { error: consentError } = await supabase
        .from('gdpr_consents')
        .insert(consentData);

      if (consentError) throw consentError;

      toast.success('Application submitted successfully!');
      
      // Redirect to confirmation page
      navigate('/login?message=application_submitted');
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Company Information
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Building2 className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold">Company Information</h2>
              <p className="text-muted-foreground">Tell us about your business entity</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="companyName">Legal Company Name <span className="text-destructive">*</span></Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  placeholder="ACME Corporation Ltd"
                  className={errors.companyName ? 'border-destructive' : ''}
                />
                {errors.companyName && <p className="text-sm text-destructive mt-1">{errors.companyName}</p>}
              </div>

              <div>
                <Label htmlFor="businessType">Business Type <span className="text-destructive">*</span></Label>
                <Select value={formData.businessType} onValueChange={(value) => handleInputChange('businessType', value)}>
                  <SelectTrigger className={errors.businessType ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select business type" />
                  </SelectTrigger>
                  <SelectContent>
                    {BUSINESS_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.businessType && <p className="text-sm text-destructive mt-1">{errors.businessType}</p>}
              </div>

              <div>
                <Label htmlFor="incorporationCountry">Incorporation Country <span className="text-destructive">*</span></Label>
                <Select value={formData.incorporationCountry} onValueChange={(value) => handleInputChange('incorporationCountry', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="industry">Industry <span className="text-destructive">*</span></Label>
                <Select value={formData.industry} onValueChange={(value) => handleInputChange('industry', value)}>
                  <SelectTrigger className={errors.industry ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.industry && <p className="text-sm text-destructive mt-1">{errors.industry}</p>}
              </div>

              <div>
                <Label htmlFor="registrationNumber">Company Registration Number</Label>
                <Input
                  id="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
                  placeholder="12345678"
                />
              </div>

              <div>
                <Label htmlFor="vatNumber">VAT Number</Label>
                <Input
                  id="vatNumber"
                  value={formData.vatNumber}
                  onChange={(e) => handleInputChange('vatNumber', e.target.value)}
                  placeholder="DE123456789"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="businessDescription">Business Description <span className="text-destructive">*</span></Label>
              <Textarea
                id="businessDescription"
                value={formData.businessDescription}
                onChange={(e) => handleInputChange('businessDescription', e.target.value)}
                placeholder="Describe your business activities, target markets, and services..."
                rows={4}
                className={errors.businessDescription ? 'border-destructive' : ''}
              />
              {errors.businessDescription && <p className="text-sm text-destructive mt-1">{errors.businessDescription}</p>}
            </div>

            <div>
              <Label htmlFor="websiteUrl">Company Website</Label>
              <Input
                id="websiteUrl"
                value={formData.websiteUrl}
                onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
                placeholder="https://www.yourcompany.com"
              />
            </div>
          </div>
        );

      case 1: // Contact Details
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <User className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold">Contact Information</h2>
              <p className="text-muted-foreground">Provide your business contact details</p>
            </div>

            {/* Business Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Business Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="street">Street Address <span className="text-destructive">*</span></Label>
                  <Input
                    id="street"
                    value={formData.businessAddress.street}
                    onChange={(e) => handleInputChange('businessAddress.street', e.target.value)}
                    placeholder="123 Business Street"
                    className={errors['businessAddress.street'] ? 'border-destructive' : ''}
                  />
                  {errors['businessAddress.street'] && <p className="text-sm text-destructive mt-1">{errors['businessAddress.street']}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City <span className="text-destructive">*</span></Label>
                    <Input
                      id="city"
                      value={formData.businessAddress.city}
                      onChange={(e) => handleInputChange('businessAddress.city', e.target.value)}
                      placeholder="Berlin"
                      className={errors['businessAddress.city'] ? 'border-destructive' : ''}
                    />
                    {errors['businessAddress.city'] && <p className="text-sm text-destructive mt-1">{errors['businessAddress.city']}</p>}
                  </div>

                  <div>
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      value={formData.businessAddress.postalCode}
                      onChange={(e) => handleInputChange('businessAddress.postalCode', e.target.value)}
                      placeholder="10115"
                    />
                  </div>

                  <div>
                    <Label htmlFor="addressCountry">Country <span className="text-destructive">*</span></Label>
                    <Select value={formData.businessAddress.country} onValueChange={(value) => handleInputChange('businessAddress.country', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Primary Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Primary Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="primaryContactName">Full Name <span className="text-destructive">*</span></Label>
                    <Input
                      id="primaryContactName"
                      value={formData.primaryContactName}
                      onChange={(e) => handleInputChange('primaryContactName', e.target.value)}
                      placeholder="John Smith"
                      className={errors.primaryContactName ? 'border-destructive' : ''}
                    />
                    {errors.primaryContactName && <p className="text-sm text-destructive mt-1">{errors.primaryContactName}</p>}
                  </div>

                  <div>
                    <Label htmlFor="primaryContactJobTitle">Job Title <span className="text-destructive">*</span></Label>
                    <Input
                      id="primaryContactJobTitle"
                      value={formData.primaryContactJobTitle}
                      onChange={(e) => handleInputChange('primaryContactJobTitle', e.target.value)}
                      placeholder="Chief Financial Officer"
                      className={errors.primaryContactJobTitle ? 'border-destructive' : ''}
                    />
                    {errors.primaryContactJobTitle && <p className="text-sm text-destructive mt-1">{errors.primaryContactJobTitle}</p>}
                  </div>

                  <div>
                    <Label htmlFor="primaryContactEmail">Business Email <span className="text-destructive">*</span></Label>
                    <Input
                      id="primaryContactEmail"
                      type="email"
                      value={formData.primaryContactEmail}
                      onChange={(e) => handleInputChange('primaryContactEmail', e.target.value)}
                      placeholder="john.smith@company.com"
                      className={errors.primaryContactEmail ? 'border-destructive' : ''}
                    />
                    {errors.primaryContactEmail && <p className="text-sm text-destructive mt-1">{errors.primaryContactEmail}</p>}
                  </div>

                  <div>
                    <Label htmlFor="primaryContactPhone">Phone Number</Label>
                    <Input
                      id="primaryContactPhone"
                      value={formData.primaryContactPhone}
                      onChange={(e) => handleInputChange('primaryContactPhone', e.target.value)}
                      placeholder="+49 30 12345678"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Secondary Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Secondary Contact (Optional)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="secondaryContactName">Full Name</Label>
                    <Input
                      id="secondaryContactName"
                      value={formData.secondaryContactName}
                      onChange={(e) => handleInputChange('secondaryContactName', e.target.value)}
                      placeholder="Jane Doe"
                    />
                  </div>

                  <div>
                    <Label htmlFor="secondaryContactJobTitle">Job Title</Label>
                    <Input
                      id="secondaryContactJobTitle"
                      value={formData.secondaryContactJobTitle}
                      onChange={(e) => handleInputChange('secondaryContactJobTitle', e.target.value)}
                      placeholder="Finance Manager"
                    />
                  </div>

                  <div>
                    <Label htmlFor="secondaryContactEmail">Business Email</Label>
                    <Input
                      id="secondaryContactEmail"
                      type="email"
                      value={formData.secondaryContactEmail}
                      onChange={(e) => handleInputChange('secondaryContactEmail', e.target.value)}
                      placeholder="jane.doe@company.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="secondaryContactPhone">Phone Number</Label>
                    <Input
                      id="secondaryContactPhone"
                      value={formData.secondaryContactPhone}
                      onChange={(e) => handleInputChange('secondaryContactPhone', e.target.value)}
                      placeholder="+49 30 87654321"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 2: // Business Profile
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Briefcase className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold">Business Profile</h2>
              <p className="text-muted-foreground">Help us understand your collection needs</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="annualRevenueRange">Annual Revenue Range <span className="text-destructive">*</span></Label>
                <Select value={formData.annualRevenueRange} onValueChange={(value) => handleInputChange('annualRevenueRange', value)}>
                  <SelectTrigger className={errors.annualRevenueRange ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select revenue range" />
                  </SelectTrigger>
                  <SelectContent>
                    {REVENUE_RANGES.map((range) => (
                      <SelectItem key={range} value={range}>
                        {range}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.annualRevenueRange && <p className="text-sm text-destructive mt-1">{errors.annualRevenueRange}</p>}
              </div>

              <div>
                <Label htmlFor="employeeCountRange">Number of Employees <span className="text-destructive">*</span></Label>
                <Select value={formData.employeeCountRange} onValueChange={(value) => handleInputChange('employeeCountRange', value)}>
                  <SelectTrigger className={errors.employeeCountRange ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select employee count" />
                  </SelectTrigger>
                  <SelectContent>
                    {EMPLOYEE_RANGES.map((range) => (
                      <SelectItem key={range} value={range}>
                        {range} employees
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.employeeCountRange && <p className="text-sm text-destructive mt-1">{errors.employeeCountRange}</p>}
              </div>

              <div>
                <Label htmlFor="yearsInBusiness">Years in Business <span className="text-destructive">*</span></Label>
                <Input
                  id="yearsInBusiness"
                  type="number"
                  min="0"
                  value={formData.yearsInBusiness || ''}
                  onChange={(e) => handleInputChange('yearsInBusiness', parseInt(e.target.value) || 0)}
                  placeholder="5"
                  className={errors.yearsInBusiness ? 'border-destructive' : ''}
                />
                {errors.yearsInBusiness && <p className="text-sm text-destructive mt-1">{errors.yearsInBusiness}</p>}
              </div>

              <div>
                <Label htmlFor="expectedMonthlyCases">Expected Monthly Cases <span className="text-destructive">*</span></Label>
                <Input
                  id="expectedMonthlyCases"
                  type="number"
                  min="1"
                  value={formData.expectedMonthlyCases || ''}
                  onChange={(e) => handleInputChange('expectedMonthlyCases', parseInt(e.target.value) || 0)}
                  placeholder="50"
                  className={errors.expectedMonthlyCases ? 'border-destructive' : ''}
                />
                {errors.expectedMonthlyCases && <p className="text-sm text-destructive mt-1">{errors.expectedMonthlyCases}</p>}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="expectedAverageCaseValue">Expected Average Case Value (EUR) <span className="text-destructive">*</span></Label>
                <Input
                  id="expectedAverageCaseValue"
                  type="number"
                  min="1"
                  step="0.01"
                  value={formData.expectedAverageCaseValue || ''}
                  onChange={(e) => handleInputChange('expectedAverageCaseValue', parseFloat(e.target.value) || 0)}
                  placeholder="2500.00"
                  className={errors.expectedAverageCaseValue ? 'border-destructive' : ''}
                />
                {errors.expectedAverageCaseValue && <p className="text-sm text-destructive mt-1">{errors.expectedAverageCaseValue}</p>}
              </div>
            </div>

            <div>
              <Label>Primary Debtor Types <span className="text-destructive">*</span></Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                {DEBTOR_TYPES.map((type) => (
                  <div
                    key={type}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.primaryDebtorTypes.includes(type)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => handleDebtorTypeToggle(type)}
                  >
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={formData.primaryDebtorTypes.includes(type)}
                        onChange={() => handleDebtorTypeToggle(type)}
                      />
                      <span className="text-sm font-medium">{type}</span>
                    </div>
                  </div>
                ))}
              </div>
              {errors.primaryDebtorTypes && <p className="text-sm text-destructive mt-1">{errors.primaryDebtorTypes}</p>}
            </div>
          </div>
        );

      case 3: // Banking Details
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <CreditCard className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold">Banking Information</h2>
              <p className="text-muted-foreground">Secure banking details for payment processing</p>
            </div>

            <Alert>
              <Lock className="h-4 w-4" />
              <AlertDescription>
                Your banking information is encrypted and stored securely. This information is required for payment processing and compliance verification.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="bankName">Bank Name <span className="text-destructive">*</span></Label>
                <Input
                  id="bankName"
                  value={formData.bankName}
                  onChange={(e) => handleInputChange('bankName', e.target.value)}
                  placeholder="Deutsche Bank AG"
                  className={errors.bankName ? 'border-destructive' : ''}
                />
                {errors.bankName && <p className="text-sm text-destructive mt-1">{errors.bankName}</p>}
              </div>

              <div>
                <Label htmlFor="bankCountry">Bank Country <span className="text-destructive">*</span></Label>
                <Select value={formData.bankCountry} onValueChange={(value) => handleInputChange('bankCountry', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="bankIban">IBAN <span className="text-destructive">*</span></Label>
                <Input
                  id="bankIban"
                  value={formData.bankIban}
                  onChange={(e) => handleInputChange('bankIban', e.target.value.toUpperCase())}
                  placeholder="DE89 3704 0044 0532 0130 00"
                  className={errors.bankIban ? 'border-destructive' : ''}
                />
                {errors.bankIban && <p className="text-sm text-destructive mt-1">{errors.bankIban}</p>}
              </div>

              <div>
                <Label htmlFor="bankSwift">SWIFT/BIC Code</Label>
                <Input
                  id="bankSwift"
                  value={formData.bankSwift}
                  onChange={(e) => handleInputChange('bankSwift', e.target.value.toUpperCase())}
                  placeholder="DEUTDEFF"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="accountHolderName">Account Holder Name <span className="text-destructive">*</span></Label>
                <Input
                  id="accountHolderName"
                  value={formData.accountHolderName}
                  onChange={(e) => handleInputChange('accountHolderName', e.target.value)}
                  placeholder="ACME Corporation Ltd"
                  className={errors.accountHolderName ? 'border-destructive' : ''}
                />
                {errors.accountHolderName && <p className="text-sm text-destructive mt-1">{errors.accountHolderName}</p>}
              </div>
            </div>
          </div>
        );

      case 4: // GDPR Compliance
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold">GDPR Compliance</h2>
              <p className="text-muted-foreground">Data protection and privacy configuration</p>
            </div>

            {/* GDPR Representative */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  GDPR Representative
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="gdprRepresentativeName">Representative Name <span className="text-destructive">*</span></Label>
                    <Input
                      id="gdprRepresentativeName"
                      value={formData.gdprRepresentativeName}
                      onChange={(e) => handleInputChange('gdprRepresentativeName', e.target.value)}
                      placeholder="Data Protection Representative"
                      className={errors.gdprRepresentativeName ? 'border-destructive' : ''}
                    />
                    {errors.gdprRepresentativeName && <p className="text-sm text-destructive mt-1">{errors.gdprRepresentativeName}</p>}
                  </div>

                  <div>
                    <Label htmlFor="gdprRepresentativeEmail">Representative Email <span className="text-destructive">*</span></Label>
                    <Input
                      id="gdprRepresentativeEmail"
                      type="email"
                      value={formData.gdprRepresentativeEmail}
                      onChange={(e) => handleInputChange('gdprRepresentativeEmail', e.target.value)}
                      placeholder="gdpr@company.com"
                      className={errors.gdprRepresentativeEmail ? 'border-destructive' : ''}
                    />
                    {errors.gdprRepresentativeEmail && <p className="text-sm text-destructive mt-1">{errors.gdprRepresentativeEmail}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Protection Officer */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Data Protection Officer (Optional)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dpoName">DPO Name</Label>
                    <Input
                      id="dpoName"
                      value={formData.dpoName}
                      onChange={(e) => handleInputChange('dpoName', e.target.value)}
                      placeholder="Chief Privacy Officer"
                    />
                  </div>

                  <div>
                    <Label htmlFor="dpoEmail">DPO Email</Label>
                    <Input
                      id="dpoEmail"
                      type="email"
                      value={formData.dpoEmail}
                      onChange={(e) => handleInputChange('dpoEmail', e.target.value)}
                      placeholder="dpo@company.com"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* GDPR Processing Purposes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Data Processing Purposes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {GDPR_PURPOSES.map((purpose) => {
                  const consent = formData.gdprConsents.find(c => c.purpose === purpose.value);
                  
                  return (
                    <div key={purpose.value} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{purpose.label}</h4>
                          <Badge variant={purpose.required ? 'destructive' : 'secondary'}>
                            {purpose.required ? 'Required' : 'Optional'}
                          </Badge>
                        </div>
                        <Checkbox
                          checked={consent?.consentGiven || false}
                          onCheckedChange={(checked) => 
                            handleGdprConsentChange(purpose.value, 'consentGiven', checked)
                          }
                          disabled={purpose.required}
                        />
                      </div>
                      
                      <div>
                        <Label className="text-sm">Lawful Basis</Label>
                        <Select 
                          value={consent?.lawfulBasis || 'contract'} 
                          onValueChange={(value) => handleGdprConsentChange(purpose.value, 'lawfulBasis', value)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {LAWFUL_BASIS_OPTIONS.map((basis) => (
                              <SelectItem key={basis.value} value={basis.value}>
                                <div>
                                  <div className="font-medium">{basis.label}</div>
                                  <div className="text-xs text-muted-foreground">{basis.description}</div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        );

      case 5: // Legal Agreements
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <FileText className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold">Legal Agreements</h2>
              <p className="text-muted-foreground">Review and accept our legal documents</p>
            </div>

            <div className="space-y-4">
              {/* Terms of Service */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Scale className="h-6 w-6 text-primary" />
                      <div>
                        <h3 className="font-semibold">Terms of Service</h3>
                        <p className="text-sm text-muted-foreground">Legal terms governing our service relationship</p>
                      </div>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Read Terms
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh]">
                        <DialogHeader>
                          <DialogTitle>Terms of Service</DialogTitle>
                        </DialogHeader>
                        <ScrollArea className="h-96">
                          <div className="whitespace-pre-wrap text-sm p-4">
                            {TERMS_OF_SERVICE}
                          </div>
                        </ScrollArea>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="termsAccepted"
                      checked={formData.termsAccepted}
                      onCheckedChange={(checked) => handleInputChange('termsAccepted', checked)}
                    />
                    <Label htmlFor="termsAccepted" className="text-sm">
                      I have read and accept the Terms of Service <span className="text-destructive">*</span>
                    </Label>
                  </div>
                  {errors.termsAccepted && <p className="text-sm text-destructive mt-1">{errors.termsAccepted}</p>}
                </CardContent>
              </Card>

              {/* Privacy Policy */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Shield className="h-6 w-6 text-primary" />
                      <div>
                        <h3 className="font-semibold">Privacy Policy</h3>
                        <p className="text-sm text-muted-foreground">How we handle and protect your data</p>
                      </div>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Read Policy
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh]">
                        <DialogHeader>
                          <DialogTitle>Privacy Policy</DialogTitle>
                        </DialogHeader>
                        <ScrollArea className="h-96">
                          <div className="whitespace-pre-wrap text-sm p-4">
                            {PRIVACY_POLICY}
                          </div>
                        </ScrollArea>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="privacyPolicyAccepted"
                      checked={formData.privacyPolicyAccepted}
                      onCheckedChange={(checked) => handleInputChange('privacyPolicyAccepted', checked)}
                    />
                    <Label htmlFor="privacyPolicyAccepted" className="text-sm">
                      I have read and accept the Privacy Policy <span className="text-destructive">*</span>
                    </Label>
                  </div>
                  {errors.privacyPolicyAccepted && <p className="text-sm text-destructive mt-1">{errors.privacyPolicyAccepted}</p>}
                </CardContent>
              </Card>

              {/* Service Agreement */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Briefcase className="h-6 w-6 text-primary" />
                      <div>
                        <h3 className="font-semibold">Service Agreement</h3>
                        <p className="text-sm text-muted-foreground">Detailed service terms and fee structure</p>
                      </div>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Read Agreement
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh]">
                        <DialogHeader>
                          <DialogTitle>Service Agreement</DialogTitle>
                        </DialogHeader>
                        <ScrollArea className="h-96">
                          <div className="whitespace-pre-wrap text-sm p-4">
                            {SERVICE_AGREEMENT}
                          </div>
                        </ScrollArea>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="serviceAgreementAccepted"
                      checked={formData.serviceAgreementAccepted}
                      onCheckedChange={(checked) => handleInputChange('serviceAgreementAccepted', checked)}
                    />
                    <Label htmlFor="serviceAgreementAccepted" className="text-sm">
                      I have read and accept the Service Agreement <span className="text-destructive">*</span>
                    </Label>
                  </div>
                  {errors.serviceAgreementAccepted && <p className="text-sm text-destructive mt-1">{errors.serviceAgreementAccepted}</p>}
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 6: // Document Verification
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Upload className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold">Document Verification</h2>
              <p className="text-muted-foreground">Upload required documents for verification</p>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Document uploads will be implemented in the next phase. For now, please note the required documents below.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Required Documents</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Building2 className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Company Registration Certificate</p>
                      <p className="text-sm text-muted-foreground">Official incorporation document</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">VAT Registration Certificate</p>
                      <p className="text-sm text-muted-foreground">If applicable to your business</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <User className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Authorized Signatory ID</p>
                      <p className="text-sm text-muted-foreground">Government-issued identification</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Optional Documents</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Bank Statement</p>
                      <p className="text-sm text-muted-foreground">Recent bank statement for verification</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <TrendingUp className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Financial Statements</p>
                      <p className="text-sm text-muted-foreground">Annual reports or financial statements</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Award className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Professional Certifications</p>
                      <p className="text-sm text-muted-foreground">Industry certifications or licenses</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 7: // Review & Submit
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold">Review & Submit</h2>
              <p className="text-muted-foreground">Review your application before submission</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Application Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Company Details</h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>Name:</strong> {formData.companyName}</p>
                      <p><strong>Type:</strong> {BUSINESS_TYPES.find(t => t.value === formData.businessType)?.label}</p>
                      <p><strong>Industry:</strong> {formData.industry}</p>
                      <p><strong>Country:</strong> {COUNTRIES.find(c => c.code === formData.incorporationCountry)?.name}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Business Profile</h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>Revenue:</strong> {formData.annualRevenueRange}</p>
                      <p><strong>Employees:</strong> {formData.employeeCountRange}</p>
                      <p><strong>Monthly Cases:</strong> {formData.expectedMonthlyCases}</p>
                      <p><strong>Avg Case Value:</strong> €{formData.expectedAverageCaseValue?.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Primary Contact</h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>Name:</strong> {formData.primaryContactName}</p>
                      <p><strong>Title:</strong> {formData.primaryContactJobTitle}</p>
                      <p><strong>Email:</strong> {formData.primaryContactEmail}</p>
                      <p><strong>Phone:</strong> {formData.primaryContactPhone || 'Not provided'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">GDPR Representative</h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>Name:</strong> {formData.gdprRepresentativeName}</p>
                      <p><strong>Email:</strong> {formData.gdprRepresentativeEmail}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">Legal Agreements Status</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className={`h-4 w-4 ${formData.termsAccepted ? 'text-success' : 'text-muted-foreground'}`} />
                      <span className="text-sm">Terms of Service</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className={`h-4 w-4 ${formData.privacyPolicyAccepted ? 'text-success' : 'text-muted-foreground'}`} />
                      <span className="text-sm">Privacy Policy</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className={`h-4 w-4 ${formData.serviceAgreementAccepted ? 'text-success' : 'text-muted-foreground'}`} />
                      <span className="text-sm">Service Agreement</span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="applicantNotes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="applicantNotes"
                    value={formData.applicantNotes}
                    onChange={(e) => handleInputChange('applicantNotes', e.target.value)}
                    placeholder="Any additional information you'd like to provide..."
                    rows={3}
                  />
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Important:</strong> After submission, your application will be reviewed by our compliance team. 
                    You will receive an email notification once the review is complete. The review process typically takes 2-3 business days.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-surface">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-4">
            <Building2 className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Professional Client Onboarding</h1>
          <p className="text-muted-foreground">
            Complete your business application to access CollectPro's debt collection services
          </p>
        </div>

        {/* Progress Indicator */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">Application Progress</span>
              <span className="text-sm text-muted-foreground">
                Step {currentStep + 1} of {STEPS.length}
              </span>
            </div>
            <Progress value={progress} className="h-2 mb-4" />
            
            <div className="flex items-center justify-between">
              {STEPS.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = index < currentStep;
                const isCurrent = index === currentStep;
                
                return (
                  <div key={step.id} className="flex flex-col items-center">
                    <div className={`p-2 rounded-full ${
                      isCompleted ? 'bg-success text-success-foreground' :
                      isCurrent ? 'bg-primary text-primary-foreground' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-xs mt-1 text-center max-w-16 leading-tight">
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        <Card className="mb-8">
          <CardContent className="p-8">
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {currentStep === STEPS.length - 1 ? (
            <Button
              onClick={submitApplication}
              disabled={isSubmitting}
              className="min-w-32"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit Application
                  <CheckCircle className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          ) : (
            <Button onClick={handleNext}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 space-y-2">
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Lock className="h-3 w-3" />
            <span>Secure Application • GDPR Compliant • Enterprise Grade</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Need help? Contact our support team at support@collectpro.com
          </p>
        </div>
      </div>
    </div>
  );
}