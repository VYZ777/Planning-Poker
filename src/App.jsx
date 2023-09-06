import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Main } from './components/Main'
import { Workspace } from './components/Workspace'
import { Game } from './components/Game'
import { NotFound } from './components/NotFound'
import { SignIn, SignUp } from '@clerk/clerk-react'

const router = createBrowserRouter([
  {
    path: '/',
    Component: Main,
  },
  {
    path: '/workspace/',
    Component: Workspace,
  },
  {
    path: '/workspace/:token',
    Component: Game,
  },
  {
    path: '/not-found',
    Component: NotFound,
  },
  {
    path: '/sign-in/*',
    element: <SignIn redirectUrl='/workspace' />,
  },
  {
    path: '/sign-up/*',
    Component: SignUp,
  },
])

function App() {
  return (
    <div>
      <RouterProvider
        router={router}
        fallbackElement={<div>Unknown page</div>}
      />
    </div>
  )
}

export default App
