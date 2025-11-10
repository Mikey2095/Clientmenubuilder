import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { ScrollArea } from './ui/scroll-area';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CartItem[];
  onSubmit: (orderData: any) => void;
}

export function CheckoutDialog({ open, onOpenChange, items, onSubmit }: CheckoutDialogProps) {
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    email: '',
    pickupDate: '',
    pickupTime: '',
    pickupToday: true,
    specialRequests: '',
    isCatering: false,
    paymentMethod: 'zelle',
  });

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Generate time slots for today in 30-minute increments
  const generateTimeSlots = () => {
    const slots = [];
    const now = new Date();
    const startHour = 9; // 9 AM
    const endHour = 21; // 9 PM
    
    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === endHour && minute > 0) break;
        
        const time = new Date();
        time.setHours(hour, minute, 0, 0);
        
        // Only show future times if pickup is today
        if (formData.pickupToday && time <= now) {
          continue;
        }
        
        const timeString = time.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        });
        const valueString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push({ label: timeString, value: valueString });
      }
    }
    return slots;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Set the pickup date to today if pickupToday is checked
    const pickupDate = formData.pickupToday 
      ? new Date().toISOString().split('T')[0]
      : formData.pickupDate;
    
    onSubmit({
      ...formData,
      pickupDate,
      items,
      total,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Complete Your Order</DialogTitle>
          <DialogDescription>
            Please fill out your information below. Payment must be completed via Zelle before your order can be confirmed.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Order Summary */}
          <div className="space-y-2">
            <h3>Order Summary</h3>
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>{item.name} x {item.quantity}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <Separator />

          {/* Contact Information */}
          <div className="space-y-4">
            <h3>Contact Information</h3>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                required
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          {/* Pickup Time */}
          <div className="space-y-4">
            <h3>Pickup Time</h3>
            
            {/* Pickup Today Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="pickupToday"
                checked={formData.pickupToday}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, pickupToday: checked as boolean })
                }
              />
              <Label htmlFor="pickupToday" className="cursor-pointer">
                Pickup Today
              </Label>
            </div>

            {/* Pickup Date - Only if not today */}
            {!formData.pickupToday && (
              <div className="space-y-2">
                <Label htmlFor="pickupDate">Preferred Pickup Date *</Label>
                <Input
                  id="pickupDate"
                  type="date"
                  required={!formData.pickupToday}
                  value={formData.pickupDate}
                  onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            )}

            {/* Pickup Time Scrollable List */}
            <div className="space-y-2">
              <Label htmlFor="pickupTime">Select Pickup Time *</Label>
              <Select
                value={formData.pickupTime}
                onValueChange={(value) => setFormData({ ...formData, pickupTime: value })}
                required
              >
                <SelectTrigger id="pickupTime">
                  <SelectValue placeholder="Choose a time" />
                </SelectTrigger>
                <SelectContent>
                  <ScrollArea className="h-72">
                    {generateTimeSlots().map(slot => (
                      <SelectItem key={slot.value} value={slot.value}>
                        {slot.label}
                      </SelectItem>
                    ))}
                  </ScrollArea>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Catering Option */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="catering"
              checked={formData.isCatering}
              onCheckedChange={(checked) => 
                setFormData({ ...formData, isCatering: checked as boolean })
              }
            />
            <Label htmlFor="catering" className="cursor-pointer">
              This is a catering order
            </Label>
          </div>

          {/* Special Requests */}
          <div className="space-y-2">
            <Label htmlFor="specialRequests">
              Special Requests {formData.isCatering && '(Catering Details) *'}
            </Label>
            <Textarea
              id="specialRequests"
              placeholder="Any special instructions or dietary requirements..."
              required={formData.isCatering}
              value={formData.specialRequests}
              onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
              rows={4}
            />
          </div>

          {/* Payment Information */}
          <div className="space-y-4">
            <h3>Payment Information</h3>
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method *</Label>
              <Select
                value={formData.paymentMethod}
                onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
              >
                <SelectTrigger id="paymentMethod">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zelle">Zelle</SelectItem>
                  <SelectItem value="cash">Cash (Pay on Pickup)</SelectItem>
                  <SelectItem value="venmo">Venmo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Important:</strong> Please send payment via {formData.paymentMethod === 'cash' ? 'cash on pickup' : formData.paymentMethod} before your order is confirmed. Your order will be prepared once payment is received and verified.
              </p>
            </div>
          </div>

          <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
            Place Order
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}