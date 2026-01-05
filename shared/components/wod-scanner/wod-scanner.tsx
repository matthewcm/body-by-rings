import { scanWODWithAI } from '@/features/ai-scanner/services/ai-scanner';
import React, { useState } from 'react';
import { View } from 'react-native';

const WODScannerAI = ({ onWODsGenerated }) => {
  const [isScanning, setIsScanning] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsScanning(true);
    const reader = new FileReader();
    
    reader.onloadend = async () => {
      try {
        const wods = await scanWODWithAI(reader.result);
        onWODsGenerated(wods); // Passes the AI-structured JSON back to your Dashboard
      } catch (error) {
        console.error("AI Scan failed:", error);
        alert("Could not read the board. Please try a clearer photo.");
      } finally {
        setIsScanning(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <View className="bg-slate-800 p-8 rounded-2xl border-2 border-emerald-500/20 text-center shadow-xl">
      <div className="mb-4 inline-block p-4 bg-emerald-500/10 rounded-full">
        <span className="text-3xl">🤖</span>
      </div>
      <h3 className="text-2xl font-bold mb-2 text-white">AI Board Reader</h3>
      <p className="text-slate-400 mb-6">Take a photo of the whiteboard to instantly build your workout.</p>

      {isScanning ? (
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-emerald-500"></div>
          <span className="text-emerald-400 font-mono text-sm animate-pulse">Gemini is analyzing the board...</span>
        </div>
      ) : (
        <label className="cursor-pointer bg-emerald-500 hover:bg-emerald-600 px-8 py-3 rounded-xl font-bold inline-block transition-all transform hover:scale-105">
          <span>{isScanning ? 'Processing...' : 'Upload or Capture Photo'}</span>
          <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileUpload} />
        </label>
      )}
    </View>
  );
};

export default WODScannerAI;
