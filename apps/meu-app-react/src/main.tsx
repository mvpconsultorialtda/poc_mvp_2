import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Exemplo de como importar um componente do seu módulo local
// import { MeuComponente } from '@meu-projeto/modulo-exemplo';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    {/* <MeuComponente /> */}
  </React.StrictMode>
);