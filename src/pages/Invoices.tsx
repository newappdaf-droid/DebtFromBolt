// Professional Invoice Management Page for B2B Debt Collection Platform
// Enhanced invoice view with detailed invoice dialog matching reference design

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
  Building2,
  MapPin,
  Phone,
  Globe
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
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
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

// Enhanced invoice detail dialog component
function InvoiceDetailDialog({ 
  invoice, 
  isOpen, 
  onOpenChange 
}: { 
  invoice: Invoice | null; 
  isOpen: boolean; 
  onOpenChange: (open: boolean) => void; 
}) {
  if (!invoice) return null;

  const handleDownload = () => {
    toast({
      title: 'Download Started',
      description: `Downloading invoice ${invoice.invoiceNumber}`
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <DialogTitle className="text-2xl font-bold">{invoice.invoiceNumber}</DialogTitle>
                <DialogDescription>Invoice Details</DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={invoice.status} />
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Issued</p>
                <p className="text-2xl font-bold">
                  <Money amount={invoice.totalAmount} currency={invoice.currency} />
                </p>
              </div>
            </div>
          </div>
        </DialogHeader>
        
        <ScrollArea className="flex-1 px-6">
          <div className="space-y-8">
            {/* Company Header */}
            <div className="flex justify-between items-start">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary rounded-lg">
                  <Building2 className="h-8 w-8 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">DebtCollect Pro</h2>
                  <p className="text-muted-foreground">Professional Debt Collection Services</p>
                  <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3" />
                      <span>123 Business Street, London, SW1A 1AA, United Kingdom</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3" />
                      <span>VAT: GB123456789</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <h1 className="text-3xl font-bold">INVOICE</h1>
                <div className="mt-2 space-y-1 text-sm">
                  <p><span className="text-muted-foreground">Invoice #:</span> {invoice.invoiceNumber}</p>
                  <p><span className="text-muted-foreground">Issue Date:</span> {format(new Date(invoice.createdAt), 'dd/MM/yyyy')}</p>
                  <p><span className="text-muted-foreground">Due Date:</span> {format(new Date(invoice.dueDate), 'dd/MM/yyyy')}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Bill To Section */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Bill To:</h3>
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="font-semibold">{invoice.clientName}</p>
                <p className="text-sm text-muted-foreground">Client ID: {invoice.clientId}</p>
              </div>
            </div>

            {/* Related Case Section */}
            <div>
              <h3 className="font-semibold text-lg mb-3">Related Case:</h3>
              <div className="bg-accent/30 rounded-lg p-4">
                <p className="font-medium text-primary">{invoice.caseName}</p>
                <p className="text-sm text-muted-foreground">Case reference and details</p>
              </div>
            </div>

            {/* Invoice Items Table */}
            <div>
              <Table>
                <TableHeader>
                  <TableRow className="border-b-2">
                    <TableHead className="font-semibold text-foreground">DESCRIPTION</TableHead>
                    <TableHead className="font-semibold text-foreground text-center">QTY</TableHead>
                    <TableHead className="font-semibold text-foreground text-right">UNIT PRICE</TableHead>
                    <TableHead className="font-semibold text-foreground text-right">TOTAL</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.items.map((item, index) => (
                    <TableRow key={index} className="border-b">
                      <TableCell className="py-4">
                        <div>
                          <p className="font-medium">{item.description}</p>
                          <p className="text-sm text-muted-foreground">Collection handling fee (5%)</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center py-4">{item.quantity}</TableCell>
                      <TableCell className="text-right py-4">
                        <Money amount={item.unitPrice} currency={invoice.currency} />
                      </TableCell>
                      <TableCell className="text-right py-4 font-medium">
                        <Money amount={item.total} currency={invoice.currency} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Totals Section */}
            <div className="flex justify-end">
              <div className="w-80 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-medium">
                    <Money amount={invoice.amount} currency={invoice.currency} />
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">VAT (20%):</span>
                  <span className="font-medium">
                    <Money amount={invoice.vatAmount} currency={invoice.currency} />
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>
                    <Money amount={invoice.totalAmount} currency={invoice.currency} />
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Terms */}
            <div className="bg-muted/30 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Payment Terms</h4>
              <p className="text-sm text-muted-foreground">
                Payment is due within 30 days of invoice date. Late payments may incur additional charges. 
                For questions regarding this invoice, please contact our billing department.
              </p>
            </div>

            {/* Data Protection Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold mb-2 text-blue-800">Data Protection Notice</h4>
              <p className="text-sm text-blue-700">
                This invoice and payment data will be retained for 7 years as required by law. 
                You have the right to request access to or deletion of your personal data in accordance with GDPR.
              </p>
            </div>
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="flex justify-between items-center pt-4 border-t">
          <Button variant="outline" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button className="bg-green-600 hover:bg-green-700 text-white">
            Pay Now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Invoices() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  
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
    setShowInvoiceDialog(true);
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
            <div className="py-12 text-center">
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
                <TableRow className="border-b-2">
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
                      <TableCell className="py-4">
                        <div>
                          <p className="font-semibold text-primary">{invoice.invoiceNumber}</p>
                          <p className="text-sm text-muted-foreground">
                            Issued {format(new Date(invoice.createdAt), 'dd/MM/yyyy')}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div>
                          <p className="font-medium text-primary">{invoice.caseName}</p>
                          <p className="text-sm text-muted-foreground">Case reference</p>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <p className="font-medium">{invoice.clientName}</p>
                      </TableCell>
                      <TableCell className="py-4 text-right">
                        <div>
                          <p className="font-bold text-lg">
                            <Money amount={invoice.totalAmount} currency={invoice.currency} />
                          </p>
                          <p className="text-sm text-muted-foreground">
                            VAT: <Money amount={invoice.vatAmount} currency={invoice.currency} />
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <StatusBadge status={invoice.status} />
                      </TableCell>
                      <TableCell className="py-4">
                        <p className="font-medium">{format(new Date(invoice.dueDate), 'dd/MM/yyyy')}</p>
                        {invoice.paidAt && (
                          <p className="text-sm text-success">
                            Paid {format(new Date(invoice.paidAt), 'dd/MM/yyyy')}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="py-4 text-right">
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

      {/* Enhanced Invoice Detail Dialog */}
      <InvoiceDetailDialog
        invoice={selectedInvoice}
        isOpen={showInvoiceDialog}
        onOpenChange={setShowInvoiceDialog}
      />
    </div>
  );
}