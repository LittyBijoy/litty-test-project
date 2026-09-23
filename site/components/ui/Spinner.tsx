import { HTMLAttributes } from 'react';

export function Spinner({ className = '', ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent ${className || 'h-5 w-5'}`}
      {...props}
    />
  );
}

export default Spinner;
