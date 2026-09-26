import { PackageCheck } from 'lucide-react';

interface BrandLogoProps {
  compact?: boolean;
}

export default function BrandLogo({ compact = false }: BrandLogoProps) {
  return (
    <div className="flex items-center gap-3 select-none">
      <div className="rounded-xl bg-primary text-primary-foreground p-2.5 shadow-sm">
        <PackageCheck className={compact ? 'h-6 w-6' : 'h-8 w-8'} />
      </div>
      <div className="leading-tight">
        <p className={compact ? 'font-bold text-lg' : 'font-bold text-2xl'}>ExpediCheck</p>
        <p className="text-xs text-muted-foreground">Double Check de Expedição</p>
      </div>
    </div>
  );
}
