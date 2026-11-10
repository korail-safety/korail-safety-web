"use client";

import { useEffect, useState } from "react";

/** 값이 delay 동안 바뀌지 않으면 그때 반영한다 (검색어 입력 등) */
export function useDebouncedValue<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
