import { StepType } from '@reactour/tour';

export const tourSteps: StepType[] = [
  {
    selector: '[data-tour="sidebar"]',
    content: (
      <div className="space-y-2">
        <h3 className="font-bold text-lg">¡Bienvenido a BolsiVibe! 🎉</h3>
        <p>
          Este es tu menú de navegación principal. Desde aquí puedes acceder a todas las
          secciones de la aplicación.
        </p>
      </div>
    ),
    position: 'right',
  },
  {
    selector: '[data-tour="nav-home"]',
    content: (
      <div className="space-y-2">
        <h3 className="font-bold text-lg">Panel Principal 🏠</h3>
        <p>
          Aquí encontrarás un resumen de todas tus finanzas: balance total, ingresos,
          gastos y más.
        </p>
      </div>
    ),
    position: 'right',
  },
  {
    selector: '[data-tour="nav-transactions"]',
    content: (
      <div className="space-y-2">
        <h3 className="font-bold text-lg">Transacciones 💰</h3>
        <p>
          Registra y visualiza todos tus movimientos de dinero. Puedes agregar
          ingresos, gastos y transferencias entre cuentas.
        </p>
      </div>
    ),
    position: 'right',
  },
  {
    selector: '[data-tour="nav-budget"]',
    content: (
      <div className="space-y-2">
        <h3 className="font-bold text-lg">Presupuesto 📊</h3>
        <p>
          Crea y administra tus presupuestos mensuales por categoría. Te ayudará
          a controlar tus gastos y alcanzar tus metas financieras.
        </p>
      </div>
    ),
    position: 'right',
  },
  {
    selector: '[data-tour="nav-education"]',
    content: (
      <div className="space-y-2">
        <h3 className="font-bold text-lg">Educación Financiera 📚</h3>
        <p>
          Aprende sobre finanzas personales con artículos, consejos y recursos
          educativos para mejorar tu salud financiera.
        </p>
      </div>
    ),
    position: 'right',
  },
  {
    selector: '[data-tour="balance-card"]',
    content: (
      <div className="space-y-2">
        <h3 className="font-bold text-lg">Tu Balance Total 💵</h3>
        <p>
          Aquí puedes ver tu balance total, patrimonio neto, ingresos y gastos
          de un vistazo. Puedes ocultar los montos si lo deseas.
        </p>
      </div>
    ),
    position: 'bottom',
  },
  {
    selector: '[data-tour="accounts-panel"]',
    content: (
      <div className="space-y-2">
        <h3 className="font-bold text-lg">Tus Cuentas 🏦</h3>
        <p>
          Administra todas tus cuentas bancarias, de ahorro, efectivo y más.
          Puedes agregar nuevas cuentas y ver el detalle de cada una.
        </p>
      </div>
    ),
    position: 'top',
  },
  {
    selector: '[data-tour="credit-cards-panel"]',
    content: (
      <div className="space-y-2">
        <h3 className="font-bold text-lg">Tarjetas de Crédito 💳</h3>
        <p>
          Lleva el control de tus tarjetas de crédito, fechas de corte, límites
          de crédito y saldos pendientes.
        </p>
      </div>
    ),
    position: 'top',
  },
  {
    selector: '[data-tour="goals-widget"]',
    content: (
      <div className="space-y-2">
        <h3 className="font-bold text-lg">Metas de Ahorro 🎯</h3>
        <p>
          Establece metas de ahorro para tus objetivos financieros. Visualiza
          tu progreso y mantente motivado.
        </p>
      </div>
    ),
    position: 'left',
  },
  {
    selector: '[data-tour="user-menu"]',
    content: (
      <div className="space-y-2">
        <h3 className="font-bold text-lg">Tu Perfil 👤</h3>
        <p>
          Desde aquí puedes acceder a la configuración de tu cuenta, cambiar
          ajustes y cerrar sesión.
        </p>
      </div>
    ),
    position: 'bottom',
  },
  {
    selector: 'body',
    content: (
      <div className="space-y-2">
        <h3 className="font-bold text-lg">¡Listo para comenzar! 🚀</h3>
        <p>
          Ya conoces las funcionalidades principales de BolsiVibe. Puedes
          reiniciar este tour en cualquier momento desde la configuración.
        </p>
        <p className="text-sm text-muted-foreground">
          ¡Comienza a organizar tus finanzas hoy!
        </p>
      </div>
    ),
    position: 'center',
  },
];
