import BrandLogo from '@/components/BrandLogo';

interface PageHeaderProps {
  children?: React.ReactNode;
}

export default function PageHeader({ children }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
      <div className="flex items-center gap-3 flex-1 min-w-[260px]">{children}</div>
      <BrandLogo compact />
    </div>
  );
}
