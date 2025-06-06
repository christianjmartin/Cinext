import { useEffect } from 'react';
import NetInfo from "@react-native-community/netinfo";

export const useNetListener = (setPage) => {
  useEffect(() => {
    let debounceLock = false;

    // Initial check on mount
    const checkNow = async () => {
      const state = await NetInfo.fetch();
      if (!state.isConnected || state.isInternetReachable === false) {
        setPage("offline");
      }
    };

    checkNow();

    const unsubscribe = NetInfo.addEventListener(state => {
      if (!state.isConnected || state.isInternetReachable === false) {
        if (debounceLock) return; // 🛑 already waiting
        debounceLock = true;

        setTimeout(async () => {
          const secondCheck = await NetInfo.fetch();
          debounceLock = false;

          if (!secondCheck.isConnected || secondCheck.isInternetReachable === false) {
            setPage("offline");
          }
        }, 3500);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);
};
