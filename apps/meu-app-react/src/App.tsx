import { useState } from 'react';
import './App.css';
import '@meu-projeto/background-remover/index.css';
import { showPopup } from '@meu-projeto/modulo-exemplo';
import { BackgroundRemover } from '@meu-projeto/background-remover';

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Simple React App</h1>
        <p>Welcome to your deployed application.</p>
        <input type="file" onChange={handleFileChange} accept="image/*" />
        <button onClick={() => showPopup('This is a popup from the shared module!')}>Show Popup</button>
      </header>
      {selectedFile && <BackgroundRemover file={selectedFile} onClose={handleClose} />}
    </div>
  );
}

export default App;
