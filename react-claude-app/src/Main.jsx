import { useState, useEffect } from "react"
import { getRecipeFromAI } from "./services/recipeService"
import IngredientList from "./components/IngredientList"
import Recipe from "./components/Recipe"

export default function Main() {

    const [ingredients, setIngredients] = useState([])
       // "Chicken", "Oregano", "Tomatoes"])

    const [recipe, setRecipe] = useState("")
    const [loading, setLoading] = useState(false)
    const [recipeHistory, setRecipeHistory] = useState([])

    // Load recipe history from localStorage on mount
    useEffect(() => {
        const savedHistory = localStorage.getItem('recipeHistory')
        if (savedHistory) {
            try {
                setRecipeHistory(JSON.parse(savedHistory))
            } catch (e) {
                console.error('Failed to load recipe history:', e)
            }
        }
    }, [])

    function handleSubmit(event) {
        event.preventDefault()

        const formData = new FormData(event.currentTarget)
        const newIngredient = formData.get("ingredient")

        if (!newIngredient) return

        setIngredients(prev => [...prev, newIngredient])

        event.currentTarget.reset()
    }

    function removeIngredient(indexToRemove) {
        setIngredients(prev => prev.filter((_, index) => index !== indexToRemove))
    }

    function clearAllIngredients() {
        setIngredients([])
        setRecipe("")
    }

    async function generateRecipe() {

        setLoading(true)

        const aiRecipe = await getRecipeFromAI(ingredients)

        setRecipe(aiRecipe)

        // Save to history
        const newRecipe = {
            id: Date.now(),
            recipe: aiRecipe,
            ingredients: [...ingredients],
            timestamp: new Date().toISOString()
        }

        const updatedHistory = [newRecipe, ...recipeHistory].slice(0, 5) // Keep only last 5
        setRecipeHistory(updatedHistory)
        localStorage.setItem('recipeHistory', JSON.stringify(updatedHistory))

        setLoading(false)
    }

    function loadHistoricalRecipe(historicalRecipe) {
        setRecipe(historicalRecipe.recipe)
        setIngredients(historicalRecipe.ingredients)
        // Scroll to recipe
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">

                {/* Hero Section */}
                <div className="text-center mb-10 animate-fade-in">
                    <h2 className="text-5xl font-extrabold text-gray-900 mb-3 tracking-tight text-balance">
                        What's in your kitchen?
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto text-balance">
                        Transform your ingredients into delicious recipes with AI-powered culinary expertise
                    </p>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-3xl shadow-2xl shadow-orange-100/50 p-10 mb-8 border border-gray-100 animate-scale-in">
                    <form onSubmit={handleSubmit} className="mb-8">
                        <label className="block text-sm font-semibold text-gray-700 mb-3 tracking-wide uppercase text-xs">
                            Add Your Ingredients
                        </label>
                        <div className="flex gap-3">
                            <div className="flex-1 relative group">
                                <input
                                    type="text"
                                    placeholder="e.g. chicken, tomatoes, garlic..."
                                    aria-label="Add ingredient"
                                    name="ingredient"
                                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-400/20 focus:border-orange-400 transition-all duration-300 text-gray-800 placeholder-gray-400 text-base group-hover:border-gray-300 shadow-sm"
                                />
                            </div>

                            <button
                                type="submit"
                                className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-2xl hover:from-orange-600 hover:to-orange-700 hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 flex items-center gap-2 whitespace-nowrap"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Add
                            </button>
                        </div>
                    </form>

                    <IngredientList
                        ingredients={ingredients}
                        generateRecipe={generateRecipe}
                        loading={loading}
                        removeIngredient={removeIngredient}
                        clearAllIngredients={clearAllIngredients}
                    />
                </div>

                {recipe && <Recipe recipe={recipe} />}

                {/* Recipe History */}
                {recipeHistory.length > 0 && (
                    <div className="mt-12 animate-fade-in">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-1 h-6 bg-gradient-to-b from-orange-500 to-amber-500 rounded-full"></div>
                            <h3 className="text-2xl font-bold text-gray-900">Recent Recipes</h3>
                            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent"></div>
                            <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                                {recipeHistory.length} {recipeHistory.length === 1 ? 'recipe' : 'recipes'}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                            {recipeHistory.map((item, index) => (
                                <button
                                    key={item.id}
                                    onClick={() => loadHistoricalRecipe(item)}
                                    className="bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-orange-300 hover:shadow-xl transition-all duration-300 text-left group hover:scale-[1.02] active:scale-95"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-amber-100 rounded-xl flex items-center justify-center group-hover:from-orange-200 group-hover:to-amber-200 transition-colors duration-300">
                                                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                </svg>
                                            </div>
                                            <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                                                Recipe #{index + 1}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Ingredients</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {item.ingredients.slice(0, 3).map((ing, i) => (
                                                <span key={i} className="inline-flex items-center px-2 py-1 bg-orange-50 border border-orange-200 text-orange-700 rounded-lg text-xs font-medium">
                                                    {ing}
                                                </span>
                                            ))}
                                            {item.ingredients.length > 3 && (
                                                <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">
                                                    +{item.ingredients.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                        <span className="text-xs text-gray-500 font-medium">
                                            {new Date(item.timestamp).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                        <span className="text-xs font-semibold text-orange-600 group-hover:text-orange-700 flex items-center gap-1">
                                            View Recipe
                                            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </main>
    )
}