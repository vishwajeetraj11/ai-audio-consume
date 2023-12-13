
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
import { URL } from "url";

// const model = new ChatOpenAI({ modelName: "gpt-3.5-turbo", openAIApiKey: process.env.OPENAI_API_KEY });
const model = new ChatOpenAI({ modelName: "gpt-4", openAIApiKey: process.env.OPENAI_API_KEY });
const embeddings = new OpenAIEmbeddings({ openAIApiKey: process.env.OPEN_AI_KEY });
const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 500, chunkOverlap: 0 });

const formatMessage = (message: VercelChatMessage) => {
    return `${message.role}: ${message.content}`;
};

const template = `Use the following pieces of context to answer the question at the end.
  The provided is a transcript of a youtube video preferrably a podcast.
  Please provide the result without mentioning this is a transcript.
  If you don't know the answer, just say that you don't know, don't try to make up an answer.
  {context}
  User: {question}
  AI:`;

const highlightQuery = `Please furnish a JSON response containing a maximum of 10 noteworthy points extracted from the transcript. Just an array of strings. These highlights should be valuable and easily comprehensible for an average user. If there are no substantial highlights, provide at least one highlight as an array of strings. Ensure that any requests pertaining to subscriptions or follows are excluded from the highlighted content, emphasizing key insights or surprising findings.`

const summaryQuery = `Please provide summary, The summary should capture the key insights, main points, or significant findings. If applicable, provide a brief overview of the context or purpose of the content. Limit the summary to a maximum of 10 sentences for brevity. Exclude any promotional or subscription-related information from the summary. If the content covers multiple topics or sections, ensure that the summary offers a well-rounded representation. Additionally, if there are specific terms or phrases to be highlighted or avoided, please adhere to those preferences in the summary.`

// const chaptersQuery = `Please furnish a JSON response containing an array of strings named "chapters", maximum of 10 chapter names that if expanded or asked upon covers the entire transcript provided. as an array of strings.`
const chaptersQuery = `Please furnish a JSON response containing maximum of 10 chapter names that if expanded or asked upon covers the entire transcript provided. as an array of strings.`

/*
Get chapters with timestamps;
Make 4 important chapters out of the subtitles and also provide the timestamps from where to where that thing is discussed.


*/
let cache: any = {

}

function msToTimecode(milliseconds: any) {
    const ms = milliseconds % 1000,
        sec = Math.floor((milliseconds / 1000) % 60),
        min = Math.floor((milliseconds / (1000 * 60)) % 60),
        hour = Math.floor((milliseconds / (1000 * 60 * 60)) % 24);

    return `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
}

function transcriptsToSRT(transcripts: any[]) {
    let srtContent = '';

    transcripts.forEach((transcript, index) => {
        const startTime = msToTimecode(transcript.offset);
        const endTime = msToTimecode(transcript.offset + transcript.duration);

        srtContent += `${index + 1}\n`;
        srtContent += `${startTime} --> ${endTime}\n`;
        srtContent += `${transcript.text}\n\n`;
    });

    return srtContent.trim();
}
export const POST = async (req: Request, res: Response) => {
    try {
        const body = await req.json();
        const url = new URL(req.url);
        const searchParams = new URLSearchParams(url.search);
        const highlight = searchParams.has('highlight');
        const summary = searchParams.has('summary');
        const chapters = searchParams.has('chapters');
        const chapterName = searchParams.get('chapterName');
        const { videoId } = body;
        const messages = body.messages ?? [];
        const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage);
        const currentMessageContent = highlight
            ? highlightQuery
            : summary
                ? summaryQuery
                : chapters
                    ? chaptersQuery
                    : messages[messages.length - 1].content;

        if (!videoId) {
            return NextResponse.json({ status: false, message: "please send both videoId and query string." }, { status: 400 });
        }
        let readableParagraph = ''
        // const videoId = 'fPL5YnDXaYE'
        if (Object.entries(cache).length > 30) {
            cache = {}
        }
        if (!cache[videoId]) {
            const yt_transcript = await YoutubeTranscript.fetchTranscript(videoId);
            readableParagraph = yt_transcript.map(obj => obj.text).join(' ');
            // const subtitles = transcriptsToSRT(yt_transcript);
            // readableParagraph = subtitles;
            cache[videoId] = readableParagraph;
            // cache[videoId] = subtitles;
        } else {
            readableParagraph = cache[videoId];
        }
        const docs = await textSplitter.createDocuments([readableParagraph]);
        const splitDocs = await textSplitter.splitDocuments(docs);

        const vectorStore = await MemoryVectorStore.fromDocuments(
            splitDocs,
            embeddings
        );

        const outputParser = new BytesOutputParser();

        const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever(), {
            prompt: PromptTemplate.fromTemplate(template),
        });

        const res = await chain.call({
            query: currentMessageContent,

            chat_history: formattedPreviousMessages.join('\n'),
        });
        console.log(res)
        if (highlight) {
            let json = res.text;
            try {
                json = JSON.parse(json);
            } catch (e) {
                console.log(e)
                json = {};
            }
            return NextResponse.json({ text: json }, { status: 200 })
        }

        if (summary) {
            return NextResponse.json({ text: res.text }, { status: 200 })
        }

        return new StreamingTextResponse(await outputParser.stream(res.text));
    } catch (e: unknown) {
        let message = "Something went wrong."
        if (typeof e === 'object' && e && 'message' in e && typeof e.message === 'string' && e.message?.includes('Transcript is disabled on this video')) {
            message = 'Transcript disabled in the video.'
        }
        return NextResponse.json({ status: false, message }, { status: 400 });
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