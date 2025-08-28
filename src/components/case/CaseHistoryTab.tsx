// Case History Tab Component
// Comprehensive audit trail with detailed and compact views

import React, { useState, useEffect } from 'react';
import { 
  History, Download, Filter, Calendar, User, FileText, 
  Activity, CreditCard, Upload, Scale, Edit, Plus, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { casesApi } from '@/lib/api/casesApi';
import { CaseHistoryItem } from '@/types/cases';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface CaseHistoryTabProps {
  caseId: string;
}

const historyTypeConfig = {
  Created: { label: 'Case Created', icon: Plus, color: 'bg-green-100 text-green-800' },
  FieldChanged: { label: 'Field Updated', icon: Edit, color: 'bg-blue-100 text-blue-800' },
  Assignment: { label: 'Assignment', icon: User, color: 'bg-purple-100 text-purple-800' },
  Message: { label: 'Message', icon: FileText, color: 'bg-indigo-100 text-indigo-800' },
  Activity: { label: 'Activity', icon: Activity, color: 'bg-orange-100 text-orange-800' },
  Payment: { label: 'Payment', icon: CreditCard, color: 'bg-emerald-100 text-emerald-800' },
  Document: { label: 'Document', icon: Upload, color: 'bg-teal-100 text-teal-800' },
  Escalation: { label: 'Escalation', icon: Scale, color: 'bg-red-100 text-red-800' },
  PhaseChange: { label: 'Phase Change', icon: Scale, color: 'bg-yellow-100 text-yellow-800' },
  Note: { label: 'Note', icon: FileText, color: 'bg-gray-100 text-gray-800' }
};

export function CaseHistoryTab({ caseId }: CaseHistoryTabProps) {
  const [history, setHistory] = useState<CaseHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'detailed' | 'compact'>('detailed');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    loadHistory();
  }, [caseId, viewMode]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const historyData = await casesApi.getCaseHistory(caseId, viewMode);
      setHistory(historyData);
    } catch (error) {
      console.error('Failed to load history:', error);
      toast.error('Failed to load case history');
    } finally {
      setLoading(false);
    }
  };

  const filteredHistory = history.filter(item => 
    typeFilter === 'all' || item.Type === typeFilter
  );

  const exportHistory = () => {
    const csvContent = [
      ['Date', 'Type', 'Title', 'Description', 'User'].join(','),
      ...filteredHistory.map(item => [
        format(new Date(item.When), 'yyyy-MM-dd HH:mm:ss'),
        item.Type,
        `"${item.Title || ''}"`,
        `"${item.Body || ''}"`,
        item.WhoUserId || 'System'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `case-${caseId}-history.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('History exported to CSV');
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading history...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Tabs value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
                <TabsList>
                  <TabsTrigger value="detailed">Detailed View</TabsTrigger>
                  <TabsTrigger value="compact">Compact View</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {Object.entries(historyTypeConfig).map(([key, config]) => (
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
            
            <Button variant="outline" onClick={exportHistory}>
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* History Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Case History ({filteredHistory.length} events)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No history events found</p>
              {typeFilter !== 'all' && (
                <p className="text-sm">Try changing the filter to see more events</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredHistory.map((item, index) => {
                const HistoryIcon = historyTypeConfig[item.Type].icon;
                
                return (
                  <div key={item.HistoryId} className="relative">
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="p-2 bg-primary/10 rounded-full">
                          <HistoryIcon className="h-4 w-4 text-primary" />
                        </div>
                        {index < filteredHistory.length - 1 && (
                          <div className="h-full w-0.5 bg-border mt-3"></div>
                        )}
                      </div>
                      
                      <div className="flex-1 pb-6">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge className={historyTypeConfig[item.Type].color}>
                              {historyTypeConfig[item.Type].label}
                            </Badge>
                            <span className="font-medium">{item.Title}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(item.When), 'MMM dd, yyyy HH:mm')}
                          </div>
                        </div>
                        
                        {viewMode === 'detailed' && item.Body && (
                          <p className="text-sm text-muted-foreground mb-2">{item.Body}</p>
                        )}
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {item.WhoUserId && (
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {item.WhoUserId}
                            </div>
                          )}
                          {item.RefTable && item.RefId && (
                            <div className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {item.RefTable}:{item.RefId}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}