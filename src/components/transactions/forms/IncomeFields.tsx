import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "../../ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Account } from "../../../types/accounts";
import { UseFormReturn } from "react-hook-form";

interface IncomeFieldsProps {
    form: UseFormReturn<any>;
    accounts: Account[];
}

const IncomeFields = ({ form, accounts }: IncomeFieldsProps) => {
    return (
        <FormField
            control={form.control}
            name="destination_account_id"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Cuenta Destino</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona la cuenta destino" />
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
    );
};

export default IncomeFields;