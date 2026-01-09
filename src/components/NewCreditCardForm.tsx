import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useToast } from "../hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { BankType, BANK_CONFIGS } from "../types/creditCard";

interface NewCreditCardFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    limit_amount: number;
    payment_day: number;
    cutoff_day: number;
    days_until_payment: number;
    bank: BankType;
    bank_name?: string;
    expiration_date?: string;
  }) => Promise<void>;
  initialValues?: {
    name: string;
    limit_amount?: number;
    payment_day?: number;
    cutoff_day?: number;
    days_until_payment?: number;
    bank?: BankType;
    bank_name?: string;
    expiration_date?: string;
  };
}

const NewCreditCardForm = ({ isOpen, onClose, onSubmit, initialValues }: NewCreditCardFormProps) => {
  const { toast } = useToast();
  const [showCustomBankName, setShowCustomBankName] = useState(false);
  const form = useForm({
    defaultValues: {
      name: "",
      limit_amount: 1000,
      cutoff_month: "1",
      cutoff_day: 1,
      days_until_payment: 20,
      payment_day: 1,
      bank: "otro" as BankType,
      bank_name: "",
      expiration_month: "",
      expiration_year: "",
    },
  });

  useEffect(() => {
    if (initialValues) {
      const bank = initialValues.bank || "otro";
      setShowCustomBankName(bank === "otro");
      const [expMonth, expYear] = initialValues.expiration_date?.split('/') || ["", ""];
      form.reset({
        ...initialValues,
        cutoff_month: "1",
        cutoff_day: initialValues.cutoff_day || 1,
        days_until_payment: initialValues.days_until_payment || 20,
        payment_day: initialValues.payment_day || 1,
        bank,
        bank_name: initialValues.bank_name || "",
        expiration_month: expMonth || "",
        expiration_year: expYear || "",
      });
    }
  }, [initialValues, form]);

  const calculatePaymentDay = (cutoffDay: number, daysUntilPayment: number) => {
    const paymentDay = cutoffDay + daysUntilPayment;
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

    if (data.days_until_payment < 1 || data.days_until_payment > 30) {
      toast({
        title: "Error",
        description: "Los días para pago deben estar entre 1 y 30.",
        variant: "destructive",
      });
      return;
    }

    const paymentDay = calculatePaymentDay(data.cutoff_day, data.days_until_payment);

    try {
      const expirationDate = data.expiration_month && data.expiration_year 
        ? `${data.expiration_month.padStart(2, '0')}/${data.expiration_year}` 
        : undefined;
      
      await onSubmit({
        name: data.name,
        limit_amount: data.limit_amount,
        cutoff_day: data.cutoff_day,
        days_until_payment: data.days_until_payment,
        payment_day: paymentDay,
        bank: data.bank as BankType,
        bank_name: data.bank === "otro" ? data.bank_name : undefined,
        expiration_date: expirationDate,
      });
      form.reset();
      setShowCustomBankName(false);
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
      <SheetContent className="flex flex-col h-full overflow-hidden">
        <SheetHeader>
          <SheetTitle>{initialValues ? "Editar Tarjeta" : "Nueva Tarjeta de Crédito"}</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 mt-4 flex-1 overflow-y-auto pb-4">
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
              name="bank"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Banco</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      setShowCustomBankName(value === "otro");
                    }} 
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el banco" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(BANK_CONFIGS).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          {config.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {showCustomBankName && (
              <FormField
                control={form.control}
                name="bank_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Banco</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Banco Regional" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
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
            <FormField
              control={form.control}
              name="days_until_payment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Días para Pago (después del corte)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      max="30"
                      {...field}
                      onChange={e => {
                        const value = Math.min(30, Math.max(1, Number(e.target.value)));
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Días que el banco otorga después del corte como fecha límite de pago
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-2">
              <FormLabel>Fecha de Expiración</FormLabel>
              <div className="flex gap-2">
                <FormField
                  control={form.control}
                  name="expiration_month"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Mes" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                            <SelectItem key={month} value={String(month)}>
                              {String(month).padStart(2, '0')}
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
                  name="expiration_year"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Año" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Array.from({ length: 15 }, (_, i) => new Date().getFullYear() + i).map((year) => (
                            <SelectItem key={year} value={String(year).slice(-2)}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
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