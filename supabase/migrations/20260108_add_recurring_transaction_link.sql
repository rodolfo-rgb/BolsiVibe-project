-- =====================================================
-- AGREGAR VINCULACIÓN DE GASTOS CON TRANSACCIONES RECURRENTES
-- =====================================================

-- Agregar columna recurring_transaction_id a budget_expenses
ALTER TABLE budget_expenses 
ADD COLUMN IF NOT EXISTS recurring_transaction_id UUID REFERENCES recurring_transactions(id) ON DELETE SET NULL;

-- Crear índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_budget_expenses_recurring_transaction 
ON budget_expenses(recurring_transaction_id) 
WHERE recurring_transaction_id IS NOT NULL;

-- Comentario explicativo
COMMENT ON COLUMN budget_expenses.recurring_transaction_id IS 
'ID de la transacción recurrente vinculada. Cuando esta se ejecute, el gasto se marcará como pagado automáticamente.';
