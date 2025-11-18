import { useLayoutEffect, useState } from "react";

export default function useGridColumns(ref) {
  const [cols, setCols] = useState(1);

  useLayoutEffect(() => {
    if (!ref.current) return;

    const compute = () => {
      const cs = getComputedStyle(ref.current);
      // gridTemplateColumns like: "1fr 1fr 1fr ..."
      const count = cs.gridTemplateColumns.split(" ").filter(Boolean).length;
      setCols(count || 1);
    };

    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, [ref]);

  return cols;
}
