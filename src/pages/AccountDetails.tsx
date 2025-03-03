import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, DollarSign } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { useAccounts } from "../hooks/useAccounts";
import { useState } from "react";
import { Input } from "../components/ui/input";
import { useToast } from "../components/ui/use-toast";
import { useTransactions } from "../hooks/useTransactions";

const AccountDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { accounts, editAccount } = useAccounts();
    const { transactions } = useTransactions();
    const { toast } = useToast();
    const account = accounts.find((acc) => acc.id === id);
    const [isAdjusting, setIsAdjusting] = useState(false);
    const [newBalance, setNewBalance] = useState((account?.balance ?? 0).toString());

    if (!account) {
        return (
            <div className="p-6">
                <Button variant="ghost" onClick={() => navigate("/")} className="mb-4">
                    <ArrowLeft className="mr-2" />
                    Volver al Dashboard
                </Button>
                <p>Cuenta no encontrada</p>
            </div>
        );
    }

    // Verificar si es la cuenta Cartera y si tiene transacciones
    const isCartera = account.name === "Cartera";
    const accountTransactions = transactions.filter(
        (t) => t.account_id === account.id || t.destination_account_id === account.id
    );
    const hasTransactions = accountTransactions.length > 0;

    const handleBalanceAdjust = async () => {
        if (isAdjusting) {
            await editAccount(account.id, {
                name: account.name,
                balance: Number(newBalance),
            });
            toast({
                title: "Saldo actualizado",
                description: "El saldo de la cuenta ha sido actualizado exitosamente.",
            });
        }
        setIsAdjusting(!isAdjusting);
    };

    return (
        <div className="p-6">
            <Button variant="ghost" onClick={() => navigate("/")} className="mb-4">
                <ArrowLeft className="mr-2" />
                Volver al Dashboard
            </Button>

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>{account.name}</span>
                            <Button
                                variant={isAdjusting ? "default" : "outline"}
                                onClick={handleBalanceAdjust}
                            >
                                {isAdjusting ? "Guardar" : "Reajustar"}
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center space-x-2">
                            <DollarSign className="h-5 w-5 text-muted-foreground" />
                            {isAdjusting ? (
                                <Input
                                    type="number"
                                    value={newBalance}
                                    onChange={(e) => setNewBalance(e.target.value)}
                                    className="max-w-[200px]"
                                />
                            ) : (
                                <span className="text-2xl font-bold">
                                    ${(account.balance ?? 0).toLocaleString("es-ES")}
                                </span>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {(!isCartera || hasTransactions) && (
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Información de la Cuenta</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <dl className="space-y-2">
                                    <div className="flex justify-between">
                                        <dt className="text-muted-foreground">Tipo de Cuenta</dt>
                                        <dd className="font-medium">
                                            {isCartera ? "Cartera" : "Cuenta Regular"}
                                        </dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-muted-foreground">Transacciones</dt>
                                        <dd className="font-medium">{accountTransactions.length}</dd>
                                    </div>
                                </dl>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Movimientos</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {accountTransactions.map((transaction) => (
                                        <div
                                            key={transaction.id}
                                            className="flex items-center justify-between border-b pb-2"
                                        >
                                            <span className="text-sm text-muted-foreground">
                                                {transaction.description}
                                            </span>
                                            <span
                                                className={`font-medium ${transaction.type === "income"
                                                    ? "text-green-600"
                                                    : "text-red-600"
                                                    }`}
                                            >
                                                {transaction.type === "income" ? "+" : "-"}$
                                                {transaction.amount.toLocaleString("es-ES")}
                                            </span>
                                        </div>
                                    ))}
                                    {accountTransactions.length === 0 && (
                                        <p className="text-center text-muted-foreground">
                                            No hay transacciones registradas
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {isCartera && !hasTransactions && (
                    <Card>
                        <CardContent className="p-6">
                            <p className="text-center text-muted-foreground">
                                Esta cuenta aún no ha sido utilizada. Las transacciones y detalles
                                se mostrarán una vez que realices operaciones en ella.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default AccountDetails;