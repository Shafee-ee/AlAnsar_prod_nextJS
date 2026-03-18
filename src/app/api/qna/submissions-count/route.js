import {NextResponse} from "next/server";
import { adminDB } from "@/lib/firebaseAdmin";

export async function GET(){
    try{
        const snapshot = await adminDB
        .collection("qna_submissions")
        .where("status","==","pending")
        .get();
       return NextResponse.json({
        count:snapshot.size
       })
    }
    catch(err){
        console.error("Count fetch error:",err)
        return NextResponse.json(
            {error:"Failed to fetch count"},
            {status:500}
        )
    }

} 