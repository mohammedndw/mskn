import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FileText,
  Download,
  Building2,
  Users,
  FileCheck,
  Wrench,
  Calendar,
  Filter,
  Printer
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { getAuthHeader } from "@/lib/auth";
import { formatSAR } from "@/lib/currency";

type ReportType = 'properties' | 'tenants' | 'contracts' | 'maintenance' | 'summary';

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<ReportType>('summary');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();

  // Fetch all data for reports
  const { data: propertiesData, isLoading: loadingProperties } = useQuery({
    queryKey: ['/api/properties', 'reports'],
    queryFn: async () => {
      const response = await fetch('/api/properties?pageSize=1000', {
        headers: getAuthHeader(),
      });
      if (!response.ok) throw new Error('Failed to fetch properties');
      return response.json();
    },
  });

  const { data: tenantsData, isLoading: loadingTenants } = useQuery({
    queryKey: ['/api/tenants', 'reports'],
    queryFn: async () => {
      const response = await fetch('/api/tenants', {
        headers: getAuthHeader(),
      });
      if (!response.ok) throw new Error('Failed to fetch tenants');
      return response.json();
    },
  });

  const { data: contractsData, isLoading: loadingContracts } = useQuery({
    queryKey: ['/api/contracts', 'reports'],
    queryFn: async () => {
      const response = await fetch('/api/contracts', {
        headers: getAuthHeader(),
      });
      if (!response.ok) throw new Error('Failed to fetch contracts');
      return response.json();
    },
  });

  const { data: maintenanceData, isLoading: loadingMaintenance } = useQuery({
    queryKey: ['/api/maintenance', 'reports'],
    queryFn: async () => {
      const response = await fetch('/api/maintenance', {
        headers: getAuthHeader(),
      });
      if (!response.ok) throw new Error('Failed to fetch maintenance');
      return response.json();
    },
  });

  const { data: estatesData } = useQuery({
    queryKey: ['/api/estates', 'reports'],
    queryFn: async () => {
      const response = await fetch('/api/estates', {
        headers: getAuthHeader(),
      });
      if (!response.ok) throw new Error('Failed to fetch estates');
      return response.json();
    },
  });

  const properties = propertiesData?.data || [];
  const tenants = tenantsData?.data || [];
  const contracts = contractsData?.data || [];
  const maintenance = maintenanceData?.data || [];
  const estates = estatesData?.data || [];

  const isLoading = loadingProperties || loadingTenants || loadingContracts || loadingMaintenance;

  // Calculate summary statistics
  const stats = {
    totalProperties: properties.length,
    rentedProperties: properties.filter((p: any) => p.status === 'RENTED').length,
    availableProperties: properties.filter((p: any) => p.status === 'AVAILABLE').length,
    reservedProperties: properties.filter((p: any) => p.status === 'RESERVED').length,
    totalTenants: tenants.length,
    totalContracts: contracts.length,
    activeContracts: contracts.filter((c: any) => new Date(c.endDate) >= new Date()).length,
    expiredContracts: contracts.filter((c: any) => new Date(c.endDate) < new Date()).length,
    totalMaintenance: maintenance.length,
    pendingMaintenance: maintenance.filter((m: any) => m.status === 'PENDING').length,
    inProgressMaintenance: maintenance.filter((m: any) => m.status === 'IN_PROGRESS').length,
    completedMaintenance: maintenance.filter((m: any) => m.status === 'COMPLETED').length,
    totalEstates: estates.length,
  };

  // Filter data based on status
  const getFilteredData = (data: any[], type: string) => {
    if (statusFilter === 'all') return data;
    return data.filter((item: any) => {
      if (type === 'properties') return item.status === statusFilter;
      if (type === 'contracts') {
        if (statusFilter === 'ACTIVE') return new Date(item.endDate) >= new Date();
        if (statusFilter === 'EXPIRED') return new Date(item.endDate) < new Date();
      }
      if (type === 'maintenance') return item.status === statusFilter;
      return true;
    });
  };

  // Generate PDF report
  const generatePDF = async () => {
    toast({
      title: "Generating PDF",
      description: "Please wait while we generate your report...",
    });

    // Create printable content
    const printContent = document.getElementById('report-content');
    if (!printContent) return;

    // Open print dialog
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({
        title: "Error",
        description: "Please allow pop-ups to generate PDF",
        variant: "destructive",
      });
      return;
    }

    const currentDate = new Date().toLocaleDateString('en-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Property Management Report - ${currentDate}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 40px;
            color: #1a1a1a;
            line-height: 1.6;
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 3px solid #2563eb;
          }
          .header h1 {
            font-size: 28px;
            color: #1e40af;
            margin-bottom: 10px;
          }
          .header p {
            color: #6b7280;
            font-size: 14px;
          }
          .section {
            margin-bottom: 30px;
            page-break-inside: avoid;
          }
          .section-title {
            font-size: 18px;
            font-weight: 600;
            color: #1e40af;
            margin-bottom: 15px;
            padding-bottom: 8px;
            border-bottom: 2px solid #e5e7eb;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin-bottom: 30px;
          }
          .stat-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
          }
          .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: #1e40af;
          }
          .stat-label {
            font-size: 12px;
            color: #6b7280;
            margin-top: 5px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            font-size: 12px;
          }
          th, td {
            border: 1px solid #e2e8f0;
            padding: 10px;
            text-align: left;
          }
          th {
            background: #f1f5f9;
            font-weight: 600;
            color: #374151;
          }
          tr:nth-child(even) {
            background: #f8fafc;
          }
          .badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: 500;
          }
          .badge-green { background: #dcfce7; color: #166534; }
          .badge-yellow { background: #fef9c3; color: #854d0e; }
          .badge-blue { background: #dbeafe; color: #1e40af; }
          .badge-red { background: #fee2e2; color: #991b1b; }
          .badge-orange { background: #ffedd5; color: #9a3412; }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
          }
          @media print {
            body { padding: 20px; }
            .section { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Property Management Report</h1>
          <p>Generated on ${currentDate}</p>
        </div>

        <div class="section">
          <h2 class="section-title">Summary Overview</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-value">${stats.totalProperties}</div>
              <div class="stat-label">Total Properties</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${stats.totalTenants}</div>
              <div class="stat-label">Total Tenants</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${stats.activeContracts}</div>
              <div class="stat-label">Active Contracts</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${stats.pendingMaintenance}</div>
              <div class="stat-label">Pending Maintenance</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">Properties (${properties.length})</h2>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Status</th>
                <th>Location</th>
                <th>Owner</th>
              </tr>
            </thead>
            <tbody>
              ${properties.map((p: any) => `
                <tr>
                  <td>${p.name}</td>
                  <td>${p.type}</td>
                  <td><span class="badge ${p.status === 'RENTED' ? 'badge-green' : p.status === 'AVAILABLE' ? 'badge-blue' : 'badge-yellow'}">${p.status}</span></td>
                  <td>${p.estate?.city || p.city || '-'}, ${p.estate?.region || p.region || '-'}</td>
                  <td>${p.owner ? `${p.owner.firstName} ${p.owner.lastName}` : '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2 class="section-title">Tenants (${tenants.length})</h2>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>National ID</th>
                <th>Phone</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              ${tenants.map((t: any) => `
                <tr>
                  <td>${t.firstName} ${t.lastName}</td>
                  <td>${t.nationalId}</td>
                  <td>${t.phone}</td>
                  <td>${t.email || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2 class="section-title">Contracts (${contracts.length})</h2>
          <table>
            <thead>
              <tr>
                <th>Property</th>
                <th>Tenant</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Price</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${contracts.map((c: any) => {
                const isActive = new Date(c.endDate) >= new Date();
                return `
                <tr>
                  <td>${c.property?.name || '-'}</td>
                  <td>${c.tenant ? `${c.tenant.firstName} ${c.tenant.lastName}` : '-'}</td>
                  <td>${new Date(c.startDate).toLocaleDateString('en-SA')}</td>
                  <td>${new Date(c.endDate).toLocaleDateString('en-SA')}</td>
                  <td>${c.price ? c.price.toLocaleString() + ' SAR' : '-'}</td>
                  <td><span class="badge ${isActive ? 'badge-green' : 'badge-red'}">${isActive ? 'Active' : 'Expired'}</span></td>
                </tr>
              `}).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2 class="section-title">Maintenance Requests (${maintenance.length})</h2>
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Property</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              ${maintenance.map((m: any) => `
                <tr>
                  <td>${m.title}</td>
                  <td>${m.property?.name || '-'}</td>
                  <td><span class="badge ${m.status === 'COMPLETED' ? 'badge-green' : m.status === 'IN_PROGRESS' ? 'badge-yellow' : 'badge-orange'}">${m.status}</span></td>
                  <td>${new Date(m.createdAt).toLocaleDateString('en-SA')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div class="footer">
          <p>Property Management System - Confidential Report</p>
          <p>Generated automatically on ${currentDate}</p>
        </div>
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    // Wait for content to load then print
    setTimeout(() => {
      printWindow.print();
      toast({
        title: "Success",
        description: "PDF report generated. Use your browser's print dialog to save as PDF.",
      });
    }, 500);
  };

  // Export to CSV
  const exportToCSV = (type: ReportType) => {
    let data: any[] = [];
    let headers: string[] = [];
    let filename = '';

    switch (type) {
      case 'properties':
        data = properties;
        headers = ['Name', 'Type', 'Status', 'Bedrooms', 'Bathrooms', 'Area', 'City', 'Region', 'Owner'];
        filename = 'properties_report.csv';
        break;
      case 'tenants':
        data = tenants;
        headers = ['First Name', 'Last Name', 'National ID', 'Phone', 'Email'];
        filename = 'tenants_report.csv';
        break;
      case 'contracts':
        data = contracts;
        headers = ['Property', 'Tenant', 'Start Date', 'End Date', 'Price', 'Status'];
        filename = 'contracts_report.csv';
        break;
      case 'maintenance':
        data = maintenance;
        headers = ['Title', 'Description', 'Property', 'Status', 'Created At'];
        filename = 'maintenance_report.csv';
        break;
      default:
        return;
    }

    const csvContent = [
      headers.join(','),
      ...data.map((item: any) => {
        switch (type) {
          case 'properties':
            return [
              `"${item.name}"`,
              item.type,
              item.status,
              item.bedrooms || '',
              item.bathrooms || '',
              item.area || '',
              item.estate?.city || item.city || '',
              item.estate?.region || item.region || '',
              item.owner ? `${item.owner.firstName} ${item.owner.lastName}` : ''
            ].join(',');
          case 'tenants':
            return [
              `"${item.firstName}"`,
              `"${item.lastName}"`,
              item.nationalId,
              item.phone,
              item.email || ''
            ].join(',');
          case 'contracts':
            return [
              `"${item.property?.name || ''}"`,
              item.tenant ? `"${item.tenant.firstName} ${item.tenant.lastName}"` : '',
              new Date(item.startDate).toLocaleDateString(),
              new Date(item.endDate).toLocaleDateString(),
              item.price || '',
              new Date(item.endDate) >= new Date() ? 'Active' : 'Expired'
            ].join(',');
          case 'maintenance':
            return [
              `"${item.title}"`,
              `"${item.description?.substring(0, 50) || ''}"`,
              `"${item.property?.name || ''}"`,
              item.status,
              new Date(item.createdAt).toLocaleDateString()
            ].join(',');
          default:
            return '';
        }
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();

    toast({
      title: "Success",
      description: `${filename} downloaded successfully`,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading reports data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="page-reports">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground" data-testid="text-reports-title">
            Reports
          </h1>
          <p className="text-muted-foreground mt-2">
            Generate and export comprehensive reports for your property portfolio
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => generatePDF()}>
            <Printer className="h-4 w-4 mr-2" />
            Print / PDF
          </Button>
          <Button onClick={() => generatePDF()}>
            <Download className="h-4 w-4 mr-2" />
            Export Full Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Properties</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProperties}</div>
            <p className="text-xs text-muted-foreground">
              {stats.rentedProperties} rented, {stats.availableProperties} available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tenants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTenants}</div>
            <p className="text-xs text-muted-foreground">
              Active tenants in your properties
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contracts</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalContracts}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeContracts} active, {stats.expiredContracts} expired
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMaintenance}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingMaintenance} pending, {stats.inProgressMaintenance} in progress
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Report Content */}
      <div id="report-content">
        <Tabs defaultValue="properties" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="properties">Properties</TabsTrigger>
              <TabsTrigger value="tenants">Tenants</TabsTrigger>
              <TabsTrigger value="contracts">Contracts</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            </TabsList>
          </div>

          {/* Properties Tab */}
          <TabsContent value="properties" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Properties Report</CardTitle>
                    <CardDescription>All properties in your portfolio</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[150px]">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Filter" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="AVAILABLE">Available</SelectItem>
                        <SelectItem value="RENTED">Rented</SelectItem>
                        <SelectItem value="RESERVED">Reserved</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" onClick={() => exportToCSV('properties')}>
                      <Download className="h-4 w-4 mr-2" />
                      CSV
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getFilteredData(properties, 'properties').map((property: any) => (
                      <TableRow key={property.id}>
                        <TableCell className="font-medium">{property.name}</TableCell>
                        <TableCell className="capitalize">{property.type}</TableCell>
                        <TableCell>
                          <Badge variant={
                            property.status === 'RENTED' ? 'default' :
                            property.status === 'AVAILABLE' ? 'secondary' : 'outline'
                          }>
                            {property.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {property.estate?.city || property.city || '-'}, {property.estate?.region || property.region || '-'}
                        </TableCell>
                        <TableCell>
                          {property.owner ? `${property.owner.firstName} ${property.owner.lastName}` : '-'}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {property.bedrooms && `${property.bedrooms} BR`}
                          {property.bathrooms && ` | ${property.bathrooms} BA`}
                          {property.area && ` | ${property.area} sqm`}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tenants Tab */}
          <TabsContent value="tenants" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Tenants Report</CardTitle>
                    <CardDescription>All tenants registered in the system</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => exportToCSV('tenants')}>
                    <Download className="h-4 w-4 mr-2" />
                    CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>National ID</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tenants.map((tenant: any) => (
                      <TableRow key={tenant.id}>
                        <TableCell className="font-medium">
                          {tenant.firstName} {tenant.lastName}
                        </TableCell>
                        <TableCell>{tenant.nationalId}</TableCell>
                        <TableCell>{tenant.phone}</TableCell>
                        <TableCell>{tenant.email || '-'}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(tenant.createdAt).toLocaleDateString('en-SA')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contracts Tab */}
          <TabsContent value="contracts" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Contracts Report</CardTitle>
                    <CardDescription>All rental contracts</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[150px]">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Filter" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="EXPIRED">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" onClick={() => exportToCSV('contracts')}>
                      <Download className="h-4 w-4 mr-2" />
                      CSV
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property</TableHead>
                      <TableHead>Tenant</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getFilteredData(contracts, 'contracts').map((contract: any) => {
                      const isActive = new Date(contract.endDate) >= new Date();
                      return (
                        <TableRow key={contract.id}>
                          <TableCell className="font-medium">
                            {contract.property?.name || '-'}
                          </TableCell>
                          <TableCell>
                            {contract.tenant ? `${contract.tenant.firstName} ${contract.tenant.lastName}` : '-'}
                          </TableCell>
                          <TableCell>
                            {new Date(contract.startDate).toLocaleDateString('en-SA')}
                          </TableCell>
                          <TableCell>
                            {new Date(contract.endDate).toLocaleDateString('en-SA')}
                          </TableCell>
                          <TableCell>
                            {contract.price ? formatSAR(contract.price) : '-'}
                          </TableCell>
                          <TableCell>
                            <Badge variant={isActive ? 'default' : 'destructive'}>
                              {isActive ? 'Active' : 'Expired'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Maintenance Tab */}
          <TabsContent value="maintenance" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Maintenance Report</CardTitle>
                    <CardDescription>All maintenance requests</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[150px]">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Filter" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="REJECTED">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" onClick={() => exportToCSV('maintenance')}>
                      <Download className="h-4 w-4 mr-2" />
                      CSV
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Property</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getFilteredData(maintenance, 'maintenance').map((request: any) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">{request.title}</TableCell>
                        <TableCell>{request.property?.name || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={
                            request.status === 'COMPLETED' ? 'default' :
                            request.status === 'IN_PROGRESS' ? 'secondary' :
                            request.status === 'PENDING' ? 'outline' : 'destructive'
                          }>
                            {request.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(request.createdAt).toLocaleDateString('en-SA')}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-muted-foreground">
                          {request.description || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
