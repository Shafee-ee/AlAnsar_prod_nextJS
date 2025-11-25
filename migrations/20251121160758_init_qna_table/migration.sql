-- CreateTable
CREATE TABLE "QnA" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "question_kn" TEXT NOT NULL,
    "answer_kn" TEXT NOT NULL,
    "keywords_kn" TEXT NOT NULL,
    "question_en" TEXT NOT NULL,
    "answer_en" TEXT NOT NULL,
    "keywords_en" TEXT[],

    CONSTRAINT "QnA_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QnA_question_en_idx" ON "QnA"("question_en");

-- CreateIndex
CREATE INDEX "QnA_keywords_en_idx" ON "QnA"("keywords_en");
