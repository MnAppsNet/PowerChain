import React, { useState, useEffect } from "react"
import Login from "./components/Login";
import Message from "./components/Message";
import Dashboard from "./components/Dashboard"
import styles from "./styles.css";
import Languages from "./strings.json"

function App() {
  
  const [RpcUrl, setRpcUrl] = useState("");
  const [Language, setLanguage] = useState("EN");
  const [MessageText, setMessageText] = useState("");
  const [MessageStatus, setMessageStatus] = useState("");

  class Tools {
    static strings = Languages.EN
    static RpcUrl = () => RpcUrl
    static showMessage = (text,error=true) => {
      setMessageStatus((error)?"error":"info")
      setMessageText(text)
      setTimeout(() => {Tools.clearMessage()}, 10000); //Hide message after 10 seconds
    }
    static clearMessage = () => {
      setMessageText("")
    }
    static setRpcUrl = (url) => {
      setRpcUrl(url)
    }
    static disconect = () => {
      setRpcUrl("")
    }
  }

  useEffect(() => {
    Tools.strings = Languages[Language]
  }, [Language]);

  return (
    <div className={styles.main}>
      {MessageText != "" ? (<Message Tools={Tools} text={MessageText} status={MessageStatus}></Message>):("")}
      {RpcUrl == "" ? (
        <Login Tools={Tools}></Login>
      ) : (
        <Dashboard Tools={Tools}></Dashboard>
      )}
    </div>
  );
}

export default App;