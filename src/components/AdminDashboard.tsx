import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { LogOut, Bell, Eye, User, Users } from 'lucide-react';
import { OrdersPanel } from './OrdersPanel';
import { MenuManagement } from './MenuManagement';
import { BrandingPanel } from './BrandingPanel';
import { AdminManagementPanel } from './AdminManagementPanel';
import { GalleryPanel } from './GalleryPanel';
import { UserManagement } from './UserManagement';
import { Badge } from './ui/badge';
import { getSession } from '../utils/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { AdminCustomerPortalPreview } from './AdminCustomerPortalPreview';

interface AdminDashboardProps {
  onLogout: () => void;
  accessToken: string;
  onPreview: () => void;
}

export function AdminDashboard({ onLogout, accessToken, onPreview }: AdminDashboardProps) {
  const [userName, setUserName] = useState('Admin');
  const [userRole, setUserRole] = useState('Admin');
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [showCustomerPortalPreview, setShowCustomerPortalPreview] = useState(false);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const { data } = await getSession();
        if (data?.session?.user) {
          const metadata = data.session.user.user_metadata || {};
          setUserName(metadata.name || 'Admin');
          setUserRole(metadata.role || 'admin');
        }
      } catch (error) {
        console.log('Error fetching user info:', error);
      }
    };
    fetchUserInfo();
  }, []);

  const getRoleDisplay = () => {
    if (userRole === 'admin') {
      return 'Admin';
    }
    return userRole;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 gap-2">
            <div className="flex items-center gap-3">
              <h1 className="text-lg sm:text-2xl">Admin Dashboard</h1>
              {pendingOrdersCount > 0 && (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <Bell className="w-3 h-3" />
                  <span className="hidden sm:inline">{pendingOrdersCount} New</span>
                  <span className="sm:hidden">{pendingOrdersCount}</span>
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-end">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                <User className="w-4 h-4 text-gray-600" />
                <div className="text-sm">
                  <div className="font-medium">{userName}</div>
                  <div className="text-xs text-muted-foreground">{getRoleDisplay()}</div>
                </div>
              </div>
              <Button onClick={onPreview} variant="outline" size="sm">
                <Eye className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Preview Site</span>
              </Button>
              <Button onClick={() => setShowCustomerPortalPreview(true)} variant="outline" size="sm" className="hidden md:flex">
                <Users className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Customer Portal</span>
              </Button>
              <Button onClick={onLogout} variant="outline" size="sm">
                <LogOut className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList>
            <TabsTrigger value="orders">
              Orders
              {pendingOrdersCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {pendingOrdersCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="menu">Menu Management</TabsTrigger>
            <TabsTrigger value="branding">Branding</TabsTrigger>
            <TabsTrigger value="admin">Admin Management</TabsTrigger>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <OrdersPanel 
              accessToken={accessToken}
              onPendingCountChange={setPendingOrdersCount}
            />
          </TabsContent>

          <TabsContent value="menu">
            <MenuManagement accessToken={accessToken} />
          </TabsContent>

          <TabsContent value="branding">
            <BrandingPanel accessToken={accessToken} />
          </TabsContent>

          <TabsContent value="admin">
            <AdminManagementPanel accessToken={accessToken} />
          </TabsContent>

          <TabsContent value="gallery">
            <GalleryPanel accessToken={accessToken} />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement accessToken={accessToken} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Customer Portal Preview Dialog */}
      <Dialog open={showCustomerPortalPreview} onOpenChange={setShowCustomerPortalPreview}>
        <DialogContent className="max-w-[95vw] w-full max-h-[95vh] h-full overflow-hidden p-0">
          <AdminCustomerPortalPreview 
            accessToken={accessToken}
            onBack={() => setShowCustomerPortalPreview(false)} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}