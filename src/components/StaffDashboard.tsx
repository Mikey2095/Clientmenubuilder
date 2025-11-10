import { useState, useEffect } from 'react';
import { getOrders, getMenu, getSession } from '../utils/api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { LogOut, User, ClipboardList, UtensilsCrossed } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { MenuItem } from './MenuCard';

interface StaffDashboardProps {
  onLogout: () => void;
  accessToken: string;
}

interface Order {
  id: string;
  customerName: string;
  phone: string;
  items: any[];
  total: number;
  status: string;
  createdAt: string;
  pickupDate?: string;
  pickupTime?: string;
}

export function StaffDashboard({ onLogout, accessToken }: StaffDashboardProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [userName, setUserName] = useState('User');
  const [userTitle, setUserTitle] = useState('Staff');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersResult, menuResult, sessionResult] = await Promise.all([
          getOrders(accessToken),
          getMenu(),
          getSession(),
        ]);

        if (ordersResult.orders) {
          setOrders(ordersResult.orders);
        }

        if (menuResult.items) {
          setMenuItems(menuResult.items);
        }

        if (sessionResult.data?.session?.user) {
          const user = sessionResult.data.session.user;
          setUserName(user.user_metadata?.name || 'User');
          setUserTitle(user.user_metadata?.title || 'Staff');
        }
      } catch (error) {
        console.log('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [accessToken]);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'confirmed':
        return 'bg-blue-500';
      case 'preparing':
        return 'bg-orange-500';
      case 'ready':
        return 'bg-green-500';
      case 'completed':
        return 'bg-gray-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusProgress = (status: string) => {
    switch (status) {
      case 'pending':
        return 20;
      case 'confirmed':
        return 40;
      case 'preparing':
        return 60;
      case 'ready':
        return 80;
      case 'completed':
        return 100;
      default:
        return 0;
    }
  };

  const activeOrders = orders.filter(o => 
    ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <h1 className="text-lg sm:text-2xl">Staff Dashboard</h1>
              <Badge variant="secondary" className="bg-primary text-white">
                {activeOrders.length} Active
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                <User className="w-4 h-4 text-gray-600" />
                <div className="text-sm">
                  <div className="font-medium">{userName}</div>
                  <div className="text-xs text-muted-foreground">{userTitle}</div>
                </div>
              </div>
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
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="orders">
              <ClipboardList className="w-4 h-4 mr-2" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="menu">
              <UtensilsCrossed className="w-4 h-4 mr-2" />
              Menu
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Active Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {activeOrders.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No active orders at the moment
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeOrders.map((order) => (
                      <Card key={order.id} className="border-l-4" style={{ borderLeftColor: getStatusBadgeColor(order.status).replace('bg-', '#') }}>
                        <CardContent className="pt-6">
                          <div className="space-y-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold">{order.customerName}</h3>
                                <p className="text-sm text-muted-foreground">{order.phone}</p>
                              </div>
                              <Badge className={getStatusBadgeColor(order.status)} variant="secondary">
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </Badge>
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Order Progress</span>
                                <span className="font-medium">{getStatusProgress(order.status)}%</span>
                              </div>
                              <Progress value={getStatusProgress(order.status)} />
                            </div>

                            <div className="border-t pt-3">
                              <h4 className="text-sm font-medium mb-2">Items:</h4>
                              {order.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-sm">
                                  <span>{item.quantity}x {item.name}</span>
                                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                              ))}
                            </div>

                            <div className="flex justify-between items-center pt-3 border-t">
                              <div className="text-sm text-muted-foreground">
                                {order.pickupDate && order.pickupTime && (
                                  <div>Pickup: {order.pickupDate} at {order.pickupTime}</div>
                                )}
                              </div>
                              <div className="font-bold">${order.total.toFixed(2)}</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Completed & Cancelled Orders</CardTitle>
              </CardHeader>
              <CardContent>
                {orders.filter(o => ['completed', 'cancelled'].includes(o.status)).length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No completed or cancelled orders yet
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders
                      .filter(o => ['completed', 'cancelled'].includes(o.status))
                      .slice(0, 5)
                      .map((order) => (
                        <div key={order.id} className="flex justify-between items-center py-2 border-b last:border-0">
                          <div>
                            <div className="font-medium">{order.customerName}</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <Badge className={getStatusBadgeColor(order.status)} variant="secondary">
                            {order.status}
                          </Badge>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="menu">
            <Card>
              <CardHeader>
                <CardTitle>Current Menu</CardTitle>
              </CardHeader>
              <CardContent>
                {menuItems.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No menu items available
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {menuItems.map((item) => (
                      <Card key={item.id}>
                        <CardContent className="pt-6">
                          {item.imageUrl && (
                            <div className="aspect-video mb-3 rounded-lg overflow-hidden">
                              <img 
                                src={item.imageUrl} 
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <h3 className="font-semibold mb-1">{item.name}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                          <div className="flex justify-between items-center">
                            <span className="font-bold">${item.price.toFixed(2)}</span>
                            <Badge variant={item.isSpecial ? 'default' : 'secondary'}>
                              {item.category}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
