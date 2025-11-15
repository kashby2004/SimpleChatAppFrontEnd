import React, { useState } from 'react';
import { useNavigate } from 'react-router';

export const Login = () => {
  const [errorMessage, setErrorMessage] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  
  const nav = useNavigate();

  function handleLogin() {
    console.log('login', password, username);
    const userDto = {
      userName: username,
      password: password,
    };

    fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userDto)
    })
      .then(response => {
        if (response.ok) {
          // Parse the JSON returned by the backend
          return response.json(); 
        } else {
          throw new Error('Login failed');
        }
      })
      .then(data => {
        console.log('Login successful, data:', data);
        /**
         * Assume that the response data contains the user information.
         * For example, data might be:
         * { status: true, user: { userName: 'melvin', token: 'abc123', ... } }
         * If data.user exists, use that object as the user info.
         * Otherwise, at least use the username input from the Login page.
         */
        const userInfo = (data && data.user) ? data.user : { userName: username };
        // Store the user information in localStorage under the key "currentUser"
        localStorage.setItem('currentUser', JSON.stringify(userInfo));
        // Upon successful login, navigate to the Conversations page
        nav('/conversations');
      })
      .catch(error => {
        console.error('Login error:', error);
        setErrorMessage('Username or password was incorrect');
      });
    
    console.log('Completed submitting new user');
  }

  const handlerCreateAccount = () => {
    console.log('create account', password, username);
    const userDto = {
      userName: username,
      password: password,
    };

    fetch('/createUser', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userDto)
    })
      .then(response => response.json())
      .then(jsonResult => {
        if (jsonResult.status) {
          // If account creation succeeds, clear the input fields and error message
          setPassword('');
          setUsername('');
          setErrorMessage('');
        } else {
          setErrorMessage(jsonResult.message);
        }
      })
      .catch(() => setErrorMessage('Failed to create account'));
    console.log('Completed submitting new user');
  };

  return (
    <div>
      <h1>Login</h1>
      <div className="login-form">
        <div className="login-row">
          <label>Username</label>
          <input value={username} onChange={e => setUsername(e.target.value)} />
        </div>
        <div className="login-row">
          <label>Password</label>
          <input value={password} type="password" onChange={e => setPassword(e.target.value)} />
        </div>
        <div className="login-row">
          <button onClick={handleLogin}>Log in</button>
          <button onClick={handlerCreateAccount}>Create account</button>
        </div>
        {errorMessage}
      </div>
    </div>
  );
};
