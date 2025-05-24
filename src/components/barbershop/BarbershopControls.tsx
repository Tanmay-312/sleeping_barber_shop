
'use client';

import type { BarbershopConfig } from '@/types/barbershop';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Pause, RefreshCw, Settings2, Users2, Clock4 } from 'lucide-react';

interface BarbershopControlsProps {
  config: BarbershopConfig;
  isSimulating: boolean;
  onConfigChange: (newConfig: Partial<BarbershopConfig>) => void;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
}

export default function BarbershopControls({
  config,
  isSimulating,
  onConfigChange,
  onStart,
  onStop,
  onReset,
}: BarbershopControlsProps) {
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let numericValue = parseInt(value, 10);

    if (isNaN(numericValue)) {
      // If parsing results in NaN (e.g., empty string "" or non-numeric characters like "abc"),
      // default to 0. The hook's updateConfig will handle clamping this to valid minimums
      // (e.g., 100ms for durations, 0 for chairs/time limit).
      numericValue = 0;
    }
    
    // Apply component-level constraints or let the hook handle all clamping.
    // For numWaitingChairs, we can clamp it here as it has a clear max.
    if (name === 'numWaitingChairs') {
      numericValue = Math.min(Math.max(0, numericValue), 20); // Clamp 0-20
    } else {
      // For other fields, ensure non-negative. Specific minimums (like 100ms for durations)
      // are handled by the use-sleeping-barber hook's updateConfig.
      numericValue = Math.max(0, numericValue);
    }

    onConfigChange({ [name]: numericValue });
  };

  const handleSelectChange = (name: keyof BarbershopConfig, value: string) => {
    const numericValue = parseInt(value, 10);
    // numBarbers select already provides valid numbers 1-5, but good to be safe.
    if (name === 'numBarbers' && numericValue >= 1 && numericValue <= 5) {
      onConfigChange({ [name]: numericValue });
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Settings2 />
          Controls & Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="numBarbers" className="text-base flex items-center gap-1 mb-1">
              <Users2 size={16}/> Number of Barbers
            </Label>
            <Select
              value={String(config.numBarbers)}
              onValueChange={(value) => handleSelectChange('numBarbers', value)}
              disabled={isSimulating}
            >
              <SelectTrigger id="numBarbers" className="w-full mt-1 text-base">
                <SelectValue placeholder="Select number of barbers" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map(num => (
                  <SelectItem key={num} value={String(num)}>{num} Barber{num > 1 ? 's' : ''}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="numWaitingChairs" className="text-base">Waiting Chairs (0-20)</Label>
            <Input
              id="numWaitingChairs"
              name="numWaitingChairs"
              type="number"
              value={config.numWaitingChairs} // Value is a number from state
              onChange={handleInputChange}
              disabled={isSimulating}
              className="mt-1 text-base"
              min="0" // Native browser validation hint
              max="20" // Native browser validation hint
            />
          </div>
          <div>
            <Label htmlFor="customerArrivalRateMs" className="text-base">Arrival Rate (ms/cust)</Label>
            <Input
              id="customerArrivalRateMs"
              name="customerArrivalRateMs"
              type="number"
              value={config.customerArrivalRateMs} // Value is a number from state
              onChange={handleInputChange}
              disabled={isSimulating}
              className="mt-1 text-base"
              min="100" // Native browser validation hint, hook enforces 100 too
            />
          </div>
          <div>
            <Label htmlFor="haircutDurationMs" className="text-base">Haircut Duration (ms)</Label>
            <Input
              id="haircutDurationMs"
              name="haircutDurationMs"
              type="number"
              value={config.haircutDurationMs} // Value is a number from state
              onChange={handleInputChange}
              disabled={isSimulating}
              className="mt-1 text-base"
              min="100" // Native browser validation hint, hook enforces 100 too
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="simulationTimeLimitS" className="text-base flex items-center gap-1 mb-1">
                <Clock4 size={16} /> Sim. Time Limit (s, 0=inf)
            </Label>
            <Input
              id="simulationTimeLimitS"
              name="simulationTimeLimitS"
              type="number"
              value={config.simulationTimeLimitS} // Value is a number from state
              onChange={handleInputChange}
              disabled={isSimulating}
              className="mt-1 text-base"
              min="0" // Native browser validation hint
            />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          {!isSimulating ? (
            <Button onClick={onStart} className="flex-1 text-lg py-6 bg-green-600 hover:bg-green-700">
              <Play className="mr-2" /> Start
            </Button>
          ) : (
            <Button onClick={onStop} variant="destructive" className="flex-1 text-lg py-6">
              <Pause className="mr-2" /> Stop
            </Button>
          )}
          <Button onClick={onReset} variant="outline" disabled={isSimulating} className="flex-1 text-lg py-6">
            <RefreshCw className="mr-2" /> Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
