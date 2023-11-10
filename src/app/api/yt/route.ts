
import { NextResponse } from "next/server";
import { YoutubeTranscript } from 'youtube-transcript';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { RetrievalQAChain } from 'langchain/chains';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { PromptTemplate } from 'langchain/prompts';
import { Message as VercelChatMessage, StreamingTextResponse } from 'ai';
import { BytesOutputParser } from 'langchain/schema/output_parser';
// export const runtime = 'edge';

const model = new ChatOpenAI({ modelName: "gpt-3.5-turbo", openAIApiKey: process.env.OPENAI_API_KEY });
const embeddings = new OpenAIEmbeddings({ openAIApiKey: process.env.OPEN_AI_KEY });
const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 500, chunkOverlap: 0 });

const formatMessage = (message: VercelChatMessage) => {
    return `${message.role}: ${message.content}`;
};

const template = `Use the following pieces of context to answer the question at the end.
  The provided is a transcript of a youtube video preferrably a podcast.
  If you don't know the answer, just say that you don't know, don't try to make up an answer.
  {context}
  User: {question}
  AI:`;

const cache: any = {

}

const vectorStoreCache: any = {

}


export const POST = async (req: Request, res: Response) => {
    try {
        const body = await req.json();
        const { videoId } = body;
        const messages = body.messages ?? [];
        const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage);
        const currentMessageContent = messages[messages.length - 1].content;

        if (!videoId) {
            return NextResponse.json({ status: false, message: "please send both videoId and query string." }, { status: 400 });
        }
        let readableParagraph = ''
        // const videoId = 'fPL5YnDXaYE'
        if (!cache[videoId]) {
            const yt_transcript = await YoutubeTranscript.fetchTranscript(videoId);
            readableParagraph = yt_transcript.map(obj => obj.text).join(' ');
            cache[videoId] = readableParagraph;
        } else {
            readableParagraph = cache[videoId];
        }
        const docs = await textSplitter.createDocuments([readableParagraph]);
        const splitDocs = await textSplitter.splitDocuments(docs);

        // if (!vectorStoreCache[videoId]) {
        const vectorStore = await MemoryVectorStore.fromDocuments(
            splitDocs,
            embeddings
        );
        //     vectorStoreCache[videoId] = createStore;
        // } else {
        //     vectorStore = vectorStoreCache[videoId];
        // }

        const outputParser = new BytesOutputParser();

        const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever(), {
            prompt: PromptTemplate.fromTemplate(template),
        });

        const res = await chain.call({
            query: currentMessageContent,
            chat_history: formattedPreviousMessages.join('\n'),
        });

        return new StreamingTextResponse(await outputParser.stream(res.text));
    } catch (e) {
        console.log(e)
        return NextResponse.json({ status: false, message: "Something went wrong." }, { status: 400 });
    }
}
// export const POST = async (req: Request, res: Response) => {
//     try {
//         const body = await req.json();
//         const { videoId, messages } = body;
//         const query = messages[0].content;
//         if (!videoId || !query) {
//             return NextResponse.json({ status: false, message: "please send both videoId and query string." }, { status: 400 });
//         }
//         // const videoId = 'fPL5YnDXaYE'
//         const yt_transcript = await YoutubeTranscript.fetchTranscript(videoId);
//         const readableParagraph = yt_transcript.map(obj => obj.text).join(' ');

//         const docs = await textSplitter.createDocuments([readableParagraph]);
//         const splitDocs = await textSplitter.splitDocuments(docs);
//         const vectorStore = await MemoryVectorStore.fromDocuments(
//             splitDocs,
//             embeddings
//         );
//         const template = `Use the following pieces of context to answer the question at the end.
//         The provided is a transcript of a youtube video preferrably a podcast.
//         If you don't know the answer, just say that you don't know, don't try to make up an answer.
//         {context}
//         User: {question}
//         AI:`;
//         const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever(), {
//             prompt: PromptTemplate.fromTemplate(template),
//         })

//         const stream = await chain.stream({
//             query,
//         });
//         // const stream = await chain.call({
//         //     query,
//         // });

//         // return NextResponse.json({ status: true, text: response.text, id: v4() }, { status: 200 });
//         return new StreamingTextResponse(stream);
//     } catch (e) {
//         console.log(e)
//         return NextResponse.json({ status: false, message: "Something went wrong." }, { status: 400 });
//     }
// }