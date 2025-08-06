import './App.css';
import { showPopup } from '@meu-projeto/modulo-exemplo';

function App() {
  const handleButtonClick = () => {
    showPopup('This is a popup from the shared module!');
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Simple React App</h1>
        <p>Welcome to your deployed application.</p>
        <button onClick={handleButtonClick}>Show Popup</button>
      </header>
    </div>
  );
}

export default App;
