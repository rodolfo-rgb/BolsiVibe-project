import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useToast } from "../hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface NewCreditCardFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    limit_amount: number;
    payment_day: number;
    cutoff_day: number;
  }) => Promise<void>;
  initialValues?: {
    name: string;
    limit_amount?: number;
    payment_day?: number;
    cutoff_day?: number;
  };
}

const NewCreditCardForm = ({ isOpen, onClose, onSubmit, initialValues }: NewCreditCardFormProps) => {
  const { toast } = useToast();
  const form = useForm({
    defaultValues: {
      name: "",
      limit_amount: 1000,
      cutoff_month: "1",
      cutoff_day: 1,
      payment_day: 1,
    },
  });

  useEffect(() => {
    if (initialValues) {
      form.reset({
        ...initialValues,
        cutoff_month: "1",
        cutoff_day: initialValues.cutoff_day || 1,
        payment_day: initialValues.payment_day || 1,
      });
    }
  }, [initialValues, form]);

  const calculatePaymentDay = (cutoffDay: number) => {
    const paymentDay = cutoffDay + 20;
    return paymentDay > 31 ? paymentDay - 31 : paymentDay;
  };

  const handleSubmit = async (data: any) => {
    if (!data.name || !data.limit_amount || !data.cutoff_day) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos.",
        variant: "destructive",
      });
      return;
    }

    if (data.limit_amount < 1000) {
      toast({
        title: "Error",
        description: "El límite de crédito debe ser mayor a $1,000.",
        variant: "destructive",
      });
      return;
    }

    if (data.cutoff_day < 1 || data.cutoff_day > 31) {
      toast({
        title: "Error",
        description: "El día de corte debe estar entre 1 y 31.",
        variant: "destructive",
      });
      return;
    }

    const paymentDay = calculatePaymentDay(data.cutoff_day);

    try {
      await onSubmit({
        name: data.name,
        limit_amount: data.limit_amount,
        cutoff_day: data.cutoff_day,
        payment_day: paymentDay,
      });
      form.reset();
      onClose();
    } catch (error: any) {
      if (error?.message?.includes('unique constraint')) {
        toast({
          title: "Error",
          description: "Ya tienes una tarjeta con este nombre. Por favor elige un nombre diferente.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "No se pudo guardar la tarjeta. Por favor intenta de nuevo.",
          variant: "destructive",
        });
      }
    }
  };

  const months = [
    { value: "1", label: "Enero" },
    { value: "2", label: "Febrero" },
    { value: "3", label: "Marzo" },
    { value: "4", label: "Abril" },
    { value: "5", label: "Mayo" },
    { value: "6", label: "Junio" },
    { value: "7", label: "Julio" },
    { value: "8", label: "Agosto" },
    { value: "9", label: "Septiembre" },
    { value: "10", label: "Octubre" },
    { value: "11", label: "Noviembre" },
    { value: "12", label: "Diciembre" },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{initialValues ? "Editar Tarjeta" : "Nueva Tarjeta de Crédito"}</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la Tarjeta</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Tarjeta Oro" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="limit_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Límite de Crédito (Mínimo $1,000)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1000"
                      placeholder="Ej: 50000"
                      {...field}
                      onChange={e => field.onChange(Math.max(1000, Number(e.target.value)))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cutoff_month"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mes de Corte</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el mes" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem key={month.value} value={month.value}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cutoff_day"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Día de Corte</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      max="31"
                      {...field}
                      onChange={e => {
                        const value = Math.min(31, Math.max(1, Number(e.target.value)));
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              {initialValues ? "Guardar Cambios" : "Agregar Tarjeta"}
            </Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};

export default NewCreditCardForm;