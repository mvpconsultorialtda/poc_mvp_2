
import React, { useState, useRef } from 'react';
import { UploadIcon } from './src/components/icons';
import BackgroundRemovalModal from './src/components/BackgroundRemovalModal';

const App: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];
      if (!file.type.startsWith('image/')) {
        setError('Por favor, selecione um arquivo de imagem.');
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleDragEvents = (e: React.DragEvent<HTMLDivElement>, isEntering: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(isEntering);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    handleDragEvents(e, false);
    handleFileSelect(e.dataTransfer.files);
  };

  const Uploader = () => (
    <div 
      className={`p-8 transition-all duration-300 rounded-2xl ${isDragging ? 'bg-sky-50 dark:bg-sky-900/50 ring-4 ring-sky-400' : ''}`}
      onDragEnter={(e) => handleDragEvents(e, true)} onDragLeave={(e) => handleDragEvents(e, false)} onDragOver={(e) => handleDragEvents(e, true)} onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center text-center border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-10 md:p-16">
        <UploadIcon className="w-16 h-16 text-slate-400 dark:text-slate-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Arraste e solte uma imagem aqui</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">ou clique para selecionar um arquivo</p>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => handleFileSelect(e.target.files)} className="hidden"/>
        <button onClick={() => fileInputRef.current?.click()} className="bg-indigo-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          Selecionar Imagem
        </button>
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans">
      <header className="p-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-indigo-600">
          Removedor de Fundo de Imagem
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          Powered by <a href="https://img.ly/docs/bsdk/web/background-removal/" target="_blank" rel="noopener noreferrer" className="font-semibold text-sky-500 hover:text-sky-600">img.ly</a>. Edição feita no seu navegador.
        </p>
      </header>

      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-4xl bg-white dark:bg-slate-800/50 rounded-2xl shadow-2xl backdrop-blur-sm border border-slate-200 dark:border-slate-700/50 transition-all duration-300">
          <Uploader />
        </div>
      </main>

      {selectedFile && (
        <BackgroundRemovalModal
          imageFile={selectedFile}
          onClose={() => setSelectedFile(null)}
        />
      )}

      <footer className="text-center p-4 text-sm text-slate-500 dark:text-slate-400">
        <p>&copy; {new Date().getFullYear()} - Criado por um Engenheiro de IA. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default App;
