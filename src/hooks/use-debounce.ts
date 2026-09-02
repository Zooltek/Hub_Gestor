import { useState, useEffect } from "react";

/**
 * Hook para atrasar a atualização de um valor até que um determinado intervalo de tempo
 * tenha decorrido sem novas alterações. Ideal para campos de busca e filtros de texto.
 */
export function useDebounce<T>(value: T, delay: number = 400): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
