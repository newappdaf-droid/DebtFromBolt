// Professional Invoice Management Page for B2B Debt Collection Platform
// Enhanced invoice view with dedicated invoice detail page matching reference design

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  CreditCard,
  Download,
  Eye,
  Filter,
  Search,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Send,
  Calculator,
  Calendar,
  Building,
  TrendingUp,
  DollarSign,
  Receipt,
  Mail,
  ArrowLeft,
  Building2
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Money } from '@/components/ui/money';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { useAuth } from '@/components/auth/AuthProvider';
import { getInvoicesForUser } from '@/lib/mockData';
import type { Invoice } from '@/types';

const statusConfig = {
  draft: { 
    label: 'Draft', 
    icon: FileText, 
    variant: 'secondary' as const,
    description: 'Invoice being prepared'
  },
  sent: { 
    label: 'Sent', 
    icon: Send, 
    variant: 'default' as const,
    description: 'Invoice sent to client'
  },
  viewed: { 
    label: 'Viewed', 
    icon: Eye, 
    variant: 'default' as const,
    description: 'Client has viewed invoice'
  },
  paid: { 
    label: 'Paid', 
    icon: CheckCircle, 
    variant: 'success' as const,
    description: 'Payment received'
  },
  overdue: { 
    label: 'Overdue', 
    icon: AlertTriangle, 
    variant: 'destructive' as const,
    description: 'Payment past due date'
  },
  cancelled: { 
    label: 'Cancelled', 
    icon: FileText, 
    variant: 'secondary' as const,
    description: 'Invoice cancelled'
  }
};

// Invoice Detail Component matching the exact structure provided
function InvoiceDetailView({ 
  invoice, 
  onBack 
}: { 
  invoice: Invoice; 
  onBack: () => void; 
}) {
  const navigate = useNavigate();

  const handlePayment = () => {
    // Mock payment process
    alert('Payment functionality would be integrated with payment provider (e.g., Stripe)');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{invoice.invoiceNumber}</h1>
            <p className="text-gray-600">Invoice Details</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <StatusBadge status={invoice.status} />
          <Money amount={invoice.totalAmount} currency={invoice.currency} className="text-xl font-bold" />
        </div>
      </div>

      {/* Invoice Content */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-8">
          {/* Invoice Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">DC</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">DebtCollect Pro</h2>
                  <p className="text-sm text-gray-600">Professional Debt Collection Services</p>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                <p>123 Business Street</p>
                <p>London, SW1A 1AA</p>
                <p>United Kingdom</p>
                <p>VAT: GB123456789</p>
              </div>
            </div>
            <div className="text-right">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">INVOICE</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p><span className="font-medium">Invoice #:</span> {invoice.invoiceNumber}</p>
                <p><span className="font-medium">Issue Date:</span> {format(new Date(invoice.createdAt), 'dd/MM/yyyy')}</p>
                <p><span className="font-medium">Due Date:</span> {format(new Date(invoice.dueDate), 'dd/MM/yyyy')}</p>
                {invoice.paidAt && (
                  <p><span className="font-medium">Paid Date:</span> {format(new Date(invoice.paidAt), 'dd/MM/yyyy')}</p>
                )}
              </div>
            </div>
          </div>

          {/* Bill To */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Bill To:</h4>
            <div className="text-sm text-gray-600">
              <p className="font-medium">{invoice.clientName}</p>
              <p>Client ID: {invoice.clientId}</p>
            </div>
          </div>

          {/* Related Case */}
          <div className="mb-8">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Related Case:</h4>
            <div className="text-sm text-gray-600">
              <button
                onClick={() => navigate(`/cases/${invoice.caseId}`)}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                {invoice.caseName}
              </button>
            </div>
          </div>

          {/* Invoice Items */}
          <div className="mb-8">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {invoice.items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      <div>
                        <p className="font-medium">{item.description}</p>
                        <p className="text-gray-500">Collection handling fee (5%)</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 text-center">{item.quantity}</td>
                    <td className="px-4 py-4 text-sm text-gray-900 text-right">
                      <Money amount={item.unitPrice} currency={invoice.currency} />
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 text-right font-medium">
                      <Money amount={item.total} currency={invoice.currency} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-80 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">
                  <Money amount={invoice.amount} currency={invoice.currency} />
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">VAT (20%):</span>
                <span className="font-medium">
                  <Money amount={invoice.vatAmount} currency={invoice.currency} />
                </span>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-gray-900">Total:</span>
                  <span className="text-gray-900">
                    <Money amount={invoice.totalAmount} currency={invoice.currency} />
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Terms */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Payment Terms</h4>
            <p className="text-sm text-gray-600">
              Payment is due within 30 days of invoice date. Late payments may incur additional charges.
              For questions regarding this invoice, please contact our billing department.
            </p>
          </div>

          {/* GDPR Notice */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Data Protection Notice</h4>
            <p className="text-sm text-blue-800">
              This invoice and payment data will be retained for 7 years as required by law.
              You have the right to request access to or deletion of your personal data in accordance with GDPR.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
          <button
            onClick={() => {
              toast({
                title: 'Download Started',
                description: `Downloading invoice ${invoice.invoiceNumber}`
              });
            }}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </button>
          
          {(invoice.status === 'sent' || invoice.status === 'overdue') && (
            <button
              onClick={handlePayment}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Pay Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Invoices() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showInvoiceDetail, setShowInvoiceDetail] = useState(false);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');

  // Load invoices data
  useEffect(() => {
    if (user) {
      const userInvoices = getInvoicesForUser(user.id, user.role);
      setInvoices(userInvoices);
    }
  }, [user]);

  // Apply filters
  useEffect(() => {
    let filtered = [...invoices];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(invoice => invoice.status === statusFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(invoice => 
        invoice.invoiceNumber.toLowerCase().includes(query) ||
        invoice.clientName.toLowerCase().includes(query) ||
        invoice.caseName.toLowerCase().includes(query)
      );
    }

    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'this_month':
          filterDate.setMonth(now.getMonth());
          filtered = filtered.filter(invoice => 
            new Date(invoice.createdAt).getMonth() === filterDate.getMonth() &&
            new Date(invoice.createdAt).getFullYear() === filterDate.getFullYear()
          );
          break;
        case 'last_month':
          filterDate.setMonth(now.getMonth() - 1);
          filtered = filtered.filter(invoice => 
            new Date(invoice.createdAt).getMonth() === filterDate.getMonth() &&
            new Date(invoice.createdAt).getFullYear() === filterDate.getFullYear()
          );
          break;
        case 'this_year':
          filtered = filtered.filter(invoice => 
            new Date(invoice.createdAt).getFullYear() === now.getFullYear()
          );
          break;
      }
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setFilteredInvoices(filtered);
  }, [invoices, statusFilter, searchQuery, dateFilter]);

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceDetail(true);
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    // Simulate download
    toast({
      title: 'Download Started',
      description: `Downloading invoice ${invoice.invoiceNumber}`
    });
  };

  const handleSendReminder = (invoice: Invoice) => {
    toast({
      title: 'Reminder Sent',
      description: `Payment reminder sent for invoice ${invoice.invoiceNumber}`
    });
  };

  const exportCSV = () => {
    const csvContent = [
      ['Invoice', 'Case', 'Client', 'Total', 'Status', 'Due Date', 'Actions'].join(','),
      ...filteredInvoices.map(inv => [
        inv.invoiceNumber,
        inv.caseName,
        inv.clientName,
        `${inv.currency} ${inv.totalAmount}`,
        inv.status,
        format(new Date(inv.dueDate), 'dd/MM/yyyy'),
        'View Download'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoices-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Calculate statistics
  const stats = {
    total: invoices.length,
    totalValue: invoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
    paid: invoices.filter(i => i.status === 'paid').length,
    paidValue: invoices.filter(i => i.status === 'paid').reduce((sum, inv) => sum + inv.totalAmount, 0),
    overdue: invoices.filter(i => i.status === 'overdue').length,
    overdueValue: invoices.filter(i => i.status === 'overdue').reduce((sum, inv) => sum + inv.totalAmount, 0),
    sent: invoices.filter(i => i.status === 'sent').length
  };

  // Show invoice detail view if selected
  if (showInvoiceDetail && selectedInvoice) {
    return (
      <InvoiceDetailView 
        invoice={selectedInvoice} 
        onBack={() => {
          setShowInvoiceDetail(false);
          setSelectedInvoice(null);
        }} 
      />
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Invoices</h1>
          <p className="text-muted-foreground">
            Manage collection fees and service invoices
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          {user?.role === 'ADMIN' && (
            <Button onClick={() => navigate('/invoices/new')}>
              <FileText className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="card-professional">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Receipt className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Invoices</p>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">
                  <Money amount={stats.totalValue} currency="GBP" />
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-professional">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Paid</p>
                <p className="text-2xl font-bold">{stats.paid}</p>
                <p className="text-xs text-muted-foreground">
                  <Money amount={stats.paidValue} currency="GBP" />
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-professional">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold">{stats.overdue}</p>
                <p className="text-xs text-muted-foreground">
                  <Money amount={stats.overdueValue} currency="GBP" />
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-professional">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <Send className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Sent</p>
                <p className="text-2xl font-bold">{stats.sent}</p>
                <p className="text-xs text-muted-foreground">
                  Awaiting payment
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="card-professional">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by invoice number, client, or case..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="viewed">Viewed</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="this_month">This Month</SelectItem>
                  <SelectItem value="last_month">Last Month</SelectItem>
                  <SelectItem value="this_year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card className="card-professional">
        <CardContent className="p-0">
          {filteredInvoices.length === 0 ? (
            <div className="py-8 text-center">
              <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No invoices found</h3>
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== 'all' || dateFilter !== 'all'
                  ? 'Try adjusting your filters to see more results.'
                  : 'Invoices will appear here when created.'
                }
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold text-foreground">INVOICE</TableHead>
                  <TableHead className="font-semibold text-foreground">CASE</TableHead>
                  <TableHead className="font-semibold text-foreground">CLIENT</TableHead>
                  <TableHead className="font-semibold text-foreground text-right">TOTAL</TableHead>
                  <TableHead className="font-semibold text-foreground">STATUS</TableHead>
                  <TableHead className="font-semibold text-foreground">DUE DATE</TableHead>
                  <TableHead className="font-semibold text-foreground text-right">ACTIONS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => {
                  const StatusIcon = statusConfig[invoice.status].icon;
                  const isOverdue = invoice.status === 'overdue';
                  
                  return (
                    <TableRow key={invoice.id} className="hover:bg-muted/30 cursor-pointer" onClick={() => handleViewInvoice(invoice)}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-primary text-sm">{invoice.invoiceNumber}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Issued {format(new Date(invoice.createdAt), 'dd/MM/yyyy')}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm truncate max-w-[200px]" title={invoice.caseName}>
                            {invoice.caseName}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">Case reference</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-sm truncate max-w-[150px]" title={invoice.clientName}>
                          {invoice.clientName}
                        </p>
                      </TableCell>
                      <TableCell className="text-right">
                        <div>
                          <p className="font-bold">
                            <Money amount={invoice.totalAmount} currency={invoice.currency} />
                          </p>
                          <p className="text-xs text-muted-foreground">
                            VAT: <Money amount={invoice.vatAmount} currency={invoice.currency} />
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={invoice.status} size="sm" maxWidth="100px" />
                      </TableCell>
                      <TableCell>
                        <p className="text-sm font-medium">{format(new Date(invoice.dueDate), 'dd/MM/yy')}</p>
                        {invoice.paidAt && (
                          <p className="text-xs text-success">
                            Paid {format(new Date(invoice.paidAt), 'dd/MM/yy')}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewInvoice(invoice);
                            }}
                          >
                            View
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadInvoice(invoice);
                            }}
                          >
                            Download
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}