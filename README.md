# Project Title

This project is a simulation of the classic "Sleeping Barber Problem" using modern web technologies. It visualizations the interactions between a barber, waiting customers, and the state of the barbershop, demonstrating concepts of concurrency and resource management.

## Description

The Sleeping Barber Problem is a classic concurrency problem that illustrates the challenges of coordinating multiple processes (customers) with a limited resource (the barber). This simulation provides a visual and interactive way to understand the dynamics of this problem, including how the barber sleeps when there are no customers, and customers wait or leave if the chairs are occupied.

## Documentation of its Making

This project was built with a focus on creating a clear and interactive simulation of the Sleeping Barber Problem. The core logic for the simulation resides in the `use-sleeping-barber.ts` hook, which manages the state of the barber and the waiting customers. The user interface, built with React and Next.js, provides controls to adjust parameters of the simulation and visualize the current state of the barbershop, including the barber's status, the waiting queue, and an event log. Various UI components were utilized to create a user-friendly and informative display.

## Folder Structure

The project is organized into the following main directories:

*   **`src`**: This directory contains the source code for the application.
    *   **`app`**: Contains the main application files, including the root layout (`layout.tsx`) and the main page (`page.tsx`). The simulation interface is rendered within `page.tsx`.
    *   **`hooks`**: Contains custom React hooks used in the project. The core simulation logic is implemented in `use-sleeping-barber.ts`. Other hooks include `use-mobile.tsx` and `use-toast.ts`.
    *   **`lib`**: Contains utility functions (`utils.ts`).
    *   **`types`**: Contains TypeScript type definitions (`barbershop.ts`).
    *   **`components`**: Contains reusable UI components.
        *   **`barbershop`**: Components specifically for the barbershop simulation (e.g., `BarberCard.tsx`, `WaitingChairsDisplay.tsx`). These components consume the state and logic from the `use-sleeping-barber.ts` hook to render the simulation visually.
        *   **`ui`**: Contains general-purpose UI components built using a component library (e.g., `button.tsx`, `dialog.tsx`).

## Code Understanding of Algorithm

The core of the Sleeping Barber Problem simulation is implemented in the `use-sleeping-barber.ts` hook. This hook manages the state of the barbershop and the interactions between the barber and customers.

Key state variables within `use-sleeping-barber.ts` include:

*   `barberState`: Represents the current state of the barber (e.g., 'sleeping', 'working', 'waiting').
*   `waitingCustomers`: An array representing the queue of customers waiting for a haircut.
*   `chairs`: The total number of waiting chairs available.
*   `isBarberBusy`: A boolean indicating if the barber is currently cutting hair.
*   `eventLog`: A log of significant events happening in the barbershop (e.g., customer arrives, barber starts cutting).

The algorithm handles the following logic:

*   **Customer Arrival:** When a new customer arrives, the hook checks if there are available waiting chairs. If chairs are available, the customer joins the `waitingCustomers` queue. If no chairs are available, the customer leaves.
*   **Barber State Management:** The barber's state is updated based on the number of waiting customers. If there are customers waiting (`waitingCustomers.length > 0`) and the barber is not busy, the barber starts cutting hair, and `isBarberBusy` is set to `true`. If there are no waiting customers, the barber's state changes to 'sleeping'.
*   **Haircut Process:** When the barber starts cutting a customer's hair, that customer is removed from the `waitingCustomers` queue. After a simulated haircut duration, the barber becomes free, and the next customer in the queue is checked.
*   **Concurrency:** While this is a simulation within a single-threaded JavaScript environment, the logic in `use-sleeping-barber.ts` is designed to model concurrent behavior. The state updates and event handling mimic how threads or processes would interact in a true concurrent system. The hook uses effects and state management to react to changes in the number of waiting customers and the barber's status, driving the simulation forward.

The simulation flow is driven by actions such as a new customer arriving (which might trigger the barber to wake up) or the barber finishing a haircut (which might lead to the barber sleeping or serving the next customer). The `use-sleeping-barber.ts` hook encapsulates this state and logic, making it reusable and testable.
