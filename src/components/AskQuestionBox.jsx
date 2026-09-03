import { useState, useEffect, useRef } from "react";
import {
  getCountries,
  getCountryCallingCode,
  isValidPhoneNumber,
} from "libphonenumber-js";

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
  const [country, setCountry] = useState("IN");
  const [phone, setPhone] = useState("");
  const qnaInputRef = useRef(null);

  const emailIsValid =
    email.trim() === "" || /^\S+@\S+\.\S+$/.test(email.trim());

  const phoneIsValid =
    phone.trim() === "" || isValidPhoneNumber(phone.trim(), country);

  const hasContact = email.trim() !== "" || phone.trim() !== "";

  const isFormValid =
    question.trim().length >= 10 &&
    (isAnonymous ||
      (name.trim().length >= 2 && hasContact && emailIsValid && phoneIsValid));

  const reset = () => {
    setMode("collapsed");
    setQuestion("");
    setEmail("");
    setPhone("");
    setName("");
    setIsAnonymous(false);
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
          email: isAnonymousChoice ? null : email.trim(),
          countryCode: isAnonymousChoice ? null : countryCallingCode,
          phone: isAnonymousChoice ? null : phone.trim(),
          name: isAnonymousChoice ? null : name.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Submission failed");
        setLoading(false);
        return;
      }
      setMode("success");
      setQuestion("");
      setEmail("");
      setPhone("");
      setName("");
      setIsAnonymous(false);
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const countryOptions = getCountries()
    .map((code) => ({
      code,
      name: new Intl.DisplayNames(["en"], { type: "region" }).of(code) || code,
      callingCode: `+${getCountryCallingCode(code)}`,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const selectedCountry = countryOptions.find((item) => item.code === country);

  const countryCallingCode = selectedCountry?.callingCode || "+91";

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
          <div ref={qnaInputRef} className="space-y-4">
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
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isAnonymous}
              className={`w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isAnonymous ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
            />

            <input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isAnonymous}
              className={`w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isAnonymous ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
            />

            <div className="flex gap-2">
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                disabled={isAnonymous}
                className={`border border-gray-300 rounded-lg px-3 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isAnonymous ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
              >
                {countryOptions.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.name} {item.callingCode}
                  </option>
                ))}
              </select>

              <input
                type="tel"
                inputMode="numeric"
                placeholder="Your phone number"
                value={phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 15);
                  setPhone(value);
                }}
                disabled={isAnonymous}
                className={`flex-1 border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isAnonymous ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
              />
            </div>

            {!isAnonymous && !hasContact && (
              <p className="text-sm text-red-600">
                Please provide either an email address or phone number.
              </p>
            )}

            {!isAnonymous && email.trim() !== "" && !emailIsValid && (
              <p className="text-sm text-red-600">
                Please enter a valid email address.
              </p>
            )}

            {!isAnonymous && phone.trim() !== "" && !phoneIsValid && (
              <p className="text-sm text-red-600">
                Please enter a valid phone number
              </p>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={reset}
                className="px-4 py-2 rounded-lg bg-red-400 text-white hover:bg-red-700 transition"
              >
                Cancel
              </button>

              <button
                disabled={loading || !isFormValid}
                onClick={() => submitQuestion(isAnonymous)}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Submit your question
              </button>
            </div>
          </div>
        )}

        {mode === "success" && (
          <div className="text-center space-y-6">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Question submitted
              </h3>

              <p className="text-sm text-gray-600">
                Your question has been sent to our scholars for review. If
                approved, it will be answered and published.
              </p>
              {!isAnonymous && (email || phone) && (
                <p className="text-sm text-gray-500">
                  You will be contacted at{" "}
                  <span className="font-medium">{email || phone}</span>
                </p>
              )}

              <button
                onClick={() => {
                  setQuestion("");
                  setEmail("");
                  setPhone("");
                  setName("");
                  setIsAnonymous(false);
                  onClose?.();
                }}
                className="mt-4 px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Ask another question
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
