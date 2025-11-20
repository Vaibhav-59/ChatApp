import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './pages/store/auth.js'
import { Toaster } from 'react-hot-toast'

createRoot(document.getElementById('root')).render(
  <AuthProvider>
    {/* <StrictMode> */}
    <>
      <App />
      <Toaster position="top-right" gutter={8} toastOptions={{ duration: 3000 }} />
    </>
    {/* </StrictMode> */}
  </AuthProvider>
)
