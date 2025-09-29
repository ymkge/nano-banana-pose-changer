import React, { useState, useRef, useCallback } from 'react';
import ImageUploader from './components/ImageUploader';
import PoseCanvas from './components/PoseCanvas';
import ResultDisplay from './components/ResultDisplay';
import { editImageWithNanoBanana } from './services/geminiService';

// Define a type for the PoseCanvas ref to expose its methods
export interface PoseCanvasHandle {
  getCanvasAsBase64: () => string | null;
  clearCanvas: () => void;
}

const App: React.FC = () => {
  const [sourceImage, setSourceImage] = useState<{ file: File; base64: string } | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const canvasRef = useRef<PoseCanvasHandle>(null);

  const handleImageUpload = (file: File, base64: string) => {
    setSourceImage({ file, base64 });
    setGeneratedImage(null); // Clear previous result when new image is uploaded
    setError(null);
  };

  const handleGenerate = useCallback(async () => {
    if (!sourceImage || !canvasRef.current) {
      setError('キャラクター画像とポーズの指定は必須です。');
      return;
    }

    const poseImageBase64 = canvasRef.current.getCanvasAsBase64();
    if (!poseImageBase64) {
      setError('ポーズを描いてください。');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const result = await editImageWithNanoBanana(
        sourceImage.base64,
        sourceImage.file.type,
        poseImageBase64,
        prompt
      );
      if (result) {
        setGeneratedImage(`data:image/png;base64,${result}`);
      } else {
        setError('画像が生成されませんでした。プロンプトやポーズを変えて再度お試しください。');
      }
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : '予期せぬエラーが発生しました。');
    } finally {
      setIsLoading(false);
    }
  }, [sourceImage, prompt]);

  const handleClearCanvas = () => {
    canvasRef.current?.clearCanvas();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans p-4 lg:p-8 flex flex-col">
      <header className="text-center mb-8">
        <h1 className="text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500">
          Nano Banana ポーズチェンジャー
        </h1>
        <p className="mt-2 text-gray-400">キャラクターのポーズを描画とテキストで変更しよう</p>
      </header>

      <main className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="bg-gray-800 rounded-2xl p-6 shadow-lg flex flex-col items-center justify-center">
          <h2 className="text-2xl font-semibold mb-4 text-gray-300">1. キャラクター画像</h2>
          <ImageUploader onImageUpload={handleImageUpload} />
        </div>
        
        <div className="bg-gray-800 rounded-2xl p-6 shadow-lg flex flex-col">
          <h2 className="text-2xl font-semibold mb-4 text-center text-gray-300">2. ポーズの指定</h2>
          <p className="text-center text-gray-400 mb-4">棒人間で希望のポーズを描いてください。</p>
          <PoseCanvas ref={canvasRef} />
          <button
            onClick={handleClearCanvas}
            className="mt-4 w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200"
          >
            クリア
          </button>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="表情など、追加の指示を入力 (例: 笑顔で、驚いた表情で)"
            className="mt-4 w-full h-24 p-3 bg-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition"
          />
        </div>

        <div className="bg-gray-800 rounded-2xl p-6 shadow-lg flex flex-col items-center justify-center">
          <h2 className="text-2xl font-semibold mb-4 text-gray-300">3. 生成結果</h2>
          <ResultDisplay image={generatedImage} isLoading={isLoading} />
        </div>
      </main>

      <footer className="text-center mt-8">
        <button
          onClick={handleGenerate}
          disabled={isLoading || !sourceImage}
          className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-gray-900 font-bold py-3 px-12 rounded-full text-lg shadow-lg transform hover:scale-105 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
        >
          {isLoading ? '生成中...' : 'ポーズを生成'}
        </button>
        {error && <p className="text-red-400 mt-4">{error}</p>}
      </footer>
    </div>
  );
};

export default App;