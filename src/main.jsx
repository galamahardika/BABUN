import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { DSSProvider } from './context/DSSContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DSSProvider>
      <App />
    </DSSProvider>
  </StrictMode>,
)
