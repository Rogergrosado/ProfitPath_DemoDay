import { createContext, useContext, useState } from "react";
import type { Product, Inventory, Sale, Goal } from "@shared/schema";

interface InventoryContextType {
  products: Product[];
  inventory: Inventory[];
  sales: Sale[];
  goals: Goal[];
  setProducts: (products: Product[]) => void;
  setInventory: (inventory: Inventory[]) => void;
  setSales: (sales: Sale[]) => void;
  setGoals: (goals: Goal[]) => void;
}

const InventoryContext = createContext<InventoryContextType | null>(null);

export function InventoryProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<Inventory[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);

  return (
    <InventoryContext.Provider value={{
      products,
      inventory,
      sales,
      goals,
      setProducts,
      setInventory,
      setSales,
      setGoals,
    }}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error("useInventory must be used within an InventoryProvider");
  }
  return context;
}
