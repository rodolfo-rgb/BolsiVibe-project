import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "../../ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { CreditCard } from "../../../types/creditCard";
import { UseFormReturn } from "react-hook-form";
import { useEffect } from "react";

interface CreditPaymentFieldsProps {
    form: UseFormReturn<any>;
    creditCards: CreditCard[];
}

const CreditPaymentFields = ({ form, creditCards }: CreditPaymentFieldsProps) => {
    useEffect(() => {
        const creditCardId = form.watch('credit_card_id');
        if (creditCardId) {
            const selectedCard = creditCards.find(card => card.id === creditCardId);
            if (selectedCard) {
                form.setValue('amount', selectedCard.current_balance ?? 0);
            }
        }
    }, [form.watch('credit_card_id')]);

    return (
        <FormField
            control={form.control}
            name="credit_card_id"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Tarjeta a Pagar</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona la tarjeta" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {creditCards.map((card) => (
                                <SelectItem key={card.id} value={card.id}>
                                    {card.name} - Deuda: ${(card.current_balance ?? 0).toLocaleString("es-ES")}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
};

export default CreditPaymentFields;