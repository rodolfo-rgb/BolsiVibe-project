import { CreditCard } from "../../types/creditCard";
import EmptyState from "./EmptyState";
import CardsList from "./CardsList";
import TotalDebt from "./TotalDebt";

interface CardsPanelContentProps {
    cards: CreditCard[];
    showAmounts: boolean;
    onShowAllCards: () => void;
}

const CardsPanelContent = ({ cards, showAmounts, onShowAllCards }: CardsPanelContentProps) => {
    if (cards.length === 0) {
        return <EmptyState />;
    }

    return (
        <div className="space-y-4">
            <CardsList cards={cards} showAmounts={showAmounts} />
            <TotalDebt
                cards={cards}
                showAmounts={showAmounts}
                onClick={onShowAllCards}
            />
        </div>
    );
};

export default CardsPanelContent;