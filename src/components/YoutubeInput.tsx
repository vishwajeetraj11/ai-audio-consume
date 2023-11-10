import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface YoutubeInputProps {
  ytUrl: string;
  setYtUrl: (url: string) => void;
  setVideoId: (id: string) => void;
  mutateAsync: (params: { videoId: string; query: string }) => void;
  query?: string;
  videoId?: string;
}

const YoutubeInput: React.FC<YoutubeInputProps> = ({
  ytUrl,
  setYtUrl,
  setVideoId,
  mutateAsync,
  query,
  videoId,
}) => {
  return (
    <>
      <Input
        value={ytUrl}
        className="mr-10"
        onChange={(e) => {
          setYtUrl(e.target.value);
          const youtubeUrlRegex =
            /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
          if (e.target.value.match(youtubeUrlRegex)) {
            const urlParams = new URLSearchParams(
              new URL(e.target.value).search
            );
            const videoId = urlParams.get("v");
            console.log(videoId);
            setVideoId(videoId || "");
          }
        }}
      />
      <Button
        className="min-w-fit"
        onClick={() => {
          if (query && videoId) {
            mutateAsync({ videoId, query: query || "" });
          }
        }}
      >
        Generate Transript
      </Button>
    </>
  );
};

export default YoutubeInput;
