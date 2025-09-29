import React from 'react';

interface ResultDisplayProps {
  image: string | null;
  isLoading: boolean;
}

const LoadingSpinner: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full text-center">
    <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-yellow-400"></div>
    <p className="mt-4 text-lg text-gray-300">画像を生成中...</p>
    <p className="text-sm text-gray-500">しばらくお待ちください</p>
  </div>
);

const Placeholder: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
    <p className="mt-4 text-lg">ここに生成された画像が表示されます</p>
  </div>
);


const ResultDisplay: React.FC<ResultDisplayProps> = ({ image, isLoading }) => {
  const handleDownload = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation(); // Prevent any parent onClick events
    if (!image) return;

    const link = document.createElement('a');
    link.href = image;
    link.download = 'generated-pose.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="relative group w-full h-full min-h-64 aspect-square bg-gray-900/50 rounded-lg flex items-center justify-center p-2">
      {isLoading ? (
        <LoadingSpinner />
      ) : image ? (
        <>
          <img src={image} alt="Generated result" className="max-w-full max-h-full object-contain rounded-md" />
          <button
            onClick={handleDownload}
            className="absolute bottom-4 right-4 bg-gray-900/70 hover:bg-yellow-500 hover:text-gray-900 text-white font-bold py-2 px-4 rounded-full transition-all duration-300 flex items-center gap-2 backdrop-blur-sm opacity-0 group-hover:opacity-100"
            aria-label="Download generated image"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            <span>ダウンロード</span>
          </button>
        </>
      ) : (
        <Placeholder />
      )}
    </div>
  );
};

export default ResultDisplay;