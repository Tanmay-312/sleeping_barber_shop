
import { useState, useEffect, useCallback, useRef } from 'react';
import type { SleepingBarberState, Barber, Customer, SimulationEvent, BarbershopConfig } from '@/types/barbershop';

const MAX_EVENTS = 100; // Maximum number of events to keep in the log

const getDefaultBarbers = (num: number): Barber[] => {
  return Array.from({ length: num }, (_, i) => ({
    id: i,
    name: `Barber ${i + 1}`,
    status: 'SLEEPING',
    customerInChair: null,
    haircutProgress: 0,
    haircutStartTime: undefined,
  }));
};

const initialStateBase: Omit<SleepingBarberState, keyof BarbershopConfig | 'barbers'> = {
  waitingCustomers: [],
  customersServed: 0,
  customersTurnedAway: 0,
  events: [],
  isSimulating: false,
  nextCustomerId: 1,
  simulationTime: 0,
};

export function useSleepingBarber(initialConfig: BarbershopConfig = {
  numWaitingChairs: 5,
  customerArrivalRateMs: 3000,
  haircutDurationMs: 5000,
  numBarbers: 1,
  simulationTimeLimitS: 0,
}) {
  const [state, setState] = useState<SleepingBarberState>({
    ...initialStateBase,
    ...initialConfig,
    barbers: getDefaultBarbers(initialConfig.numBarbers),
    haircutDurationMs: Math.max(100, initialConfig.haircutDurationMs),
    customerArrivalRateMs: Math.max(100, initialConfig.customerArrivalRateMs),
  });

  const arrivalIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const simulationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const haircutTimeoutRefs = useRef<(NodeJS.Timeout | null)[]>(initialConfig.numBarbers > 0 ? new Array(initialConfig.numBarbers).fill(null) : []);
  const progressIntervalRefs = useRef<(NodeJS.Timeout | null)[]>(initialConfig.numBarbers > 0 ? new Array(initialConfig.numBarbers).fill(null) : []);


  const addEvent = useCallback((message: string) => {
    setState(prevState => ({
      ...prevState,
      events: [{ id: Date.now() + Math.random(), timestamp: new Date(), message }, ...prevState.events].slice(0, MAX_EVENTS),
    }));
  }, []);

  const handleCustomerArrival = useCallback(() => {
    setState(prevState => {
      if (!prevState.isSimulating) return prevState;

      const newCustomer: Customer = { id: prevState.nextCustomerId };
      let newState = { ...prevState, nextCustomerId: prevState.nextCustomerId + 1 };
      
      const availableBarberIndex = newState.barbers.findIndex(b => b.status === 'SLEEPING');

      if (availableBarberIndex !== -1) {
        const barber = newState.barbers[availableBarberIndex];
        addEvent(`Customer ${newCustomer.id} arrived. ${barber.name} is taking them.`);
        const newBarbers = [...newState.barbers];
        newBarbers[availableBarberIndex] = {
          ...barber,
          status: 'CUTTING_HAIR',
          customerInChair: newCustomer,
          haircutProgress: 0,
          haircutStartTime: Date.now(),
        };
        newState.barbers = newBarbers;
      } else if (newState.waitingCustomers.length < newState.numWaitingChairs) {
        addEvent(`Customer ${newCustomer.id} arrived and is waiting. All barbers busy.`);
        newState.waitingCustomers = [...newState.waitingCustomers, newCustomer];
      } else {
        addEvent(`Customer ${newCustomer.id} arrived, but all barbers busy and no chairs. Customer left.`);
        newState.customersTurnedAway += 1;
      }
      return newState;
    });
  }, [addEvent]);

  const handleHaircutCompletion = useCallback((barberIndex: number) => {
    setState(prevState => {
      const barber = prevState.barbers[barberIndex];
      // Ensure barber exists and was actually cutting hair; this can prevent errors if called unexpectedly
      if (!barber || barber.status !== 'CUTTING_HAIR' || !barber.customerInChair) {
        // Log if this happens unexpectedly, could indicate a logic flaw
        // console.warn(`handleHaircutCompletion called for barber ${barberIndex} not in CUTTING_HAIR state or no customer.`);
        return prevState;
      }


      addEvent(`${barber.name} finished haircut for Customer ${barber.customerInChair.id}.`);
      
      let newBarbers = [...prevState.barbers];
      let newWaitingCustomers = [...prevState.waitingCustomers];
      
      let updatedBarber: Barber = {
        ...barber,
        customerInChair: null,
        haircutProgress: 0,
        status: 'SLEEPING', 
        haircutStartTime: undefined,
      };

      if (newWaitingCustomers.length > 0) {
        const nextCustomer = newWaitingCustomers[0];
        newWaitingCustomers = newWaitingCustomers.slice(1);
        addEvent(`${barber.name} is taking next Customer ${nextCustomer.id} from waiting line.`);
        updatedBarber = {
          ...updatedBarber,
          customerInChair: nextCustomer,
          status: 'CUTTING_HAIR',
          haircutProgress: 0,
          haircutStartTime: Date.now(),
        };
      } else {
        addEvent(`${barber.name} has no customers waiting and is now SLEEPING.`);
        // haircutStartTime is already set to undefined above
      }
      
      newBarbers[barberIndex] = updatedBarber;

      return {
        ...prevState,
        barbers: newBarbers,
        waitingCustomers: newWaitingCustomers,
        customersServed: prevState.customersServed + 1,
      };
    });
  }, [addEvent]);
  
  useEffect(() => {
    if (state.isSimulating && state.customerArrivalRateMs > 0) {
      arrivalIntervalRef.current = setInterval(handleCustomerArrival, state.customerArrivalRateMs);
    } else {
      if (arrivalIntervalRef.current) clearInterval(arrivalIntervalRef.current);
    }
    return () => {
      if (arrivalIntervalRef.current) clearInterval(arrivalIntervalRef.current);
    };
  }, [state.isSimulating, state.customerArrivalRateMs, handleCustomerArrival]);

  useEffect(() => {
    state.barbers.forEach((barber, index) => {
      // Always clear previous timers for this barber before deciding what to do next
      if (haircutTimeoutRefs.current[index]) {
        clearTimeout(haircutTimeoutRefs.current[index]!);
        haircutTimeoutRefs.current[index] = null;
      }
      if (progressIntervalRefs.current[index]) {
        clearInterval(progressIntervalRefs.current[index]!);
        progressIntervalRefs.current[index] = null;
      }

      if (state.isSimulating && barber.status === 'CUTTING_HAIR' && barber.customerInChair && state.haircutDurationMs > 0 && barber.haircutStartTime) {
        const now = Date.now();
        const expectedEndTime = barber.haircutStartTime + state.haircutDurationMs;
        const remainingDuration = expectedEndTime - now;

        if (remainingDuration <= 0) {
          // Haircut is overdue or just completed
          // Schedule completion with a minimal delay to allow state to process, or call directly
          // Using a timeout 0 can help ensure it happens in the next event loop tick
          haircutTimeoutRefs.current[index] = setTimeout(() => handleHaircutCompletion(index), 0);
        } else {
          haircutTimeoutRefs.current[index] = setTimeout(() => handleHaircutCompletion(index), remainingDuration);
          
          progressIntervalRefs.current[index] = setInterval(() => {
            setState(prevState => {
              const currentBarberInInterval = prevState.barbers[index]; 
              if (!prevState.isSimulating || !currentBarberInInterval || currentBarberInInterval.status !== 'CUTTING_HAIR' || !currentBarberInInterval.customerInChair || !currentBarberInInterval.haircutStartTime) {
                if (progressIntervalRefs.current[index]) {
                  clearInterval(progressIntervalRefs.current[index]!);
                  progressIntervalRefs.current[index] = null;
                }
                return prevState; 
              }

              const elapsedTime = Date.now() - currentBarberInInterval.haircutStartTime;
              const duration = Math.max(1, prevState.haircutDurationMs); 
              let progress = (elapsedTime / duration) * 100;
              progress = Math.min(100, Math.max(0, Number(progress) || 0));

              const newBarbers = [...prevState.barbers];
              newBarbers[index] = { ...currentBarberInInterval, haircutProgress: progress };
              return { ...prevState, barbers: newBarbers };
            });
          }, 100); // Update progress e.g., every 100ms
        }
      } else { 
        // Barber is not cutting, or conditions not met (e.g. sim stopped, no customer, no start time)
        // Ensure progress and start time are reset if they are not already.
        if (barber.haircutProgress !== 0 || barber.haircutStartTime !== undefined) {
           setState(s => {
             const freshBarber = s.barbers[index];
             // Check fresh state to avoid race conditions or unnecessary updates
             if (freshBarber && (freshBarber.haircutProgress !== 0 || freshBarber.haircutStartTime !== undefined)) {
                const newBarbers = [...s.barbers];
                newBarbers[index] = {...newBarbers[index], haircutProgress: 0, haircutStartTime: undefined};
                return {...s, barbers: newBarbers};
             }
             return s; 
           });
        }
      }
    });

    return () => {
      haircutTimeoutRefs.current.forEach(timeout => timeout && clearTimeout(timeout));
      progressIntervalRefs.current.forEach(interval => interval && clearInterval(interval));
    };
  }, [state.isSimulating, state.barbers, state.haircutDurationMs, handleHaircutCompletion, addEvent]);

   useEffect(() => {
    if (state.isSimulating) {
      simulationTimerRef.current = setInterval(() => {
        setState(s => {
          if(!s.isSimulating) { // Double check if simulation was stopped by other means
            if (simulationTimerRef.current) clearInterval(simulationTimerRef.current);
            return s;
          }
          const newTime = s.simulationTime + 1;
          if (s.simulationTimeLimitS > 0 && newTime >= s.simulationTimeLimitS) {
            addEvent(`Simulation time limit of ${s.simulationTimeLimitS}s reached. Stopping.`);
            // Clear all simulation-related timers
            if (arrivalIntervalRef.current) clearInterval(arrivalIntervalRef.current);
            haircutTimeoutRefs.current.forEach(timeout => timeout && clearTimeout(timeout));
            progressIntervalRefs.current.forEach(interval => interval && clearInterval(interval));
            if (simulationTimerRef.current) clearInterval(simulationTimerRef.current);
            
            return { 
              ...s, 
              simulationTime: newTime, 
              isSimulating: false,
              // Optionally, reset barbers to sleeping if desired when time limit hits
              // barbers: s.barbers.map(b => ({...b, status: 'SLEEPING', customerInChair: null, haircutProgress: 0, haircutStartTime: undefined }))
            };
          }
          return { ...s, simulationTime: newTime };
        });
      }, 1000);
    } else {
      if (simulationTimerRef.current) clearInterval(simulationTimerRef.current);
    }
    return () => {
      if (simulationTimerRef.current) clearInterval(simulationTimerRef.current);
    };
  }, [state.isSimulating, state.simulationTimeLimitS, addEvent]);


  const startSimulation = useCallback(() => {
    // Clear any existing events before starting anew, except for the "Simulation started." message.
    setState(prevState => ({ 
      ...prevState,
      ...initialStateBase, // Reset counters, waiting customers, etc.
      barbers: getDefaultBarbers(prevState.numBarbers), 
      isSimulating: true,
      // Retain existing config
      numWaitingChairs: prevState.numWaitingChairs,
      customerArrivalRateMs: prevState.customerArrivalRateMs,
      haircutDurationMs: prevState.haircutDurationMs,
      numBarbers: prevState.numBarbers,
      simulationTimeLimitS: prevState.simulationTimeLimitS,
      events: [], // Clear previous events
    }));
    addEvent('Simulation started.'); // Add start event after state is set
  }, [addEvent]);

  const stopSimulation = useCallback(() => {
    addEvent('Simulation stopped.');
    setState(prevState => ({ ...prevState, isSimulating: false }));
    // Timers will be cleared by the useEffect hooks when isSimulating becomes false
  }, [addEvent]);

  const resetSimulation = useCallback(() => {
    // Stop simulation first to ensure all timers are cleared by effects
    setState(prevState => ({ ...prevState, isSimulating: false }));

    // Then, set the state to initial, preserving config.
    // A small timeout helps ensure `isSimulating: false` effect cleanup runs before reset.
    setTimeout(() => {
      setState(prevState => {
        const currentConfig = {
          numWaitingChairs: prevState.numWaitingChairs,
          customerArrivalRateMs: Math.max(100,prevState.customerArrivalRateMs),
          haircutDurationMs: Math.max(100,prevState.haircutDurationMs),
          numBarbers: prevState.numBarbers,
          simulationTimeLimitS: prevState.simulationTimeLimitS,
        };
        haircutTimeoutRefs.current = new Array(currentConfig.numBarbers).fill(null);
        progressIntervalRefs.current = new Array(currentConfig.numBarbers).fill(null);

        return {
          ...initialStateBase,
          ...currentConfig,
          barbers: getDefaultBarbers(currentConfig.numBarbers),
          events: [{ id: Date.now(), timestamp: new Date(), message: 'Simulation reset.' }],
        };
      });
    }, 0);
  }, []); // Removed addEvent from deps, event is added manually

  const updateConfig = useCallback((newConfig: Partial<BarbershopConfig>) => {
    let effectiveConfig = { ...newConfig }; 
    let eventsToLog: string[] = [];

    if (effectiveConfig.haircutDurationMs !== undefined) {
        if (effectiveConfig.haircutDurationMs < 100) {
            eventsToLog.push(`Haircut duration (${effectiveConfig.haircutDurationMs}ms) too low, adjusted to 100ms.`);
            effectiveConfig.haircutDurationMs = 100;
        }
    }
    if (effectiveConfig.customerArrivalRateMs !== undefined) {
        if (effectiveConfig.customerArrivalRateMs < 100) {
            eventsToLog.push(`Customer arrival rate (${effectiveConfig.customerArrivalRateMs}ms) too low, adjusted to 100ms.`);
            effectiveConfig.customerArrivalRateMs = 100;
        }
    }
    if (effectiveConfig.numWaitingChairs !== undefined) {
        if (effectiveConfig.numWaitingChairs > 20) {
            eventsToLog.push(`Max waiting chairs (${effectiveConfig.numWaitingChairs}) too high, adjusted to 20.`);
            effectiveConfig.numWaitingChairs = 20;
        } else if (effectiveConfig.numWaitingChairs < 0) {
            eventsToLog.push(`Max waiting chairs (${effectiveConfig.numWaitingChairs}) invalid, adjusted to 0.`);
            effectiveConfig.numWaitingChairs = 0;
        }
    }
     if (effectiveConfig.simulationTimeLimitS !== undefined && effectiveConfig.simulationTimeLimitS < 0) {
        eventsToLog.push(`Simulation time limit (${effectiveConfig.simulationTimeLimitS}s) invalid, adjusted to 0.`);
        effectiveConfig.simulationTimeLimitS = 0;
    }

    setState(prevState => {
      const oldNumBarbers = prevState.numBarbers;
      const finalConfig = { ...prevState, ...effectiveConfig };
      let updatedState = { ...finalConfig };

      if (effectiveConfig.numBarbers !== undefined && effectiveConfig.numBarbers !== oldNumBarbers) {
        const newNumBarbers = Math.max(1, Math.min(5, effectiveConfig.numBarbers));
        if (newNumBarbers !== effectiveConfig.numBarbers) {
             eventsToLog.push(`Number of barbers (${effectiveConfig.numBarbers}) adjusted to ${newNumBarbers}. Min 1, Max 5.`);
        }
        updatedState.barbers = getDefaultBarbers(newNumBarbers);
        updatedState.numBarbers = newNumBarbers;
        
        // Clear and resize timer refs for the new number of barbers
        haircutTimeoutRefs.current.forEach(timeout => timeout && clearTimeout(timeout));
        haircutTimeoutRefs.current = new Array(newNumBarbers).fill(null);
        progressIntervalRefs.current.forEach(interval => interval && clearInterval(interval));
        progressIntervalRefs.current = new Array(newNumBarbers).fill(null);
      }
      return updatedState;
    });

    eventsToLog.forEach(eventMsg => addEvent(`Warning: ${eventMsg}`));
    if (Object.keys(effectiveConfig).length > 0) {
      addEvent(`Configuration update applied.`); // Simplified message
    }
  }, [addEvent]);

  return { state, startSimulation, stopSimulation, resetSimulation, updateConfig };
}
