import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Form } from "../ui/form";
import { Button } from "../ui/button";
import { useForm } from "react-hook-form";
import CommonFields from "./forms/CommonFields";
import ExpenseFields from "./forms/ExpenseFields";
import IncomeFields from "./forms/IncomeFields";
import CreditPaymentFields from "./forms/CreditPaymentFields";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "../../hooks/use-toast";
import { TransactionFormData, TransactionType } from "../../types/transaction-types";
import { Account } from "../../types/accounts";
import { useCreditCards } from "../../hooks/useCreditCards";

const transactionSchema = z.object({
    type: z.enum(["income", "expense", "credit_payment"] as const),
    amount: z.coerce.number().min(1, "El monto debe ser mayor a 0"),
    description: z.string().min(1, "La descripción es requerida"),
    date: z.string().min(1, "La fecha es requerida"),
    account_id: z.string().optional(),
    destination_account_id: z.string().optional(),
    credit_card_id: z.string().optional(),
    source: z.string().optional(),
}).refine((data) => {
    if (data.type === "expense") {
        return (!!data.account_id || !!data.credit_card_id) && !data.destination_account_id;
    }
    if (data.type === "income") {
        return !!data.destination_account_id && !data.account_id && !data.credit_card_id;
    }
    if (data.type === "credit_payment") {
        return !!data.credit_card_id && !data.account_id && !data.destination_account_id;
    }
    return true;
}, {
    message: "Por favor selecciona una cuenta o tarjeta según el tipo de transacción",
});

interface NewTransactionFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: TransactionFormData) => void;
    accounts: Account[];
}

const NewTransactionForm = ({ isOpen, onClose, onSubmit, accounts }: NewTransactionFormProps) => {
    const { toast } = useToast();
    const { creditCards } = useCreditCards();

    const form = useForm<TransactionFormData>({
        resolver: zodResolver(transactionSchema),
        defaultValues: {
            type: "expense",
            amount: 0,
            description: "",
            date: new Date().toISOString().split("T")[0],
            account_id: undefined,
            destination_account_id: undefined,
            credit_card_id: undefined,
        },
    });

    const handleSubmit = async (data: TransactionFormData) => {
        try {
            if (data.type === "expense" && data.credit_card_id) {
                const selectedCard = creditCards.find(card => card.id === data.credit_card_id);
                if (selectedCard) {
                    const availableCredit = selectedCard.limit_amount - (selectedCard.current_balance ?? 0);
                    if (data.amount > availableCredit) {
                        toast({
                            variant: "destructive",
                            title: "Error",
                            description: "El monto excede el crédito disponible de la tarjeta",
                        });
                        return;
                    }
                }
            }

            onSubmit(data);
            form.reset();
            onClose();
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Hubo un error al procesar la transacción",
            });
        }
    };

    const handleTypeChange = (type: TransactionType) => {
        form.setValue("type", type);
        form.setValue("account_id", undefined);
        form.setValue("destination_account_id", undefined);
        form.setValue("credit_card_id", undefined);
        form.setValue("amount", 0);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Nueva Transacción</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <CommonFields form={form} onTypeChange={handleTypeChange} />

                        {form.watch("type") === "expense" && (
                            <ExpenseFields form={form} accounts={accounts} />
                        )}

                        {form.watch("type") === "income" && (
                            <IncomeFields form={form} accounts={accounts} />
                        )}

                        {form.watch("type") === "credit_payment" && (
                            <CreditPaymentFields form={form} creditCards={creditCards} />
                        )}

                        <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={onClose}>
                                Cancelar
                            </Button>
                            <Button type="submit">Guardar</Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default NewTransactionForm;