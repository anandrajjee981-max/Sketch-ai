import {createBrowserRouter} from 'react-router'
import Register from './src/features/auth/Register'
import Login from './src/features/auth/Login'
import Dashboard from './src/features/chats/Dashboard'
import Protected from './src/components/Protected'
export const router = createBrowserRouter([
{
    path : '/',
    element:<Login/>
},
{
    path : '/register',
    element:<Register/>
},
{
    path : '/dashboard',
    element:<Protected>
        <Dashboard/>
    </Protected>
}



])

