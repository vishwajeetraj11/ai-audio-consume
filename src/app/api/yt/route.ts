
import { NextResponse } from "next/server";
import { YoutubeTranscript } from 'youtube-transcript';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { RetrievalQAChain } from 'langchain/chains';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { PromptTemplate } from 'langchain/prompts';


const model = new ChatOpenAI({ modelName: "gpt-3.5-turbo", openAIApiKey: process.env.OPENAI_API_KEY });
const embeddings = new OpenAIEmbeddings({ openAIApiKey: process.env.OPEN_AI_KEY });
const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 500, chunkOverlap: 0 });

export const POST = async (req: Request, res: Response) => {
    try {
        const body = await req.json();
        const { videoId, query } = body;

        if (!videoId || !query) {
            return NextResponse.json({ status: false, message: "please send both videoId and query string." }, { status: 400 });
        }
        // const videoId = 'fPL5YnDXaYE'
        const yt_transcript = await YoutubeTranscript.fetchTranscript(videoId);
        const readableParagraph = yt_transcript.map(obj => obj.text).join(' ');

        const docs = await textSplitter.createDocuments([readableParagraph]);
        const splitDocs = await textSplitter.splitDocuments(docs);
        const vectorStore = await MemoryVectorStore.fromDocuments(
            splitDocs,
            embeddings
        );
        const template = `Use the following pieces of context to answer the question at the end.
        The provided is a transcript of a youtube video preferrably a podcast.
        If you don't know the answer, just say that you don't know, don't try to make up an answer.
        {context}
        Question: {question}
        Helpful Answer:`;
        const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever(), {
            prompt: PromptTemplate.fromTemplate(template),
        })

        const response = await chain.call({
            query
        });

        return NextResponse.json({ status: true, response }, { status: 200 });
    } catch (e) {
        console.log(e)
        return NextResponse.json({ status: false, message: "Something went wrong." }, { status: 400 });
    }
}