"use client";

import { useEffect, useState } from "react";
import {
  fetchIncomingConfirmationRequests,
  type IncomingConfirmationRequest,
} from "@/utils/achievements";

export function useConfirmationRequests() {
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

  return { requests, setRequests, isLoading, error };
}
