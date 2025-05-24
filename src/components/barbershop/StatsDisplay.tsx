'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserX, Timer } from 'lucide-react';

interface StatsDisplayProps {
  customersServed: number;
  customersTurnedAway: number;
  simulationTime: number; // in seconds
}

export default function StatsDisplay({ customersServed, customersTurnedAway, simulationTime }: StatsDisplayProps) {
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Shop Statistics</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-primary/10 rounded-lg flex items-center gap-3 shadow">
          <Users size={32} className="text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Customers Served</p>
            <p className="text-3xl font-bold text-primary">{customersServed}</p>
          </div>
        </div>
        <div className="p-4 bg-destructive/10 rounded-lg flex items-center gap-3 shadow">
          <UserX size={32} className="text-destructive" />
          <div>
            <p className="text-sm text-muted-foreground">Customers Turned Away</p>
            <p className="text-3xl font-bold text-destructive">{customersTurnedAway}</p>
          </div>
        </div>
        <div className="p-4 bg-secondary/30 rounded-lg flex items-center gap-3 shadow">
          <Timer size={32} className="text-secondary-foreground" />
          <div>
            <p className="text-sm text-muted-foreground">Simulation Time</p>
            <p className="text-3xl font-bold text-secondary-foreground">{formatTime(simulationTime)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
