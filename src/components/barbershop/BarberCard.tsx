
'use client';

import type { Barber } from '@/types/barbershop';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Scissors, BedDouble, UserCircle2 } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface BarberCardProps {
  barber: Barber;
}

export default function BarberCard({ barber }: BarberCardProps) {
  const statusText = barber.status === 'SLEEPING' ? 'Sleeping' : `Cutting Hair for Customer #${barber.customerInChair?.id || '?'}`;
  const StatusIcon = barber.status === 'SLEEPING' ? BedDouble : Scissors;
  
  // Ensure haircutProgress is a number and defaults to 0 if NaN or undefined
  const currentProgress = Number(barber.haircutProgress) || 0;

  return (
    <Card className="shadow-md bg-card/80">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <UserCircle2 className="text-primary" />
          {barber.name}
        </CardTitle>
        <CardDescription className="flex items-center gap-1 text-sm">
          <StatusIcon size={16} className={barber.status === 'SLEEPING' ? "text-muted-foreground" : "text-accent"} />
          {statusText}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2 space-y-3">
        <div className="flex items-center gap-2 p-2 bg-secondary/20 rounded-md text-sm">
          <User size={20} className={barber.customerInChair ? "text-foreground" : "text-muted-foreground/70"} />
          <span>
            Chair: {barber.customerInChair ? `Customer #${barber.customerInChair.id}` : 'Empty'}
          </span>
        </div>
        
        {barber.status === 'CUTTING_HAIR' && barber.customerInChair && (
          <div className="mt-1 px-1">
            <Label htmlFor={`haircut-progress-${barber.id}`} className="text-xs text-muted-foreground mb-1 block">
              Haircut Progress (Cust. #{barber.customerInChair.id})
            </Label>
            <Progress id={`haircut-progress-${barber.id}`} value={currentProgress} className="w-full h-3" />
            <p className="text-xs text-muted-foreground text-right mt-0.5">{Math.round(currentProgress)}%</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

    