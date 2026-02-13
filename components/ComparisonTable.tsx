import React from 'react';
import { useComparison } from '../context/ComparisonContext';
import { X, Check } from 'lucide-react';
import ImageWithLoader from './ImageWithLoader';

interface ComparisonTableProps {
    currencyCode?: string;
}

const ComparisonTable: React.FC<ComparisonTableProps> = ({ currencyCode = 'USD' }) => {
  const { products, removeFromComparison } = useComparison();

  if (products.length === 0) {
    return (
      <div className="p-8 text-center text-gray-400 bg-white/5 backdrop-blur-md rounded-xl border border-white/10">
        <p>No products in comparison. Add products from the search results.</p>
      </div>
    );
  }

  // Collect all unique spec keys
  const allSpecKeys: string[] = Array.from(
    new Set(products.flatMap((p) => Object.keys(p.specs)))
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: 0
    }).format(price);
  };

  // Helper to determine highlight color
  const getHighlightClass = (key: string, value: string | number, allValues: (string | number)[]) => {
    if (typeof value !== 'number') return 'text-gray-300';
    
    // Filter out non-numbers for comparison
    const numericValues = allValues.filter((v): v is number => typeof v === 'number');
    if (numericValues.length < 2) return 'text-gray-300';

    const maxVal = Math.max(...numericValues);
    const minVal = Math.min(...numericValues);

    const lowerKey = key.toLowerCase();

    // Logic: Price -> Lowest is Green. RAM/Battery/Storage -> Highest is Green.
    if (lowerKey.includes('price')) {
      return value === minVal ? 'text-green-400 font-bold' : 'text-gray-300';
    }
    if (['ram', 'battery', 'storage', 'screen', 'processor'].some(k => lowerKey.includes(k))) {
      return value === maxVal ? 'text-green-400 font-bold' : 'text-gray-300';
    }
    return 'text-gray-300';
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-white/10 shadow-2xl bg-slate-900/50 backdrop-blur-xl">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr>
            <th className="p-4 bg-white/10 border-b border-white/10 w-32 min-w-[150px] sticky left-0 z-10 backdrop-blur-md">Feature</th>
            {products.map((product) => (
              <th key={product.id} className="p-4 bg-white/5 border-b border-white/10 min-w-[200px] relative">
                <button
                  onClick={() => removeFromComparison(product.id)}
                  className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <X size={16} />
                </button>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-lg bg-black/20 p-1 overflow-hidden">
                      <ImageWithLoader 
                        src={product.imageUrl} 
                        alt={product.name}
                        productName={product.name}
                        className="w-full h-full object-contain"
                      />
                  </div>
                  <span className="font-semibold text-white text-center text-sm line-clamp-2">{product.name}</span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Price Row (Special Case) */}
          <tr className="hover:bg-white/5 transition-colors">
            <td className="p-4 border-b border-white/10 font-medium text-gray-200 sticky left-0 bg-slate-900/80 backdrop-blur-sm z-10">Price</td>
            {products.map((product) => {
               const allPrices = products.map(p => p.price);
               const highlight = getHighlightClass('price', product.price, allPrices);
               return (
                <td key={product.id} className={`p-4 border-b border-white/10 text-center ${highlight}`}>
                  {formatPrice(product.price)}
                </td>
               );
            })}
          </tr>

          {/* Dynamic Spec Rows */}
          {allSpecKeys.map((key) => (
            <tr key={key} className="hover:bg-white/5 transition-colors">
              <td className="p-4 border-b border-white/10 font-medium text-gray-200 sticky left-0 bg-slate-900/80 backdrop-blur-sm z-10 capitalize">{key}</td>
              {products.map((product) => {
                const val = product.specs[key] ?? '-';
                // Try to parse number for sorting/highlighting
                let numericVal: number | string = val;
                if (typeof val === 'string') {
                    const match = val.match(/(\d+(\.\d+)?)/);
                    if (match) numericVal = parseFloat(match[0]);
                }

                const highlight = getHighlightClass(key, numericVal, products.map(p => {
                    const v = p.specs[key];
                    if (typeof v === 'number') return v;
                    if (typeof v === 'string') {
                         const m = v.match(/(\d+(\.\d+)?)/);
                         return m ? parseFloat(m[0]) : -1;
                    }
                    return -1;
                }));

                return (
                  <td key={product.id} className={`p-4 border-b border-white/10 text-center ${highlight}`}>
                    {val}
                  </td>
                );
              })}
            </tr>
          ))}
          
          {/* Action Row */}
           <tr>
            <td className="p-4 border-b border-white/10 sticky left-0 bg-slate-900/80 backdrop-blur-sm z-10"></td>
            {products.map((product) => (
              <td key={product.id} className="p-4 border-b border-white/10 text-center">
                 <a
                    href={`/api/outbound?url=${encodeURIComponent(product.link)}&id=${product.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg shadow-lg hover:shadow-blue-500/50 transition-all duration-300"
                  >
                    Buy Now
                  </a>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ComparisonTable;