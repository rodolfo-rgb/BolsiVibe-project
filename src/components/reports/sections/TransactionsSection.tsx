import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Transaction } from "../../../types/transaction";

interface TransactionsSectionProps {
    transactions: Transaction[];
}

const TransactionsSection = ({ transactions }: TransactionsSectionProps) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Últimas Transacciones</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {transactions.slice(0, 5).map((transaction) => (
                        <div
                            key={transaction.id}
                            className="flex justify-between items-center border-b pb-2"
                        >
                            <div>
                                <p className="font-semibold">{transaction.description}</p>
                                <p className="text-sm text-gray-500">{transaction.date}</p>
                            </div>
                            <span
                                className={
                                    transaction.type === "income"
                                        ? "text-green-600"
                                        : "text-red-600"
                                }
                            >
                                ${transaction.amount.toLocaleString()}
                            </span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default TransactionsSection;