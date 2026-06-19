import React, { useState } from 'react';
import '../style/login.scss';
import { useNavigate } from 'react-router';
import useauth from './hooks/useauth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
const {handlelogin , loading} = useauth()

  const navigate = useNavigate();

async function  handleSubmit (e) {
    e.preventDefault();
const res = await handlelogin(email,password)
if(res){
  navigate('/dashboard')
}

  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Sketch Ai</h1>
          <p>Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form" autoComplete="off">
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              autoComplete="off"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '🙉' : '🙈'}
              </button>
            </div>
          </div>

      

          <button type="submit" className="login-button">
            Sign In
          </button>
        </form>

        <div className="login-footer">
          <p>
            Don't have an account?{' '}
            <span 
              className="signup-link"
              onClick={() => navigate('/register')}
            >
              Sign up
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;