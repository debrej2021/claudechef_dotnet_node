import React from "react"
import avatar from "./images/user.png"
import starFilled from "./images/star-filled.png"
import starEmpty from "./images/star-empty.png"

export default function App() {
    const [contact, setContact] = React.useState({
        firstName: "John",
        lastName: "Doe",
        phone: "+1 (212) 555-1212",
        email: "itsmyrealname@example.com",
        isFavorite: true
    })
    
    let starIcon = contact.isFavorite ? starFilled : starEmpty

    function toggleFavorite() {
        setContact(prevContact => {
            return {
                ...prevContact,
                isFavorite: !prevContact.isFavorite
            }
        })
    }

    return (
        <main>
            <article className="card">
                <img
                    src={avatar}
                    className="avatar"
                    alt="User profile picture of John Doe"
                />
                <div className="info">
                    <button
                        onClick={toggleFavorite}
                        aria-pressed={contact.isFavorite}
                        aria-label={contact.isFavorite ? "Remove from favorites" : "Add to favorites"}
                        className="favorite-button"
                    >
                        <img
                            src={starIcon}
                            alt={contact.isFavorite ? "filled star icon" : "empty star icon"}
                            className="favorite"
                        />
                    </button>
                    <h2 className="name">
                        {contact.firstName} {contact.lastName}
                    </h2>
                    <p className="contact">{contact.phone}</p>
                    <p className="contact">{contact.email}</p>
                </div>

            </article>
        </main>
    )
}

form -submit ---
<html>

<head>
	<link rel="stylesheet" href="style.css">
</head>

<body>

	<form action="/api/my-server-code.php" method="GET" id="my-form">
		<label for="first-name">First Name: </label>
		<input type="text" id="first-name" name="firstName" class="input" />
		<br />
		<label for="last-name">Last Name: </label>
		<input type="text" id="last-name" name="lastName" class="input" />
		<br />
		<input type="submit" value="Submit" />
	</form>

	<script src="./index.js"></script>
</body>

</html>

document.getElementById("my-form").addEventListener("submit", function(event) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const firstName = formData.get("firstName")
    const lastName = formData.get("lastName")
    submitViaAPI({
        firstName,
        lastName
    })
})

function submitViaAPI(data) {
    console.log(data)
    console.log("Submitted!")
}