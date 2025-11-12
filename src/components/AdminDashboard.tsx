import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { LogOut, Bell, Eye, User, Users, Menu as MenuIcon } from 'lucide-react';
import { OrdersPanel } from './OrdersPanel';
import { MenuManagement } from './MenuManagement';
import { BrandingPanel } from './BrandingPanel';
import { AdminManagementPanel } from './AdminManagementPanel';
import { GalleryPanel } from './GalleryPanel';
import { UserManagement } from './UserManagement';
import { Badge } from './ui/badge';
import { getSession } from '../utils/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
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

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-2 flex-wrap justify-end">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                <User className="w-4 h-4 text-gray-600" />
                <div className="text-sm">
                  <div className="font-medium">{userName}</div>
                  <div className="text-xs text-muted-foreground">{getRoleDisplay()}</div>
                </div>
              </div>
              <Button onClick={onPreview} variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                Preview Site
              </Button>
              <Button onClick={() => setShowCustomerPortalPreview(true)} variant="outline" size="sm">
                <Users className="w-4 h-4 mr-2" />
                Customer Portal
              </Button>
              <Button onClick={onLogout} variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>

            {/* Mobile Navigation - Hamburger Menu */}
            <div className="flex lg:hidden gap-2 items-center">
              <Button onClick={onPreview} variant="outline" size="sm" className="h-9 w-9 p-0">
                <Eye className="w-4 h-4" />
              </Button>
              
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 w-9 p-0">
                    <MenuIcon className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] sm:w-[320px]" aria-describedby="admin-menu-description">
                  <SheetHeader>
                    <SheetTitle>Admin Menu</SheetTitle>
                  </SheetHeader>
                  <span id="admin-menu-description" className="sr-only">Admin navigation and settings</span>
                  <div className="flex flex-col gap-4 mt-6">
                    {/* User Info */}
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                      <User className="w-4 h-4 text-gray-600" />
                      <div className="text-sm">
                        <div className="font-medium">{userName}</div>
                        <div className="text-xs text-muted-foreground">{getRoleDisplay()}</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-2">
                      <Button 
                        onClick={() => setShowCustomerPortalPreview(true)} 
                        variant="outline" 
                        className="w-full justify-start"
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Customer Portal
                      </Button>
                      <Button 
                        onClick={onLogout} 
                        variant="outline" 
                        className="w-full justify-start"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="orders" className="space-y-6">
          {/* Scrollable Tab List for Mobile */}
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <TabsList className="inline-flex w-auto min-w-full sm:w-full">
              <TabsTrigger value="orders" className="whitespace-nowrap">
                Orders
                {pendingOrdersCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {pendingOrdersCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="menu" className="whitespace-nowrap">Menu</TabsTrigger>
              <TabsTrigger value="branding" className="whitespace-nowrap">Branding</TabsTrigger>
              <TabsTrigger value="admin" className="whitespace-nowrap">Admins</TabsTrigger>
              <TabsTrigger value="gallery" className="whitespace-nowrap">Gallery</TabsTrigger>
              <TabsTrigger value="users" className="whitespace-nowrap">Users</TabsTrigger>
            </TabsList>
          </div>

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
          <div className="sr-only">
            <DialogTitle>Customer Portal Preview</DialogTitle>
            <DialogDescription>Preview of the customer portal interface</DialogDescription>
          </div>
          <AdminCustomerPortalPreview 
            accessToken={accessToken}
            onBack={() => setShowCustomerPortalPreview(false)} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}