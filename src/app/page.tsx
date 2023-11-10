"use client";
import Image from "next/image";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios, { AxiosResponse } from "axios";

export default function Home() {
  const {
    data,
    error,
    isError,
    isIdle,
    isLoading,
    isPaused,
    isSuccess,
    failureCount,
    failureReason,
    mutate,
    mutateAsync,
    reset,
    status,
  } = useMutation({
    mutationFn: async (variables: { file: File }) => {
      const formData = new FormData();
      formData.append("file", variables.file);
      return axios.post("/api/transcript", formData, {});
    },
  });

  const invokeFileInput = () => {
    const fileInput = document.getElementById("file-input");
    fileInput?.click();
  };

  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    mutateAsync(
      { file },
      {
        onSettled: () => {},
        onSuccess: ({ data: { text } }) => {
          console.log(text);
        },
        onError: () => {},
      }
    );
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {data?.data?.text}
      <input
        id="file-input"
        className="hidden"
        type="file"
        onChange={onFileChange}
        placeholder="Upload File"
      />
      <button onClick={invokeFileInput} type="button">
        Add file
      </button>
    </main>
  );
}

const transcript = `The Joe Rogan Experience. Look at North Korea. Mm-hmm. That's the best example. You know, if you want to see a state where, I mean, we have very little news from there. Very few people get out, but the ones that do, it's... Horrific. George Orwell's 1984, it's happening right now. Somewhere. Yeah. I mean, I kind of thought that was like an interesting idea on America's original sin is slavery. And there's no way to change the past. But one thing you could do, if you can't work out reparations, and people don't seem to be able to work out what to do with that, but one thing you could do is make America's foreign policy, why don't we just stop slavery? Who couldn't get behind that? Right. Globally, to say, well, just, you've got an incredible military. There's injustice going on in the world. That idea of being the world's policeman, I don't know, I mean, freeing slaves? Who could disagree with that? Well... Who's putting up a case against it? The problem is that you're addressing the way the United States interfaces with the world as if we're just trying to do overall good. That's not really what happens with this whole empire building thing. What's really going on is controlling resources and coming up with some reason that you have to intervene in order to acquire these resources or control these resources or protect your resources. I think it's... You know what I think that is? Short money. Mm-hmm. Short money. Because what's a resource? There's things that are resources now that won't be in 20 years. You know what the biggest industry in the world was in 1903? Beavers. Very close. I'll give you a... I'll pass you. I'll give you a C. Whaling was the biggest industry in the world in 1903, and whaling disappeared overnight. Like in a year and a half, it was gone. Those towns were just emptied because the whale oil wasn't required anymore. Suddenly, we discovered petrochemicals. Electricity, too. Petrochemicals was really the thing. Yeah. Whale oil, electricity, Edison, all of that stuff for Tesla. It's really interesting how that industry just fell away. It's like the story of horse manure in New York City. You know this? No. So horse manure... You know why the brownstones have got steps up to the front door? You ever wondered about that? Why is the ground floor not on the ground floor? Why is it up steps? Why? Horseshit. Why? There was horseshit everywhere. They've always got those metal scrapers by the side. Yeah. To get the horseshit off. You know the old movies? They always talk about smelling salts. There's a lot of references to smelling salts. Yeah. The smell was horrific. If a horse died in the street, you had to wait for it to atrophy to cut it up and take it away. New York was the sound. Cobbled streets, metal wheels on the carts. Horses everywhere. So they made a law to say, right, horses, we're going to put a tax on them. It didn't change anything. Made another law the next year. We're doubling the taxes. Right. We're going to do a thing with, we're going to say, if you have a horse, then you have to do this, you have to do that. Whatever it was. It kept on, kept on, kept on. And what stopped it? Henry Ford. Cars came along. All gone. There's five of them left in Central Park. Right. All gone in no time. Whaling disappeared over the night. That thing of like, what's a resource now? America trying to get resources overseas. I mean, I don't want to sound like a Boy Scout, but I think freeing slaves would be a much better thing to do than trying to get control of an oil field somewhere where you go, that's not going to be a resource in 10 years time. Yeah. The problem is it's a resource now. And it's a phenomenal one in terms of the amount of money that you could acquire. But I mean, cobalt wasn't a resource. Right. 20 years ago. Right. Now we really need cobalt. And suddenly, I mean, the things that are happening to get it are just horrific. Yeah. I had Siddharth Kaur on the podcast. He's a journalist that went to the Congo to document this and brought back video footage. The Democratic Republic of Congo. Any country with democratic in the name, that's a fucking red flag, isn't it? That's a red flag. They go, hey, we're democratic. Are you though? Are you? Yeah. Yeah. It's I mean, it's it's hell on earth out there. It's happening right now. I think that thing of like people saying, well, I would I would go and make a difference. Well, there's stuff going on now if you want to get involved. Well, what's so ironic is that it's one of the most horrific conditions that human beings are imposed that's imposed upon human beings. But yet it is required in order for you to have a cell phone and complain about the injustices of the world. Every single person that has one of these things, you have in it minerals that were carved out of the ground by people living in the most child labor, slavery, I mean, slavery and not just that, like people with babies on their back that are breathing in this cobalt dust, horrific health consequences, everything, all the above abject poverty, no electricity. I mean, here's the big thing in the I mean, again, gratitude. Go back to gratitude. We don't live there. Anyone listening to a podcast is, you know, we're doing great. What can we do about it? I don't know. I mean, this is part of the anxiety of the modern world because we're surrounded by problems, told about problems that we can we have no agency there. We can't sort of do anything. But it's I don't know. I mean, it's what's going to be the next resource? Because environmentalism is clearly there, right? Yeah. This fossil fuels. It needs to stop. But we've already got the downside volatility from splitting the atom. We've already got all the weapons. We could already destroy the world. We've got all of that. Why are we not building? And the tests have been done, right? There's nuclear submarines. You know, the ranges on a nuclear submarine. That's insane. It's unlimited. It's unlimited. They can go forever. I mean, it's it's crazy. Why isn't every town powered by one of those? Yes. Well, people have this bad taste in their mouth because of the few disasters that have existed when nuclear power was not Fukushima. Right. Yeah. What's the death toll on Fukushima? It's very low. But I think it might be nothing. I think it's one person. But the the toxic environmental effect of them not being able to shut down that reactor is pretty devastating. Yeah. I tell you what it's not as devastating as. Fossil fuels. So it's it's as opposed to what is always burning coal. Right. So burning coal. Endlessly burning coal. Yeah. And anyone that says the environmental problem can be fixed by us cutting back is living in a dream world. Right. You can't deny like that. We owe a debt to future generations and we owe a debt to people that are in different geographies to us. Like there's no way you can say with good conscience, well, you need to cut back China and India. You. I mean, most people in the world, a third of third of all, don't have flushing toilets. Right. Like they're living in poverty. So the idea that they won't need energy is insane. Insane. We've nailed the technology and we just never. We got we got nervous. But it's worse than that. Germany shut down their nuclear power plants. I mean, people shut them down because there's this there's this negative connotation. This is negative association that people have with nuclear. Well, I mean, I don't know about. I'm not an expert, but Fukushima, I think, was a 40 year old. Yeah. Technology. Yes. I mean, I can't understand why, like the big oil companies. Why isn't someone like instead of just going, you've got to every time there's an oil spill, you've got to clean up the seabirds better or, you know, the Gulf of Mexico disaster was horrific. What happened? You go. Why don't you just say you've got to invest half of your profits in nuclear? Take it private. Private seems to get things done quicker than governments. Yeah. The real problem is there's still an insane amount of money to be made from fossil fuels. There's a desire for it and there's a market for it and people are already making money doing it. I don't know, though. But OK. So if you want ants, put down sugar. The incentives need to be there. So yeah. So let's put down some BP could be the next traditional oil major to invest in a quickly evolving nuclear fusion sector. I mean, join a list of companies, including Chevron, E&I and. But that happened after I said it. Right. I said what? Three months ago. I changed the date, Jesus. That would. I think that's kind of because those guys you go, would you buy stock in Shell Oil today? I wouldn't. Because if you if you're buying stocks and you said, look, I'm going to leave my kids a bunch of stocks and shares. What do I think is going to be there in 30 years time? Yeah, I'm sure. And I don't know whether it'll be like someone gluing themselves to a jumbo jet. I think it's going to be it's going to be someone goes, there's more money to be made, like in New York with Henry Ford and like the whaling industry. You know, those guys want to make money. They went and they worked for Rockefeller.`;
