export async function getRecipeFromAI(ingredients) {
  try {
    const response = await fetch("/api/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ ingredients })
    })

    const data = await response.json()

    // Handle new response structure: data.data.answers
    if (data.success && data.data && data.data.answers && data.data.answers.length > 0) {
      return data.data.answers[0].text
    }

    // Fallback for old structure
    if (data.answers && data.answers.length > 0) {
      return data.answers[0].text
    }

    // This should never happen due to backend fallback
    return "Unable to generate recipe. Please try again."

  } catch (error) {
    console.error('Recipe fetch error:', error)
    return "Unable to connect to recipe service. Please check your connection and try again."
  }
}