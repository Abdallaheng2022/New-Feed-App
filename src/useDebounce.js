import { useEffect, useState } from "react";

export function useDebounce(value, delay = 500) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer); // لو كتب حرفًا جديدًا، نلغي المؤقت القديم
  }, [value, delay]);

  return debounced;
}