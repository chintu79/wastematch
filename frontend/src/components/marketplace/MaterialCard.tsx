import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { MapPin, Box } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export interface MaterialCardProps {
  title: string;
  category: string;
  location: string;
  quantity: string;
  price?: string;
  onClick?: () => void;
}

export const MaterialCard: React.FC<MaterialCardProps> = ({ 
  title, 
  category, 
  location, 
  quantity, 
  price, 
  onClick 
}) => {
  return (
    <Card 
      className={`group overflow-hidden transition-all hover:shadow-md ${onClick ? 'cursor-pointer hover:border-emerald-300' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <Badge variant="neutral" className="bg-slate-100">{category}</Badge>
          {price && <span className="text-xs font-bold text-slate-700">{price}</span>}
        </div>
        
        <h4 className="font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors mb-2 line-clamp-2">
          {title}
        </h4>
        
        <div className="space-y-1.5 mt-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <MapPin className="h-3.5 w-3.5 text-slate-400" />
            <span className="truncate">{location}</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <Box className="h-3.5 w-3.5 text-slate-400" />
            <span className="font-medium text-slate-700">{quantity}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
