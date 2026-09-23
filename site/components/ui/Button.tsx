import { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react';
import { Spinner } from './Spinner';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

const variantClasses: Record<Variant, string> = {
  primary: 'bg-charcoal text-white hover:bg-charcoal-light disabled:bg-charcoal/40',
  secondary: 'bg-cream-dark text-charcoal hover:bg-border disabled:opacity-50',
  outline: 'border border-border bg-transparent text-charcoal hover:bg-cream-dark disabled:opacity-50',
  ghost: 'bg-transparent text-charcoal hover:bg-cream-dark disabled:opacity-50',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
};

const base = 'inline-flex items-center justify-center gap-2 rounded-full font-medium disabled:cursor-not-allowed';

interface ButtonAsButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  as?: 'button';
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
}

interface ButtonAsAnchorProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  as: 'a';
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
}

type ButtonProps = ButtonAsButtonProps | ButtonAsAnchorProps;

export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const classes = `${base} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  if (props.as === 'a') {
    const { as: _as, ...anchorProps } = props;
    void _as;
    return (
      <a className={classes} {...anchorProps}>
        {isLoading && <Spinner className="h-4 w-4" />}
        {children}
      </a>
    );
  }

  const { as: _as, disabled, ...buttonProps } = props as ButtonAsButtonProps;
  void _as;
  return (
    <button className={classes} disabled={disabled || isLoading} {...buttonProps}>
      {isLoading && <Spinner className="h-4 w-4" />}
      {children}
    </button>
  );
}
