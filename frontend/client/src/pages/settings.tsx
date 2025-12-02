import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Settings as SettingsIcon, Save, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Setting {
  key: string;
  value: string;
  description: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function Settings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [settingsMap, setSettingsMap] = useState<Record<string, string>>({});

  // Fetch all settings
  const { data: settingsResponse, isLoading } = useQuery({
    queryKey: ['/api/settings'],
    queryFn: async () => {
      const response = await fetch('/api/settings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch settings');
      return response.json();
    },
  });

  const settings: Setting[] = settingsResponse?.data || [];

  // Initialize settings map when data loads
  useEffect(() => {
    if (settings.length > 0) {
      const map: Record<string, string> = {};
      settings.forEach((setting) => {
        map[setting.key] = setting.value;
      });
      setSettingsMap(map);
    }
  }, [settings]);

  // Update setting mutation
  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      return await apiRequest('PUT', `/api/settings/${key}`, { value });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({
        title: 'Settings updated',
        description: 'Your settings have been saved successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    },
  });

  // Initialize settings mutation (creates default settings if they don't exist)
  const initializeSettingsMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/settings/initialize', undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({
        title: 'Settings initialized',
        description: 'Default settings have been created.',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    },
  });

  const handleInputChange = (key: string, value: string) => {
    setSettingsMap((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveAll = () => {
    // Update all modified settings
    const updates = Object.entries(settingsMap).map(([key, value]) => {
      const originalSetting = settings.find(s => s.key === key);
      if (originalSetting && originalSetting.value !== value) {
        return updateSettingMutation.mutateAsync({ key, value });
      }
      return null;
    }).filter(Boolean);

    Promise.all(updates).then(() => {
      toast({
        title: 'All settings saved',
        description: 'Your settings have been updated successfully.',
      });
    });
  };

  const handleInitialize = () => {
    initializeSettingsMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  // Group settings by category (based on key prefix)
  const companySettings = settings.filter(s => s.key.startsWith('company.'));
  const systemSettings = settings.filter(s => s.key.startsWith('system.'));
  const notificationSettings = settings.filter(s => s.key.startsWith('notification.'));
  const otherSettings = settings.filter(s =>
    !s.key.startsWith('company.') &&
    !s.key.startsWith('system.') &&
    !s.key.startsWith('notification.')
  );

  const renderSettingInput = (setting: Setting) => (
    <div key={setting.key} className="grid gap-2">
      <Label htmlFor={setting.key}>
        {setting.key.split('.').pop()?.replace(/([A-Z])/g, ' $1').trim()}
      </Label>
      <Input
        id={setting.key}
        value={settingsMap[setting.key] || ''}
        onChange={(e) => handleInputChange(setting.key, e.target.value)}
        placeholder={setting.description || ''}
      />
      {setting.description && (
        <p className="text-xs text-muted-foreground">{setting.description}</p>
      )}
    </div>
  );

  return (
    <div className="space-y-6" data-testid="page-settings">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground" data-testid="text-settings-title">
            Settings
          </h1>
          <p className="text-muted-foreground mt-2" data-testid="text-settings-description">
            Manage your application configuration
          </p>
        </div>
        <div className="flex gap-2">
          {settings.length === 0 && (
            <Button
              onClick={handleInitialize}
              disabled={initializeSettingsMutation.isPending}
              variant="outline"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {initializeSettingsMutation.isPending ? 'Initializing...' : 'Initialize Settings'}
            </Button>
          )}
          <Button
            onClick={handleSaveAll}
            disabled={updateSettingMutation.isPending || settings.length === 0}
          >
            <Save className="h-4 w-4 mr-2" />
            Save All Changes
          </Button>
        </div>
      </div>

      {settings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <SettingsIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No settings found</p>
            <p className="text-sm text-muted-foreground mt-2">Click "Initialize Settings" to create default settings</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Company Settings */}
          {companySettings.length > 0 && (
            <Card data-testid="card-company-settings">
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {companySettings.map(renderSettingInput)}
              </CardContent>
            </Card>
          )}

          {/* System Settings */}
          {systemSettings.length > 0 && (
            <Card data-testid="card-system-settings">
              <CardHeader>
                <CardTitle>System Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {systemSettings.map(renderSettingInput)}
              </CardContent>
            </Card>
          )}

          {/* Notification Settings */}
          {notificationSettings.length > 0 && (
            <Card data-testid="card-notification-settings">
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {notificationSettings.map(renderSettingInput)}
              </CardContent>
            </Card>
          )}

          {/* Other Settings */}
          {otherSettings.length > 0 && (
            <Card data-testid="card-other-settings">
              <CardHeader>
                <CardTitle>Other Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {otherSettings.map(renderSettingInput)}
              </CardContent>
            </Card>
          )}

          {/* Info Card */}
          <Card className="border-dashed" data-testid="card-settings-info">
            <CardContent className="p-6">
              <h3 className="font-medium text-foreground mb-2">Settings Information</h3>
              <p className="text-sm text-muted-foreground">
                These settings control various aspects of your application. Changes are saved immediately to the database.
                Make sure to review your changes before saving.
              </p>
              <Separator className="my-4" />
              <p className="text-sm text-muted-foreground">
                <strong>Total Settings:</strong> {settings.length} |{' '}
                <strong>Public:</strong> {settings.filter(s => s.isPublic).length} |{' '}
                <strong>Private:</strong> {settings.filter(s => !s.isPublic).length}
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
