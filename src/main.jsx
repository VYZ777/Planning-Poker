import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ClerkProvider, SignedIn, SignedOut } from '@clerk/clerk-react'
import { store } from './store/index.js'
import { Provider } from 'react-redux'

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

ReactDOM.createRoot(document.getElementById('root')).render(
  <Suspense fallback='loading'>
    <ClerkProvider publishableKey={clerkPubKey}>
      <SignedIn>
        <Provider store={store}>
          <App />
        </Provider>
      </SignedIn>
      <SignedOut>
        <Provider store={store}>
          <App />
        </Provider>
      </SignedOut>
    </ClerkProvider>
  </Suspense>
)
