import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useToast } from "../../hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useAccounts } from "../../hooks/useAccounts";
import { useCreditCards } from "../../hooks/useCreditCards";
import { FrequencyType, FREQUENCY_LABELS, DAYS_OF_WEEK } from "../../types/recurring-transaction";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";

interface NewRecurringTransactionFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: {
        type: "income" | "expense";
        amount: number;
        description: string;
        frequency: FrequencyType;
        day_of_month?: number;
        day_of_week?: number;
        start_date: string;
        account_id?: string;
        credit_card_id?: string;
    }) => Promise<void>;
}

const NewRecurringTransactionForm = ({ isOpen, onClose, onSubmit }: NewRecurringTransactionFormProps) => {
    const { toast } = useToast();
    const { accounts } = useAccounts();
    const { creditCards } = useCreditCards();
    const [paymentSource, setPaymentSource] = useState<"account" | "credit">("account");

    const form = useForm({
        defaultValues: {
            type: "expense" as "income" | "expense",
            amount: 0,
            description: "",
            frequency: "monthly" as FrequencyType,
            day_of_month: 1,
            day_of_week: 1,
            start_date: new Date().toISOString().split("T")[0],
            account_id: "",
            credit_card_id: "",
        },
    });

    const watchedType = form.watch("type");
    const watchedFrequency = form.watch("frequency");

    useEffect(() => {
        // Reset payment source when type changes
        if (watchedType === "income") {
            setPaymentSource("account");
            form.setValue("credit_card_id", "");
        }
    }, [watchedType, form]);

    const handleSubmit = async (data: any) => {
        if (!data.description) {
            toast({
                title: "Error",
                description: "Por favor ingresa una descripción.",
                variant: "destructive",
            });
            return;
        }

        if (data.amount <= 0) {
            toast({
                title: "Error",
                description: "El monto debe ser mayor a 0.",
                variant: "destructive",
            });
            return;
        }

        if (data.type === "expense" && paymentSource === "account" && !data.account_id) {
            toast({
                title: "Error",
                description: "Por favor selecciona una cuenta.",
                variant: "destructive",
            });
            return;
        }

        if (data.type === "expense" && paymentSource === "credit" && !data.credit_card_id) {
            toast({
                title: "Error",
                description: "Por favor selecciona una tarjeta de crédito.",
                variant: "destructive",
            });
            return;
        }

        if (data.type === "income" && !data.account_id) {
            toast({
                title: "Error",
                description: "Por favor selecciona una cuenta destino.",
                variant: "destructive",
            });
            return;
        }

        try {
            await onSubmit({
                type: data.type,
                amount: data.amount,
                description: data.description,
                frequency: data.frequency,
                day_of_month: data.frequency === "monthly" ? data.day_of_month : undefined,
                day_of_week: data.frequency === "weekly" ? data.day_of_week : undefined,
                start_date: data.start_date,
                account_id: paymentSource === "account" || data.type === "income" ? data.account_id : undefined,
                credit_card_id: paymentSource === "credit" && data.type === "expense" ? data.credit_card_id : undefined,
            });
            
            form.reset();
            onClose();
            toast({
                title: "Éxito",
                description: "Transacción recurrente creada correctamente.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudo crear la transacción recurrente.",
                variant: "destructive",
            });
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="flex flex-col h-full overflow-hidden">
                <SheetHeader>
                    <SheetTitle>Nueva Transacción Recurrente</SheetTitle>
                </SheetHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 mt-4 flex-1 overflow-y-auto pb-4">
                        {/* Tipo de transacción */}
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tipo</FormLabel>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        className="flex gap-4"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="expense" id="expense" />
                                            <Label htmlFor="expense">Gasto</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="income" id="income" />
                                            <Label htmlFor="income">Ingreso</Label>
                                        </div>
                                    </RadioGroup>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Descripción */}
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descripción</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ej: Netflix, Renta, Nómina" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Monto */}
                        <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Monto</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min="1"
                                            placeholder="0"
                                            {...field}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Frecuencia */}
                        <FormField
                            control={form.control}
                            name="frequency"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Frecuencia</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona la frecuencia" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {Object.entries(FREQUENCY_LABELS).map(([key, label]) => (
                                                <SelectItem key={key} value={key}>
                                                    {label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Día del mes (solo para mensual) */}
                        {watchedFrequency === "monthly" && (
                            <FormField
                                control={form.control}
                                name="day_of_month"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Día del mes</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min="1"
                                                max="31"
                                                {...field}
                                                onChange={(e) => {
                                                    const value = Math.min(31, Math.max(1, Number(e.target.value)));
                                                    field.onChange(value);
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {/* Día de la semana (solo para semanal) */}
                        {watchedFrequency === "weekly" && (
                            <FormField
                                control={form.control}
                                name="day_of_week"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Día de la semana</FormLabel>
                                        <Select 
                                            onValueChange={(v) => field.onChange(Number(v))} 
                                            value={String(field.value)}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona el día" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {DAYS_OF_WEEK.map((day) => (
                                                    <SelectItem key={day.value} value={String(day.value)}>
                                                        {day.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {/* Fecha de inicio */}
                        <FormField
                            control={form.control}
                            name="start_date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Fecha de inicio</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Origen del pago (solo para gastos) */}
                        {watchedType === "expense" && (
                            <div className="space-y-3">
                                <FormLabel>Origen del pago</FormLabel>
                                <RadioGroup
                                    value={paymentSource}
                                    onValueChange={(v) => setPaymentSource(v as "account" | "credit")}
                                    className="flex gap-4"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="account" id="source-account" />
                                        <Label htmlFor="source-account">Cuenta</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="credit" id="source-credit" />
                                        <Label htmlFor="source-credit">Tarjeta de Crédito</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        )}

                        {/* Selector de cuenta */}
                        {(watchedType === "income" || (watchedType === "expense" && paymentSource === "account")) && (
                            <FormField
                                control={form.control}
                                name="account_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            {watchedType === "income" ? "Cuenta destino" : "Cuenta"}
                                        </FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona una cuenta" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {accounts.map((account) => (
                                                    <SelectItem key={account.id} value={account.id}>
                                                        {account.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        {/* Selector de tarjeta de crédito */}
                        {watchedType === "expense" && paymentSource === "credit" && (
                            <FormField
                                control={form.control}
                                name="credit_card_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tarjeta de Crédito</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona una tarjeta" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {creditCards.map((card) => (
                                                    <SelectItem key={card.id} value={card.id}>
                                                        {card.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <Button type="submit" className="w-full">
                            Crear Transacción Recurrente
                        </Button>
                    </form>
                </Form>
            </SheetContent>
        </Sheet>
    );
};

export default NewRecurringTransactionForm;
