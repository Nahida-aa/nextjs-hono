'use client';
import { SWRConfig, SWRConfiguration } from 'swr'
export const SWRProvider = ({ children,
  value
}: { children: React.ReactNode;
  value?: SWRConfiguration | ((parentConfig?: SWRConfiguration | undefined) => SWRConfiguration) | undefined
  }) => {
  return <SWRConfig value={value}>{children}</SWRConfig>
};