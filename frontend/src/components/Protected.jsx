import React from 'react'
import { useSelector } from 'react-redux'
import {Navigate} from 'react-router'

const Protected = ({children}) => {
    const user = useSelector(state=>state.auth.user)
    const loading = useSelector(state=>state.auth.loading)
    
    if(loading){
        return <h1>loading ....</h1>
    }
    if(!user){
return <Navigate to='/' replace />
    }
  return children
}

export default Protected
