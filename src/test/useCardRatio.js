import { useState, useCallback } from "react";

// ** aspectRatio 설정
export function useCardRatio(initialRatio) {
  const [aspectRatio, setAspectRatio] = useState(initialRatio);

  // ** Ratio 계산을 useCallback으로 묶어 재사용, 렌더링 최소화
  const calculateRatio = useCallback((height, width) => {
    if (height && width) {
      const isLandscape = height <= width;
      const ratio = isLandscape ? width / height : height / width;

      setAspectRatio(ratio);
    }
  }, []);

  return [aspectRatio, calculateRatio];
}
