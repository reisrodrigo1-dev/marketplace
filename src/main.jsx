import './styles/ctaPulse.css';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import clientService from './firebase/firestore.js';
import { clientProcessService } from './firebase/clientProcessService.js';
window.clientService = clientService;
window.clientProcessService = clientProcessService;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
