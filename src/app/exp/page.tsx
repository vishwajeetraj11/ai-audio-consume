"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";

type Props = {};

const Page = (props: Props) => {
  const [breeds, setBreeds] = useState<any[]>();

  const getBreeds = async () => {
    const { data } = await axios.get("https://dog.ceo/api/breeds/list/all");
    const arr = Object.entries(data.message);
    setBreeds(arr);
  };

  useEffect(() => {
    getBreeds();
  }, []);

  return (
    <div>
      {breeds?.map((breed, i) => {
        const [_breed, subBreeds] = breed;
        return <Breeds subBreeds={subBreeds} breed={_breed} key={i} />;
      })}
    </div>
  );
};

const Breeds = ({
  breed,
  subBreeds,
  currentBreed,
}: {
  breed: string;
  subBreeds?: string[];
  currentBreed?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [randomImage, setRandomImage] = useState("");

  const onClick = (breed: string) => {
    if (subBreeds) {
      if (subBreeds?.length === 0) {
        getRandomImage(breed);
      } else {
        setIsOpen((p) => !p);
      }
    } else {
      getRandomImage(breed);
    }
  };

  const getRandomImage = async (breed: string) => {
    const { data } = await axios.get(
      currentBreed
        ? `https://dog.ceo/api/breed/${currentBreed}/${breed}/images/random`
        : `https://dog.ceo/api/breed/${breed}/images/random`
    );
    setRandomImage(data.message);
  };

  return (
    <div>
      <button onClick={() => onClick(breed)} type="button">
        {breed}
      </button>
      {isOpen ? (
        <div className="ml-3">
          {subBreeds?.map((subbreed, i) => (
            <Breeds currentBreed={breed} breed={subbreed} key={i} />
          ))}
        </div>
      ) : null}
      {randomImage ? (
        <img
          className="w-40 h-40 object-cover"
          src={randomImage}
          alt="random"
        />
      ) : null}
    </div>
  );
};

const SubBreed = () => {};

export default Page;
