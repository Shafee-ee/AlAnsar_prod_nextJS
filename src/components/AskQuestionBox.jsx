import { useState, useEffect } from "react";

export default function AskQuestionBox({
    initialQuestion = "",
    forceOpen = false,
    onClose
}) {
    const [mode, setMode] = useState("collapsed");
    const [question, setQuestion] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const reset = () => {
        setMode("collapsed");
        setQuestion("");
        setEmail("");

        if (onClose) {
            onClose();
        }

    };

    useEffect(() => {
        if (forceOpen) {
            setMode("input");
            if (initialQuestion) {
                setQuestion(initialQuestion);
            }
        }
    }, [forceOpen, initialQuestion]);


    const submitQuestion = async (isAnonymousChoice) => {
        try {
            setLoading(true);

            const res = await fetch("/api/qna/user-submission", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    question: question.trim(),
                    isAnonymous: isAnonymousChoice,
                    email: isAnonymousChoice ? null : email,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.error || "Submission failed");
                setLoading(false);
                return;
            }

            setMode("success");
        } catch (err) {
            console.error(err);
            alert("Something went wrong");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="w-full flex justify-center my-12">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-md p-8">

                {mode === "collapsed" && (
                    <div className="text-center space-y-6">
                        <p className="text-lg font-medium text-gray-700">
                            Have any questions you would like answered?
                        </p>

                        <button
                            onClick={() => setMode("input")}
                            className="px-6 py-3 rounded-full bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
                        >
                            Submit your question
                        </button>
                    </div>
                )}

                {mode === "input" && (
                    <div className="space-y-4">
                        <textarea
                            placeholder="Type your question... to submit"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            className="w-full border border-gray-300 rounded-xl p-4 text-gray-900 placeholder-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={4}
                        />

                        <div className="flex justify-end">

                            <button onClick={reset}
                                className="px-6 py-2 rounded-lg bg-red-400 text-white cursor hover:bg-red-700 transition mr-2">
                                cancel
                            </button>
                            <button
                                disabled={question.trim().length < 10}
                                onClick={() => setMode("decision")}
                                className="px-6 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition"
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                )}

                {mode === "decision" && (
                    <div className="space-y-6">
                        <p className="font-medium text-gray-700">
                            Choose submission type:

                        </p>

                        <button
                            disabled={loading}
                            onClick={() => submitQuestion(true)}
                            className="w-full py-3 rounded-lg border border-gray-300 hover:bg-red-400 bg-red-300 transition"
                        >
                            {loading ? "Submitting..." : "Submit anonymously"}
                        </button>
                        <p className=" text-sm text-gray-500 ">
                            ** Your question will be reviewed and, if approved, added to our database.
                            Please check the Page in 3–5 business days.
                        </p>

                        <div className="space-y-3">
                            <input
                                type="email"
                                placeholder="Enter your email address if you would like us to respond to you directly."
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />


                            <button
                                disabled={loading}
                                onClick={() => {
                                    if (!email.includes("@")) return;
                                    submitQuestion(false);
                                }}
                                className="w-full py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                            >
                                {loading ? "Submitting..." : "Submit & Email Me"}
                            </button>
                        </div>
                    </div>
                )}

                {mode === "success" && (
                    <div className="text-center space-y-6">
                        <p className="text-green-600 font-medium">
                            Your question has been submitted for review.
                        </p>

                        {/* <button
                            onClick={reset}
                            className="px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
                        >
                            Ask another question
                        </button> */}
                    </div>
                )}

            </div>
        </div>
    );

}
