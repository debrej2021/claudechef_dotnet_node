import { useState } from "react"
import { getRecipeFromAI } from "./services/recipeService"
import IngredientList from "./components/IngredientList"
import Recipe from "./components/Recipe"

export default function Main() {

    const [ingredients, setIngredients] = useState([])
       // "Chicken", "Oregano", "Tomatoes"])

    const [recipe, setRecipe] = useState("")
    const [loading, setLoading] = useState(false)

    function handleSubmit(event) {
        event.preventDefault()

        const formData = new FormData(event.currentTarget)
        const newIngredient = formData.get("ingredient")

        if (!newIngredient) return

        setIngredients(prev => [...prev, newIngredient])

        event.currentTarget.reset()
    }

    async function generateRecipe() {

        setLoading(true)

        const aiRecipe = await getRecipeFromAI(ingredients)

        setRecipe(aiRecipe)

        setLoading(false)
    }

    return (
        <main>

            <form onSubmit={handleSubmit} className="add-ingredient-form">
                <input
                    type="text"
                    placeholder="e.g. oregano"
                    aria-label="Add ingredient"
                    name="ingredient"
                />

                <button>Add ingredient</button>
            </form>

            <IngredientList
                ingredients={ingredients}
                generateRecipe={generateRecipe}
                loading={loading}
            />

            {recipe && <Recipe recipe={recipe} />}

        </main>
    )
}