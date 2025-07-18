import type { MDXComponents } from 'mdx/types';
import { components } from '@/components/mdx-components';

export function useMDXComponents(): MDXComponents {
  return components;
}