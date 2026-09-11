import { ShoppingCart, Flame } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  isSpecial?: boolean;
  specialDays?: string[];
  available?: boolean;
}

interface MenuCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
}

export function MenuCard({ item, onAddToCart }: MenuCardProps) {
  const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const isAvailableToday = !item.specialDays || item.specialDays.length === 0 || item.specialDays.includes(currentDay);
  
  if (!isAvailableToday && item.isSpecial) {
    return null;
  }

  return (
    <Card className="mexican-card overflow-hidden transition-all duration-300">
      <div className="relative aspect-[4/3] bg-gray-200">
        <img 
          src={item.image || 'https://images.unsplash.com/photo-1688845465690-e5ea24774fd5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZXhpY2FuJTIwdGFjb3MlMjBmb29kfGVufDF8fHx8MTc2MjYxNTUwMHww&ixlib=rb-4.1.0&q=80&w=1080'} 
          alt={item.name}
          className="w-full h-full object-cover"
        />
        {item.isSpecial && (
          <Badge className="absolute top-2 right-2 bg-gradient-to-r from-pink-500 to-orange-500 text-white border-0">
            <Flame className="w-3 h-3 mr-1" />
            Special
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-secondary">{item.name}</h3>
          <span className="text-primary font-bold">${item.price.toFixed(2)}</span>
        </div>
        <p className="text-muted-foreground mb-3">{item.description}</p>
        {item.specialDays && item.specialDays.length > 0 && (
          <p className="text-sm text-muted-foreground mb-3">
            Available: {item.specialDays.join(', ')}
          </p>
        )}
        <Button 
          onClick={() => onAddToCart(item)} 
          className="w-full bg-primary hover:bg-primary/90"
          disabled={item.available === false}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Add to Cart
        </Button>
      </CardContent>
    </Card>
  );
}