"use client";
import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
export function DateField({
  id,
  value,
  onChange,
  birth = false,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  birth?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          className="w-full justify-start font-normal"
        >
          <CalendarIcon className="mr-2 size-4" />
          {value
            ? format(new Date(value + "T12:00:00"), "dd MMM yyyy", {
                locale: es,
              })
            : "Seleccionar fecha"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          locale={es}
          selected={value ? new Date(value + "T12:00:00") : undefined}
          defaultMonth={
            value
              ? new Date(value + "T12:00:00")
              : birth
                ? new Date(2000, 0)
                : new Date()
          }
          captionLayout="dropdown"
          startMonth={new Date(birth ? 1920 : 2020, 0)}
          endMonth={new Date(birth ? new Date().getFullYear() : 2040, 11)}
          disabled={birth ? { after: new Date() } : undefined}
          onSelect={(d) => {
            if (d) {
              onChange(format(d, "yyyy-MM-dd"));
              setOpen(false);
            }
          }}
        />
        <div className="border-t p-3 text-xs text-muted-foreground">
          Selecciona día, mes y año.
        </div>
      </PopoverContent>
    </Popover>
  );
}
