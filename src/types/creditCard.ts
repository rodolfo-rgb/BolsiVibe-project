export type BankType = 'bbva' | 'banamex' | 'nu' | 'santander' | 'scotia' | 'otro';

export interface BankConfig {
    name: string;
    gradient: string;
    primaryColor: string;
    textColor: string;
    logo?: string;
}

export const BANK_CONFIGS: Record<BankType, BankConfig> = {
    bbva: {
        name: 'BBVA',
        gradient: 'linear-gradient(135deg, #004481 0%, #0066b3 50%, #0073cf 100%)',
        primaryColor: '#004481',
        textColor: '#ffffff',
    },
    banamex: {
        name: 'Banamex',
        gradient: 'linear-gradient(135deg, #002d72 0%, #003d8f 50%, #0056a6 100%)',
        primaryColor: '#002d72',
        textColor: '#ffffff',
    },
    nu: {
        name: 'Nu',
        gradient: 'linear-gradient(135deg, #820ad1 0%, #9b2dd6 50%, #b24ddb 100%)',
        primaryColor: '#820ad1',
        textColor: '#ffffff',
    },
    santander: {
        name: 'Santander',
        gradient: 'linear-gradient(135deg, #ec0000 0%, #ff1a1a 50%, #ff3333 100%)',
        primaryColor: '#ec0000',
        textColor: '#ffffff',
    },
    scotia: {
        name: 'Scotiabank',
        gradient: 'linear-gradient(135deg, #ec111a 0%, #c41017 50%, #9a0d12 100%)',
        primaryColor: '#ec111a',
        textColor: '#ffffff',
    },
    otro: {
        name: 'Otro',
        gradient: 'linear-gradient(135deg, #171717 0%, #2a2a2a 50%, #3d3d3d 100%)',
        primaryColor: '#171717',
        textColor: '#ffffff',
    },
};

export interface CreditCard {
    id: string;
    user_id: string | null;
    name: string;
    limit_amount: number;
    current_balance: number | null;
    payment_day: number;
    cutoff_day: number;
    days_until_payment: number; // Días después del corte para la fecha límite de pago
    bank?: BankType;
    bank_name?: string;
    expiration_date?: string; // Formato: MM/YY o YYYY-MM
    created_at: string;
    updated_at: string;
}