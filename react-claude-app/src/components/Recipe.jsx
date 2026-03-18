import { useState } from "react"
import ReactMarkdown from "react-markdown"

export default function Recipe({ recipe }) {
    const [showToast, setShowToast] = useState(false)

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(recipe)
            setShowToast(true)
            setTimeout(() => setShowToast(false), 3000)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }

    return (
        <>
            {/* Toast Notification */}
            {showToast && (
                <div className="fixed top-24 right-6 z-50 animate-slide-up">
                    <div className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-6 py-4 rounded-2xl shadow-2xl shadow-emerald-500/30 flex items-center gap-3 border border-emerald-400">
                        <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-xl">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-bold text-sm">Recipe Copied!</p>
                            <p className="text-xs text-emerald-50">Ready to paste anywhere</p>
                        </div>
                    </div>
                </div>
            )}

            <section className="bg-white rounded-3xl shadow-2xl shadow-orange-100/50 p-10 border border-gray-100 animate-fade-in relative">

            <div className="relative mb-10">
                <div className="absolute -top-6 -left-6 w-32 h-32 bg-gradient-to-br from-orange-400/20 to-amber-400/20 rounded-full blur-3xl"></div>
                <div className="relative flex items-center justify-between pb-6 border-b-2 border-gradient-to-r from-orange-200 via-amber-200 to-transparent">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl shadow-lg shadow-orange-500/30">
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Your Recipe</h2>
                            <p className="text-sm text-gray-500 font-medium mt-1">Created by Chef Claude AI</p>
                        </div>
                    </div>

                    {/* Copy Button */}
                    <button
                        onClick={copyToClipboard}
                        className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 font-semibold rounded-xl hover:scale-105 active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg border border-gray-300"
                        aria-label="Copy recipe to clipboard"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span className="hidden sm:inline">Copy Recipe</span>
                    </button>
                </div>
            </div>

            <div className="prose prose-orange max-w-none">
                <ReactMarkdown
                    components={{
                        h3: ({node, children, ...props}) => {
                            const text = children?.toString().toLowerCase() || '';
                            const isIngredients = text.includes('ingredient');
                            const isInstructions = text.includes('instruction');

                            return (
                                <div className="mt-10 mb-6">
                                    <div className="flex items-center gap-4 mb-5">
                                        {isIngredients && (
                                            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-emerald-100 to-green-100 border border-emerald-200 rounded-2xl shadow-md">
                                                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                            </div>
                                        )}
                                        {isInstructions && (
                                            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 border border-blue-200 rounded-2xl shadow-md">
                                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                </svg>
                                            </div>
                                        )}
                                        <div>
                                            <h3 className="text-2xl font-extrabold text-gray-900 m-0 tracking-tight" {...props}>
                                                {children}
                                            </h3>
                                            <div className="h-1 w-16 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full mt-2"></div>
                                        </div>
                                    </div>
                                </div>
                            );
                        },
                        h2: ({node, ...props}) => (
                            <h2 className="text-3xl font-extrabold text-gray-900 mt-10 mb-5 pb-3 border-b-2 border-gray-200" {...props} />
                        ),
                        ul: ({node, ...props}) => (
                            <ul className="space-y-3 my-6 bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border border-gray-100 shadow-sm" {...props} />
                        ),
                        ol: ({node, ...props}) => (
                            <ol className="space-y-5 my-6" {...props} />
                        ),
                        li: ({node, children, ordered, ...props}) => {
                            // For unordered lists (ingredients), show custom bullet
                            if (!ordered) {
                                return (
                                    <li className="flex gap-3 text-gray-700 leading-relaxed pl-1 hover:text-gray-900 transition-colors duration-200" {...props}>
                                        <span className="flex-shrink-0 mt-1.5">
                                            <div className="w-2 h-2 rounded-full bg-gradient-to-br from-orange-500 to-amber-500"></div>
                                        </span>
                                        <span className="flex-1 text-base font-medium">{children}</span>
                                    </li>
                                );
                            }

                            // For ordered lists (instructions), use CSS counter
                            return (
                                <li className="flex gap-4 text-gray-700 leading-relaxed text-base bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-200" {...props}>
                                    <span className="flex-1 font-medium">{children}</span>
                                </li>
                            );
                        },
                        p: ({node, ...props}) => (
                            <p className="text-gray-700 leading-relaxed my-4 text-base" {...props} />
                        ),
                        strong: ({node, ...props}) => (
                            <strong className="font-bold text-gray-900" {...props} />
                        ),
                        em: ({node, ...props}) => (
                            <em className="italic text-gray-600" {...props} />
                        )
                    }}
                >
                    {recipe}
                </ReactMarkdown>
            </div>

        </section>
        </>
    )
}