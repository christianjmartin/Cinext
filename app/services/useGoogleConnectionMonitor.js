import { useEffect, useRef } from 'react';
import NetInfo from "@react-native-community/netinfo";
import { AppState } from 'react-native';

export const useNetListener = (setPage) => {
  const appState = useRef(AppState.currentState);
  const netInfoUnsub = useRef(null);
  const debounceLock = useRef(false);

  useEffect(() => {
    // Check on mount
    const checkNow = async () => {
      const state = await NetInfo.fetch();
      if (!state.isConnected || state.isInternetReachable === false) {
        setPage("offline");
      }
    };
    checkNow();

    // commented code -> UNCOMMENT if still boots randomly 
    // add SPECIFICALLY isInternetReachable === null then RETURN (dont setpage, assuming internet good)
    // isConnected: false, isInternetReachable: null	->  assumes online SCARY CASE...... UNCOMMENT THEN TEST ACTUAL OFFLINE CASE TO MAKE SURE STILL WORKS ON TRUE NEGATIVE
    const subscribe = () => {
      if (netInfoUnsub.current) return; // avoid double-subscribe

      netInfoUnsub.current = NetInfo.addEventListener(state => {
        if (state.isInternetReachable === null) { return; } // UNCOMMENT IF STILL HAPPEN, THEN TEST ACTUAL OFFLINE CASE TO MAKE SURE STILL WORKS ON TRUE NEGATIVE
        if (
          typeof state.isConnected === 'boolean' &&
          typeof state.isInternetReachable === 'boolean'
        ) {
          if (state.isConnected === false || state.isInternetReachable === false) {
            if (debounceLock.current) return;
            debounceLock.current = true;

            setTimeout(async () => {
              const secondCheck = await NetInfo.fetch();
              debounceLock.current = false;
              if (secondCheck.isInternetReachable === null) { return; } // UNCOMMENT IF STILL HAPPEN, THEN TEST ACTUAL OFFLINE CASE TO MAKE SURE STILL WORKS ON TRUE NEGATIVE
              if (
                typeof secondCheck.isConnected === 'boolean' &&
                typeof secondCheck.isInternetReachable === 'boolean'
              ) {
                if (secondCheck.isConnected === false || secondCheck.isInternetReachable === false) {
                  setPage("offline");
                }
              }
            }, 1000);
          }
        }
      });
    };

    const unsubscribe = () => {
      if (netInfoUnsub.current) {
        netInfoUnsub.current();
        netInfoUnsub.current = null;
      }
    };

    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'active') {
        setTimeout(() => {
          if (AppState.currentState !== 'active') return;
          subscribe();
        }, 1000);
      } else {
        unsubscribe();
      }
      appState.current = nextAppState;
    };

    if (appState.current === 'active') {
      subscribe();
    }

    const sub = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      unsubscribe();
      sub.remove();
    };
  }, []);
};
