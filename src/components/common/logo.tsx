import type { SVGProps } from 'react';
import { ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoProps extends SVGProps<SVGSVGElement> {
  iconOnly?: boolean;
  className?: string;
}

export function Logo({ iconOnly = false, className, ...props }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2 text-primary", className)}>
      <ShieldCheck className="h-7 w-7" {...props} />
      {!iconOnly && (
        <span className="text-xl font-bold">SheSafe</span>
      )}
    </div>
  );
}
