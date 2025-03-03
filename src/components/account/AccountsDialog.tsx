import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "../ui/dialog";
import AccountItem from "./AccountItem";
import { Account } from "../../types/accounts";

interface AccountsDialogProps {
    isOpen: boolean;
    accounts: Account[];
    onClose: () => void;
    onEdit: (account: Account) => void;
    onDelete: (account: Account) => void;
}

const AccountsDialog = ({
    isOpen,
    accounts,
    onClose,
    onEdit,
    onDelete,
}: AccountsDialogProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Detalle de Cuentas</DialogTitle>
                    <DialogDescription>
                        Gestiona tus cuentas bancarias
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    {accounts.map((account) => (
                        <AccountItem
                            key={account.id}
                            account={account}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default AccountsDialog;