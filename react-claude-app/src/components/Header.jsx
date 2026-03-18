import chefClaudeLogo from "../assets/images/chef-claude-icon.png"

export default function Header() {
    return (
        <header className="glass-effect border-b border-gray-100 sticky top-0 z-50 animate-slide-up">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-amber-400 rounded-xl blur-lg opacity-20 animate-pulse"></div>
                        <img src={chefClaudeLogo} alt="Chef Claude" className="relative w-11 h-11 rounded-xl" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Chef Claude</h1>
                        <p className="text-xs text-gray-500 font-medium">AI Recipe Generator</p>
                    </div>
                </div>
                <button
                    onClick={() => {
                        localStorage.removeItem("chef-auth")
                        window.location.reload()
                    }}
                    className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm hover:shadow"
                >
                    Logout
                </button>
            </div>
        </header>
    )
}