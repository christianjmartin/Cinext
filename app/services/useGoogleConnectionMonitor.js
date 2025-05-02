import { useEffect, useRef } from 'react';
import NetInfo from "@react-native-community/netinfo";

const checkGoogleReachable = async () => {
    const net = await NetInfo.fetch();
  
    if (!net.isConnected || net.isInternetReachable === false) {
      return false;
    }
  
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, 7000); // ⏱️ up from 4s to 7s
  
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
  const lastStatus = useRef(true); // assume online
  const triggeredOffline = useRef(false); // block future checks

  useEffect(() => {
    const check = async () => {
      if (triggeredOffline.current) return;

    //   console.log("fanum AURA");
      const isOnline = await checkGoogleReachable();
    //   console.log(isOnline);

      if (!isOnline && lastStatus.current) {
        // console.warn("Lost connection — flipping to offline");
        lastStatus.current = false;
        triggeredOffline.current = true;
        setPage("offline");
      }
    };

    const interval = setInterval(check, 3000);
    return () => clearInterval(interval);
  }, []);
};
