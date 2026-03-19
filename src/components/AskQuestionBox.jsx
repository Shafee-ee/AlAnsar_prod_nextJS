import { useState, useEffect } from "react";

export default function AskQuestionBox({
  initialQuestion = "",
  forceOpen = false,
  onClose,
}) {
  const [mode, setMode] = useState("collapsed");
  const [question, setQuestion] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  const reset = () => {
    setMode("collapsed");
    setQuestion("");
    setEmail("");
    setName("");

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
          name: isAnonymousChoice ? null : name,
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

            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
              />
              Submit anonymously
            </label>
            <input
              type="text"
              placeholder="Your name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isAnonymous}
              className={`w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isAnonymous ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
            />

            <input
              type="email"
              placeholder="Your email (optional, for response)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isAnonymous}
              className={`w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isAnonymous ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
            />

            <div className="flex gap-3 justify-end">
              <button
                onClick={reset}
                className="px-4 py-2 rounded-lg bg-red-400 text-white hover:bg-red-700 transition"
              >
                Cancel
              </button>

              <button
                disabled={
                  loading ||
                  question.trim().length < 10 ||
                  (!isAnonymous &&
                    (!/^\S+@\S+\.\S+$/.test(email.trim()) ||
                      name.trim().length < 2))
                }
                onClick={() => submitQuestion(isAnonymous)}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Submit & Get Response
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
