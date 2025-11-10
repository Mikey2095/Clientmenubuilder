import { useState, useEffect } from 'react';
import { getOrders, updateOrderStatus, addOrderMessage } from '../utils/api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { CheckCircle2, Clock, ChefHat, Package, XCircle, Phone, Mail, Calendar, MessageSquare, Bell } from 'lucide-react';
import { Separator } from './ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner@2.0.3';

interface Order {
  id: string;
  customerName: string;
  phone: string;
  email?: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
  status: string;
  pickupTime: string;
  specialRequests?: string;
  isCatering: boolean;
  paymentMethod: string;
  paymentConfirmation?: string;
  createdAt: string;
  messages?: Array<{
    message: string;
    type: string;
    from: string;
    timestamp: string;
  }>;
}

interface OrdersPanelProps {
  accessToken: string;
  onPendingCountChange?: (count: number) => void;
}

export function OrdersPanel({ accessToken, onPendingCountChange }: OrdersPanelProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState('all');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const result = await getOrders(accessToken);
      if (result.orders) {
        setOrders(result.orders);
        
        // Count pending orders and notify parent
        const pendingCount = result.orders.filter(
          (order: Order) => order.status === 'pending' || order.status === 'confirmed'
        ).length;
        
        if (onPendingCountChange) {
          onPendingCountChange(pendingCount);
        }
      }
    } catch (error) {
      console.log('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Poll for new orders every 30 seconds
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [accessToken]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, { status: newStatus }, accessToken);
      fetchOrders();
      
      // Auto-notify customer when order is ready
      if (newStatus === 'ready') {
        const order = orders.find(o => o.id === orderId);
        if (order?.email) {
          await handleSendMessage(orderId, `Your order is ready for pickup!`, 'ready');
          toast.success('Order marked as ready and customer notified');
        }
      }
    } catch (error) {
      console.log('Error updating order status:', error);
    }
  };

  const handleSendMessage = async (orderId: string, msg: string, type: string) => {
    try {
      await addOrderMessage(orderId, msg, type, 'admin', accessToken);
      setMessage('');
      setSelectedOrder(null);
      fetchOrders();
      toast.success('Message sent to customer');
    } catch (error) {
      console.log('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const openMessageDialog = (order: Order, messageType: string) => {
    setSelectedOrder(order);
    switch (messageType) {
      case 'ready':
        setMessage(`Your order is ready for pickup at ${new Date(order.pickupTime).toLocaleTimeString()}!`);
        break;
      case 'question':
        setMessage('');
        break;
      case 'change':
        setMessage('We need to make a change to your order. ');
        break;
      default:
        setMessage('');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any }> = {
      pending: { variant: 'default', icon: Clock },
      confirmed: { variant: 'secondary', icon: CheckCircle2 },
      preparing: { variant: 'default', icon: ChefHat },
      ready: { variant: 'default', icon: Package },
      completed: { variant: 'default', icon: CheckCircle2 },
      cancelled: { variant: 'destructive', icon: XCircle },
    };

    const config = variants[status] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="capitalize">
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  if (loading) {
    return <div className="text-center py-8">Loading orders...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2>Orders</h2>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="preparing">Preparing</SelectItem>
            <SelectItem value="ready">Ready</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No orders found
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle>{order.customerName}</CardTitle>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {order.phone}
                      </span>
                      {order.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {order.email}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    {order.isCatering && (
                      <Badge variant="outline">Catering</Badge>
                    )}
                    {getStatusBadge(order.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="mb-2">Order Items</h4>
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

                  <div className="space-y-3">
                    <div>
                      <h4 className="mb-1">Pickup Time</h4>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        {new Date(order.pickupTime).toLocaleString()}
                      </div>
                    </div>

                    <div>
                      <h4 className="mb-1">Payment</h4>
                      <p className="text-sm capitalize">{order.paymentMethod}</p>
                      {order.paymentConfirmation && (
                        <p className="text-sm text-muted-foreground">
                          Confirmation: {order.paymentConfirmation}
                        </p>
                      )}
                    </div>

                    {order.specialRequests && (
                      <div>
                        <h4 className="mb-1">Special Requests</h4>
                        <p className="text-sm">{order.specialRequests}</p>
                      </div>
                    )}

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Ordered: {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex gap-2 flex-wrap">
                  <Select
                    value={order.status}
                    onValueChange={(value) => handleStatusChange(order.id, value)}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="preparing">Preparing</SelectItem>
                      <SelectItem value="ready">Ready</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openMessageDialog(order, 'ready')}
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    Notify Ready
                  </Button>

                  <Select
                    onValueChange={(value) => value && openMessageDialog(order, value)}
                  >
                    <SelectTrigger className="w-48">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        <span>Contact Customer</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="question">Ask Question</SelectItem>
                      <SelectItem value="change">Order Change</SelectItem>
                      <SelectItem value="delay">Delay Notification</SelectItem>
                      <SelectItem value="custom">Custom Message</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {order.messages && order.messages.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="mb-2">Messages</h4>
                      <div className="space-y-2">
                        {order.messages.map((msg, idx) => (
                          <div key={idx} className="p-2 bg-muted rounded text-sm">
                            <div className="flex justify-between items-start">
                              <Badge variant="outline" className="text-xs mb-1">
                                {msg.from === 'admin' ? 'You' : 'Customer'}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(msg.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <p>{msg.message}</p>
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

      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Message to {selectedOrder?.customerName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                placeholder="Type your message here..."
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => selectedOrder && handleSendMessage(selectedOrder.id, message, 'custom')}
                disabled={!message.trim()}
                className="flex-1"
              >
                Send Message
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedOrder(null)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}