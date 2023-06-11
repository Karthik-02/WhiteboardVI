import React, { useState } from 'react';
import { auth } from './firebase';
import { signInWithEmailAndPassword } from "firebase/auth";
import './Login.css';
import White from './White';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showWhite, setShowWhite] = useState(false);
  
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleLoging = (e) => {
    e.preventDefault();
    setShowWhite(true);
  };

  return (
    <div className="login-container">
      {showWhite ? (
        <White />
      ) : (
        <>
         <div>
          <div className="login-header">
          <img
          style={{ height: 50 }}
          src="https://media.licdn.com/dms/image/C560BAQFOjTUn_b2ZqQ/company-logo_200_200/0/1678103344824?e=1694649600&v=beta&t=w135OcHzBfSZ3m9jtz4WvBfvqRW-w32vvxKs9h0Ig0o"
          alt="Company Logo"
        />

            <h2 className="login-title">Vidyalai</h2>
            <p className="login-subtitle">Unlock Your Potential</p>
          </div>
          <form className="login-form" onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="login-input"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
            />
            <button type="submit" className="login-button">
              Login
            </button>
          </form>
          <br />
          <form className="login-form" onSubmit={handleLoging}>
            <button type="submit" className="login-button">
              Login as Guest
            </button>
          </form>
          </div>
        </>
      )}
    </div>
  
  );
};

export default Login;
