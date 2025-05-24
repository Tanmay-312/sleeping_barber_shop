'use client';

import type { Customer } from '@/types/barbershop';
import { Armchair, User } from 'lucide-react';

interface WaitingChairsDisplayProps {
  waitingCustomers: Customer[];
  maxChairs: number;
}

export default function WaitingChairsDisplay({ waitingCustomers, maxChairs }: WaitingChairsDisplayProps) {
  const chairs = Array.from({ length: maxChairs }, (_, i) => {
    const customer = waitingCustomers[i];
    return { occupied: !!customer, customerId: customer?.id };
  });

  return (
    <div>
      <h3 className="text-xl font-semibold mb-3 text-foreground">Waiting Area</h3>
      <div className="flex items-center justify-between mb-3">
        <p className="text-muted-foreground">
          Occupied: <span className="font-bold text-foreground">{waitingCustomers.length}</span> / {maxChairs}
        </p>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 p-3 bg-secondary/30 rounded-lg shadow">
        {chairs.map((chair, index) => (
          <div
            key={index}
            className={`p-3 rounded-md flex flex-col items-center justify-center aspect-square border-2
                        ${chair.occupied ? 'bg-accent/20 border-accent' : 'bg-muted/30 border-muted-foreground/30'}`}
            title={chair.occupied ? `Customer #${chair.customerId}` : 'Empty Chair'}
          >
            {chair.occupied ? (
              <>
                <User size={32} className="text-accent" />
                <span className="text-xs mt-1 text-accent font-medium">C. {chair.customerId}</span>
              </>
            ) : (
              <Armchair size={32} className="text-muted-foreground/70" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
