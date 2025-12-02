import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, UserCircle, Shield, Building2 } from "lucide-react";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import PropertiesPage from "@/pages/properties";
import TenantsPage from "@/pages/tenants";
import ParentEstatesPage from "@/pages/parent-estates";
import ContractsPage from "@/pages/contracts";
import MaintenanceRequestsPage from "@/pages/maintenance-requests";
import UsersPage from "@/pages/users";
import Settings from "@/pages/settings";
import ManagerSettings from "@/pages/manager-settings";
import TenantPortal from "@/pages/tenant-portal";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import OwnerLogin from "@/pages/owner-login";
import AdminLogin from "@/pages/admin-login";
import AdminDashboard from "@/pages/admin-dashboard";
import SubscriptionPlansPage from "@/pages/subscription-plans";
import UserSubscriptionsPage from "@/pages/user-subscriptions";
import ReportsPage from "@/pages/reports";

// ============================================
// ADMIN ROUTES (Separate Platform)
// ============================================
function AdminRouter() {
  return (
    <Switch>
      <Route path="/admin">
        {() => (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin/users">
        {() => (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <UsersPage />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin/subscription-plans">
        {() => (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <SubscriptionPlansPage />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin/user-subscriptions">
        {() => (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <UserSubscriptionsPage />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin/maintenance">
        {() => (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <MaintenanceRequestsPage />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin/settings">
        {() => (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <Settings />
          </ProtectedRoute>
        )}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

// ============================================
// PROPERTY MANAGER ROUTES (Main Platform)
// ============================================
function PropertyManagerRouter() {
  return (
    <Switch>
      <Route path="/">
        {() => (
          <ProtectedRoute allowedRoles={['PROPERTY_MANAGER']}>
            <Dashboard />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/properties">
        {() => (
          <ProtectedRoute allowedRoles={['PROPERTY_MANAGER']}>
            <PropertiesPage />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/tenants">
        {() => (
          <ProtectedRoute allowedRoles={['PROPERTY_MANAGER']}>
            <TenantsPage />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/contracts">
        {() => (
          <ProtectedRoute allowedRoles={['PROPERTY_MANAGER']}>
            <ContractsPage />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/maintenance">
        {() => (
          <ProtectedRoute allowedRoles={['PROPERTY_MANAGER']}>
            <MaintenanceRequestsPage />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/parent-estates">
        {() => (
          <ProtectedRoute allowedRoles={['PROPERTY_MANAGER']}>
            <ParentEstatesPage />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/reports">
        {() => (
          <ProtectedRoute allowedRoles={['PROPERTY_MANAGER']}>
            <ReportsPage />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/settings">
        {() => (
          <ProtectedRoute allowedRoles={['PROPERTY_MANAGER']}>
            <ManagerSettings />
          </ProtectedRoute>
        )}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

// ============================================
// PROPERTY OWNER ROUTES (Read-Only Platform)
// ============================================
function PropertyOwnerRouter() {
  return (
    <Switch>
      <Route path="/owner">
        {() => (
          <ProtectedRoute allowedRoles={['PROPERTY_OWNER']}>
            <Dashboard />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/owner/properties">
        {() => (
          <ProtectedRoute allowedRoles={['PROPERTY_OWNER']}>
            <PropertiesPage />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/owner/tenants">
        {() => (
          <ProtectedRoute allowedRoles={['PROPERTY_OWNER']}>
            <TenantsPage />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/owner/contracts">
        {() => (
          <ProtectedRoute allowedRoles={['PROPERTY_OWNER']}>
            <ContractsPage />
          </ProtectedRoute>
        )}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <AppContent />
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

function AppContent() {
  const [location] = useLocation();
  const { user } = useAuth();

  // Check which portal we're in based on URL
  const isTenantPortal = location.startsWith('/tenant/');
  const isAdminPortal = location.startsWith('/admin');
  const isOwnerPortal = location.startsWith('/owner');
  const isLoginPage = location === '/login';
  const isSignupPage = location === '/signup';
  const isOwnerLoginPage = location === '/owner-login';
  const isAdminLoginPage = location === '/admin/login';

  // Custom sidebar width
  const style = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  // ============================================
  // TENANT PORTAL - Completely separate layout
  // ============================================
  if (isTenantPortal) {
    return (
      <Switch>
        <Route path="/tenant/:token" component={TenantPortal} />
      </Switch>
    );
  }

  // ============================================
  // LOGIN PAGES - No sidebar
  // ============================================
  if (isLoginPage) {
    return (
      <Switch>
        <Route path="/login" component={Login} />
      </Switch>
    );
  }

  if (isSignupPage) {
    return (
      <Switch>
        <Route path="/signup" component={Signup} />
      </Switch>
    );
  }

  if (isOwnerLoginPage) {
    return (
      <Switch>
        <Route path="/owner-login" component={OwnerLogin} />
      </Switch>
    );
  }

  if (isAdminLoginPage) {
    return (
      <Switch>
        <Route path="/admin/login" component={AdminLogin} />
      </Switch>
    );
  }

  // ============================================
  // ADMIN PORTAL - Separate platform with admin sidebar
  // ============================================
  if (isAdminPortal) {
    return (
      <SidebarProvider style={style as React.CSSProperties}>
        <div className="flex h-screen w-full">
          <AdminSidebar />
          <div className="flex flex-col flex-1">
            <AdminHeader />
            <main className="flex-1 overflow-auto p-6">
              <AdminRouter />
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  // ============================================
  // PROPERTY OWNER PORTAL - Read-only platform
  // ============================================
  if (isOwnerPortal) {
    return (
      <SidebarProvider style={style as React.CSSProperties}>
        <div className="flex h-screen w-full">
          <OwnerSidebar />
          <div className="flex flex-col flex-1">
            <OwnerHeader />
            <main className="flex-1 overflow-auto p-6">
              <PropertyOwnerRouter />
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  // ============================================
  // PROPERTY MANAGER PORTAL - Main platform
  // ============================================
  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1">
          <Header />
          <main className="flex-1 overflow-auto p-6">
            <PropertyManagerRouter />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

// ============================================
// HEADERS FOR EACH PORTAL
// ============================================

function Header() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    logout();
    setLocation('/login');
  };

  return (
    <header className="flex items-center justify-between p-4 border-b">
      <SidebarTrigger data-testid="button-sidebar-toggle" />
      <div className="flex-1 text-center">
        <h2 className="text-lg font-semibold text-foreground flex items-center justify-center gap-2">
          <Building2 className="h-5 w-5" />
          Property Manager
        </h2>
        <p className="text-sm text-muted-foreground">Saudi Real Estate Management Platform</p>
      </div>
      <div className="flex items-center gap-2">
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" data-testid="button-user-menu">
                <UserCircle className="h-4 w-4" />
                <span className="ml-2">{user.firstName}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground mt-1">
                    Property Manager
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} data-testid="menu-logout">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}

function AdminHeader() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    logout();
    setLocation('/admin/login');
  };

  return (
    <header className="flex items-center justify-between p-4 border-b bg-red-50 dark:bg-red-950/20">
      <SidebarTrigger data-testid="button-sidebar-toggle" />
      <div className="flex-1 text-center">
        <h2 className="text-lg font-semibold text-foreground flex items-center justify-center gap-2">
          <Shield className="h-5 w-5 text-red-600" />
          Admin Portal
        </h2>
        <p className="text-sm text-muted-foreground">System Administration</p>
      </div>
      <div className="flex items-center gap-2">
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="border-red-200" data-testid="button-user-menu">
                <Shield className="h-4 w-4 text-red-600" />
                <span className="ml-2">{user.firstName}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                  <p className="text-xs leading-none text-red-600 mt-1 font-medium">
                    Administrator
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} data-testid="menu-logout">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}

function OwnerHeader() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    logout();
    setLocation('/owner-login');
  };

  return (
    <header className="flex items-center justify-between p-4 border-b bg-green-50 dark:bg-green-950/20">
      <SidebarTrigger data-testid="button-sidebar-toggle" />
      <div className="flex-1 text-center">
        <h2 className="text-lg font-semibold text-foreground flex items-center justify-center gap-2">
          <Building2 className="h-5 w-5 text-green-600" />
          Property Owner Portal
        </h2>
        <p className="text-sm text-muted-foreground">View Your Properties</p>
      </div>
      <div className="flex items-center gap-2">
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="border-green-200" data-testid="button-user-menu">
                <UserCircle className="h-4 w-4 text-green-600" />
                <span className="ml-2">{user.firstName}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                  <p className="text-xs leading-none text-green-600 mt-1 font-medium">
                    Property Owner
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} data-testid="menu-logout">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}

// ============================================
// OWNER SIDEBAR
// ============================================
import { Home, Building2 as BuildingIcon, Users, FileText } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";

function OwnerSidebar() {
  const [location] = useLocation();

  const ownerMenuItems = [
    { title: "Dashboard", url: "/owner", icon: Home },
    { title: "My Properties", url: "/owner/properties", icon: BuildingIcon },
    { title: "My Tenants", url: "/owner/tenants", icon: Users },
    { title: "My Contracts", url: "/owner/contracts", icon: FileText },
  ];

  return (
    <Sidebar side="left" data-testid="sidebar-owner">
      <SidebarHeader className="border-b border-border p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-green-600 rounded-lg flex items-center justify-center">
            <BuildingIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground">Owner Portal</h2>
            <p className="text-xs text-muted-foreground">Property Owner</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>My Portfolio</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {ownerMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`nav-owner-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export default App;
