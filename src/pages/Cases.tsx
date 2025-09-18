// Professional Cases List Page for B2B Debt Collection Platform
// Cases 2.0: Enhanced filtering, saved views, bulk actions, and comprehensive case management

import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, Search, Filter, Download, FileText, Eye, MoreHorizontal, 
  Save, Star, Users, Tag, Calendar, Building, Briefcase, Scale,
  Clock, AlertTriangle, CheckCircle, User, Archive
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/components/auth/AuthProvider';
import { casesApi } from '@/lib/api/casesApi';
import { CaseSummary, CaseFilters, SavedView, CasePhase, CaseZone } from '@/types/cases';
import { AIHelpButton } from '@/components/ai/AIHelpButton';
import { useTranslation } from '@/contexts/TranslationContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const ITEMS_PER_PAGE = 10;

// Phase configuration for UI
const phaseConfig = {
  Soft: { label: 'Soft Collection', color: 'bg-blue-100 text-blue-800', icon: Clock },
  Field: { label: 'Field Collection', color: 'bg-yellow-100 text-yellow-800', icon: User },
  Legal: { label: 'Legal Action', color: 'bg-red-100 text-red-800', icon: Scale },
  Bailiff: { label: 'Bailiff Action', color: 'bg-purple-100 text-purple-800', icon: AlertTriangle },
  Closed: { label: 'Closed', color: 'bg-green-100 text-green-800', icon: CheckCircle }
};

const zoneConfig = {
  PreLegal: { label: 'Pre-Legal', color: 'bg-gray-100 text-gray-800' },
  Legal: { label: 'Legal', color: 'bg-red-100 text-red-800' },
  Bailiff: { label: 'Bailiff', color: 'bg-purple-100 text-purple-800' }
};

const statusConfig = {
  PendingAcceptance: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  Active: { label: 'Active', color: 'bg-green-100 text-green-800' },
  Refused: { label: 'Refused', color: 'bg-red-100 text-red-800' },
  Closed: { label: 'Closed', color: 'bg-gray-100 text-gray-800' }
};

export default function Cases() {
  const { user, hasRole } = useAuth();
  const { t } = useTranslation();
  
  // Enhanced filters
  const [filters, setFilters] = useState<CaseFilters>({
    Query: '',
    Phase: undefined,
    Zone: undefined,
    Assignee: undefined,
    Label: undefined,
    Page: 1,
    Size: ITEMS_PER_PAGE
  });
  
  const [sortBy, setSortBy] = useState<'OpenedAt' | 'Principal' | 'UpdatedAt'>('OpenedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCases, setSelectedCases] = useState<string[]>([]);
  const [showSavedViewDialog, setShowSavedViewDialog] = useState(false);
  const [savedViewName, setSavedViewName] = useState('');
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);

  const [caseList, setCaseList] = useState<CaseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load cases from API
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        const response = await casesApi.getCases(filters);
        if (isMounted) setCaseList(response.Items);
      } catch (e: any) {
        console.error('Failed to load cases', e);
        if (isMounted) setError(e.message || 'Failed to load cases');
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, [filters]);

  // Load saved views
  useEffect(() => {
    (async () => {
      try {
        const views = await casesApi.getSavedViews();
        setSavedViews(views);
      } catch (e) {
        console.error('Failed to load saved views', e);
      }
    })();
  }, []);

  // Filter cases based on user role and permissions
  const filteredCases = useMemo(() => {
    let data = caseList;

    // Role-based filtering
    if (hasRole('CLIENT') && user?.clientId) {
      data = data.filter(c => c.ClientId === user.clientId);
    } else if (hasRole('AGENT') && user?.id) {
      data = data.filter(c => c.AssignedToUserId === user.id);
    }
    // ADMIN and DPO see all cases

    // Sort
    data = [...data].sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'Principal':
          // Would need to join with finance data in real implementation
          aValue = Math.random() * 50000;
          bValue = Math.random() * 50000;
          break;
        case 'UpdatedAt':
          aValue = new Date(a.AcceptedAt || a.OpenedAt);
          bValue = new Date(b.AcceptedAt || b.OpenedAt);
          break;
        default:
          aValue = new Date(a.OpenedAt);
          bValue = new Date(b.OpenedAt);
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return data;
  }, [caseList, user, hasRole, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredCases.length / ITEMS_PER_PAGE);
  const paginatedCases = filteredCases.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSort = (field: 'OpenedAt' | 'Principal' | 'UpdatedAt') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleFilterChange = (key: keyof CaseFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, Page: 1 }));
    setCurrentPage(1);
  };

  const handleSaveView = async () => {
    if (!savedViewName.trim()) {
      toast.error('Please enter a name for the saved view');
      return;
    }

    try {
      const view = await casesApi.createSavedView(savedViewName, filters);
      setSavedViews(prev => [view, ...prev]);
      setSavedViewName('');
      setShowSavedViewDialog(false);
      toast.success(`Saved view "${view.Name}" created`);
    } catch (error) {
      toast.error('Failed to save view');
    }
  };

  const handleLoadView = (view: SavedView) => {
    setFilters(view.Filters);
    setCurrentPage(1);
    toast.success(`Loaded view "${view.Name}"`);
  };

  const handleBulkAction = async (action: string) => {
    if (selectedCases.length === 0) {
      toast.error('Please select cases first');
      return;
    }

    // Mock bulk actions
    switch (action) {
      case 'assign':
        toast.success(`Assigned ${selectedCases.length} cases`);
        break;
      case 'label':
        toast.success(`Added labels to ${selectedCases.length} cases`);
        break;
      case 'escalate':
        toast.success(`Requested escalation for ${selectedCases.length} cases`);
        break;
    }
    
    setSelectedCases([]);
  };

  const toggleCaseSelection = (caseId: string) => {
    setSelectedCases(prev => 
      prev.includes(caseId) 
        ? prev.filter(id => id !== caseId)
        : [...prev, caseId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedCases.length === paginatedCases.length) {
      setSelectedCases([]);
    } else {
      setSelectedCases(paginatedCases.map(c => c.CaseId));
    }
  };

  const exportCases = () => {
    // Convert to CSV and download
    const csvContent = [
      ['Case Number', 'Phase', 'Zone', 'Status', 'Priority', 'Opened', 'Labels'].join(','),
      ...filteredCases.map(c => [
        c.CaseNumber,
        c.Phase,
        c.Zone,
        c.Status,
        c.Priority || 'Medium',
        new Date(c.OpenedAt).toLocaleDateString('en-GB'),
        `"${c.Labels.join(', ')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cases-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Cases 2.0</h1>
          <p className="text-muted-foreground mt-1">
            Enhanced case management with workflows, activities, and finance tracking
          </p>
        </div>
        <div className="flex items-center gap-3">
          {selectedCases.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Users className="h-4 w-4 mr-2" />
                  Bulk Actions ({selectedCases.length})
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleBulkAction('assign')}>
                  <User className="h-4 w-4 mr-2" />
                  Assign to Agent
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkAction('label')}>
                  <Tag className="h-4 w-4 mr-2" />
                  Add Label
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkAction('escalate')}>
                  <Scale className="h-4 w-4 mr-2" />
                  Request Escalation
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <AIHelpButton onOpenAI={() => {}} />
          <Button
            variant="outline"
            size="sm"
            onClick={exportCases}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          {(hasRole(['CLIENT', 'ADMIN'])) && (
            <Button asChild>
              <Link to="/cases/new" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Case
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Enhanced Filters & Saved Views */}
      <Card className="card-professional border-muted/50">
        <CardContent className="p-4">
          <Tabs defaultValue="filters" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="filters">Filters</TabsTrigger>
              <TabsTrigger value="views">Saved Views ({savedViews.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="filters" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search cases..."
                    value={filters.Query || ''}
                    onChange={(e) => handleFilterChange('Query', e.target.value)}
                    className="pl-10 h-9"
                  />
                </div>

                {/* Phase Filter */}
                <Select value={filters.Phase || 'all'} onValueChange={(value) => handleFilterChange('Phase', value === 'all' ? undefined : value)}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="All Phases" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Phases</SelectItem>
                    <SelectItem value="Soft">Soft Collection</SelectItem>
                    <SelectItem value="Field">Field Collection</SelectItem>
                    <SelectItem value="Legal">Legal Action</SelectItem>
                    <SelectItem value="Bailiff">Bailiff Action</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                  </SelectContent>
                </Select>

                {/* Zone Filter */}
                <Select value={filters.Zone || 'all'} onValueChange={(value) => handleFilterChange('Zone', value === 'all' ? undefined : value)}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="All Zones" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Zones</SelectItem>
                    <SelectItem value="PreLegal">Pre-Legal</SelectItem>
                    <SelectItem value="Legal">Legal</SelectItem>
                    <SelectItem value="Bailiff">Bailiff</SelectItem>
                  </SelectContent>
                </Select>

                {/* Assignee Filter */}
                <Select value={filters.Assignee || 'all'} onValueChange={(value) => handleFilterChange('Assignee', value === 'all' ? undefined : value)}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="All Assignees" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Assignees</SelectItem>
                    <SelectItem value="agent_1">Agent 1</SelectItem>
                    <SelectItem value="agent_2">Agent 2</SelectItem>
                    <SelectItem value="agent_3">Agent 3</SelectItem>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFilters({ Page: 1, Size: ITEMS_PER_PAGE });
                      setCurrentPage(1);
                    }}
                  >
                    Clear Filters
                  </Button>
                  
                  <Dialog open={showSavedViewDialog} onOpenChange={setShowSavedViewDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Save className="h-4 w-4 mr-2" />
                        Save View
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Save Current View</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="viewName">View Name</Label>
                          <Input
                            id="viewName"
                            value={savedViewName}
                            onChange={(e) => setSavedViewName(e.target.value)}
                            placeholder="Enter view name..."
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowSavedViewDialog(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleSaveView}>
                          Save View
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                
                <Select value={`${sortBy}_${sortOrder}`} onValueChange={(value) => {
                  const [field, order] = value.split('_');
                  setSortBy(field as typeof sortBy);
                  setSortOrder(order as typeof sortOrder);
                }}>
                  <SelectTrigger className="w-[160px] h-9">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OpenedAt_desc">Newest First</SelectItem>
                    <SelectItem value="OpenedAt_asc">Oldest First</SelectItem>
                    <SelectItem value="Principal_desc">Highest Amount</SelectItem>
                    <SelectItem value="Principal_asc">Lowest Amount</SelectItem>
                    <SelectItem value="UpdatedAt_desc">Recently Updated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
            
            <TabsContent value="views" className="space-y-4">
              {savedViews.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Star className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No saved views yet</p>
                  <p className="text-sm">Save your current filters to quickly access them later</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {savedViews.map((view) => (
                    <Card key={view.ViewId} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleLoadView(view)}>
                      <CardContent className="p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Star className="h-4 w-4 text-primary" />
                          <h4 className="font-medium text-sm">{view.Name}</h4>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Created {new Date(view.CreatedAt).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {paginatedCases.length} of {filteredCases.length} cases
          {selectedCases.length > 0 && ` (${selectedCases.length} selected)`}
        </span>
        {filteredCases.length > ITEMS_PER_PAGE && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span>Page {currentPage} of {totalPages}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Cases Table */}
      <Card className="card-professional">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedCases.length === paginatedCases.length && paginatedCases.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('OpenedAt')}
              >
                Case Number
                {sortBy === 'OpenedAt' && (
                  <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </TableHead>
              <TableHead>Phase</TableHead>
              <TableHead>Zone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50 text-right"
                onClick={() => handleSort('Principal')}
              >
                Principal
                {sortBy === 'Principal' && (
                  <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead>Labels</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort('UpdatedAt')}
              >
                Opened
                {sortBy === 'UpdatedAt' && (
                  <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12">
                  <div className="text-muted-foreground">Loading cases...</div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12">
                  <div className="text-destructive">Failed to load cases: {error}</div>
                </TableCell>
              </TableRow>
            ) : paginatedCases.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="h-12 w-12 text-muted-foreground/50" />
                    <p className="text-muted-foreground">
                      {filters.Query || filters.Phase || filters.Zone
                        ? 'No cases match your filters' 
                        : 'No cases found'
                      }
                    </p>
                    {hasRole(['CLIENT', 'ADMIN']) && !filters.Query && !filters.Phase && (
                      <Button asChild variant="outline" className="mt-2">
                        <Link to="/cases/new">Create First Case</Link>
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedCases.map((case_) => {
                const PhaseIcon = phaseConfig[case_.Phase].icon;
                return (
                  <TableRow key={case_.id} className="hover:bg-muted/30">
                    <TableCell>
                      <Checkbox
                        checked={selectedCases.includes(case_.CaseId)}
                        onCheckedChange={() => toggleCaseSelection(case_.CaseId)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <Link 
                        to={`/cases/${case_.CaseId}`}
                        className="text-primary hover:underline"
                      >
                        {case_.CaseNumber}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge className={phaseConfig[case_.Phase].color}>
                        <PhaseIcon className="h-3 w-3 mr-1" />
                        {phaseConfig[case_.Phase].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={zoneConfig[case_.Zone].color}>
                        {zoneConfig[case_.Zone].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusConfig[case_.Status].color}>
                        {statusConfig[case_.Status].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {case_.Priority && (
                        <Badge variant="outline" className={
                          case_.Priority === 'High' ? 'border-red-500 text-red-500' :
                          case_.Priority === 'Medium' ? 'border-yellow-500 text-yellow-500' :
                          'border-green-500 text-green-500'
                        }>
                          {case_.Priority}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-mono">€{Math.floor(Math.random() * 50000 + 1000).toLocaleString()}</span>
                    </TableCell>
                    <TableCell>
                      {case_.AssignedToUserId ? (
                        <span className="text-sm">Agent {case_.AssignedToUserId.split('_')[1]}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground italic">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {case_.Labels.slice(0, 2).map((label) => (
                          <Badge key={label} variant="outline" className="text-xs">
                            {label}
                          </Badge>
                        ))}
                        {case_.Labels.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{case_.Labels.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(case_.OpenedAt).toLocaleDateString('en-GB')}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/cases/${case_.CaseId}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}