import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product } from '../types';
import { MAX_COMPARISON_ITEMS } from '../constants';

interface ComparisonContextType {
  products: Product[];
  addToComparison: (product: Product) => void;
  removeFromComparison: (productId: string) => void;
  isInComparison: (productId: string) => boolean;
  clearComparison: () => void;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

export const ComparisonProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);

  const addToComparison = (product: Product) => {
    setProducts((prev) => {
      if (prev.some((p) => p.id === product.id)) return prev;
      if (prev.length >= MAX_COMPARISON_ITEMS) {
        // Optional: Notify user max items reached
        return prev; 
      }
      return [...prev, product];
    });
  };

  const removeFromComparison = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const isInComparison = (productId: string) => {
    return products.some((p) => p.id === productId);
  };

  const clearComparison = () => {
    setProducts([]);
  };

  return (
    <ComparisonContext.Provider
      value={{ products, addToComparison, removeFromComparison, isInComparison, clearComparison }}
    >
      {children}
    </ComparisonContext.Provider>
  );
};

export const useComparison = () => {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error('useComparison must be used within a ComparisonProvider');
  }
  return context;
};