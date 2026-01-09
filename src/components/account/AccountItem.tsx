import { Button } from "../ui/button";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Account } from "../../types/accounts";
import { BANK_CONFIGS } from "../../types/creditCard";

interface AccountItemProps {
    account: Account;
    showAmounts?: boolean;
    onEdit: (account: Account) => void;
    onDelete: (account: Account) => void;
}

const AccountItem = ({ account, onEdit, onDelete }: AccountItemProps) => {
    const isCartera = account.name === "Cartera";

    const getBankDisplayName = () => {
        if (!account.bank) return null;
        if (account.bank === "otro" && account.bank_name) {
            return account.bank_name;
        }
        return BANK_CONFIGS[account.bank]?.name || null;
    };

    const bankName = getBankDisplayName();

    return (
        <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
            <div>
                <span className="font-medium">{account.name}</span>
                {bankName && (
                    <p className="text-xs text-muted-foreground">{bankName}</p>
                )}
                <p className="text-sm text-muted-foreground">
                    ${(account.balance ?? 0).toLocaleString("es-ES")}
                </p>
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(account)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                    </DropdownMenuItem>
                    {!isCartera && (
                        <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => onDelete(account)}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};

export default AccountItem;