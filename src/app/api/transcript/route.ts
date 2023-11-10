import { getAudioTranscript, getTranscriptEmbeddings } from "@/lib/openai";
import { NextResponse } from "next/server"



export const POST = async (req: Request, res: Response) => {
    try {
        const body = await req.formData();
        const file: File | null = body.get('file') as File;
        if (!file) {
            return NextResponse.json({ status: false, message: "File not found." }, { status: 400 });
        }
        const text = await getAudioTranscript(file);
        if (text) {
            const embeddings = await getTranscriptEmbeddings(text);
            console.log(embeddings)
        }
        return NextResponse.json({ status: true, text }, { status: 200 });
    } catch (e) {
        console.log(e)
        return NextResponse.json({ status: false, message: "Something went wrong." }, { status: 400 });
    }
}