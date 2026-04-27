import React from 'react';

type DynamicImport = () => Promise<{ default: React.ComponentType<Record<string, unknown>> }>;
type DynamicOptions = {
  ssr?: boolean;
  loading?: () => React.ReactNode;
};

// In tests, render the loading placeholder instead of attempting a dynamic import
export default function dynamic(
  _importFn: DynamicImport,
  options?: DynamicOptions
): React.ComponentType<Record<string, unknown>> {
  return function DynamicComponent() {
    return options?.loading ? <>{options.loading()}</> : null;
  };
}
