import { Answer } from "@/components/Answer/Answer";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { PGChunk } from "@/types";
import {
  IconArrowRight,
  IconExternalLink,
  IconSearch,
} from "@tabler/icons-react";
import endent from "endent";
import Head from "next/head";
import { KeyboardEvent, useEffect, useRef, useState } from "react";

export default function Home() {
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<any>(null);

  const [query, setQuery] = useState<string>("");
  const [chunks, setChunks] = useState<PGChunk[]>([]);
  const [answer, setAnswer] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [mode, setMode] = useState<"search" | "chat">("chat");
  const [matchCount, setMatchCount] = useState<number>(5);
  const [apiKey, setApiKey] = useState<string>("");
  const [userChat, setUserChat] = useState<Object[]>([]);

  useEffect(() => {
    containerRef.current!.scrollTop = containerRef.current!.scrollHeight;
  }, [userChat]);

  const handleSearch = async () => {
    if (!apiKey) {
      alert("Please enter an API key.");
      return;
    }

    if (!query) {
      alert("Please enter a query.");
      return;
    }

    setAnswer("");
    setChunks([]);

    setLoading(true);

    const searchResponse = await fetch("/api/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, apiKey, matches: matchCount }),
    });

    if (!searchResponse.ok) {
      setLoading(false);
      throw new Error(searchResponse.statusText);
    }

    const results: PGChunk[] = await searchResponse.json();

    setChunks(results);

    setLoading(false);

    inputRef.current?.focus();

    return results;
  };

  const handleAnswer = async () => {
    // if (!apiKey) {
    //   alert("Please enter an API key.");
    //   return;
    // }

    // if (!query) {
    //   alert("Please enter a query.");
    //   return;
    // }

    const myChat = [...userChat];
    myChat.push({ user: "me", message: query });
    setUserChat(myChat);
    setAnswer("");
    setChunks([]);

    setLoading(true);

    const searchResponse = await fetch("/api/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, apiKey, matches: matchCount }),
    });

    if (!searchResponse.ok) {
      setLoading(false);
      throw new Error(searchResponse.statusText);
    }

    const results: PGChunk[] = await searchResponse.json();

    setChunks(results);

    const prompt = endent`
    Use the following passages to provide an answer to the query: "${query}"

    ${results?.map((d: any) => d.content).join("\n\n")}
    `;

    const answerResponse = await fetch("/api/answer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt, apiKey }),
    });

    if (!answerResponse.ok) {
      setLoading(false);
      throw new Error(answerResponse.statusText);
    }

    const data = answerResponse.body;

    if (!data) {
      return;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;
    let modelResponse = "";

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      modelResponse += chunkValue;
    }
    setLoading(false);
    setAnswer(modelResponse);
    myChat.push({ user: "model", message: modelResponse });
    setUserChat(myChat);

    inputRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (mode === "search") {
        handleSearch();
      } else {
        handleAnswer();
      }
    }
  };

  const handleSave = () => {
    if (51 !== 51) {
      alert("Please enter a valid API key.");
      return;
    }

    localStorage.setItem("PG_KEY", apiKey);
    localStorage.setItem("PG_MATCH_COUNT", matchCount.toString());
    localStorage.setItem("PG_MODE", mode);

    setShowSettings(false);
    inputRef.current?.focus();
  };

  const handleClear = () => {
    localStorage.removeItem("PG_KEY");
    localStorage.removeItem("PG_MATCH_COUNT");
    localStorage.removeItem("PG_MODE");

    setApiKey("");
    setMatchCount(5);
    setMode("search");
  };

  useEffect(() => {
    if (matchCount > 10) {
      setMatchCount(10);
    } else if (matchCount < 1) {
      setMatchCount(1);
    }
  }, [matchCount]);

  useEffect(() => {
    const PG_KEY = localStorage.getItem("PG_KEY");
    const PG_MATCH_COUNT = localStorage.getItem("PG_MATCH_COUNT");
    const PG_MODE = localStorage.getItem("PG_MODE");

    if (PG_KEY) {
      setApiKey("");
    }

    if (PG_MATCH_COUNT) {
      setMatchCount(parseInt(PG_MATCH_COUNT));
    }

    if (PG_MODE) {
      setMode(PG_MODE as "search" | "chat");
    }

    inputRef.current?.focus();
  }, []);

  return (
    <>
      <Head>
        <title>Turtle Brain</title>
        <meta name="description" content={`AI-powered chat`} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex flex-col h-screen">
        <Navbar />
        <div className="flex-1 overflow-auto">
          <div className="mx-auto flex h-full w-full max-w-[750px] flex-col items-center px-3 pt-4 pb-4 sm:pt-8">
            <div
              ref={containerRef}
              className="mt-1"
              style={{
                width: "100%",
                height: "90vh",
                marginBottom: "10px",
                overflowY: "auto",
                overflowX: "hidden",
                borderRadius: "7px",
              }}
            >
              {/* <div className="font-bold text-2xl mb-2">Answer</div> */}
              {/* {userChat.length ? ( */}
              <Answer text={answer} userChat={userChat} loading={loading} />
              {/* ) : null} */}
            </div>
            {/* <button
              className="mt-4 flex cursor-pointer items-center space-x-2 rounded-full border border-zinc-600 px-3 py-1 text-sm hover:opacity-50"
              onClick={() => setShowSettings(!showSettings)}
            >
              {showSettings ? "Hide" : "Show"} Settings
            </button> */}

            {/* {showSettings && (
              <div className="w-[340px] sm:w-[400px]">

                <div className="mt-2">
                  <div>OpenAI API Key</div>
                  <input
                    type="password"
                    placeholder="OpenAI API Key"
                    className="max-w-[400px] block w-full rounded-md border border-gray-300 p-2 text-black shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
                    value={apiKey}
                    onChange={(e) => {
                      setApiKey(e.target.value);

                      if (e.target.value.length !== 51) {
                        setShowSettings(true);
                      }
                    }}
                  />
                </div>

                <div className="mt-4 flex space-x-2 justify-center">
                  <div
                    className="flex cursor-pointer items-center space-x-2 rounded-full bg-green-500 px-3 py-1 text-sm text-white hover:bg-green-600"
                    onClick={handleSave}
                  >
                    Save
                  </div>

                  <div
                    className="flex cursor-pointer items-center space-x-2 rounded-full bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600"
                    onClick={handleClear}
                  >
                    Clear
                  </div>
                </div>
              </div>
            )} */}

            <div className="relative w-full">
              <IconSearch className="absolute top-3 w-10 left-1 h-6 rounded-full opacity-50 sm:left-3 sm:top-4 sm:h-8" />

              <input
                ref={inputRef}
                className="h-12 w-full border pr-12 pl-11 focus:border-zinc-800 focus:ring-1 sm:h-16 sm:py-2 sm:pr-16 sm:pl-16 sm:text-lg"
                style={{ borderRadius: "5px" }}
                type="text"
                placeholder="What’s the benefits of strength training?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
              />

              <button>
                <IconArrowRight
                  onClick={mode === "search" ? handleSearch : handleAnswer}
                  className="absolute right-2 top-2.5 h-7 w-7 rounded-full bg-blue-500 p-1 hover:cursor-pointer hover:bg-blue-600 sm:right-3 sm:top-3 sm:h-10 sm:w-10 text-white"
                />
              </button>
            </div>

            {
              // loading ? (
              //   <div className="mt-6 w-full">
              //     {"chat" == "chat" && (
              //       <>
              //         {/* <div className="font-bold text-2xl">Answer</div> */}
              //         <div className="animate-pulse mt-2">
              //           <div className="h-4 bg-gray-300 rounded"></div>
              //           <div className="h-4 bg-gray-300 rounded mt-2"></div>
              //           <div className="h-4 bg-gray-300 rounded mt-2"></div>
              //           <div className="h-4 bg-gray-300 rounded mt-2"></div>
              //           <div className="h-4 bg-gray-300 rounded mt-2"></div>
              //         </div>
              //       </>
              //     )}
              //   </div>
              // ) :
              // answer ? (
              //   <div className="mt-6">
              //     {/* <div className="font-bold text-2xl mb-2">Answer</div> */}
              //     <Answer text={answer} userChat={userChat} />
              //   </div>
              // ) : chunks.length > 0 ? (
              //   <div className="mt-6 pb-16">
              //     <div className="font-bold text-2xl">Passages</div>
              //     {chunks.map((chunk, index) => (
              //       <div key={index}>
              //         <div className="mt-4 border border-zinc-600 rounded-lg p-4">
              //           <div className="flex justify-between">
              //             <div>
              //               <div className="font-bold text-xl">
              //                 {chunk.essay_title}
              //               </div>
              //               <div className="mt-1 font-bold text-sm">
              //                 {chunk.essay_date}
              //               </div>
              //             </div>
              //             <a
              //               className="hover:opacity-50 ml-2"
              //               href={chunk.essay_url}
              //               target="_blank"
              //               rel="noreferrer"
              //             >
              //               <IconExternalLink />
              //             </a>
              //           </div>
              //           <div className="mt-2">{chunk.content}</div>
              //         </div>
              //       </div>
              //     ))}
              //   </div>
              // ) : (
              //   <div className="mt-6 text-center text-lg">{`AI-powered search & chat`}</div>
              // )
            }
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}
