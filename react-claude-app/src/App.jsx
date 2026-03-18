import Header from "./components/Header"
import Main from "./Main"
import { useState } from "react"

export default function App() {
  const [authorized, setAuthorized] = useState(false)
  const [password, setPassword] = useState("")
  if (!authorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-50 flex items-center justify-center px-4 relative overflow-hidden">
        {/* Animated background blobs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-amber-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>

        <div className="relative bg-white rounded-3xl shadow-2xl shadow-orange-100/50 p-10 max-w-md w-full border border-gray-100 animate-scale-in">
          <div className="text-center mb-8">
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-amber-400 rounded-2xl blur-xl opacity-30 animate-pulse"></div>
              <div className="relative flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">Welcome Back</h2>
            <p className="text-gray-600 font-medium">Enter your password to access Chef Claude</p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 tracking-wide uppercase text-xs">Password</label>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    if (password === "chef2026") {
                      setAuthorized(true)
                    } else {
                      alert("Wrong password")
                    }
                  }
                }}
                className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-400/20 focus:border-orange-400 transition-all duration-300 text-gray-800 placeholder-gray-400 shadow-sm"
              />
            </div>

            <button
              onClick={() => {
                if (password === "chef2026") {
                  setAuthorized(true)
                } else {
                  alert("Wrong password")
                }
              }}
              className="w-full py-4 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 text-white font-bold rounded-2xl hover:from-orange-600 hover:via-orange-700 hover:to-amber-600 hover:scale-[1.02] active:scale-98 transition-all duration-300 shadow-xl shadow-orange-500/30 hover:shadow-2xl hover:shadow-orange-500/40 flex items-center justify-center gap-2"
            >
              <span>Access Chef Claude</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500">Protected demo environment</p>
          </div>
        </div>
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