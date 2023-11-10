import OpenAI from "openai";


const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const getAudioTranscript = async (file: File) => {
    try {
        const { text } = await openai.audio.transcriptions.create({
            file,
            model: 'whisper-1',
            response_format: 'json'
        })
        return text
    } catch (e) {
        console.log("failed to get transcript.", e);
    }
}

export const getTranscriptEmbeddings = async (text: string) => {
    try {
        const { data } = await openai.embeddings.create({
            input: text.replace(/\n/g, ' '),
            model: 'text-embedding-ada-002',
        })
        return data?.[0].embedding;
    } catch (e) {
        console.log("failed to get transcript embeddings.", e);
    }
}