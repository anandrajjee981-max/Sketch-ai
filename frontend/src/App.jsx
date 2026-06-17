import React, { useEffect } from 'react'
import Login from './features/auth/Login'
import { RouterProvider } from 'react-router'
import { router } from '../auth.routes'
import { useSelector } from 'react-redux'
import useauth from './features/auth/hooks/useauth'


const App = () => {
  const auth = useauth()
  useEffect(() => {
    auth.handlegetme()
  }, [])

  return (
    <div>
    <RouterProvider router={router}/>
      
    </div>
  )
}

export default App
