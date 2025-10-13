import * as React from "react";

// Returns dynamic bottom inset using the VisualViewport API on Android devices
// This helps avoid overlap with the system navigation bar or gesture area.
export function useBottomInset() {
  const [inset, setInset] = React.useState(0);

  React.useEffect(() => {
    const vv = window.visualViewport;
    const compute = () => {
      if (!vv) {
        setInset(0);
        return;
      }
      const bottom = Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop));
      setInset(bottom);
    };

    compute();
    vv?.addEventListener("resize", compute);
    vv?.addEventListener("scroll", compute);
    window.addEventListener("resize", compute);

    return () => {
      vv?.removeEventListener("resize", compute as EventListener);
      vv?.removeEventListener("scroll", compute as EventListener);
      window.removeEventListener("resize", compute);
    };
  }, []);

  return inset;
}
