import { Check, Clock, ChefHat, Package, CheckCircle2 } from 'lucide-react';

interface OrderTimelineProps {
  status: string;
}

export function OrderTimeline({ status }: OrderTimelineProps) {
  const stages = [
    { key: 'pending', label: 'Order Received', icon: Clock },
    { key: 'confirmed', label: 'Confirmed', icon: Check },
    { key: 'preparing', label: 'Preparing', icon: ChefHat },
    { key: 'ready', label: 'Ready for Pickup', icon: Package },
    { key: 'completed', label: 'Completed', icon: CheckCircle2 },
  ];

  const currentIndex = stages.findIndex(stage => stage.key === status);
  
  return (
    <div className="py-8">
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 -z-10">
          <div 
            className="h-full bg-primary transition-all duration-500"
            style={{ 
              width: currentIndex >= 0 
                ? `${(currentIndex / (stages.length - 1)) * 100}%` 
                : '0%' 
            }}
          />
        </div>

        {/* Stage Markers */}
        {stages.map((stage, index) => {
          const Icon = stage.icon;
          const isActive = index <= currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={stage.key} className="flex flex-col items-center flex-1">
              <div 
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all
                  ${isActive 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-200 text-gray-400'
                  }
                  ${isCurrent ? 'ring-4 ring-primary/30 scale-110' : ''}
                `}
              >
                <Icon className="w-5 h-5" />
              </div>
              <p className={`
                text-xs text-center
                ${isActive ? 'text-primary' : 'text-gray-400'}
                ${isCurrent ? 'font-semibold' : ''}
              `}>
                {stage.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
