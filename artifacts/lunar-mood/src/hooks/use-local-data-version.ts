import { useEffect, useState } from "react";

import { DEV_FALLBACKS_UPDATED_EVENT } from "../data/devFallbacks";
import { LOCAL_DATA_UPDATED_EVENT } from "../data/storage";

export function useLocalDataVersion(): number {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const bumpVersion = () => {
      setVersion((current) => current + 1);
    };

    window.addEventListener(LOCAL_DATA_UPDATED_EVENT, bumpVersion);
    window.addEventListener(DEV_FALLBACKS_UPDATED_EVENT, bumpVersion);
    window.addEventListener("storage", bumpVersion);

    return () => {
      window.removeEventListener(LOCAL_DATA_UPDATED_EVENT, bumpVersion);
      window.removeEventListener(DEV_FALLBACKS_UPDATED_EVENT, bumpVersion);
      window.removeEventListener("storage", bumpVersion);
    };
  }, []);

  return version;
}
