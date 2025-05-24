
'use client';

import type { Barber } from '@/types/barbershop';
import BarberCard from './BarberCard'; // Assuming BarberCard.tsx is created

interface BarbersDisplayProps {
  barbers: Barber[];
}

export default function BarbersDisplay({ barbers }: BarbersDisplayProps) {
  if (!barbers || barbers.length === 0) {
    return <p className="text-muted-foreground">No barbers available.</p>;
  }
  
  return (
    <div className="space-y-4">
        <h3 className="text-xl font-semibold text-foreground">Barber Activity</h3>
        <div className={`grid grid-cols-1 ${barbers.length > 1 ? 'md:grid-cols-2' : ''} ${barbers.length > 3 ? 'lg:grid-cols-3' : ''} gap-4`}>
            {barbers.map((barber) => (
            <BarberCard key={barber.id} barber={barber} />
            ))}
        </div>
    </div>
  );
}
