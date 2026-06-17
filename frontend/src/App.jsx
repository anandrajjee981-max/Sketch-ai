import React from 'react'
import Login from './features/auth/Login'
import { RouterProvider } from 'react-router'
import { router } from '../auth.routes'

const App = () => {
  return (
    <div>
    <RouterProvider router={router}/>
      
    </div>
  )
}

export default App
