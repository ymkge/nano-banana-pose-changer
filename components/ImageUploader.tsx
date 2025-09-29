
import React, { useState, useCallback } from 'react';

interface ImageUploaderProps {
  onImageUpload: (file: File, base64: string) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = useCallback((file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setImagePreview(reader.result as string);
        onImageUpload(file, base64String);
      };
      reader.readAsDataURL(file);
    }
  }, [onImageUpload]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      processFile(event.target.files[0]);
    }
  };

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      processFile(event.dataTransfer.files[0]);
    }
  }, [processFile]);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };
  
  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const triggerFileInput = () => {
    document.getElementById('file-input')?.click();
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <input
        type="file"
        id="file-input"
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
      {imagePreview ? (
        <div className="w-full text-center">
          <img src={imagePreview} alt="Preview" className="max-w-full max-h-80 object-contain rounded-lg mx-auto" />
          <button 
            onClick={triggerFileInput}
            className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-2 px-4 rounded-lg transition duration-200"
          >
            画像を変更
          </button>
        </div>
      ) : (
        <div
          onClick={triggerFileInput}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          className={`w-full h-64 border-4 border-dashed rounded-lg flex flex-col items-center justify-center text-center p-4 cursor-pointer transition-colors duration-300 ${isDragging ? 'border-yellow-400 bg-gray-700' : 'border-gray-600 hover:border-yellow-500 hover:bg-gray-700/50'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-400">ここに画像をドラッグ＆ドロップ</p>
          <p className="text-gray-500 text-sm">またはクリックして選択</p>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
