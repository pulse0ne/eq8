/* eslint-disable @typescript-eslint/ban-types */
import { useCallback, useInsertionEffect, useRef } from "react";

export function useEvent(fn: Function) {
  const ref = useRef<Function|null>(null);
  useInsertionEffect(() => {
    ref.current = fn;
  }, [fn]);
  return useCallback((...args: unknown[]) => {
    const f = ref.current;
    return f?.(...args);
  }, []);
}
