"use client";

import YoutubeInput from "@/components/YoutubeInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import React, { useState } from "react";
import { useChat } from "ai/react";

type Props = {};
const dd = {
  response: [
    { chapterName: "Economy", timestamps: ["01:46:43,199", "01:46:47,580"] },
    {
      chapterName: "Unlimited Information",
      timestamps: ["01:46:44,300", "01:46:50,040"],
    },
    {
      chapterName: "Struggling to Find Transcendence",
      timestamps: ["01:46:47,580", "01:46:52,320"],
    },
    {
      chapterName: "10 Extra Coordinates",
      timestamps: ["01:26:02,520", "01:26:08,280"],
    },
    {
      chapterName: "Pinched to Zoom",
      timestamps: ["01:26:08,280", "01:26:14,580"],
    },
    {
      chapterName: "Shear to Tilt",
      timestamps: ["01:26:17,159", "01:26:21,239"],
    },
    {
      chapterName: "Fantasizing vs Love",
      timestamps: ["02:52:28,680", "02:52:34,080"],
    },
    {
      chapterName: "Naming of Things",
      timestamps: ["02:52:34,080", "02:52:38,399"],
    },
    {
      chapterName: "Emotions in Life",
      timestamps: ["01:56:54,679", "01:56:59,699"],
    },
    {
      chapterName: "Equal Dosages",
      timestamps: ["01:56:59,699", "01:57:05,040"],
    },
  ],
};
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
        {/* <p>Chapters</p>
        <ul>
          {dd.response.map((chapter, i) => {
            return (
              <div className="flex" key={i}>
                <p>{chapter.chapterName}</p>
                <span className="ml-auto">
                  {chapter.timestamps[0].split(",")[0]}-
                  {chapter.timestamps[1].split(",")[0]}
                </span>
              </div>
            );
          })}
        </ul> */}
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

/*
Ignore the timestamps first make a transcript then use that to separate it into chapters, and now consider the timestamps and Please furnish a JSON response containing a maximum of 10 chapter names that if expanded or asked upon covers the entire subtitles provided. Please keep the chapters a minimum of 2-3 mins long. response format = {response: {chapterName: string, timestamps: [start, end]}[]}
*/
