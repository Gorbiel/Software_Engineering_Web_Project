"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import {
  fetchIncomingConfirmationRequests,
  type IncomingConfirmationRequest,
} from "@/utils/achievements";

type ConfirmationRequestsValue = {
  requests: IncomingConfirmationRequest[];
  setRequests: Dispatch<SetStateAction<IncomingConfirmationRequest[]>>;
  isLoading: boolean;
  error: string | null;
};

const ConfirmationRequestsContext =
  createContext<ConfirmationRequestsValue | null>(null);

export function ConfirmationRequestsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [requests, setRequests] = useState<IncomingConfirmationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    fetchIncomingConfirmationRequests()
      .then((data) => {
        if (ignore) return;
        setRequests(data);
        setError(null);
      })
      .catch(() => {
        if (ignore) return;
        setError("Could not load requests.");
      })
      .finally(() => {
        if (ignore) return;
        setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <ConfirmationRequestsContext.Provider
      value={{ requests, setRequests, isLoading, error }}
    >
      {children}
    </ConfirmationRequestsContext.Provider>
  );
}

export function useConfirmationRequests() {
  const context = useContext(ConfirmationRequestsContext);
  if (!context) {
    throw new Error(
      "useConfirmationRequests must be used within a ConfirmationRequestsProvider",
    );
  }
  return context;
}
