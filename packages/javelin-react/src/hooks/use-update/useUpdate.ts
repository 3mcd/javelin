import { useCallback, useState } from "react";

export function useUpdate(): () => void {
  const [, setCount] = useState(0);
  return useCallback(() => setCount((count) => count + 1), []);
}