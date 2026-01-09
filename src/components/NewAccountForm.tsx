import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useToast } from "../hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { BankType, BANK_CONFIGS } from "../types/creditCard";

interface NewAccountFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; balance: number; bank: BankType; bank_name?: string }) => void;
  initialValues?: {
    name: string;
    balance: number;
    bank?: BankType;
    bank_name?: string;
  };
}

const NewAccountForm = ({ isOpen, onClose, onSubmit, initialValues }: NewAccountFormProps) => {
  const { toast } = useToast();
  const [showCustomBankName, setShowCustomBankName] = useState(false);
  const form = useForm({
    defaultValues: {
      name: "",
      balance: 0,
      bank: "otro" as BankType,
      bank_name: "",
    },
  });

  useEffect(() => {
    if (initialValues) {
      const bank = initialValues.bank || "otro";
      setShowCustomBankName(bank === "otro");
      form.reset({
        ...initialValues,
        bank,
        bank_name: initialValues.bank_name || "",
      });
    }
  }, [initialValues, form]);

  const handleSubmit = (data: { name: string; balance: number; bank: BankType; bank_name?: string }) => {
    if (!data.name) {
      toast({
        title: "Error",
        description: "Por favor ingresa un nombre para la cuenta.",
        variant: "destructive",
      });
      return;
    }

    onSubmit({
      name: data.name,
      balance: data.balance,
      bank: data.bank,
      bank_name: data.bank === "otro" ? data.bank_name : undefined,
    });
    form.reset();
    setShowCustomBankName(false);
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="flex flex-col h-full overflow-hidden">
        <SheetHeader>
          <SheetTitle>{initialValues ? "Editar Cuenta" : "Nueva Cuenta"}</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 mt-4 flex-1 overflow-y-auto pb-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la Cuenta</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Cuenta de Ahorros" {...field} />
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
              name="balance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Saldo</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              {initialValues ? "Guardar Cambios" : "Crear Cuenta"}
            </Button>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};

export default NewAccountForm;
