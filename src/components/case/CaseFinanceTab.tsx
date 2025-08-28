// Case Finance Tab Component
// Comprehensive financial management with payments and calculations

import React, { useState, useEffect } from 'react';
import { 
  Plus, CreditCard, TrendingUp, DollarSign, Calendar, 
  Receipt, AlertCircle, CheckCircle, Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { casesApi } from '@/lib/api/casesApi';
import { CaseFinance, Payment, CreatePaymentRequest } from '@/types/cases';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface CaseFinanceTabProps {
  caseId: string;
  finance: CaseFinance | null;
  onUpdate?: () => void;
}

const paymentMethodConfig = {
  Bank: { label: 'Bank Transfer', icon: CreditCard },
  Cash: { label: 'Cash', icon: DollarSign },
  Card: { label: 'Card Payment', icon: CreditCard },
  Other: { label: 'Other', icon: Receipt }
};

export function CaseFinanceTab({ caseId, finance, onUpdate }: CaseFinanceTabProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  
  const [paymentForm, setPaymentForm] = useState<CreatePaymentRequest>({
    Amount: 0,
    Currency: 'EUR',
    PaidAt: new Date().toISOString(),
    Method: 'Bank',
    ExternalRef: ''
  });

  useEffect(() => {
    loadPayments();
  }, [caseId]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      // Mock payments data
      const mockPayments: Payment[] = [
        {
          PaymentId: `payment_${caseId}_1`,
          CaseId: caseId,
          Amount: 1500,
          Currency: 'EUR',
          PaidAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          Method: 'Bank',
          ExternalRef: 'TXN123456',
          CreatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          PaymentId: `payment_${caseId}_2`,
          CaseId: caseId,
          Amount: 750,
          Currency: 'EUR',
          PaidAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          Method: 'Card',
          ExternalRef: 'CARD789',
          CreatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      setPayments(mockPayments);
    } catch (error) {
      console.error('Failed to load payments:', error);
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePayment = async () => {
    if (!paymentForm.Amount || paymentForm.Amount <= 0) {
      toast.error('Please enter a valid payment amount');
      return;
    }

    try {
      const payment = await casesApi.createPayment(caseId, paymentForm);
      setPayments(prev => [payment, ...prev]);
      setShowPaymentDialog(false);
      setPaymentForm({
        Amount: 0,
        Currency: 'EUR',
        PaidAt: new Date().toISOString(),
        Method: 'Bank',
        ExternalRef: ''
      });
      toast.success('Payment recorded successfully');
      onUpdate?.();
    } catch (error) {
      toast.error('Failed to record payment');
    }
  };

  if (!finance) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Financial data not available</p>
        </CardContent>
      </Card>
    );
  }

  const totalDebt = finance.Principal + finance.Fees + finance.Penalties + finance.Interest;
  const recoveryRate = totalDebt > 0 ? (finance.PaymentsTotal / totalDebt) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <DollarSign className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Principal</p>
                <p className="text-2xl font-bold">{finance.Currency} {finance.Principal.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Receipt className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Fees</p>
                <p className="text-2xl font-bold">{finance.Currency} {(finance.Fees + finance.Penalties + finance.Interest).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payments</p>
                <p className="text-2xl font-bold">{finance.Currency} {finance.PaymentsTotal.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Outstanding</p>
                <p className="text-2xl font-bold">{finance.Currency} {finance.OpenToPay.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recovery Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Recovery Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Recovery Rate</span>
              <span className="text-lg font-bold">{recoveryRate.toFixed(1)}%</span>
            </div>
            <Progress value={recoveryRate} className="h-3" />
            
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <p className="text-muted-foreground">Total Debt</p>
                <p className="font-medium">{finance.Currency} {totalDebt.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-muted-foreground">Recovered</p>
                <p className="font-medium text-green-600">{finance.Currency} {finance.PaymentsTotal.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-muted-foreground">Remaining</p>
                <p className="font-medium text-red-600">{finance.Currency} {finance.OpenToPay.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Breakdown */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Financial Breakdown</CardTitle>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Debt Components</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Principal Amount</span>
                  <span className="font-medium">{finance.Currency} {finance.Principal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Collection Fees</span>
                  <span className="font-medium">{finance.Currency} {finance.Fees.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Penalties</span>
                  <span className="font-medium">{finance.Currency} {finance.Penalties.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Interest</span>
                  <span className="font-medium">{finance.Currency} {finance.Interest.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total Debt</span>
                  <span>{finance.Currency} {totalDebt.toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Payment Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Payments</span>
                  <span className="font-medium text-green-600">{finance.Currency} {finance.PaymentsTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Not Allocated</span>
                  <span className="font-medium">{finance.Currency} {finance.NotAllocatedTotal.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Open to Pay</span>
                  <span className="text-red-600">{finance.Currency} {finance.OpenToPay.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Payment History
            </CardTitle>
            <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Record Payment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Record New Payment</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Amount</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={paymentForm.Amount || ''}
                        onChange={(e) => setPaymentForm(prev => ({ ...prev, Amount: parseFloat(e.target.value) || 0 }))}
                        placeholder="0.00"
                      />
                    </div>
                    
                    <div>
                      <Label>Currency</Label>
                      <Select value={paymentForm.Currency} onValueChange={(value: any) => setPaymentForm(prev => ({ ...prev, Currency: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="GBP">GBP (£)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Payment Date</Label>
                      <Input
                        type="date"
                        value={paymentForm.PaidAt ? new Date(paymentForm.PaidAt).toISOString().split('T')[0] : ''}
                        onChange={(e) => setPaymentForm(prev => ({ ...prev, PaidAt: e.target.value ? new Date(e.target.value).toISOString() : new Date().toISOString() }))}
                      />
                    </div>
                    
                    <div>
                      <Label>Payment Method</Label>
                      <Select value={paymentForm.Method || 'Bank'} onValueChange={(value: any) => setPaymentForm(prev => ({ ...prev, Method: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(paymentMethodConfig).map(([key, config]) => (
                            <SelectItem key={key} value={key}>
                              <div className="flex items-center gap-2">
                                <config.icon className="h-4 w-4" />
                                {config.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label>External Reference</Label>
                    <Input
                      value={paymentForm.ExternalRef || ''}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, ExternalRef: e.target.value }))}
                      placeholder="Transaction ID, check number, etc."
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreatePayment}>
                    Record Payment
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No payments recorded yet</p>
              <p className="text-sm">Record the first payment to start tracking recovery</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => {
                  const MethodIcon = paymentMethodConfig[payment.Method || 'Bank'].icon;
                  
                  return (
                    <TableRow key={payment.PaymentId}>
                      <TableCell>
                        {format(new Date(payment.PaidAt), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell className="font-medium">
                        {payment.Currency} {payment.Amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MethodIcon className="h-4 w-4" />
                          {paymentMethodConfig[payment.Method || 'Bank'].label}
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {payment.ExternalRef || 'N/A'}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Confirmed
                        </Badge>
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