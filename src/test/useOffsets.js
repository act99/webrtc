import { useState, useEffect } from "react";

// We only want to apply the offsets in the event that the video (v) is larger than the parent container (c). We can create another custom Hook that uses an effect to evaluate whether an offset is required and returns the updated results whenever any of the values change.

//  ** container 대비 video 크기 조절 hook

export function useOffsets(vWidth, vHeight, cWidth, cHeight) {
  const [offsets, setOffsets] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (vWidth && vHeight && cWidth && cHeight) {
      const x = vWidth > cWidth ? Math.round((vWidth - cWidth) / 2) : 0;

      const y = vHeight > cHeight ? Math.round((vHeight - cHeight) / 2) : 0;

      setOffsets({ x, y });
    }
  }, [vWidth, vHeight, cWidth, cHeight]);

  return offsets;
}
