import { Card, CardContent, CardHeader } from "./ui/card";
import NewCreditCardForm from "./NewCreditCardForm";
import CardsDialog from "./cards/CardsDialog";
import DeleteCardDialog from "./cards/DeleteCardDialog";
import PanelHeader from "./credit-cards/PanelHeader";
import CardsPanelContent from "./credit-cards/CardsPanelContent";
import { useCardState } from "./credit-cards/useCardState";

const CreditCardsPanel = () => {
  const {
    creditCards,
    isNewCardFormOpen,
    setIsNewCardFormOpen,
    isCardsDialogOpen,
    setIsCardsDialogOpen,
    cardToEdit,
    setCardToEdit,
    cardToDelete,
    setCardToDelete,
    showAmounts,
    setShowAmounts,
    handleAddCard,
    handleEditCard,
    handleDeleteCard,
  } = useCardState();

  return (
    <Card className="w-full max-w-2xl mx-auto mt-6">
      <CardHeader>
        <PanelHeader
          showAmounts={showAmounts}
          onToggleAmounts={() => setShowAmounts(!showAmounts)}
          onAddCard={() => setIsNewCardFormOpen(true)}
        />
      </CardHeader>
      <CardContent>
        <CardsPanelContent
          cards={creditCards}
          showAmounts={showAmounts}
          onShowAllCards={() => setIsCardsDialogOpen(true)}
        />
      </CardContent>

      <CardsDialog
        isOpen={isCardsDialogOpen}
        cards={creditCards}
        showAmounts={showAmounts}
        onClose={() => {
          setIsCardsDialogOpen(false);
          setCardToEdit(null);
        }}
        onEdit={(card) => {
          setCardToEdit(card);
          setIsNewCardFormOpen(true);
          setIsCardsDialogOpen(false);
        }}
        onDelete={(card) => setCardToDelete(card)}
      />

      <NewCreditCardForm
        isOpen={isNewCardFormOpen}
        onClose={() => {
          setIsNewCardFormOpen(false);
          setCardToEdit(null);
        }}
        onSubmit={cardToEdit ? handleEditCard : handleAddCard}
        initialValues={cardToEdit || undefined}
      />

      <DeleteCardDialog
        isOpen={cardToDelete !== null}
        card={cardToDelete}
        onClose={() => setCardToDelete(null)}
        onConfirm={handleDeleteCard}
      />
    </Card>
  );
};

export default CreditCardsPanel;