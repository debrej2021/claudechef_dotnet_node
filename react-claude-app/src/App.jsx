import Header from "./components/Header"
import Main from "./Main"
import { useState } from "react"

export default function App() {
  const [authorized, setAuthorized] = useState(false)
  const [password, setPassword] = useState("")
  if (!authorized) {
return (
<div style={{
height: "100vh",
display: "flex",
flexDirection: "column",
justifyContent: "center",
alignItems: "center",
fontFamily: "Arial"
}}>
🔒 Private Demo
Please enter password to access Chef Claude

    <input
      type="password"
      placeholder="Enter password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      style={{ padding: "8px", marginBottom: "10px" }}
    />

    <button
      onClick={() => {
        if (password === "chef2026") {
          setAuthorized(true)
        } else {
          alert("Wrong password")
        }
      }}
      style={{ padding: "8px 15px", cursor: "pointer" }}
    >
      Enter
    </button>
  </div>
)

}
  return (
    <>
      <Header />
      <Main />
    </>
  )
}