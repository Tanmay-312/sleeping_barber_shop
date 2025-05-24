
export type BarberStatus = 'SLEEPING' | 'CUTTING_HAIR';

export interface Customer {
  id: number;
}

export interface SimulationEvent {
  id: number;
  timestamp: Date;
  message: string;
}

export interface Barber {
  id: number;
  name: string;
  status: BarberStatus;
  customerInChair: Customer | null;
  haircutProgress: number; // 0-100
  haircutStartTime?: number; // Timestamp when the current haircut started
}

export interface SleepingBarberState {
  barbers: Barber[];
  waitingCustomers: Customer[];
  customersServed: number;
  customersTurnedAway: number;
  events: SimulationEvent[];
  isSimulating: boolean;
  // Configurable settings mirrored from BarbershopConfig
  numWaitingChairs: number;
  customerArrivalRateMs: number;
  haircutDurationMs: number;
  numBarbers: number;
  simulationTimeLimitS: number; // 0 for no limit
  // Internal state
  nextCustomerId: number;
  simulationTime: number; // in seconds
}

export interface BarbershopConfig {
  numWaitingChairs: number;
  customerArrivalRateMs: number;
  haircutDurationMs: number;
  numBarbers: number; // 1-5
  simulationTimeLimitS: number; // 0 for no limit
}
