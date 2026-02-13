import React from 'react';
import { Product } from '../types';
import { useComparison } from '../context/ComparisonContext';
import { ShoppingBag, Plus, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  currencyCode?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, currencyCode = 'USD' }) => {
  const { addToComparison, removeFromComparison, isInComparison } = useComparison();
  const isCompared = isInComparison(product.id);

  const toggleCompare = () => {
    if (isCompared) {
      removeFromComparison(product.id);
    } else {
      addToComparison(product);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.currentTarget;
    // Prevent infinite loop if the fallback also fails
    target.onerror = null; 
    // Fallback to generative image based on product name
    target.src = `https://image.pollinations.ai/prompt/${encodeURIComponent(product.name)}?width=400&height=400&nologo=true`;
  };

  return (
    <div className="group relative bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden hover:bg-white/15 transition-all duration-300 hover:scale-[1.02] shadow-xl">
      <div className="relative aspect-square overflow-hidden bg-black/40">
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          onError={handleImageError}
          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 p-4"
        />
        <div className="absolute top-3 right-3">
          <span className="px-2 py-1 bg-black/50 backdrop-blur-sm text-xs text-white rounded-full border border-white/10">
            {product.retailer}
          </span>
        </div>
      </div>

      <div className="p-5 flex flex-col h-[calc(100%-aspect-square)]">
        <h3 className="text-lg font-bold text-white mb-1 truncate" title={product.name}>{product.name}</h3>
        <p className="text-2xl font-bold text-green-400 mb-4">{formatPrice(product.price)}</p>
        
        <div className="flex gap-2 text-sm text-gray-300 mb-4 flex-wrap">
           {Object.entries(product.specs).slice(0, 3).map(([key, val]) => (
               <span key={key} className="bg-white/5 px-2 py-1 rounded-md border border-white/10 text-xs">
                   {key}: {val}
               </span>
           ))}
        </div>

        <div className="flex gap-3 mt-auto">
          <a
            href={`/api/outbound?url=${encodeURIComponent(product.link)}&id=${product.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white py-2.5 rounded-xl font-medium shadow-lg hover:shadow-blue-500/25 transition-all"
          >
            <ShoppingBag size={18} />
            Buy Now
          </a>
          <button
            onClick={toggleCompare}
            className={`px-4 rounded-xl border transition-all flex items-center justify-center ${
              isCompared
                ? 'bg-green-500/20 border-green-500/50 text-green-400'
                : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
            }`}
          >
            {isCompared ? <Check size={20} /> : <Plus size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;