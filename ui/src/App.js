import React, { useState, useEffect } from "react"
import Login from "./components/Login";
import Message from "./components/Message";
import Dashboard from "./components/Dashboard"
import styles from "./styles.css";
import Languages from "./strings.json"
import Web3 from "web3";

function App() {
  const [web3, setWeb3] = useState(null);
  const [Language, setLanguage] = useState("EN");
  const [MessageText, setMessageText] = useState("");
  const [MessageStatus, setMessageStatus] = useState("");

  class Tools {
    static strings = Languages.EN
    static web3 = () => web3
    static showMessage = (text,error=true) => {
      setMessageStatus((error)?"error":"info")
      setMessageText(text)
      setTimeout(() => {Tools.clearMessage()}, 10000); //Hide message after 10 seconds
    }
    static clearMessage = () => {
      setMessageText("")
    }
    static setWeb3 = (w) => {
      setWeb3(w)
    }
    static disconect = () => {
      setWeb3(null)
    }
  }

  useEffect(() => {
    Tools.strings = Languages[Language]
  }, [Language]);

  return (
    <div className={styles.main}>
      {MessageText != "" ? (<Message Tools={Tools} text={MessageText} status={MessageStatus}></Message>):("")}
      {web3 == null ? (
        <Login Tools={Tools}></Login>
      ) : (
        <Dashboard Tools={Tools}></Dashboard>
      )}
    </div>
  );
}

export default App;