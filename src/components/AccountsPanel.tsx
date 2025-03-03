import { useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import { useAccounts } from "../hooks/useAccounts";
import { useToast } from "../components/ui/use-toast";
import { Account } from "../types/accounts";
import NewAccountForm from "./NewAccountForm";
import AccountsDialog from "./account/AccountsDialog";
import AccountsList from "./account/AccountsList";
import AccountsPanelHeader from "./account/AccountsPanelHeader";

const AccountsPanel = () => {
  const { accounts, addAccount, editAccount, deleteAccount } = useAccounts();
  const { toast } = useToast();
  const [isNewAccountFormOpen, setIsNewAccountFormOpen] = useState(false);
  const [isAccountsDialogOpen, setIsAccountsDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);

  const handleAddAccount = async (data: { name: string; balance: number }) => {
    const newAccount = await addAccount(data);
    setIsNewAccountFormOpen(false);
    if (newAccount) {
      toast({
        title: "Cuenta creada",
        description: `La cuenta ${newAccount.name} ha sido creada exitosamente.`,
      });
    }
  };

  const handleEditAccount = async (data: { name: string; balance: number }) => {
    if (selectedAccount) {
      await editAccount(selectedAccount.id, data);
      setIsEditFormOpen(false);
      setSelectedAccount(null);
      toast({
        title: "Cuenta actualizada",
        description: `La cuenta ${data.name} ha sido actualizada exitosamente.`,
      });
    }
  };

  const handleDeleteAccount = async (account: Account) => {
    // Prevent deletion of the default "Cartera" account
    if (account.name === "Cartera") {
      toast({
        title: "Acción no permitida",
        description: "La cuenta Cartera no puede ser eliminada.",
        variant: "destructive",
      });
      return;
    }

    await deleteAccount(account.id);
    setIsAccountsDialogOpen(false);
    setSelectedAccount(null);
    toast({
      title: "Cuenta eliminada",
      description: `La cuenta ${account.name} ha sido eliminada exitosamente.`,
      variant: "destructive",
    });
  };

  const handleCloseDialogs = () => {
    setIsAccountsDialogOpen(false);
    setIsEditFormOpen(false);
    setSelectedAccount(null);
  };

  return (
    <>
      <Card className="w-full max-w-2xl mx-auto">
        <AccountsPanelHeader onNewAccount={() => setIsNewAccountFormOpen(true)} />
        <CardContent>
          <AccountsList
            accounts={accounts.map(account => ({
              ...account,
              balance: account.balance ?? 0 // Si balance es null, usamos 0
            }))}
            onAccountClick={() => setIsAccountsDialogOpen(true)}
          />
        </CardContent>
      </Card>

      <NewAccountForm
        isOpen={isNewAccountFormOpen}
        onClose={() => setIsNewAccountFormOpen(false)}
        onSubmit={handleAddAccount}
      />

      <AccountsDialog
        isOpen={isAccountsDialogOpen}
        accounts={accounts.map(account => ({
          ...account,
          balance: account.balance ?? 0 // Si balance es null, usamos 0
        }))}
        onClose={handleCloseDialogs}
        onEdit={(account) => {
          setSelectedAccount(account);
          setIsEditFormOpen(true);
          setIsAccountsDialogOpen(false);
        }}
        onDelete={handleDeleteAccount}
      />

      <NewAccountForm
        isOpen={isEditFormOpen}
        onClose={() => {
          setIsEditFormOpen(false);
          setSelectedAccount(null);
        }}
        onSubmit={handleEditAccount}
        initialValues={selectedAccount ? {
          ...selectedAccount,
          balance: selectedAccount.balance ?? 0 // Si balance es null, usamos 0
        } : undefined}
      />
    </>
  );
};

export default AccountsPanel;