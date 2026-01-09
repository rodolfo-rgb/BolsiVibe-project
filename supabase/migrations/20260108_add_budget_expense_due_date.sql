-- Agregar campos para fechas de vencimiento y gastos recurrentes a budget_expenses
-- Esta migración agrega soporte para:
-- 1. Fechas de vencimiento de gastos (para alertas de pagos próximos)
-- 2. Indicador de gastos recurrentes (para copiar automáticamente al siguiente mes)

ALTER TABLE budget_expenses
ADD COLUMN IF NOT EXISTS due_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE;

-- Crear índice para consultas por fecha de vencimiento
CREATE INDEX IF NOT EXISTS idx_budget_expenses_due_date 
ON budget_expenses(due_date) 
WHERE due_date IS NOT NULL AND is_paid = FALSE;

-- Crear índice para gastos recurrentes
CREATE INDEX IF NOT EXISTS idx_budget_expenses_recurring 
ON budget_expenses(is_recurring) 
WHERE is_recurring = TRUE;

-- Comentarios para documentación
COMMENT ON COLUMN budget_expenses.due_date IS 'Fecha de vencimiento del pago para este gasto';
COMMENT ON COLUMN budget_expenses.is_recurring IS 'Indica si este gasto se repite cada mes';
