export function FloralDecoration({ position = 'right' }: { position?: 'left' | 'right' }) {
  return (
    <div className={`hidden lg:block absolute top-0 ${position === 'right' ? 'right-0' : 'left-0'} h-full w-48 pointer-events-none`}>
      <div className="relative h-full">
        {/* Decorative floral SVG elements */}
        <div className="absolute top-0 right-0 w-32 h-32">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Flower 1 - Purple */}
            <circle cx="50" cy="50" r="8" fill="#9C27B0"/>
            <circle cx="42" cy="42" r="6" fill="#E91E63"/>
            <circle cx="58" cy="42" r="6" fill="#E91E63"/>
            <circle cx="42" cy="58" r="6" fill="#FF6B35"/>
            <circle cx="58" cy="58" r="6" fill="#FF6B35"/>
            <circle cx="50" cy="40" r="5" fill="#FFC107"/>
            <circle cx="50" cy="60" r="5" fill="#FFC107"/>
            <circle cx="40" cy="50" r="5" fill="#00BCD4"/>
            <circle cx="60" cy="50" r="5" fill="#00BCD4"/>
          </svg>
        </div>
        
        <div className="absolute top-40 right-4 w-24 h-24">
          <svg viewBox="0 0 80 80" className="w-full h-full">
            {/* Flower 2 - Red center */}
            <circle cx="40" cy="40" r="6" fill="#dc2626"/>
            <ellipse cx="40" cy="28" rx="8" ry="10" fill="#FF6B35"/>
            <ellipse cx="40" cy="52" rx="8" ry="10" fill="#FF6B35"/>
            <ellipse cx="28" cy="40" rx="10" ry="8" fill="#FFC107"/>
            <ellipse cx="52" cy="40" rx="10" ry="8" fill="#FFC107"/>
          </svg>
        </div>

        <div className="absolute top-80 right-8 w-20 h-20">
          <svg viewBox="0 0 60 60" className="w-full h-full">
            {/* Flower 3 - Multi-color */}
            <path d="M30,20 Q25,15 20,20 T30,30 T40,20 Q35,15 30,20" fill="#E91E63"/>
            <path d="M30,40 Q25,45 20,40 T30,30 T40,40 Q35,45 30,40" fill="#9C27B0"/>
            <circle cx="30" cy="30" r="5" fill="#FFC107"/>
          </svg>
        </div>
      </div>
    </div>
  );
}
