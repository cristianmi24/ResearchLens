import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import './index.css'
import App from './App.tsx'
import { CLERK_PUBLISHABLE_KEY, isClerkEnabled } from './lib/clerkConfig'

const app = <App />

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isClerkEnabled ? (
      <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY!}>{app}</ClerkProvider>
    ) : (
      app
    )}
  </StrictMode>,
)
