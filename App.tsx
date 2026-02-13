import React, { useState } from 'react';
import { ComparisonProvider } from './context/ComparisonContext';
import ComparisonTable from './components/ComparisonTable';
import ProductCard from './components/ProductCard';
import ChatBot from './components/ChatBot';
import ImageAnalyzer from './components/ImageAnalyzer';
import { useSearchHistory } from './hooks/useSearchHistory';
import { searchProductsWithGemini, getQuickAnswer } from './services/geminiService';
import { Product } from './types';
import { Search, History, Zap, Sparkles, Globe, Loader2 } from 'lucide-react';

const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'USD ($)' },
  { code: 'EUR', symbol: '€', label: 'EUR (€)' },
  { code: 'GBP', symbol: '£', label: 'GBP (£)' },
  { code: 'INR', symbol: '₹', label: 'INR (₹)' },
  { code: 'JPY', symbol: '¥', label: 'JPY (¥)' },
  { code: 'CAD', symbol: 'C$', label: 'CAD (C$)' },
];

// Wrapper component to use hooks
const Dashboard = () => {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [currency, setCurrency] = useState('USD');
  const { history, addSearch, clearHistory } = useSearchHistory();
  const [quickAnswer, setQuickAnswer] = useState<string>('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setHasSearched(true);
    setQuickAnswer('');
    addSearch(query);

    // Parallel requests: Search products and get a quick AI summary
    const [foundProducts, answer] = await Promise.all([
        searchProductsWithGemini(query, currency),
        getQuickAnswer(`What are the key things to consider when buying ${query}? Keep it under 50 words.`)
    ]);

    setProducts(foundProducts);
    setQuickAnswer(answer);
    setIsSearching(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#0f172a] to-slate-800 text-white p-6 md:p-12 font-sans">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20">
                <Sparkles className="text-white" size={24} />
             </div>
             <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                    Lumina
                </h1>
                <p className="text-gray-400 text-sm">AI-Powered Price Tracker</p>
             </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            {/* Currency Selector */}
            <div className="relative group min-w-[140px]">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Globe size={16} className="text-gray-400" />
                </div>
                <select 
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 text-white text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block pl-10 p-3 appearance-none cursor-pointer hover:bg-slate-800 transition-colors"
                >
                    {CURRENCIES.map((c) => (
                        <option key={c.code} value={c.code}>{c.label}</option>
                    ))}
                </select>
            </div>

            {/* Search Bar */}
            <div className="w-full md:w-auto relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl opacity-50 blur group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                <form onSubmit={handleSearch} className="relative flex items-center bg-slate-900 rounded-xl w-full">
                    <div className="absolute left-4 text-gray-400 pointer-events-none">
                        {isSearching ? <Loader2 size={20} className="animate-spin text-blue-400" /> : <Search size={20} />}
                    </div>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        disabled={isSearching}
                        placeholder={`Search in ${currency}...`}
                        className="w-full md:w-96 bg-transparent border-none outline-none py-3 pl-12 pr-12 text-white placeholder-gray-500 rounded-xl focus:ring-0 disabled:opacity-50"
                    />
                    <button 
                        type="submit" 
                        disabled={isSearching} 
                        className="absolute right-2 p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors disabled:opacity-0"
                    >
                         {isSearching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                    </button>
                </form>
            </div>
          </div>
        </header>

        {/* History & Tools */}
        <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 space-y-8">
                {/* Search History Chips */}
                {history.length > 0 && (
                    <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        <History size={16} className="text-gray-500 min-w-[16px]" />
                        {history.map((term, i) => (
                            <button
                                key={i}
                                onClick={() => { setQuery(term); }}
                                className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full text-xs text-gray-300 transition-colors whitespace-nowrap"
                            >
                                {term}
                            </button>
                        ))}
                        <button onClick={clearHistory} className="text-xs text-red-400 hover:text-red-300 ml-auto">Clear</button>
                    </div>
                )}

                {/* Quick Answer Section */}
                {quickAnswer && (
                    <div className="p-4 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/20 rounded-xl flex gap-3 animate-in fade-in slide-in-from-top-2">
                        <Zap className="text-yellow-400 min-w-[20px]" />
                        <p className="text-sm text-blue-100 leading-relaxed">{quickAnswer}</p>
                    </div>
                )}
                
                <ImageAnalyzer />

                {/* Product Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {isSearching ? (
                        [...Array(4)].map((_, i) => (
                            <div key={i} className="h-96 rounded-2xl bg-white/5 animate-pulse border border-white/10" />
                        ))
                    ) : products.length > 0 ? (
                        products.map((p) => <ProductCard key={p.id} product={p} currencyCode={currency} />)
                    ) : (
                        hasSearched && !isSearching && (
                            <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-400 bg-white/5 rounded-2xl border border-white/10 border-dashed">
                                <Search size={48} className="mb-4 opacity-30" />
                                <p className="text-lg font-medium">No products found matching "{query}"</p>
                                <p className="text-sm opacity-60">Try adjusting your search terms or checking the currency.</p>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>

        {/* Comparison Section */}
        <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <span className="w-2 h-8 bg-green-500 rounded-full inline-block"></span>
                Comparison Matrix
            </h2>
            <ComparisonTable currencyCode={currency} />
        </section>

        <ChatBot />
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ComparisonProvider>
      <Dashboard />
    </ComparisonProvider>
  );
};

export default App;