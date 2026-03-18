export default function IngredientList({ ingredients, generateRecipe, loading, removeIngredient, clearAllIngredients }) {

    const ingredientsListItems = ingredients.map((ingredient, index) => (
        <li
            key={index}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 text-orange-800 rounded-xl text-sm font-semibold shadow-sm hover:shadow-md transition-all duration-200 animate-scale-in group"
            style={{ animationDelay: `${index * 50}ms` }}
        >
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
            <span className="flex-1">{ingredient}</span>
            <button
                onClick={() => removeIngredient(index)}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-red-100 rounded-lg"
                aria-label={`Remove ${ingredient}`}
                title="Remove ingredient"
            >
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </li>
    ))

    return (
        <section>

            {ingredients.length > 0 && (
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-1 h-5 bg-gradient-to-b from-orange-500 to-amber-500 rounded-full"></div>
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Your Ingredients</h3>
                        <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent"></div>
                        <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                            {ingredients.length} {ingredients.length === 1 ? 'item' : 'items'}
                        </span>
                        <button
                            onClick={clearAllIngredients}
                            className="text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all duration-200"
                            title="Clear all ingredients"
                        >
                            Clear All
                        </button>
                    </div>
                    <ul className="flex flex-wrap gap-2.5">
                        {ingredientsListItems}
                    </ul>
                </div>
            )}

            {ingredients.length > 0 && ingredients.length < 3 && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-5 mb-6 shadow-sm">
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                            <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <p className="text-amber-900 font-semibold mb-1">Almost there!</p>
                            <p className="text-amber-700 text-sm">Add at least 3 ingredients to generate your recipe</p>
                        </div>
                    </div>
                </div>
            )}

            {ingredients.length >= 3 && (
                <button
                    onClick={generateRecipe}
                    disabled={loading}
                    className="relative w-full py-5 bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 text-white font-bold rounded-2xl hover:from-orange-600 hover:via-orange-700 hover:to-amber-600 hover:scale-[1.02] active:scale-98 transition-all duration-300 shadow-xl shadow-orange-500/30 hover:shadow-2xl hover:shadow-orange-500/40 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-3 overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                    {loading ? (
                        <>
                            <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="text-base">Generating your recipe...</span>
                        </>
                    ) : (
                        <>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                            <span className="text-base">Generate Recipe</span>
                        </>
                    )}
                </button>
            )}

        </section>
    )
}