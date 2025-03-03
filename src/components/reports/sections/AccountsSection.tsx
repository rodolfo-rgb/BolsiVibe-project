import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Account } from "../../../types/accounts";

interface AccountsSectionProps {
    accounts: Account[];
}

const AccountsSection = ({ accounts }: AccountsSectionProps) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Resumen de Cuentas</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {accounts.map((account) => (
                        <div
                            key={account.id}
                            className="flex justify-between items-center border-b pb-2"
                        >
                            <span>{account.name}</span>
                            <span>${(account.balance ?? 0).toLocaleString()}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default AccountsSection;