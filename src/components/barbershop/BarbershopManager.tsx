
'use client';

import { useSleepingBarber } from '@/hooks/use-sleeping-barber';
import BarbershopControls from './BarbershopControls';
import BarbersDisplay from './BarberStateDisplay'; // Renamed from BarberStateDisplay
import WaitingChairsDisplay from './WaitingChairsDisplay';
import StatsDisplay from './StatsDisplay';
import EventLogDisplay from './EventLogDisplay';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Scissors } from 'lucide-react';

export default function BarbershopManager() {
  const { state, startSimulation, stopSimulation, resetSimulation, updateConfig } = useSleepingBarber({
    numWaitingChairs: 5,
    customerArrivalRateMs: 3000,
    haircutDurationMs: 5000,
    numBarbers: 1, // Default to 1 barber
    simulationTimeLimitS: 0, // Default to no time limit
  });

  return (
    <div className="flex flex-col gap-6 w-full h-full">
      <header className="text-center py-6">
        <h1 className="text-5xl font-bold text-primary flex items-center justify-center gap-3">
          <Scissors size={48} className="transform -rotate-45" />
          The Barbershop
          <Scissors size={48} className="transform rotate-45 scale-x-[-1]" />
        </h1>
        <p className="text-muted-foreground text-lg mt-2">A Sleeping Barber Problem Simulation</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-grow">
        {/* Left Column: Status & Visualization */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Current Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <BarbersDisplay
                barbers={state.barbers}
              />
              <Separator />
              <WaitingChairsDisplay
                waitingCustomers={state.waitingCustomers}
                maxChairs={state.numWaitingChairs}
              />
            </CardContent>
          </Card>
          
          <StatsDisplay
            customersServed={state.customersServed}
            customersTurnedAway={state.customersTurnedAway}
            simulationTime={state.simulationTime}
          />
        </div>

        {/* Right Column: Controls & Log */}
        <div className="md:col-span-1 flex flex-col gap-6">
          <BarbershopControls
            config={{
              numWaitingChairs: state.numWaitingChairs,
              customerArrivalRateMs: state.customerArrivalRateMs,
              haircutDurationMs: state.haircutDurationMs,
              numBarbers: state.numBarbers,
              simulationTimeLimitS: state.simulationTimeLimitS,
            }}
            isSimulating={state.isSimulating}
            onConfigChange={updateConfig}
            onStart={startSimulation}
            onStop={stopSimulation}
            onReset={resetSimulation}
          />
          <EventLogDisplay events={state.events} />
        </div>
      </div>
       <footer className="text-center py-4 text-muted-foreground text-sm">
        Adjust parameters and observe the barbershop dynamics.
      </footer>
    </div>
  );
}
