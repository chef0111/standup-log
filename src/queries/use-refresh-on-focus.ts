import { useFocusEffect } from '@react-navigation/native';
import * as React from 'react';

export function useRefreshOnFocus(refetch: () => void): void {
  const refetchRef = React.useRef(refetch);
  refetchRef.current = refetch;

  useFocusEffect(
    React.useCallback(() => {
      refetchRef.current();
    }, [])
  );
}
