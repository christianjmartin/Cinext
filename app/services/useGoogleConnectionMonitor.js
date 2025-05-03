import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import NetInfo from "@react-native-community/netinfo";

const checkGoogleReachable = async () => {
  const net = await NetInfo.fetch();

  if (!net.isConnected || net.isInternetReachable === false) {
    return false;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, 7000);

  try {
    const res = await fetch("https://clients3.google.com/generate_204", {
      method: "GET",
      signal: controller.signal,
      cache: "no-cache",
    });
    clearTimeout(timeout);
    return res.status === 204;
  } catch {
    clearTimeout(timeout);
    return false;
  }
};

export const useGoogleConnectionMonitor = (setPage) => {
  const lastStatus = useRef(true);
  const triggeredOffline = useRef(false);
  const intervalRef = useRef(null);

  const startChecking = () => {
    if (intervalRef.current) return; // prevent duplicates

    intervalRef.current = setInterval(async () => {
      if (triggeredOffline.current) return;

      const isOnline = await checkGoogleReachable();
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
