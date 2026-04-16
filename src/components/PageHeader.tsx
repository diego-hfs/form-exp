import logoNitro from '@/assets/logo-nitro.png';

interface PageHeaderProps {
  children?: React.ReactNode;
}

export default function PageHeader({ children }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        {children}
      </div>
      <img src={logoNitro} alt="Nitro" className="h-32 object-contain" />
    </div>
  );
}
