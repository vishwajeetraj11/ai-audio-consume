"use client";

import YoutubeInput from "@/components/YoutubeInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import React, { useState } from "react";
import { useChat } from "ai/react";

type Props = {};
const Page = (props: Props) => {
  const { data: hData, mutateAsync: hMutateAsync } = useMutation({
    mutationFn: ({
      videoId,
      query,
      urlParam,
    }: {
      videoId: string;
      query?: string;
      urlParam?: string;
    }) => {
      return axios.post(`/api/yt?${urlParam}`, { videoId, query });
    },

    onSuccess: (data) => {
      console.log(data);
    },
  });

  const {
    data: sData,
    mutateAsync: sMutateAsync,
    reset,
  } = useMutation({
    mutationFn: ({
      videoId,
      query,
      urlParam,
    }: {
      videoId: string;
      query?: string;
      urlParam?: string;
    }) => {
      return axios.post(`/api/yt?${urlParam}`, { videoId, query });
    },
    onSuccess: (data) => {
      console.log(data);
    },
  });

  const [videoId, setVideoId] = React.useState("");
  const [ytUrl, setYtUrl] = React.useState("");
  const [query, setQuery] = React.useState("");

  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: "/api/yt",
      body: { videoId, query },
    });

  const onClick = () => {
    if (videoId) {
      hMutateAsync({ videoId, urlParam: "highlight" });
      sMutateAsync({ videoId, urlParam: "summary" });
    }
  };
  console.log(hData);
  return (
    <div className="min-h-screen p-10">
      <div className="flex">
        <YoutubeInput
          mutateAsync={hMutateAsync}
          setVideoId={setVideoId}
          setYtUrl={setYtUrl}
          ytUrl={ytUrl}
          videoId={videoId}
          query={query}
          onClick={onClick}
        />
      </div>

      <div className="flex mt-8 gap-4 overflow-hidden">
        <div className="w-[50%]">
          {videoId && (
            <iframe
              width="100%"
              height="500"
              src={`https://www.youtube.com/embed/${videoId}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          )}
        </div>
        <div className="w-[50%] flex flex-col relative pb-[50px] h-min overflow-hidden">
          <div className="overflow-scroll">
            {messages.map((message) => {
              return (
                <p
                  className="shadow-md mx-2 my-1 px-4 py-2 rounded-md mb-2"
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
            {isLoading ? <p>Loading...</p> : null}
          </div>
          <div className="flex w-full p-2 gap-4 mt-auto absolute bottom-0">
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
      <div>
        <p>Highlights</p>
        <ul>
          {hData
            ? hData?.data?.text?.map((highlight: any, i: number) => {
                return <li key={i}>{highlight}</li>;
              })
            : null}
        </ul>
        <p>Summary</p>
        {sData?.data?.text}
      </div>
    </div>
  );
};

export default Page;
