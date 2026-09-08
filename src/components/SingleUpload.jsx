"use client";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebaseClient";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useSearchParams } from "next/navigation";

export default function SingleUpload() {
  const [questionEn, setQuestionEn] = useState("");
  const [questionKn, setQuestionKn] = useState("");
  const [answerEn, setAnswerEn] = useState("");
  const [answerKn, setAnswerKn] = useState("");
  const [keywords, setKeywords] = useState("");
  const [loading, setLoading] = useState(false);
  const [editorNoteEn, setEditorNoteEn] = useState("");
  const [editorNoteKn, setEditorNoteKn] = useState("");
  const [imamName, setImamName] = useState("");
  const [sourceTitle, setSourceTitle] = useState("");
  const [samputa, setSamputa] = useState("");
  const [sanchike, setSanchike] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [translating, setTranslating] = useState(null);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  //prefill QnA from submissions
  const searchParams = useSearchParams();
  const fromSubmission = searchParams.get("fromSubmission");
  const submissionId = searchParams.get("submissionId");

  //ResponseId
  const responseId = searchParams.get("responseId");

  //deleted the duplicate line
  const questionFromUrl = searchParams.get("question");
  const answerFromUrl = searchParams.get("answer");

  async function translateText(text, targetLang) {
    const res = await fetch("/api/qna/single", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "translate",
        text: text.trim(),
        targetLang,
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.reason || "Translation failed");
    }

    return data.translation;
  }
  useEffect(() => {
    if (fromSubmission !== "true") return;

    if (questionFromUrl) {
      const question = decodeURIComponent(questionFromUrl);

      if (/[\u0C80-\u0CFF]/.test(question)) {
        setQuestionKn(question);
      } else {
        setQuestionEn(question);
      }
    }

    if (answerFromUrl) {
      const answer = decodeURIComponent(answerFromUrl);

      if (/[\u0C80-\u0CFF]/.test(answer)) {
        setAnswerKn(answer);
      } else {
        setAnswerEn(answer);
      }
    }

    if (submissionId) {
      fetch(
        `/api/qna/submission-contact?id=${encodeURIComponent(submissionId)}`,
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setEmail(data.email || "");
            setPhone(data.phone || "");
          }
        })
        .catch((error) => {
          console.error("Failed to load submission contact:", error);
        });
    }
  }, [fromSubmission, submissionId, questionFromUrl, answerFromUrl]);
  async function handleTranslateAll() {
    const jobs = [];

    // Question: fill whichever language is empty
    if (!questionEn.trim() && questionKn.trim()) {
      jobs.push(
        translateText(questionKn, "en").then((translation) => {
          setQuestionEn(translation);
        }),
      );
    }

    if (!questionKn.trim() && questionEn.trim()) {
      jobs.push(
        translateText(questionEn, "kn").then((translation) => {
          setQuestionKn(translation);
        }),
      );
    }

    // Answer: fill whichever language is empty
    if (!answerEn.trim() && answerKn.trim()) {
      jobs.push(
        translateText(answerKn, "en").then((translation) => {
          setAnswerEn(translation);
        }),
      );
    }

    if (!answerKn.trim() && answerEn.trim()) {
      jobs.push(
        translateText(answerEn, "kn").then((translation) => {
          setAnswerKn(translation);
        }),
      );
    }

    if (jobs.length === 0) {
      toast("Nothing to translate");
      return;
    }

    setTranslating("all");

    try {
      await Promise.all(jobs);
      toast.success("Translation completed");
    } catch (error) {
      console.error("Translation error:", error);
      toast.error("Translation failed");
    } finally {
      setTranslating(null);
    }
  }
  // for image upload
  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, PNG or WEBP images allowed");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    setUploadingImage(true);

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = async () => {
      const targetWidth = 1200;
      const targetHeight = 675; // 16:9

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const originalRatio = img.width / img.height;
      const targetRatio = 16 / 9;

      let sx, sy, sWidth, sHeight;

      if (originalRatio > targetRatio) {
        // Image is wider → crop sides
        sHeight = img.height;
        sWidth = img.height * targetRatio;
        sx = (img.width - sWidth) / 2;
        sy = 0;
      } else {
        // Image is taller → crop top/bottom
        sWidth = img.width;
        sHeight = img.width / targetRatio;
        sx = 0;
        sy = (img.height - sHeight) / 2;
      }

      ctx.drawImage(
        img,
        sx,
        sy,
        sWidth,
        sHeight,
        0,
        0,
        targetWidth,
        targetHeight,
      );

      canvas.toBlob(
        async (blob) => {
          if (!blob) {
            toast.error("Image processing failed");
            setUploadingImage(false);
            return;
          }

          try {
            const storageRef = ref(storage, `qna-images/${Date.now()}.jpg`);

            await uploadBytes(storageRef, blob);
            const url = await getDownloadURL(storageRef);

            setImageUrl(url);
          } catch (err) {
            toast.error("Upload failed");
          }

          setUploadingImage(false);
          URL.revokeObjectURL(objectUrl);
        },
        "image/jpeg",
        0.85,
      ); // compress to 85%
    };

    img.onerror = () => {
      toast.error("Invalid image file");
      setUploadingImage(false);
      URL.revokeObjectURL(objectUrl);
    };

    img.src = objectUrl;
  }

  // handle submit function
  async function handleSubmit(e) {
    e.preventDefault();

    if (uploadingImage) {
      toast.error("Please wait for image upload to finish");
      return;
    }

    if (
      !questionEn.trim() ||
      !questionKn.trim() ||
      !answerEn.trim() ||
      !answerKn.trim()
    ) {
      toast.error("Please fill all four fields before saving.");
      return;
    }

    setLoading(true);

    const keywordArray = keywords
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    const res = await fetch("/api/qna/single", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question_en: questionEn,
        question_kn: questionKn,
        answer_en: answerEn,
        answer_kn: answerKn,
        keywords: keywordArray,
        editor_note_en: editorNoteEn,
        editor_note_kn: editorNoteKn,
        imam_name: imamName,
        source_title: sourceTitle,
        email,
        phone,
        samputa,
        sanchike,
        image_urls: imageUrl ? [imageUrl] : [],
        submissionId: submissionId || null,
        responseId: responseId || null,
      }),
    });

    if (!res.ok) {
      toast.error("Server error");
      setLoading(false);
      return;
    }

    const data = await res.json();
    setLoading(false);

    if (data.success) {
      toast.success("QnA uploaded successfully!");
      setQuestionEn("");
      setQuestionKn("");
      setAnswerEn("");
      setAnswerKn("");
      setKeywords("");
      setEditorNoteEn("");
      setEditorNoteKn("");
      setImamName("");
      setSourceTitle("");
      setSamputa("");
      setSanchike("");
      setImageUrl(null);
    } else {
      toast.error("Upload failed: " + (data.reason || "Unknown error"));
    }
  }

  return (
    <div className="space-y-4 relative">
      <h2 className="text-xl font-bold text-[#1D3F9A]">Add Single QnA</h2>

      {/* Question */}
      {/* Question */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="font-medium">Question</label>

          <button
            type="button"
            onClick={handleTranslateAll}
            disabled={translating === "all"}
            className="text-sm text-[#1D3F9A] font-medium hover:underline disabled:opacity-50"
          >
            {translating === "all" ? "Translating..." : "Translate →"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <div className="text-sm text-gray-500 mb-1">English</div>

            <textarea
              value={questionEn}
              onChange={(e) => setQuestionEn(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1D3F9A]"
              rows={4}
              placeholder="English question..."
            />
          </div>

          <div>
            <div className="text-sm text-gray-500 mb-1">Kannada</div>

            <textarea
              value={questionKn}
              onChange={(e) => setQuestionKn(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1D3F9A]"
              rows={4}
              placeholder="Kannada question..."
            />
          </div>
        </div>
      </div>

      {/* Answer */}
      {/* Answer */}
      <div className="space-y-3">
        <label className="font-medium">Answer</label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <div className="text-sm text-gray-500 mb-1">English</div>

            <textarea
              value={answerEn}
              onChange={(e) => setAnswerEn(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1D3F9A]"
              rows={6}
              placeholder="English answer..."
            />
          </div>

          <div>
            <div className="text-sm text-gray-500 mb-1">Kannada</div>

            <textarea
              value={answerKn}
              onChange={(e) => setAnswerKn(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1D3F9A]"
              rows={6}
              placeholder="Kannada answer..."
            />
          </div>
        </div>
      </div>

      {/* Keywords */}
      <div className="space-y-2">
        <label className="font-medium">Keywords (comma separated)</label>
        <input
          type="text"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1D3F9A]"
          placeholder="e.g. prayer, wudu, fasting"
        />
      </div>

      {/* Editor Note (English) */}
      <div className="space-y-2">
        <label className="font-medium">Editor Note (English)</label>
        <textarea
          value={editorNoteEn}
          onChange={(e) => setEditorNoteEn(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg h-24 focus:ring-2 focus:ring-[#1D3F9A]"
          placeholder="Optional internal note (English)..."
        />
      </div>

      {/* Editor Note (Kannada) */}
      <div className="space-y-2">
        <label className="font-medium">Editor Note (Kannada)</label>
        <textarea
          value={editorNoteKn}
          onChange={(e) => setEditorNoteKn(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg h-24 focus:ring-2 focus:ring-[#1D3F9A]"
          placeholder="Optional internal note (Kannada)..."
        />
      </div>

      {loading && (
        <div className="mt-3 h-[3px] w-full bg-blue-200 overflow-hidden rounded">
          <div className="h-full bg-blue-600 animate-progress"></div>
        </div>
      )}

      <div className="space-y-2">
        <label className="font-medium">Answered by (optional)</label>
        <input
          type="text"
          value={imamName}
          onChange={(e) => setImamName(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1D3F9A]"
          placeholder="Enter imam name"
        />
      </div>

      <div className="space-y-2">
        <label className="font-medium">Source Title (optional)</label>
        <input
          type="text"
          value={sourceTitle}
          onChange={(e) => setSourceTitle(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1D3F9A]"
          placeholder="Enter source title"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="font-medium">Samputa</label>
          <input
            type="text"
            value={samputa}
            onChange={(e) => setSamputa(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1D3F9A]"
            placeholder="Volume"
          />
        </div>

        <div className="space-y-2">
          <label className="font-medium">Sanchike</label>
          <input
            type="text"
            value={sanchike}
            onChange={(e) => setSanchike(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1D3F9A]"
            placeholder="Issue"
          />
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-3">
        <label className="font-medium">Questioner Contact</label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-gray-500">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1D3F9A]"
              placeholder="Email address"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-500">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1D3F9A]"
              placeholder="Phone number"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="font-medium">
          Upload image (16:9 will be auto-cropped)
        </label>

        <div className="flex items-center gap-4">
          <label className="cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition">
            {uploadingImage ? "Processing..." : "Select Image"}
            <input
              type="file"
              accept="image/png, image/jpeg, image/webp"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>

          {uploadingImage && (
            <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
          )}

          {!uploadingImage && imageUrl && (
            <span className="text-sm text-green-600 font-medium">
              Image ready
            </span>
          )}
        </div>
      </div>

      <button
        disabled={loading || uploadingImage || translating === "all"}
        onClick={handleSubmit}
        className="bg-[#1D3F9A] text-white font-semibold px-6 py-3 rounded-lg shadow hover:bg-[#132B6A] transition disabled:opacity-50"
      >
        {loading ? "Uploading..." : "Submit QnA"}
      </button>
    </div>
  );
}
