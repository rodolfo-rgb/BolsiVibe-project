import { useNavigate } from "react-router-dom";
import { CreditCard } from "../../types/creditCard";

interface CardsListProps {
    cards: CreditCard[];
    showAmounts: boolean;
}

const CardsList = ({ cards, showAmounts }: CardsListProps) => {
    const navigate = useNavigate();

    return (
        <div className="space-y-4">
            {cards.map((card) => (
                <div
                    key={card.id}
                    className="flex items-center justify-between p-4 bg-secondary rounded-lg cursor-pointer hover:bg-secondary/80 transition-colors"
                    onClick={() => navigate(`/credit-card/${card.id}`)}
                >
                    <span className="font-medium">{card.name}</span>
                    <span className="text-lg text-destructive">
                        {showAmounts
                            ? `$${(card.current_balance || 0).toLocaleString("es-ES")}`
                            : "••••••"}
                    </span>
                </div>
            ))}
        </div>
    );
};

export default CardsList;