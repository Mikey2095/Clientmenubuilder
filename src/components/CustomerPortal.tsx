import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { getOrderByReceiptCode } from '../utils/api';
import { ShoppingBag, ArrowLeft, MapPin, Clock } from 'lucide-react';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { toast } from 'sonner@2.0.3';
import { OrderTimeline } from './OrderTimeline';

interface CustomerPortalProps {
  onBack: () => void;
}

interface Order {
  id: string;
  receiptCode: string;
  customerName: string;
  phone: string;
  email: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
  status: string;
  pickupDate: string;
  pickupTime: string;
  pickupToday: boolean;
  specialRequests?: string;
  isCatering: boolean;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
  estimatedReadyTime?: string;
}

export function CustomerPortal({ onBack }: CustomerPortalProps) {
  const [receiptCode, setReceiptCode] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await getOrderByReceiptCode(receiptCode);
      
      if (result.error) {
        setError(result.error);
        toast.error(result.error);
        return;
      }

      if (result.order) {
        setOrder(result.order);
        toast.success('Order found!');
      }
    } catch (err) {
      console.log('Error fetching order:', err);
      setError('Failed to find order. Please check your receipt code.');
      toast.error('Failed to find order');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setOrder(null);
    setReceiptCode('');
    setError('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'preparing':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'ready':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-md mx-auto">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Menu
          </Button>

          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8 text-white" />
                </div>
              </div>
              <CardTitle>Track Your Order</CardTitle>
              <p className="text-sm text-muted-foreground">
                Enter your 5-digit receipt code
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="receiptCode">Receipt Code</Label>
                  <Input
                    id="receiptCode"
                    type="text"
                    placeholder="12345"
                    maxLength={5}
                    pattern="[0-9]{5}"
                    required
                    value={receiptCode}
                    onChange={(e) => setReceiptCode(e.target.value.replace(/\D/g, ''))}
                    className="text-center text-2xl tracking-widest"
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    Check your email or order confirmation
                  </p>
                </div>
                
                {error && (
                  <p className="text-sm text-destructive text-center">{error}</p>
                )}
                
                <Button type="submit" className="w-full" disabled={loading || receiptCode.length !== 5}>
                  {loading ? 'Searching...' : 'Track Order'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            onClick={onBack}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Menu
          </Button>
          <Button 
            variant="outline" 
            onClick={handleReset}
          >
            Track Different Order
          </Button>
        </div>

        {/* Order Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>Order #{order.receiptCode}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Placed on {formatDate(order.createdAt)}
                </p>
              </div>
              <Badge className={getStatusColor(order.status)}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <OrderTimeline status={order.status} />
            
            {/* Pickup Information */}
            <div className="grid md:grid-cols-2 gap-4 mt-6">
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <Clock className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-semibold">Pickup Time</p>
                  <p className="text-sm text-muted-foreground">
                    {order.pickupToday ? 'Today' : formatDate(order.pickupDate)}
                  </p>
                  <p className="text-sm">{formatTime(order.pickupTime)}</p>
                </div>
              </div>
              
              {order.estimatedReadyTime && (
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                  <MapPin className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-green-900">Estimated Ready Time</p>
                    <p className="text-sm text-green-700">{formatTime(order.estimatedReadyTime)}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Status Message */}
            {order.status === 'ready' && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 text-center">
                  🎉 Your order is ready for pickup! Please come get it at your scheduled time.
                </p>
              </div>
            )}
            
            {order.status === 'pending' && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-center">
                  We've received your order and will confirm it shortly.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Items */}
              <div>
                <h4 className="text-sm font-semibold mb-2">Items</h4>
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between py-2">
                    <span className="text-sm">
                      {item.name} x {item.quantity}
                    </span>
                    <span className="text-sm">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
                <Separator className="my-2" />
                <div className="flex justify-between py-2">
                  <span className="font-semibold">Total</span>
                  <span className="font-semibold">${order.total.toFixed(2)}</span>
                </div>
              </div>

              <Separator />

              {/* Customer Info */}
              <div>
                <h4 className="text-sm font-semibold mb-2">Customer Information</h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>{order.customerName}</p>
                  <p>{order.phone}</p>
                  {order.email && <p>{order.email}</p>}
                </div>
              </div>

              {/* Special Requests */}
              {order.specialRequests && (
                <>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-semibold mb-2">
                      {order.isCatering ? 'Catering Details' : 'Special Requests'}
                    </h4>
                    <p className="text-sm text-muted-foreground">{order.specialRequests}</p>
                  </div>
                </>
              )}

              {/* Payment Info */}
              <Separator />
              <div>
                <h4 className="text-sm font-semibold mb-2">Payment Method</h4>
                <p className="text-sm text-muted-foreground capitalize">{order.paymentMethod}</p>
              </div>

              {order.isCatering && (
                <>
                  <Separator />
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded">
                    <p className="text-sm text-orange-800">
                      🍽️ This is a catering order
                    </p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card>
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              If you have questions about your order, please contact us using the phone number or email shown on the main menu page.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
