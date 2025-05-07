import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import NetInfo from "@react-native-community/netinfo";

const checkNetInfoOnly = async () => {
  const net = await NetInfo.fetch();
  return net.isConnected && net.isInternetReachable !== false;
};

export const useGoogleConnectionMonitor = (setPage) => {
  const lastStatus = useRef(true);
  const triggeredOffline = useRef(false);
  const intervalRef = useRef(null);

  const startChecking = () => {
    if (intervalRef.current) return; // prevent duplicates

    intervalRef.current = setInterval(async () => {
      if (triggeredOffline.current) return;

      const isOnline = await checkNetInfoOnly();
      if (!isOnline && lastStatus.current) {
        lastStatus.current = false;
        triggeredOffline.current = true;
        setPage("offline");
      }
    }, 3000);
  };

  const stopChecking = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'active') {
        startChecking();
      } else {
        stopChecking(); // pause checks while backgrounded
      }
    };

    AppState.addEventListener('change', handleAppStateChange);

    startChecking(); // start immediately

    return () => {
      AppState.removeEventListener('change', handleAppStateChange);
      stopChecking();
    };
  }, []);
};
