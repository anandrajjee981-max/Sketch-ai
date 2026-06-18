import React from 'react'
import { useSelector } from 'react-redux'
import {Navigate} from 'react-router'

const Protected = ({children}) => {
   const { isAuthenticated, loading } = useSelector(
  state => state.auth
);

if (loading) {
  return <h1>Loading...</h1>;
}

if (!isAuthenticated) {
  return <Navigate to="/" replace />;
}

return children;
}

export default Protected
