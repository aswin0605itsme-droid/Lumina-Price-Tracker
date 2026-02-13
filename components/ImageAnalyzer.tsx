import React, { useState } from 'react';
import { analyzeImageWithGemini } from '../services/geminiService';
import { Camera, Upload, X, Loader2 } from 'lucide-react';

const ImageAnalyzer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setSelectedImage(reader.result as string);
        analyzeImage(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async (base64: string) => {
    setLoading(true);
    const result = await analyzeImageWithGemini(base64);
    setAnalysis(result);
    setLoading(false);
  };

  return (
    <div className="mb-8">
      <div className="flex items-center gap-4">
         <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 rounded-lg transition-all"
         >
            <Camera size={18} />
            <span>Analyze Product Image</span>
         </button>
      </div>

      {isOpen && (
        <div className="mt-4 p-6 bg-white/5 border border-white/10 rounded-2xl animate-in fade-in slide-in-from-top-4">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-white">Visual Intelligence</h3>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                    <X size={20} />
                </button>
            </div>
            
            <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/3">
                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-white/20 rounded-xl hover:bg-white/5 cursor-pointer transition-colors relative overflow-hidden">
                        {selectedImage ? (
                            <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <div className="flex flex-col items-center text-gray-400">
                                <Upload size={32} className="mb-2" />
                                <span className="text-sm">Upload a product photo</span>
                            </div>
                        )}
                        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    </label>
                </div>

                <div className="flex-1">
                    {loading ? (
                        <div className="flex items-center gap-3 text-purple-300">
                            <Loader2 className="animate-spin" />
                            Analyzing with Gemini Pro Vision...
                        </div>
                    ) : analysis ? (
                        <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                            <p className="text-gray-200 whitespace-pre-wrap">{analysis}</p>
                        </div>
                    ) : (
                        <p className="text-gray-500 italic">Upload an image to identify products and specs instantly.</p>
                    )}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default ImageAnalyzer;