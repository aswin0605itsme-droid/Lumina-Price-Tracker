import React, { useState, useEffect } from 'react';
import { Loader2, ImageOff } from 'lucide-react';

interface ImageWithLoaderProps {
  src: string;
  alt: string;
  className?: string;
  productName?: string; // Used for generative fallback
}

const ImageWithLoader: React.FC<ImageWithLoaderProps> = ({ src, alt, className = '', productName = '' }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // Reset state when source prop changes
    setIsLoading(true);
    setHasError(false);
    setCurrentSrc(src);
    setRetryCount(0);
  }, [src]);

  const handleError = () => {
    if (retryCount === 0 && productName) {
      // First fallback: Generative AI image
      setRetryCount(1);
      setCurrentSrc(`https://image.pollinations.ai/prompt/product photo of ${encodeURIComponent(productName)} studio lighting high quality?width=400&height=400&nologo=true&seed=${Math.random()}`);
    } else if (retryCount === 1) {
      // Second fallback: Placeholder service
      setRetryCount(2);
      setCurrentSrc('https://via.placeholder.com/400x400?text=No+Image');
    } else {
      // Final fallback: Error state
      setIsLoading(false);
      setHasError(true);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/5 backdrop-blur-sm z-10">
          <Loader2 className="animate-spin text-blue-400" size={24} />
        </div>
      )}
      
      {hasError ? (
        <div className="flex flex-col items-center justify-center w-full h-full bg-white/5 text-gray-500 p-4">
          <ImageOff size={24} className="mb-2" />
          <span className="text-xs text-center">Image unavailable</span>
        </div>
      ) : (
        <img
          src={currentSrc}
          alt={alt}
          className={`w-full h-full object-contain transition-all duration-500 ${isLoading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  );
};

export default ImageWithLoader;