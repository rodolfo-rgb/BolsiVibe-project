import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { Form, FormControl, FormField, FormItem, FormLabel } from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useToast } from "../hooks/use-toast";

interface NewAccountFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; balance: number }) => void;
  initialValues?: {
    name: string;
    balance: number;
  };
}

const NewAccountForm = ({ isOpen, onClose, onSubmit, initialValues }: NewAccountFormProps) => {
  const { toast } = useToast();
  const form = useForm({
    defaultValues: {
      name: "",
      balance: 0,
    },
  });

  useEffect(() => {
    if (initialValues) {
      form.reset(initialValues);
    }
  }, [initialValues, form]);

  const handleSubmit = (data: { name: string; balance: number }) => {
    if (!data.name) {
      toast({
        title: "Error",
        description: "Por favor ingresa un nombre para la cuenta.",
        variant: "destructive",
      });
      return;
    }

    onSubmit(data);
    form.reset();
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{initialValues ? "Editar Cuenta" : "Nueva Cuenta"}</SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la Cuenta</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Cuenta de Ahorros" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
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
