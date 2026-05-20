import * as React from 'react';
import {
  RepositoryPickerContext,
  type RepositoryPickerContextValue,
} from './context';

export function useRepositoryPicker(): RepositoryPickerContextValue {
  const ctx = React.useContext(RepositoryPickerContext);
  if (!ctx) {
    throw new Error(
      'useRepositoryPicker must be used within RepositoryPickerProvider'
    );
  }
  return ctx;
}
