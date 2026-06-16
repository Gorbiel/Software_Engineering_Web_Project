"use client";

import { useEffect, useRef, useState } from "react";

type KeyedState<T> = {
  key: string;
  data: T | null;
  error: string | null;
};

export function useKeyedReport<T>(
  key: string | null,
  loader: () => Promise<T>,
): { data: T | null; isLoading: boolean; error: string | null } {
  const [state, setState] = useState<KeyedState<T> | null>(null);
  const loaderRef = useRef(loader);

  useEffect(() => {
    loaderRef.current = loader;
  });

  useEffect(() => {
    if (key === null) {
      return;
    }
    let ignore = false;
    loaderRef
      .current()
      .then((data) => {
        if (!ignore) setState({ key, data, error: null });
      })
      .catch((err) => {
        if (!ignore) {
          setState({
            key,
            data: null,
            error: err instanceof Error ? err.message : "Failed to load report.",
          });
        }
      });
    return () => {
      ignore = true;
    };
  }, [key]);

  if (key === null) {
    return { data: null, isLoading: false, error: null };
  }
  if (!state || state.key !== key) {
    return { data: null, isLoading: true, error: null };
  }
  return { data: state.data, isLoading: false, error: state.error };
}
