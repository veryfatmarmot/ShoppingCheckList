import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

// Tracks device connectivity via NetInfo (cross-platform: web + native).
// Starts optimistic (online) and updates on the first event. `isConnected` can
// be null while unknown, which is treated as online to avoid a false "offline".
export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setOnline(state.isConnected !== false);
    });
    return unsubscribe;
  }, []);

  return online;
}
