// "use client";

import React from "react";
import yt, { YoutubeTranscript } from "youtube-transcript";

type Props = {};
const Page = (props: Props) => {
  const url = `https://www.youtube.com/watch?v=0KmqnxXYJvA`;
  // https://www.youtube.com/watch?v=fPL5YnDXaYE&t=1342s
  YoutubeTranscript.fetchTranscript(
    `https://www.youtube.com/watch?v=fPL5YnDXaYE`,
    {}
  ).then((res) => {
    let final = "";
    res.forEach((item) => {
      // if (final.endsWith(".") || final.endsWith(",")) {
      final += " " + item.text;
      // } else {
      // final += item.text;
      // }
    });
    console.log(final);
  });

  return <div>page</div>;
};

export default Page;
