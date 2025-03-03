import { CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Plus } from "lucide-react";

interface AccountsPanelHeaderProps {
    onNewAccount: () => void;
}

const AccountsPanelHeader = ({ onNewAccount }: AccountsPanelHeaderProps) => {
    return (
        <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Mis Cuentas</CardTitle>
            <Button className="gap-2" onClick={onNewAccount}>
                <Plus className="h-4 w-4" />
                Nueva Cuenta
            </Button>
        </CardHeader>
    );
};

export default AccountsPanelHeader;