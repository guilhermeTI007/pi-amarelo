import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx' 


import MenuSuperior from './components/MenuSuperior.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>

    <MenuSuperior/>
    <App />
   
  </StrictMode>,
)
