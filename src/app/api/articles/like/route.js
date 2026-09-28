import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req) {
  try {
    const { articleId, likeId } = await req.json();

    if (!articleId || !likeId) {
      return NextResponse.json(
        { error: "articleId and likeId are required" },
        { status: 400 },
      );
    }

    const articleRef = adminDB.collection("articles").doc(articleId);
    const likeRef = articleRef.collection("likes").doc(likeId);

    const result = await adminDB.runTransaction(async (transaction) => {
      const likeSnap = await transaction.get(likeRef);

      if (likeSnap.exists) {
        return { alreadyLiked: true };
      }

      transaction.set(likeRef, {
        createdAt: FieldValue.serverTimestamp(),
      });

      transaction.set(
        articleRef,
        {
          likes: FieldValue.increment(1),
        },
        { merge: true },
      );

      return { alreadyLiked: false };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Article like error:", error);

    return NextResponse.json(
      { error: "Failed to like article" },
      { status: 500 },
    );
  }
}

export async function DELETE(req) {
  try {
    const { articleId, likeId } = await req.json();

    if (!articleId || !likeId) {
      return NextResponse.json(
        { error: "articleId and likeId are required" },
        { status: 400 },
      );
    }

    const articleRef = adminDB.collection("articles").doc(articleId);
    const likeRef = articleRef.collection("likes").doc(likeId);

    const result = await adminDB.runTransaction(async (transaction) => {
      const likeSnap = await transaction.get(likeRef);

      if (!likeSnap.exists) {
        return { alreadyUnliked: true };
      }

      transaction.delete(likeRef);

      transaction.set(
        articleRef,
        {
          likes: FieldValue.increment(-1),
        },
        { merge: true },
      );

      return { alreadyUnliked: false };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Article unlike error:", error);

    return NextResponse.json(
      { error: "Failed to unlike article" },
      { status: 500 },
    );
  }
}
