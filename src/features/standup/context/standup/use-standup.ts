import * as React from 'react';
import { StandupContext, type StandupContextValue } from './context';

export function useStandup(): StandupContextValue {
  const ctx = React.useContext(StandupContext);
  if (!ctx) {
    throw new Error('useStandup must be used within StandupProvider');
  }
  return ctx;
}
