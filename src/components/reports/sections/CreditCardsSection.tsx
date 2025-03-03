import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { CreditCard } from "../../../types/creditCard";

interface CreditCardsSectionProps {
    creditCards: CreditCard[];
}

const CreditCardsSection = ({ creditCards }: CreditCardsSectionProps) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Tarjetas de Crédito</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {creditCards.map((card) => (
                        <div
                            key={card.id}
                            className="flex justify-between items-center border-b pb-2"
                        >
                            <span>{card.name}</span>
                            <span className="text-red-600">
                                ${card.current_balance ? card.current_balance.toLocaleString() : '0'}
                            </span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default CreditCardsSection;