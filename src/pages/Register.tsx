// Professional B2B Registration & Onboarding for Debt Collection Platform
// Comprehensive multi-step form with legal compliance and document verification

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Eye, EyeOff, Building2, Shield, ArrowRight, CheckCircle, FileText, 
  CreditCard, Users, Award, Briefcase, ArrowLeft, Upload, Download,
  Globe, Phone, Mail, MapPin, Scale, Calculator, Target, TrendingUp,
  User, AlertTriangle, Lock, Calendar, Database, FileCheck, Info,
  ExternalLink, Check, X, Plus, Minus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Constants for form options
const BUSINESS_TYPES = [
  { value: 'sole_proprietorship', label: 'Sole Proprietorship' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'limited_liability', label: 'Limited Liability Company' },
  { value: 'corporation', label: 'Corporation' },
  { value: 'other', label: 'Other' }
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
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' }
];

const INDUSTRIES = [
  'Financial Services', 'Healthcare', 'Technology', 'Manufacturing',
  'Retail & E-commerce', 'Real Estate', 'Construction', 'Transportation',
  'Energy & Utilities', 'Telecommunications', 'Legal Services',
  'Consulting', 'Education', 'Government', 'Non-Profit', 'Other'
];

const REVENUE_RANGES = [
  'Under €100K', '€100K - €500K', '€500K - €1M', '€1M - €5M',
  '€5M - €10M', '€10M - €50M', '€50M - €100M', 'Over €100M'
];

const EMPLOYEE_RANGES = [
  '1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'
];

const DEBTOR_TYPES = [
  'B2B Commercial', 'B2C Consumer', 'Government/Public Sector',
  'Healthcare Providers', 'Financial Institutions', 'SME Businesses',
  'Large Corporations', 'International Clients'
];

const PROCESSING_PURPOSES = [
  { 
    id: 'debt_collection', 
    label: 'Debt Collection Services', 
    description: 'Primary service delivery including case management and recovery',
    required: false,
    lawfulBasis: 'contract'
  },
  { 
    id: 'client_management', 
    label: 'Client Relationship Management', 
    description: 'Account management, support, and service optimization',
    required: false,
    lawfulBasis: 'contract'
  },
  { 
    id: 'communication', 
    label: 'Business Communications', 
    description: 'Service updates, notifications, and business correspondence',
    required: false,
    lawfulBasis: 'legitimate_interests'
  },
  { 
    id: 'legal_compliance', 
    label: 'Legal & Regulatory Compliance', 
    description: 'AML, KYC, and regulatory reporting requirements',
    required: false,
    lawfulBasis: 'legal_obligation'
  },
  { 
    id: 'analytics', 
    label: 'Service Analytics & Improvement', 
    description: 'Performance analysis and service enhancement',
    required: false,
    lawfulBasis: 'legitimate_interests'
  }
];

interface FormData {
  // Account Information
  email: string;
  password: string;
  confirmPassword: string;
  
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
  
  // Contact Information
  primaryContactName: string;
  primaryContactEmail: string;
  primaryContactPhone: string;
  primaryContactJobTitle: string;
  
  secondaryContactName: string;
  secondaryContactEmail: string;
  secondaryContactPhone: string;
  secondaryContactJobTitle: string;
  
  // GDPR Information
  gdprRepresentativeName: string;
  gdprRepresentativeEmail: string;
  gdprRepresentativePhone: string;
  
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
  processingConsents: Record<string, boolean>;
  
  // Additional Information
  applicantNotes: string;
}

export default function Register() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showDocumentDialog, setShowDocumentDialog] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    // Account Information
    email: '',
    password: '',
    confirmPassword: '',
    
    // Company Information
    companyName: '',
    businessType: '',
    incorporationCountry: '',
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
      country: ''
    },
    
    // Business Profile
    annualRevenueRange: '',
    employeeCountRange: '',
    yearsInBusiness: 0,
    expectedMonthlyCases: 0,
    expectedAverageCaseValue: 0,
    primaryDebtorTypes: [],
    
    // Contact Information
    primaryContactName: '',
    primaryContactEmail: '',
    primaryContactPhone: '',
    primaryContactJobTitle: '',
    
    secondaryContactName: '',
    secondaryContactEmail: '',
    secondaryContactPhone: '',
    secondaryContactJobTitle: '',
    
    // GDPR Information
    gdprRepresentativeName: '',
    gdprRepresentativeEmail: '',
    gdprRepresentativePhone: '',
    
    dpoName: '',
    dpoEmail: '',
    dpoPhone: '',
    
    // Banking Information
    bankName: '',
    bankCountry: '',
    bankIban: '',
    bankSwift: '',
    accountHolderName: '',
    
    // Legal Agreements
    termsAccepted: false,
    privacyPolicyAccepted: false,
    serviceAgreementAccepted: false,
    
    // GDPR Consents
    processingConsents: {},
    
    // Additional Information
    applicantNotes: ''
  });

  const totalSteps = 7;
  const progress = (currentStep / totalSteps) * 100;

  const stepTitles = [
    'Account Setup',
    'Company Information', 
    'Business Profile',
    'Contact Details',
    'GDPR & Data Protection',
    'Banking Information',
    'Legal Agreements'
  ];

  const updateFormData = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof FormData] as any),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
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

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1: // Account Setup
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (!formData.password) newErrors.password = 'Password is required';
        if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm password';
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (formData.email && !emailRegex.test(formData.email)) {
          newErrors.email = 'Please enter a valid business email';
        }
        
        if (formData.password && formData.password.length < 8) {
          newErrors.password = 'Password must be at least 8 characters';
        }
        
        if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match';
        }
        break;

      case 2: // Company Information
        if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
        if (!formData.businessType) newErrors.businessType = 'Business type is required';
        if (!formData.incorporationCountry) newErrors.incorporationCountry = 'Incorporation country is required';
        if (!formData.industry) newErrors.industry = 'Industry is required';
        if (!formData.businessDescription.trim()) newErrors.businessDescription = 'Business description is required';
        break;

      case 3: // Business Profile
        if (!formData.annualRevenueRange) newErrors.annualRevenueRange = 'Revenue range is required';
        if (!formData.employeeCountRange) newErrors.employeeCountRange = 'Employee count is required';
        if (!formData.yearsInBusiness || formData.yearsInBusiness < 0) newErrors.yearsInBusiness = 'Years in business is required';
        if (!formData.expectedMonthlyCases || formData.expectedMonthlyCases < 1) newErrors.expectedMonthlyCases = 'Expected monthly cases is required';
        if (!formData.expectedAverageCaseValue || formData.expectedAverageCaseValue < 1) newErrors.expectedAverageCaseValue = 'Expected case value is required';
        if (formData.primaryDebtorTypes.length === 0) newErrors.primaryDebtorTypes = 'Select at least one debtor type';
        break;

      case 4: // Contact Details
        if (!formData.primaryContactName.trim()) newErrors.primaryContactName = 'Primary contact name is required';
        if (!formData.primaryContactEmail.trim()) newErrors.primaryContactEmail = 'Primary contact email is required';
        if (!formData.primaryContactJobTitle.trim()) newErrors.primaryContactJobTitle = 'Primary contact job title is required';
        if (!formData.gdprRepresentativeName.trim()) newErrors.gdprRepresentativeName = 'GDPR representative is required';
        if (!formData.gdprRepresentativeEmail.trim()) newErrors.gdprRepresentativeEmail = 'GDPR representative email is required';
        break;

      case 5: // GDPR & Data Protection
        const requiredPurposes = PROCESSING_PURPOSES.filter(p => p.required);
        const missingConsents = requiredPurposes.filter(p => !formData.processingConsents[p.id]);
        if (missingConsents.length > 0) {
          newErrors.processingConsents = 'All required processing purposes must be accepted';
        }
        break;

      case 6: // Banking Information
        if (!formData.bankName.trim()) newErrors.bankName = 'Bank name is required';
        if (!formData.bankCountry) newErrors.bankCountry = 'Bank country is required';
        if (!formData.bankIban.trim()) newErrors.bankIban = 'IBAN is required';
        if (!formData.accountHolderName.trim()) newErrors.accountHolderName = 'Account holder name is required';
        break;

      case 7: // Legal Agreements
        if (!formData.termsAccepted) newErrors.termsAccepted = 'Terms of Service must be accepted';
        if (!formData.privacyPolicyAccepted) newErrors.privacyPolicyAccepted = 'Privacy Policy must be accepted';
        if (!formData.serviceAgreementAccepted) newErrors.serviceAgreementAccepted = 'Service Agreement must be accepted';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(totalSteps, prev + 1));
    } else {
      toast.error('Please fix the form errors before continuing');
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const handleDebtorTypeToggle = (type: string) => {
    const current = formData.primaryDebtorTypes;
    if (current.includes(type)) {
      updateFormData('primaryDebtorTypes', current.filter(t => t !== type));
    } else {
      updateFormData('primaryDebtorTypes', [...current, type]);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      toast.error('Please fix all form errors');
      return;
    }

    setIsLoading(true);

    try {
      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.primaryContactName,
            company_name: formData.companyName,
            role: 'client_admin'
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create comprehensive client application
        const applicationData = {
          created_by: authData.user.id,
          status: 'submitted',
          submitted_at: new Date().toISOString(),
          
          // Company Information
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
          
          // Business Profile
          annual_revenue_range: formData.annualRevenueRange,
          employee_count_range: formData.employeeCountRange,
          years_in_business: formData.yearsInBusiness,
          expected_monthly_cases: formData.expectedMonthlyCases,
          expected_average_case_value: formData.expectedAverageCaseValue,
          primary_debtor_types: formData.primaryDebtorTypes,
          
          // Contact Information
          primary_contact_name: formData.primaryContactName,
          primary_contact_email: formData.primaryContactEmail,
          primary_contact_phone: formData.primaryContactPhone || null,
          primary_contact_job_title: formData.primaryContactJobTitle,
          
          secondary_contact_name: formData.secondaryContactName || null,
          secondary_contact_email: formData.secondaryContactEmail || null,
          secondary_contact_phone: formData.secondaryContactPhone || null,
          secondary_contact_job_title: formData.secondaryContactJobTitle || null,
          
          // GDPR Information
          gdpr_representative_name: formData.gdprRepresentativeName,
          gdpr_representative_email: formData.gdprRepresentativeEmail,
          gdpr_representative_phone: formData.gdprRepresentativePhone || null,
          
          dpo_name: formData.dpoName || null,
          dpo_email: formData.dpoEmail || null,
          dpo_phone: formData.dpoPhone || null,
          
          // Banking Information
          bank_name: formData.bankName,
          bank_country: formData.bankCountry,
          bank_iban: formData.bankIban,
          bank_swift: formData.bankSwift || null,
          account_holder_name: formData.accountHolderName,
          
          // Legal Agreements
          terms_accepted: formData.termsAccepted,
          terms_accepted_at: formData.termsAccepted ? new Date().toISOString() : null,
          privacy_policy_accepted: formData.privacyPolicyAccepted,
          privacy_policy_accepted_at: formData.privacyPolicyAccepted ? new Date().toISOString() : null,
          service_agreement_accepted: formData.serviceAgreementAccepted,
          service_agreement_accepted_at: formData.serviceAgreementAccepted ? new Date().toISOString() : null,
          
          // Additional Information
          applicant_notes: formData.applicantNotes || null
        };

        const { data: application, error: appError } = await supabase
          .from('client_applications')
          .insert(applicationData)
          .select()
          .single();

        if (appError) throw appError;

        // Create GDPR consents
        const consentPromises = PROCESSING_PURPOSES.map(async (purpose) => {
          const consentGiven = formData.processingConsents[purpose.id] || false;
          
          if (purpose.required || consentGiven) {
            const { error: consentError } = await supabase
              .from('gdpr_consents')
              .insert({
                user_id: authData.user.id,
                purpose: purpose.id as any,
                lawful_basis: purpose.lawfulBasis as any,
                consent_given: consentGiven,
                consent_text: `Processing consent for ${purpose.label}: ${purpose.description}`,
                consent_version: '1.0',
                ip_address: null, // Would be captured in real implementation
                user_agent: navigator.userAgent
              });
              
            if (consentError) console.error('Failed to create consent:', consentError);
          }
        });

        await Promise.all(consentPromises);

        toast.success('Application submitted successfully! You will receive an email once your application is reviewed.');
        navigate('/login');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Failed to submit application');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Account Setup</h2>
              <p className="text-muted-foreground">Create your secure business account</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Business Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  placeholder="your.email@company.com"
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
              </div>

              <div>
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => updateFormData('password', e.target.value)}
                    placeholder="Create a strong password"
                    className={`pr-10 ${errors.password ? 'border-destructive' : ''}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.password && <p className="text-sm text-destructive mt-1">{errors.password}</p>}
                <p className="text-xs text-muted-foreground mt-1">
                  Minimum 8 characters with letters and numbers
                </p>
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                    placeholder="Confirm your password"
                    className={`pr-10 ${errors.confirmPassword ? 'border-destructive' : ''}`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.confirmPassword && <p className="text-sm text-destructive mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Company Information</h2>
              <p className="text-muted-foreground">Legal business entity details</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="companyName">Legal Company Name *</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => updateFormData('companyName', e.target.value)}
                  placeholder="Your Company Ltd"
                  className={errors.companyName ? 'border-destructive' : ''}
                />
                {errors.companyName && <p className="text-sm text-destructive mt-1">{errors.companyName}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Business Type *</Label>
                  <Select value={formData.businessType} onValueChange={(value) => updateFormData('businessType', value)}>
                    <SelectTrigger className={errors.businessType ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <SelectContent>
                      {BUSINESS_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.businessType && <p className="text-sm text-destructive mt-1">{errors.businessType}</p>}
                </div>

                <div>
                  <Label>Incorporation Country *</Label>
                  <Select value={formData.incorporationCountry} onValueChange={(value) => updateFormData('incorporationCountry', value)}>
                    <SelectTrigger className={errors.incorporationCountry ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map(country => (
                        <SelectItem key={country.code} value={country.code}>{country.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.incorporationCountry && <p className="text-sm text-destructive mt-1">{errors.incorporationCountry}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="registrationNumber">Company Registration Number</Label>
                  <Input
                    id="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={(e) => updateFormData('registrationNumber', e.target.value)}
                    placeholder="12345678"
                  />
                </div>

                <div>
                  <Label htmlFor="vatNumber">VAT Number</Label>
                  <Input
                    id="vatNumber"
                    value={formData.vatNumber}
                    onChange={(e) => updateFormData('vatNumber', e.target.value)}
                    placeholder="DE123456789"
                  />
                </div>
              </div>

              <div>
                <Label>Industry *</Label>
                <Select value={formData.industry} onValueChange={(value) => updateFormData('industry', value)}>
                  <SelectTrigger className={errors.industry ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select your industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map(industry => (
                      <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.industry && <p className="text-sm text-destructive mt-1">{errors.industry}</p>}
              </div>

              <div>
                <Label htmlFor="businessDescription">Business Description *</Label>
                <Textarea
                  id="businessDescription"
                  value={formData.businessDescription}
                  onChange={(e) => updateFormData('businessDescription', e.target.value)}
                  placeholder="Describe your business activities and services..."
                  rows={3}
                  className={errors.businessDescription ? 'border-destructive' : ''}
                />
                {errors.businessDescription && <p className="text-sm text-destructive mt-1">{errors.businessDescription}</p>}
              </div>

              <div>
                <Label htmlFor="websiteUrl">Company Website</Label>
                <Input
                  id="websiteUrl"
                  type="url"
                  value={formData.websiteUrl}
                  onChange={(e) => updateFormData('websiteUrl', e.target.value)}
                  placeholder="https://www.yourcompany.com"
                />
              </div>

              {/* Business Address */}
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Business Address
                </h3>
                
                <div>
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    value={formData.businessAddress.street}
                    onChange={(e) => updateFormData('businessAddress.street', e.target.value)}
                    placeholder="123 Business Street"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.businessAddress.city}
                      onChange={(e) => updateFormData('businessAddress.city', e.target.value)}
                      placeholder="Berlin"
                    />
                  </div>

                  <div>
                    <Label htmlFor="postalCode">Postal Code</Label>
                    <Input
                      id="postalCode"
                      value={formData.businessAddress.postalCode}
                      onChange={(e) => updateFormData('businessAddress.postalCode', e.target.value)}
                      placeholder="10115"
                    />
                  </div>

                  <div>
                    <Label>Country</Label>
                    <Select value={formData.businessAddress.country} onValueChange={(value) => updateFormData('businessAddress.country', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map(country => (
                          <SelectItem key={country.code} value={country.code}>{country.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Business Profile</h2>
              <p className="text-muted-foreground">Help us understand your collection needs</p>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Annual Revenue Range *</Label>
                  <Select value={formData.annualRevenueRange} onValueChange={(value) => updateFormData('annualRevenueRange', value)}>
                    <SelectTrigger className={errors.annualRevenueRange ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Select revenue range" />
                    </SelectTrigger>
                    <SelectContent>
                      {REVENUE_RANGES.map(range => (
                        <SelectItem key={range} value={range}>{range}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.annualRevenueRange && <p className="text-sm text-destructive mt-1">{errors.annualRevenueRange}</p>}
                </div>

                <div>
                  <Label>Number of Employees *</Label>
                  <Select value={formData.employeeCountRange} onValueChange={(value) => updateFormData('employeeCountRange', value)}>
                    <SelectTrigger className={errors.employeeCountRange ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Select employee count" />
                    </SelectTrigger>
                    <SelectContent>
                      {EMPLOYEE_RANGES.map(range => (
                        <SelectItem key={range} value={range}>{range}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.employeeCountRange && <p className="text-sm text-destructive mt-1">{errors.employeeCountRange}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="yearsInBusiness">Years in Business *</Label>
                <Input
                  id="yearsInBusiness"
                  type="number"
                  min="0"
                  value={formData.yearsInBusiness || ''}
                  onChange={(e) => updateFormData('yearsInBusiness', parseInt(e.target.value) || 0)}
                  placeholder="5"
                  className={errors.yearsInBusiness ? 'border-destructive' : ''}
                />
                {errors.yearsInBusiness && <p className="text-sm text-destructive mt-1">{errors.yearsInBusiness}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expectedMonthlyCases">Expected Monthly Cases *</Label>
                  <Input
                    id="expectedMonthlyCases"
                    type="number"
                    min="1"
                    value={formData.expectedMonthlyCases || ''}
                    onChange={(e) => updateFormData('expectedMonthlyCases', parseInt(e.target.value) || 0)}
                    placeholder="50"
                    className={errors.expectedMonthlyCases ? 'border-destructive' : ''}
                  />
                  {errors.expectedMonthlyCases && <p className="text-sm text-destructive mt-1">{errors.expectedMonthlyCases}</p>}
                </div>

                <div>
                  <Label htmlFor="expectedAverageCaseValue">Average Case Value (€) *</Label>
                  <Input
                    id="expectedAverageCaseValue"
                    type="number"
                    min="1"
                    value={formData.expectedAverageCaseValue || ''}
                    onChange={(e) => updateFormData('expectedAverageCaseValue', parseInt(e.target.value) || 0)}
                    placeholder="2500"
                    className={errors.expectedAverageCaseValue ? 'border-destructive' : ''}
                  />
                  {errors.expectedAverageCaseValue && <p className="text-sm text-destructive mt-1">{errors.expectedAverageCaseValue}</p>}
                </div>
              </div>

              <div>
                <Label>Primary Debtor Types * (Select all that apply)</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {DEBTOR_TYPES.map(type => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={type}
                        checked={formData.primaryDebtorTypes.includes(type)}
                        onCheckedChange={() => handleDebtorTypeToggle(type)}
                      />
                      <Label htmlFor={type} className="text-sm cursor-pointer">{type}</Label>
                    </div>
                  ))}
                </div>
                {errors.primaryDebtorTypes && <p className="text-sm text-destructive mt-1">{errors.primaryDebtorTypes}</p>}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Contact Details</h2>
              <p className="text-muted-foreground">Business contacts and GDPR representatives</p>
            </div>
            
            <div className="space-y-6">
              {/* Primary Contact */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Primary Business Contact *
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="primaryContactName">Full Name *</Label>
                      <Input
                        id="primaryContactName"
                        value={formData.primaryContactName}
                        onChange={(e) => updateFormData('primaryContactName', e.target.value)}
                        placeholder="John Smith"
                        className={errors.primaryContactName ? 'border-destructive' : ''}
                      />
                      {errors.primaryContactName && <p className="text-sm text-destructive mt-1">{errors.primaryContactName}</p>}
                    </div>

                    <div>
                      <Label htmlFor="primaryContactJobTitle">Job Title *</Label>
                      <Input
                        id="primaryContactJobTitle"
                        value={formData.primaryContactJobTitle}
                        onChange={(e) => updateFormData('primaryContactJobTitle', e.target.value)}
                        placeholder="Finance Director"
                        className={errors.primaryContactJobTitle ? 'border-destructive' : ''}
                      />
                      {errors.primaryContactJobTitle && <p className="text-sm text-destructive mt-1">{errors.primaryContactJobTitle}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="primaryContactEmail">Email Address *</Label>
                      <Input
                        id="primaryContactEmail"
                        type="email"
                        value={formData.primaryContactEmail}
                        onChange={(e) => updateFormData('primaryContactEmail', e.target.value)}
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
                        onChange={(e) => updateFormData('primaryContactPhone', e.target.value)}
                        placeholder="+49 123 456 7890"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Secondary Contact */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Secondary Contact (Optional)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="secondaryContactName">Full Name</Label>
                      <Input
                        id="secondaryContactName"
                        value={formData.secondaryContactName}
                        onChange={(e) => updateFormData('secondaryContactName', e.target.value)}
                        placeholder="Jane Doe"
                      />
                    </div>

                    <div>
                      <Label htmlFor="secondaryContactJobTitle">Job Title</Label>
                      <Input
                        id="secondaryContactJobTitle"
                        value={formData.secondaryContactJobTitle}
                        onChange={(e) => updateFormData('secondaryContactJobTitle', e.target.value)}
                        placeholder="CFO"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="secondaryContactEmail">Email Address</Label>
                      <Input
                        id="secondaryContactEmail"
                        type="email"
                        value={formData.secondaryContactEmail}
                        onChange={(e) => updateFormData('secondaryContactEmail', e.target.value)}
                        placeholder="jane.doe@company.com"
                      />
                    </div>

                    <div>
                      <Label htmlFor="secondaryContactPhone">Phone Number</Label>
                      <Input
                        id="secondaryContactPhone"
                        value={formData.secondaryContactPhone}
                        onChange={(e) => updateFormData('secondaryContactPhone', e.target.value)}
                        placeholder="+49 123 456 7891"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* GDPR Representative */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    GDPR Representative *
                  </CardTitle>
                  <CardDescription>
                    Required for EU data protection compliance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="gdprRepresentativeName">Full Name *</Label>
                      <Input
                        id="gdprRepresentativeName"
                        value={formData.gdprRepresentativeName}
                        onChange={(e) => updateFormData('gdprRepresentativeName', e.target.value)}
                        placeholder="GDPR Representative Name"
                        className={errors.gdprRepresentativeName ? 'border-destructive' : ''}
                      />
                      {errors.gdprRepresentativeName && <p className="text-sm text-destructive mt-1">{errors.gdprRepresentativeName}</p>}
                    </div>

                    <div>
                      <Label htmlFor="gdprRepresentativeEmail">Email Address *</Label>
                      <Input
                        id="gdprRepresentativeEmail"
                        type="email"
                        value={formData.gdprRepresentativeEmail}
                        onChange={(e) => updateFormData('gdprRepresentativeEmail', e.target.value)}
                        placeholder="gdpr@company.com"
                        className={errors.gdprRepresentativeEmail ? 'border-destructive' : ''}
                      />
                      {errors.gdprRepresentativeEmail && <p className="text-sm text-destructive mt-1">{errors.gdprRepresentativeEmail}</p>}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="gdprRepresentativePhone">Phone Number</Label>
                    <Input
                      id="gdprRepresentativePhone"
                      value={formData.gdprRepresentativePhone}
                      onChange={(e) => updateFormData('gdprRepresentativePhone', e.target.value)}
                      placeholder="+49 123 456 7892"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Optional DPO */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Data Protection Officer (Optional)
                  </CardTitle>
                  <CardDescription>
                    If your organization has a designated DPO
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="dpoName">DPO Name</Label>
                      <Input
                        id="dpoName"
                        value={formData.dpoName}
                        onChange={(e) => updateFormData('dpoName', e.target.value)}
                        placeholder="Data Protection Officer"
                      />
                    </div>

                    <div>
                      <Label htmlFor="dpoEmail">DPO Email</Label>
                      <Input
                        id="dpoEmail"
                        type="email"
                        value={formData.dpoEmail}
                        onChange={(e) => updateFormData('dpoEmail', e.target.value)}
                        placeholder="dpo@company.com"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">GDPR & Data Protection</h2>
              <p className="text-muted-foreground">Configure data processing and privacy settings</p>
            </div>
            
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                We process your data in accordance with GDPR. Please review and consent to the processing purposes below.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              {PROCESSING_PURPOSES.map(purpose => (
                <Card key={purpose.id} className={purpose.required ? 'border-primary' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id={purpose.id}
                        checked={formData.processingConsents[purpose.id] || false}
                        onCheckedChange={(checked) => 
                          updateFormData('processingConsents', {
                            ...formData.processingConsents,
                            [purpose.id]: checked === true
                          })
                        }
                        disabled={purpose.required}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Label htmlFor={purpose.id} className="font-medium cursor-pointer">
                            {purpose.label}
                          </Label>
                          {purpose.required && (
                            <Badge variant="destructive" className="text-xs">Required</Badge>
                          )}
                          <Badge variant="outline" className="text-xs capitalize">
                            {purpose.lawfulBasis.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{purpose.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {errors.processingConsents && <p className="text-sm text-destructive mt-1">{errors.processingConsents}</p>}
            </div>

            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium mb-2">Data Retention Policy</h4>
                    <p className="text-sm text-muted-foreground">
                      Your data will be retained for the duration necessary to provide our services and comply with legal obligations. 
                      You can request data deletion at any time, subject to legal retention requirements.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Banking Information</h2>
              <p className="text-muted-foreground">Secure payment and settlement details</p>
            </div>
            
            <Alert>
              <Lock className="h-4 w-4" />
              <AlertDescription>
                Banking information is encrypted and stored securely. This is required for payment processing and settlements.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bankName">Bank Name *</Label>
                  <Input
                    id="bankName"
                    value={formData.bankName}
                    onChange={(e) => updateFormData('bankName', e.target.value)}
                    placeholder="Deutsche Bank AG"
                    className={errors.bankName ? 'border-destructive' : ''}
                  />
                  {errors.bankName && <p className="text-sm text-destructive mt-1">{errors.bankName}</p>}
                </div>

                <div>
                  <Label>Bank Country *</Label>
                  <Select value={formData.bankCountry} onValueChange={(value) => updateFormData('bankCountry', value)}>
                    <SelectTrigger className={errors.bankCountry ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Select bank country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map(country => (
                        <SelectItem key={country.code} value={country.code}>{country.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.bankCountry && <p className="text-sm text-destructive mt-1">{errors.bankCountry}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="bankIban">IBAN *</Label>
                <Input
                  id="bankIban"
                  value={formData.bankIban}
                  onChange={(e) => updateFormData('bankIban', e.target.value.toUpperCase())}
                  placeholder="DE89 3704 0044 0532 0130 00"
                  className={errors.bankIban ? 'border-destructive' : ''}
                />
                {errors.bankIban && <p className="text-sm text-destructive mt-1">{errors.bankIban}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bankSwift">SWIFT/BIC Code</Label>
                  <Input
                    id="bankSwift"
                    value={formData.bankSwift}
                    onChange={(e) => updateFormData('bankSwift', e.target.value.toUpperCase())}
                    placeholder="DEUTDEFF"
                  />
                </div>

                <div>
                  <Label htmlFor="accountHolderName">Account Holder Name *</Label>
                  <Input
                    id="accountHolderName"
                    value={formData.accountHolderName}
                    onChange={(e) => updateFormData('accountHolderName', e.target.value)}
                    placeholder="Your Company Ltd"
                    className={errors.accountHolderName ? 'border-destructive' : ''}
                  />
                  {errors.accountHolderName && <p className="text-sm text-destructive mt-1">{errors.accountHolderName}</p>}
                </div>
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Legal Agreements</h2>
              <p className="text-muted-foreground">Review and accept our terms and policies</p>
            </div>
            
            <div className="space-y-4">
              {/* Terms of Service */}
              <Card className={!formData.termsAccepted ? 'border-destructive' : 'border-success'}>
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="terms"
                      checked={formData.termsAccepted}
                      onCheckedChange={(checked) => updateFormData('termsAccepted', checked === true)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Label htmlFor="terms" className="font-medium cursor-pointer">
                          Terms of Service *
                        </Label>
                        <Dialog open={showDocumentDialog === 'terms'} onOpenChange={(open) => setShowDocumentDialog(open ? 'terms' : null)}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <FileText className="h-3 w-3 mr-1" />
                              Read Full Terms
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh]">
                            <DialogHeader>
                              <DialogTitle>Terms of Service - CollectPro</DialogTitle>
                            </DialogHeader>
                            <ScrollArea className="h-96">
                              <div className="space-y-4 text-sm">
                                <h3 className="font-semibold">1. Service Agreement</h3>
                                <p>CollectPro provides professional debt collection services to business clients. By accepting these terms, you agree to engage our services for the recovery of outstanding debts.</p>
                                
                                <h3 className="font-semibold">2. Service Fees and Commission</h3>
                                <p>Our standard commission structure applies as follows:</p>
                                <ul className="list-disc pl-6 space-y-1">
                                  <li>Standard Collection: 25% of recovered amount (minimum €50, maximum €5,000)</li>
                                  <li>Legal Escalation: Additional 15% plus legal costs</li>
                                  <li>International Cases: 30% of recovered amount</li>
                                </ul>
                                
                                <h3 className="font-semibold">3. Client Obligations</h3>
                                <p>Clients must provide accurate debtor information, valid debt documentation, and comply with all applicable laws and regulations.</p>
                                
                                <h3 className="font-semibold">4. Data Protection and Privacy</h3>
                                <p>We process personal data in accordance with GDPR and applicable privacy laws. All data is handled securely and confidentially.</p>
                                
                                <h3 className="font-semibold">5. Limitation of Liability</h3>
                                <p>Our liability is limited to the commission fees paid. We provide services with professional care but cannot guarantee specific recovery outcomes.</p>
                                
                                <h3 className="font-semibold">6. Termination</h3>
                                <p>Either party may terminate this agreement with 30 days written notice. Outstanding cases will be completed under existing terms.</p>
                              </div>
                            </ScrollArea>
                          </DialogContent>
                        </Dialog>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Professional debt collection service terms, commission structure, and service obligations
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Privacy Policy */}
              <Card className={!formData.privacyPolicyAccepted ? 'border-destructive' : 'border-success'}>
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="privacy"
                      checked={formData.privacyPolicyAccepted}
                      onCheckedChange={(checked) => updateFormData('privacyPolicyAccepted', checked === true)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Label htmlFor="privacy" className="font-medium cursor-pointer">
                          Privacy Policy *
                        </Label>
                        <Dialog open={showDocumentDialog === 'privacy'} onOpenChange={(open) => setShowDocumentDialog(open ? 'privacy' : null)}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Shield className="h-3 w-3 mr-1" />
                              Read Privacy Policy
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh]">
                            <DialogHeader>
                              <DialogTitle>Privacy Policy - CollectPro</DialogTitle>
                            </DialogHeader>
                            <ScrollArea className="h-96">
                              <div className="space-y-4 text-sm">
                                <h3 className="font-semibold">Data Controller Information</h3>
                                <p>CollectPro Ltd, registered in the UK, acts as data controller for client and case data processing.</p>
                                
                                <h3 className="font-semibold">Data We Collect</h3>
                                <ul className="list-disc pl-6 space-y-1">
                                  <li>Business registration and contact information</li>
                                  <li>Debtor personal and financial data</li>
                                  <li>Communication records and case notes</li>
                                  <li>Payment and financial transaction data</li>
                                </ul>
                                
                                <h3 className="font-semibold">Legal Basis for Processing</h3>
                                <p>We process data based on:</p>
                                <ul className="list-disc pl-6 space-y-1">
                                  <li>Contract performance (service delivery)</li>
                                  <li>Legal obligations (AML, regulatory compliance)</li>
                                  <li>Legitimate interests (business operations)</li>
                                  <li>Consent (marketing communications)</li>
                                </ul>
                                
                                <h3 className="font-semibold">Data Retention</h3>
                                <p>Data is retained for 7 years after case closure or as required by law. You may request earlier deletion subject to legal requirements.</p>
                                
                                <h3 className="font-semibold">Your Rights</h3>
                                <p>You have rights to access, rectify, erase, restrict processing, data portability, and object to processing of your personal data.</p>
                                
                                <h3 className="font-semibold">International Transfers</h3>
                                <p>Data may be transferred to countries with adequate protection or under appropriate safeguards including Standard Contractual Clauses.</p>
                              </div>
                            </ScrollArea>
                          </DialogContent>
                        </Dialog>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        GDPR-compliant privacy policy covering data processing, retention, and your rights
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Service Agreement */}
              <Card className={!formData.serviceAgreementAccepted ? 'border-destructive' : 'border-success'}>
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="service"
                      checked={formData.serviceAgreementAccepted}
                      onCheckedChange={(checked) => updateFormData('serviceAgreementAccepted', checked === true)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Label htmlFor="service" className="font-medium cursor-pointer">
                          Service Agreement *
                        </Label>
                        <Dialog open={showDocumentDialog === 'service'} onOpenChange={(open) => setShowDocumentDialog(open ? 'service' : null)}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Scale className="h-3 w-3 mr-1" />
                              Read Service Agreement
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh]">
                            <DialogHeader>
                              <DialogTitle>Professional Service Agreement</DialogTitle>
                            </DialogHeader>
                            <ScrollArea className="h-96">
                              <div className="space-y-4 text-sm">
                                <h3 className="font-semibold">Service Scope</h3>
                                <p>CollectPro provides comprehensive debt collection services including:</p>
                                <ul className="list-disc pl-6 space-y-1">
                                  <li>Pre-legal collection activities</li>
                                  <li>Legal escalation and court proceedings</li>
                                  <li>Debtor communication and negotiation</li>
                                  <li>Payment processing and settlement</li>
                                  <li>Compliance and regulatory reporting</li>
                                </ul>
                                
                                <h3 className="font-semibold">Service Level Agreements</h3>
                                <ul className="list-disc pl-6 space-y-1">
                                  <li>Case acceptance within 24 hours</li>
                                  <li>Initial debtor contact within 48 hours</li>
                                  <li>Monthly progress reporting</li>
                                  <li>24/7 online case management access</li>
                                </ul>
                                
                                <h3 className="font-semibold">Fee Structure</h3>
                                <p>Transparent pricing with no hidden fees:</p>
                                <ul className="list-disc pl-6 space-y-1">
                                  <li>No upfront costs or setup fees</li>
                                  <li>Commission only on successful recovery</li>
                                  <li>Detailed fee breakdown for all charges</li>
                                  <li>Monthly invoicing with full transparency</li>
                                </ul>
                                
                                <h3 className="font-semibold">Quality Assurance</h3>
                                <p>All collection activities are conducted professionally and in compliance with applicable laws and industry best practices.</p>
                              </div>
                            </ScrollArea>
                          </DialogContent>
                        </Dialog>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Professional service agreement covering scope, SLAs, and fee structure
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {errors.termsAccepted && <p className="text-sm text-destructive">{errors.termsAccepted}</p>}
              {errors.privacyPolicyAccepted && <p className="text-sm text-destructive">{errors.privacyPolicyAccepted}</p>}
              {errors.serviceAgreementAccepted && <p className="text-sm text-destructive">{errors.serviceAgreementAccepted}</p>}
            </div>

            {/* Additional Notes */}
            <div>
              <Label htmlFor="applicantNotes">Additional Information (Optional)</Label>
              <Textarea
                id="applicantNotes"
                value={formData.applicantNotes}
                onChange={(e) => updateFormData('applicantNotes', e.target.value)}
                placeholder="Any additional information you'd like to provide..."
                rows={3}
              />
            </div>

            {/* Document Upload Checklist */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileCheck className="h-5 w-5" />
                  Required Documents
                </CardTitle>
                <CardDescription>
                  These documents will be required during the review process
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <FileText className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium">Company Registration Certificate</p>
                      <p className="text-sm text-muted-foreground">Official incorporation documents</p>
                    </div>
                    <Badge variant="destructive">Required</Badge>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium">VAT Registration Certificate</p>
                      <p className="text-sm text-muted-foreground">If applicable to your business</p>
                    </div>
                    <Badge variant="outline">Conditional</Badge>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <User className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium">Authorized Signatory ID</p>
                      <p className="text-sm text-muted-foreground">Government-issued photo ID</p>
                    </div>
                    <Badge variant="destructive">Required</Badge>
                  </div>
                </div>
                
                <Alert className="mt-4">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Documents can be uploaded after account approval. Our compliance team will contact you with upload instructions.
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
    <div className="min-h-screen bg-gradient-surface p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
            <Building2 className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Join CollectPro</h1>
            <p className="text-muted-foreground">
              Professional B2B debt collection platform
            </p>
          </div>
        </div>

        {/* Progress Indicator */}
        <Card className="card-professional">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Step {currentStep} of {totalSteps}</span>
                <span className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                {stepTitles.map((title, index) => (
                  <span 
                    key={index} 
                    className={index + 1 === currentStep ? 'text-primary font-medium' : ''}
                  >
                    {title}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Content */}
        <Card className="card-professional">
          <CardContent className="p-8">
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1 || isLoading}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {currentStep < totalSteps ? (
            <Button onClick={handleNext} disabled={isLoading}>
              Next Step
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
                  Submitting Application...
                </>
              ) : (
                <>
                  Submit Application
                  <CheckCircle className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          )}
        </div>

        {/* Login Link */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign in here
            </Link>
          </p>
        </div>

        {/* Security & Compliance Notice */}
        <Card className="card-professional">
          <CardContent className="p-6">
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>GDPR Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  <span>Bank-Level Security</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  <span>ISO 27001 Certified</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Your application will be reviewed by our compliance team within 2-3 business days
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}