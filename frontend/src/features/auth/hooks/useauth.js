import {login , register ,getme} from '../service/auth.api.js'
import { authStart,authSuccess,authFailure } from '../auth.slice.js'
import {useDispatch, useSelector} from 'react-redux'
 const useauth = ()=>{
    const dispatch = useDispatch()
    const auth = useSelector(state =>state.auth)
async function handlelogin(email , password){
    try{
dispatch(authStart)
const res = await login(email , password)
dispatch(authSuccess(res))
return res
    }
    catch(err){
throw err 
console.log(err)
    }
}
async function handleregister(username ,email , password ){
try{
  dispatch(authStart())
    const res = await register(username , email , password)
  dispatch(authSuccess(res))
return res
  
}
catch(err){
      dispatch(
        authFailure(
          err.response?.data?.message || "register failed"
        ))
}
}
async function handlegetme(){
  try{
dispatch(authStart())
const res = await getme()
dispatch(authSuccess(res.user))
return res ;


  }
  catch(err){
 dispatch(
        authFailure(
          err.response?.data?.message ||"extract failed"
        ))

  }
}

return {
handlelogin , handleregister , ... auth , handlegetme
};


}

export default useauth







