export default function Main() {
    const ingredients = ["Chicken", "Oregano", "Tomatoes"]
    
    const ingredientsListItems = ingredients.map(ingredient => (
        <li key={ingredient}>{ingredient}</li>
    ))

    function handleSubmit(event) {
        event.preventDefault()
        console.log("Form submitted!")
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
            <ul>
                {ingredientsListItems}
            </ul>
        </main>
    )
}

export default function Main() {
    const ingredients = ["Chicken", "Oregano", "Tomatoes"]
    
    const ingredientsListItems = ingredients.map(ingredient => (
        <li key={ingredient}>{ingredient}</li>
    ))
    
    /**
     * Challenge:
     * Add the new ingredient to the array of ingredients. Also, add a 
     * console.log(ingredients) after adding the ingredient, because 
     * **warning**: you aren't going to see the page update!
     * 
     * Hint: this is a one-liner solution, so don't overthink it 😅
     */

    function handleSubmit(event) {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        const newIngredient = formData.get("ingredient")
        ingredients.push(newIngredient)
        console.log(ingredients)
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
            <ul>
                {ingredientsListItems}
            </ul>
        </main>
    )
}

import React from "react"

export default function App() {
    const [count, setCount] = React.useState(0)

    function add() {
        setCount(count + 1)
    }
    
    function subtract() {
        setCount(count - 1)
    }    
    
    return (
        <main className="container">
            <h1>How many times will Bob say "state" in this section?</h1>
            <div className="counter">
                <button className="minus" onClick={subtract} aria-label="Decrease count">–</button>
                <h2 className="count">{count}</h2>
                <button className="plus" onClick={add} aria-label="Increase count">+</button>
            </div>
        </main>
    )
}

import React from "react"

export default function App() {

    return (
        <main className="container">
            <h1>How many times will Bob say "state" in this section?</h1>
            <div className="counter">
                <button className="minus" onClick={subtract} aria-label="Decrease count">–</button>
                <h2 className="count">{count}</h2>
                <button className="plus" onClick={add} aria-label="Increase count">+</button>
            </div>
        </main>
    )
}


1. You have 2 options for what you can pass in to a
   state setter function (e.g. `setCount`). What are they?
   1. Pass the new version of state that we want to use as the 
      replacement for the old version of state.
   2. Pass a callback function. Must return what we want the new
      value of state to be. Will receive the old version of state
      as a parameter so we can use it to help determine what we want 
      the new value of state to be.


2. When would you want to pass the first option (from answer
   above) to the state setter function?
   
   Whenever we don't really care about (or need) the old value,
   we simply want to set a new value.


3. When would you want to pass the second option (from answer
   above) to the state setter function?

   Whenever we do care about the previous value in state and need
   it to help us determine what the new value should be.
import React from "react"

export default function App() {
  const [myFavoriteThings, setMyFavoriteThings] = React.useState([])
  
  const allFavoriteThings = ["💦🌹", "😺", "💡🫖", "🔥🧤", "🟤🎁", 
  "🐴", "🍎🥧", "🚪🔔", "🛷🔔", "🥩🍝"]
  const thingsElements = myFavoriteThings.map(thing => <p key={thing}>{thing}</p>)

  function addFavoriteThing() {
      setMyFavoriteThings(prevFavThings => [...prevFavThings, "Test"])
    /**
     * Challenge: you do it!
     * Every time "Add item" is clicked, it should add another string
     * "Test" to the list on the page
     */
  }
  
  return (
    <main>
      <button onClick={addFavoriteThing}>Add item</button>
      <section aria-live="polite">
        {thingsElements}
      </section>
    </main>
  )
}

import React from "react"

export default function App() {
    const [myFavoriteThings, setMyFavoriteThings] = React.useState([])

    const allFavoriteThings = ["💦🌹", "😺", "💡🫖", "🔥🧤", "🟤🎁",
        "🐴", "🍎🥧", "🚪🔔", "🛷🔔", "🥩🍝"]
    const thingsElements = myFavoriteThings.map(thing => <p key={thing}>{thing}</p>)

    function addFavoriteThing() {
        setMyFavoriteThings(
            prevFavThings => [
                ...prevFavThings,
                allFavoriteThings[prevFavThings.length]
            ]
        )
    }

    return (
        <main>
            <button onClick={addFavoriteThing}>Add item</button>
            <section aria-live="polite">
                {thingsElements}
            </section>
        </main>
    )
}