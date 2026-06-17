import {createBrowserRouter} from 'react-router'
import Register from './src/features/auth/Register'
import Login from './src/features/auth/Login'
export const router = createBrowserRouter([
{
    path : '/',
    element:<Login/>
},
{
    path : '/register',
    element:<Register/>
}



])

