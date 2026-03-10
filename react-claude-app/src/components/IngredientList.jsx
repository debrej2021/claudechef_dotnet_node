export default function IngredientList({ ingredients, generateRecipe, loading }) {

    const ingredientsListItems = ingredients.map((ingredient, index) => (
        <li key={index}>{ingredient}</li>
    ))

    return (
        <section>

            {ingredients.length > 0 && (
                <ul>
                    {ingredientsListItems}
                </ul>
            )}

            {ingredients.length > 0 && ingredients.length < 3 && (
                <p className="min-warning">
                    Minimum 3 ingredients required to generate a recipe
                </p>
            )}

            {ingredients.length >= 3 && (
                <button onClick={generateRecipe}>
                    {loading ? "Generating..." : "Generate Recipe"}
                </button>
            )}

        </section>
    )
}