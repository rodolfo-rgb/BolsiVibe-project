import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";

interface BalanceSectionProps {
    totalBalance: number;
    totalIncome: number;
    totalExpenses: number;
}

const BalanceSection = ({ totalBalance, totalIncome, totalExpenses }: BalanceSectionProps) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Balance General</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <h3 className="font-semibold mb-2">Balance Total</h3>
                        <p className="text-2xl">${totalBalance.toLocaleString()}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2">Ingresos Totales</h3>
                        <p className="text-2xl text-green-600">
                            ${totalIncome.toLocaleString()}
                        </p>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2">Gastos Totales</h3>
                        <p className="text-2xl text-red-600">
                            ${totalExpenses.toLocaleString()}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default BalanceSection;