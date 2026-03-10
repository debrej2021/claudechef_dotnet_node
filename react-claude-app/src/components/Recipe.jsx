import ReactMarkdown from "react-markdown"

export default function Recipe({ recipe }) {

    return (
        <section className="recipe">

            <h2>Chef Claude Recommends:</h2>

            <ReactMarkdown>
                {recipe}
            </ReactMarkdown>

        </section>
    )
}