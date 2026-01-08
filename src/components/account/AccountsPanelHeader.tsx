import { CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Plus, Wallet } from "lucide-react";

interface AccountsPanelHeaderProps {
    onNewAccount: () => void;
}

const AccountsPanelHeader = ({ onNewAccount }: AccountsPanelHeaderProps) => {
    return (
        <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2 text-base">
                <Wallet className="h-5 w-5" />
                <span className="truncate">Cuentas</span>
            </CardTitle>
            <Button size="sm" className="gap-1.5 shrink-0" onClick={onNewAccount}>
                <Plus className="h-4 w-4" />
                Nueva
            </Button>
        </CardHeader>
    );
};

export default AccountsPanelHeader;