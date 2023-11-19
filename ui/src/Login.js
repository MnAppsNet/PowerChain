import React, { useState } from "react";
import ReactDOM from "react-dom";

import "./login.css";

function Login() {
  // React States
  const [errorMessages, setErrorMessages] = useState({});

  const errors = {
    rpc: "invalid RPC url"
  };

  const handleSubmit = (event) => {
    //Prevent page reload
    event.preventDefault();
    const rpc = document.forms[0].rpc.value;
    console.log(rpc)
    if (!String(rpc).startsWith("http://")){
        setErrorMessages("rpc")
        return
    }
  };

  // Generate JSX code for error message
  const renderErrorMessage = (name) =>
    name === errorMessages.name && (
      <div className="error">{errorMessages.message}</div>
    );
  // JSX code for login form
  const renderForm = (
    <div className="form">
      <form onSubmit={handleSubmit}>
        <div className="input-container">
          <label>RPC Url </label>
          <input type="text" name="rpc" required />
          {renderErrorMessage("rpc")}
        </div>
        <div className="button-container">
          <input type="submit" />
        </div>
      </form>
    </div>
  );

  return (
    <div className="app">
      <div className="login-form">
        <div className="title">Sign In</div>
        {renderForm}
      </div>
    </div>
  );
}

export default Login;