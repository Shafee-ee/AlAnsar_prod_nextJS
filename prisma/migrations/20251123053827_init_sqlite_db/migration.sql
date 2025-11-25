-- CreateTable
CREATE TABLE "Qna" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "question_kn" TEXT NOT NULL,
    "answer_kn" TEXT NOT NULL,
    "keywords_kn" TEXT NOT NULL,
    "question_en" TEXT,
    "answer_en" TEXT,
    "keywords_en" TEXT
);

-- CreateIndex
CREATE INDEX "Qna_question_en_idx" ON "Qna"("question_en");

-- CreateIndex
CREATE INDEX "Qna_keywords_en_idx" ON "Qna"("keywords_en");
