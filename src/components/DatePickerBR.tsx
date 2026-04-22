import * as React from "react";
import { format, parse, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DatePickerBRProps {
  value: string; // yyyy-MM-dd string
  onChange: (value: string) => void;
  className?: string;
}

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

// Aplica máscara dd/mm/aaaa enquanto o usuário digita
function maskDateBR(input: string): string {
  const digits = input.replace(/\D/g, "").slice(0, 8);
  const parts = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter(Boolean);
  return parts.join("/");
}

export function DatePickerBR({ value, onChange, className }: DatePickerBRProps) {
  const [open, setOpen] = React.useState(false);

  const date = value ? parse(value, "yyyy-MM-dd", new Date()) : undefined;
  const validDate = date && isValid(date) ? date : undefined;

  // Texto exibido no input (mantém o que o usuário está digitando)
  const [textValue, setTextValue] = React.useState<string>(
    validDate ? format(validDate, "dd/MM/yyyy") : ""
  );

  // Mês exibido no calendário
  const [displayMonth, setDisplayMonth] = React.useState<Date>(validDate ?? new Date());

  // Sincroniza quando o value externo muda
  React.useEffect(() => {
    if (validDate) {
      setTextValue(format(validDate, "dd/MM/yyyy"));
      setDisplayMonth(validDate);
    } else if (!value) {
      setTextValue("");
    }
  }, [value]);

  const handleSelect = (selected: Date | undefined) => {
    if (selected) {
      onChange(format(selected, "yyyy-MM-dd"));
      setTextValue(format(selected, "dd/MM/yyyy"));
    } else {
      onChange("");
      setTextValue("");
    }
    setOpen(false);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = maskDateBR(e.target.value);
    setTextValue(masked);

    if (masked.length === 10) {
      const parsed = parse(masked, "dd/MM/yyyy", new Date());
      if (isValid(parsed)) {
        onChange(format(parsed, "yyyy-MM-dd"));
        setDisplayMonth(parsed);
      }
    } else if (masked.length === 0) {
      onChange("");
    }
  };

  // Anos: do ano atual - 5 até ano atual + 10 (validade pode ser futura)
  const currentYear = new Date().getFullYear();
  const anos = Array.from({ length: 16 }, (_, i) => currentYear - 5 + i);

  return (
    <div className={cn("flex gap-2", className)}>
      <Input
        type="text"
        inputMode="numeric"
        placeholder="dd/mm/aaaa"
        value={textValue}
        onChange={handleTextChange}
        className="h-11 flex-1"
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-11 w-11 shrink-0"
            aria-label="Abrir calendário"
          >
            <CalendarIcon className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <div className="flex gap-2 p-3 pb-0">
            <Select
              value={String(displayMonth.getMonth())}
              onValueChange={(v) => {
                const novo = new Date(displayMonth);
                novo.setMonth(Number(v));
                setDisplayMonth(novo);
              }}
            >
              <SelectTrigger className="h-9 flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {MESES.map((mes, idx) => (
                  <SelectItem key={mes} value={String(idx)}>
                    {mes}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={String(displayMonth.getFullYear())}
              onValueChange={(v) => {
                const novo = new Date(displayMonth);
                novo.setFullYear(Number(v));
                setDisplayMonth(novo);
              }}
            >
              <SelectTrigger className="h-9 w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {anos.map((ano) => (
                  <SelectItem key={ano} value={String(ano)}>
                    {ano}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Calendar
            mode="single"
            selected={validDate}
            onSelect={handleSelect}
            month={displayMonth}
            onMonthChange={setDisplayMonth}
            initialFocus
            locale={ptBR}
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
