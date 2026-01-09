import { Account } from "../../types/accounts";
import { useNavigate } from "react-router-dom";
import { BANK_CONFIGS } from "../../types/creditCard";

interface AccountsListProps {
    accounts: Account[];
    onAccountClick: () => void;
}

const AccountsList = ({ accounts, onAccountClick }: AccountsListProps) => {
    const navigate = useNavigate();

    const getBankDisplayName = (account: Account) => {
        if (!account.bank) return null;
        if (account.bank === "otro" && account.bank_name) {
            return account.bank_name;
        }
        return BANK_CONFIGS[account.bank]?.name || null;
    };

    return (
        <div className="space-y-4">
            {accounts.map((account) => {
                const bankName = getBankDisplayName(account);
                return (
                    <div
                        key={account.id}
                        className="flex items-center justify-between p-4 bg-secondary rounded-lg cursor-pointer hover:bg-secondary/80 transition-colors"
                        onClick={() => navigate(`/account/${account.id}`)}
                    >
                        <div>
                            <span className="font-medium">{account.name}</span>
                            {bankName && (
                                <p className="text-xs text-muted-foreground">{bankName}</p>
                            )}
                        </div>
                        <span className="text-lg">
                            ${(account.balance ?? 0).toLocaleString("es-ES")}
                        </span>
                    </div>
                );
            })}
            <div
                className="flex items-center justify-between pt-4 mt-4 border-t cursor-pointer hover:bg-secondary/50 p-2 rounded-lg transition-colors"
                onClick={onAccountClick}
            >
                <span className="font-semibold">Total</span>
                <span className="text-xl font-bold">
                    ${accounts
                        .reduce((sum, account) => sum + (account.balance ?? 0), 0)
                        .toLocaleString("es-ES")}
                </span>
            </div>
        </div>
    );
};

export default AccountsList;