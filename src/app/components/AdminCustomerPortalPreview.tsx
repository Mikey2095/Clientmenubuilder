import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { getCustomers, getCustomerOrdersById } from '../utils/api';
import { ShoppingBag, X } from 'lucide-react';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Label } from './ui/label';

interface AdminCustomerPortalPreviewProps {
  accessToken: string;
  onBack: () => void;
}

interface Customer {
  id: string;
  email: string;
  user_metadata: {
    name: string;
    phone?: string;
  };
}

interface Order {
  id: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
  status: string;
  pickupTime: string;
  createdAt: string;
  messages?: Array<{
    message: string;
    type: string;
    from: string;
    timestamp: string;
  }>;
}

export function AdminCustomerPortalPreview({ accessToken, onBack }: AdminCustomerPortalPreviewProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const result = await getCustomers(accessToken);
      if (result.customers) {
        setCustomers(result.customers);
      }
    } catch (error) {
      console.log('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerSelect = async (customerId: string) => {
    setSelectedCustomerId(customerId);
    const customer = customers.find(c => c.id === customerId);
    setSelectedCustomer(customer || null);

    if (customerId) {
      try {
        const result = await getCustomerOrdersById(customerId, accessToken);
        if (result.orders) {
          setOrders(result.orders);
        }
      } catch (error) {
        console.log('Error fetching customer orders:', error);
      }
    } else {
      setOrders([]);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'default',
      confirmed: 'secondary',
      preparing: 'default',
      ready: 'default',
      completed: 'default',
      cancelled: 'destructive',
    };
    return colors[status] || 'default';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1>Customer Portal Preview</h1>
              <p className="text-sm text-muted-foreground">View what your customers see</p>
            </div>
            <Button onClick={onBack} variant="outline">
              <X className="w-4 h-4 mr-2" />
              Close Preview
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Customer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Customer Account</Label>
              <Select value={selectedCustomerId} onValueChange={handleCustomerSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a customer to preview their view..." />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.user_metadata?.name || 'Unnamed Customer'} ({customer.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {customers.length === 0 && !loading && (
                <p className="text-sm text-muted-foreground">No customers have signed up yet.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {selectedCustomer ? (
          <>
            <div className="mb-6">
              <h2>Welcome, {selectedCustomer.user_metadata?.name}!</h2>
              <p className="text-sm text-muted-foreground">Viewing as customer</p>
            </div>

            <h2 className="mb-6">Your Orders</h2>

            {orders.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>This customer hasn't placed any orders yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>Order #{order.id.slice(-8).toUpperCase()}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Placed: {new Date(order.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <Badge variant={getStatusColor(order.status) as any} className="capitalize">
                          {order.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="mb-2">Items</h4>
                        <div className="space-y-1">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span>{item.name} x {item.quantity}</span>
                              <span>${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                          <Separator className="my-2" />
                          <div className="flex justify-between">
                            <span>Total</span>
                            <span>${order.total.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="mb-1">Pickup Time</h4>
                        <p className="text-sm">{new Date(order.pickupTime).toLocaleString()}</p>
                      </div>

                      {order.messages && order.messages.length > 0 && (
                        <>
                          <Separator />
                          <div>
                            <h4 className="mb-2">Messages from Restaurant</h4>
                            <div className="space-y-2">
                              {order.messages.filter(m => m.from === 'admin').map((msg, idx) => (
                                <div key={idx} className="p-3 bg-blue-50 rounded border border-blue-200">
                                  <p className="text-sm">{msg.message}</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {new Date(msg.timestamp).toLocaleString()}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Select a customer above to preview their order history</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}