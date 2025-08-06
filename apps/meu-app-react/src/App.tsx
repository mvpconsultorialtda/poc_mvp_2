import { useState, useRef } from 'react';
import BackgroundRemover from '@meu-projeto/background-remover';

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    // Reseta o valor do input para permitir selecionar o mesmo arquivo novamente
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-800 text-white p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Removedor de Fundo de Imagem</h1>
        <p className="text-lg mb-8">Selecione uma imagem para começar</p>
        
        {/* Input de arquivo escondido */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          className="hidden" 
        />
        
        {/* Botão que aciona o input de arquivo */}
        <button 
          onClick={handleButtonClick}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out"
        >
          Selecionar Imagem
        </button>
      </div>

      {/* O modal do BackgroundRemover será renderizado aqui quando um arquivo for selecionado */}
      {selectedFile && (
        <BackgroundRemover 
          file={selectedFile} 
          onClose={handleClose} 
        />
      )}
    </div>
  );
}

export default App;
