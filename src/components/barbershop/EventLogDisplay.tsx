
'use client';

import type { SimulationEvent } from '@/types/barbershop';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ListChecks } from 'lucide-react';
import { format } from 'date-fns';

interface EventLogDisplayProps {
  events: SimulationEvent[];
}

export default function EventLogDisplay({ events }: EventLogDisplayProps) {
  return (
    // Removed flex-grow from Card to prevent it from stretching unnecessarily
    <Card className="shadow-lg flex flex-col"> 
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <ListChecks />
          Event Log
        </CardTitle>
      </CardHeader>
      {/* Removed flex-grow from CardContent as ScrollArea has a fixed height */}
      <CardContent className="overflow-hidden"> 
        <ScrollArea className="h-[350px] pr-4 border rounded-md"> 
          <ul className="space-y-2 p-2">
            {events.map((event) => (
              <li key={event.id} className="text-sm p-2 bg-muted/20 rounded-md border-l-4 border-primary">
                <span className="font-mono text-xs text-muted-foreground mr-2">
                  [{format(event.timestamp, 'HH:mm:ss.SSS')}]
                </span>
                {event.message}
              </li>
            ))}
            {events.length === 0 && (
              <li className="text-sm text-muted-foreground text-center py-4">No events yet. Start the simulation!</li>
            )}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
