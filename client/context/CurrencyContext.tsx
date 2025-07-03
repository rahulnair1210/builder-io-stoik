import React, { createContext, useContext, useState, useEffect } from "react";

interface CurrencyContextType {
  currency: string;
  setCurrency: (currency: string) => void;
  formatCurrency: (amount: number) => string;
  getCurrencySymbol: () => string;
  refreshCurrency: () => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(
  undefined,
);

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return context;
}

const currencyConfig = {
  USD: { symbol: "$", position: "before" },
  EUR: { symbol: "€", position: "after" },
  GBP: { symbol: "£", position: "before" },
  INR: { symbol: "₹", position: "before" },
};

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState("USD");

  useEffect(() => {
    // Load currency from settings
    loadCurrency();
  }, []);

  const loadCurrency = async () => {
    try {
      // First check localStorage for immediate loading
      const savedCurrency = localStorage.getItem("currency");
      if (savedCurrency) {
        setCurrencyState(savedCurrency);
      }

      // Then fetch from backend settings
      const response = await fetch("/api/settings");
      const data = await response.json();
      if (data.success && data.data.business?.currency) {
        const backendCurrency = data.data.business.currency;
        setCurrencyState(backendCurrency);
        localStorage.setItem("currency", backendCurrency);
      }
    } catch (error) {
      console.error("Error loading currency:", error);
      // Fallback to localStorage or default
      const savedCurrency = localStorage.getItem("currency");
      if (savedCurrency) {
        setCurrencyState(savedCurrency);
      }
    }
  };

  const setCurrency = async (newCurrency: string) => {
    setCurrencyState(newCurrency);

    // Save to localStorage for immediate persistence
    localStorage.setItem("currency", newCurrency);

    // Save to backend settings
    try {
      await fetch("/api/settings/currency", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currency: newCurrency }),
      });
      console.log(`Currency updated to ${newCurrency}`);
    } catch (error) {
      console.error("Error saving currency:", error);
    }
  };

  const getCurrencySymbol = () => {
    return (
      currencyConfig[currency as keyof typeof currencyConfig]?.symbol || "$"
    );
  };

  const formatCurrency = (amount: number) => {
    const config = currencyConfig[currency as keyof typeof currencyConfig];
    const symbol = config?.symbol || "$";
    const formattedAmount = amount.toLocaleString();

    if (config?.position === "after") {
      return `${formattedAmount}${symbol}`;
    }
    return `${symbol}${formattedAmount}`;
  };

  const refreshCurrency = () => {
    loadCurrency();
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        formatCurrency,
        getCurrencySymbol,
        refreshCurrency,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}
