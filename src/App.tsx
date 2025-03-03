import { Routes, Route } from "react-router-dom";
import Header from "./components/header";
import AppSidebar from "./components/AppSidebar";
import Footer from "./components/Footer";
import Index from "./pages/Index";
import Transactions from "./pages/transactions";
import Budget from "./pages/budget";
import Settings from "./pages/Settings";
import Education from "./pages/Education";
import AccountDetails from "./pages/AccountDetails";
import CreditCardDetails from "./pages/CreditCardDetails";
import QuinceReport from "./components/reports/QuincenalReport";
import AuthPage from "./components/auth/AuthPage";
import { SidebarProvider } from "./components/ui/sidebar";
import { Toaster } from "./components/ui/toaster";
import { AuthProvider, useAuth } from "./lib/auth";

function AppContent() {
  const { session } = useAuth();

  if (!session) {
    return (
      <div className="min-h-screen bg-background w-full">
        <AuthPage />
        <Toaster />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background w-full flex">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-h-screen ml-[352px]">
          <Header />
          <main className="p-4 flex-grow">

            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/budget" element={<Budget />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/education" element={<Education />} />
              <Route path="/account/:id" element={<AccountDetails />} />
              <Route path="/credit-card/:id" element={<CreditCardDetails />} />
              <Route path="/report" element={<QuinceReport />} />
            </Routes>

          </main>
          <Footer />
        </div>
        <Toaster />
      </div>
    </SidebarProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;