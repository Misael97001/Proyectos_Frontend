import React from 'react'
import ReactDOM from 'react-dom/client'
// BrowserRouter habilita las rutas de la SPA sin recargar la pagina
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './App.css'

// Montamos la app dentro del <div id="root"> del index.html
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)