import React, { useState } from 'react';
import './App.css';
import { openBackgroundRemovalModal } from './background-removal/src/index.tsx';
import './background-removal/dist/background-removal-module.css';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleFileSelect = (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const imageFile = files[0];
      
      const handleClose = () => {
        console.log('Modal has been closed.');
        setIsModalOpen(false);
        // Reset the file input by clearing its value
        event.target.value = '';
      };

      // Open the modal
      openBackgroundRemovalModal(imageFile, handleClose);
      setIsModalOpen(true);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Aplicação de Edição de Imagem</h1>
        <p>Selecione uma imagem para remover o fundo.</p>
        <input 
          type="file" 
          id="upload-input" 
          accept="image/*" 
          onChange={handleFileSelect}
          style={{ display: 'none' }} 
        />
        <button 
          onClick={() => document.getElementById('upload-input').click()}
          className="upload-button"
        >
          Selecionar Imagem
        </button>
      </header>
    </div>
  );
}

export default App;