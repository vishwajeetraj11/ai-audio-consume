"use client";

import YoutubeInput from "@/components/YoutubeInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import React from "react";
import { useChat } from "ai/react";

type Props = {};
const Page = (props: Props) => {
  const { data, mutateAsync, reset } = useMutation({
    mutationFn: ({ videoId, query }: { videoId: string; query: string }) => {
      return axios.post(`/api/yt`, { videoId, query });
    },
    onSuccess: (data) => {},
  });

  const [videoId, setVideoId] = React.useState("");
  const [ytUrl, setYtUrl] = React.useState("");
  const [query, setQuery] = React.useState("");
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "/api/yt",
    body: { videoId, query },
    onError: (err) => {
      console.log({ err });
    },
    onFinish: (finish) => {
      console.log({ finish });
    },
    onResponse: (res) => {
      console.log({ res });
    },
  });
  console.log(data);
  console.log(messages);
  return (
    <div className="min-h-screen p-10">
      <div className="flex">
        <YoutubeInput
          mutateAsync={mutateAsync}
          setVideoId={setVideoId}
          setYtUrl={setYtUrl}
          ytUrl={ytUrl}
          videoId={videoId}
          query={query}
        />
      </div>

      <div className="flex mt-8 gap-4">
        <div className="w-[50%]">
          {videoId && (
            <iframe
              width="100%"
              height="315"
              src={`https://www.youtube.com/embed/${videoId}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          )}
        </div>
        <div className="w-[50%] flex flex-col">
          {messages.map((message) => {
            return (
              <p
                className="shadow-md px-4 py-2 rounded-md mb-2"
                key={message.id}
                dangerouslySetInnerHTML={{
                  __html:
                    `<span>${
                      message.role === "user" ? "User: " : "AI: "
                    }</span>` + message.content,
                }}
              ></p>
            );
          })}
          <div className="flex w-full gap-4 mt-auto">
            <form className="flex w-full gap-4" onSubmit={handleSubmit}>
              <Input
                className="w-full"
                value={input}
                onChange={handleInputChange}
              />
              <Button className="min-w-fit" type="submit">
                Send
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
