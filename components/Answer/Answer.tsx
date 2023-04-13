import React, { useEffect, useState, useRef } from "react";
import styles from "./answer.module.css";
import abc from "./output-onlinegiftools.gif";
import Image from "next/image";

interface AnswerProps {
  text: string;
  userChat: any;
  loading: any;
}

interface ChatInterface {
  user: string;
  message: string;
}

export const Answer: React.FC<AnswerProps> = ({ text, userChat, loading }) => {
  const containerRef = useRef<any>(null);
  const [words, setWords] = useState<string[]>([]);

  useEffect(() => {
    console.log(userChat);
    setWords(text.split(" "));
    containerRef.current!.scrollTop = containerRef.current!.scrollHeight;
  }, [text, userChat]);

  return (
    <div className={styles.answerContainer} ref={containerRef}>
      {/* {words.map((word, index) => (
        <span
          key={index}
          className={styles.fadeIn}
          style={{ animationDelay: `${index * 0.01}s` }}
        >
          {word}{" "}
        </span>
      ))} */}
      {userChat.map((word: any, index: any) => (
        <div
          key={index}
          style={{
            alignSelf: `${word.user === "me" ? "flex-end" : "flex-start"}`,
            backgroundColor: `${word.user === "me" ? "#0084FF" : "#E3E6EA"}`,
            color: `${word.user === "me" ? "#fff" : "#000"}`,
            borderRadius: "5px",
            padding: "5px",
            maxWidth: "80%",
            display: "inline-block",
          }}
        >
          <span
            key={index}
            className={`${styles.fadeIn} ${styles.messageMe}`}
            style={{ animationDelay: `${index * 0.01}s`, textAlign: "center" }}
          >
            {word.message}
            <br />
          </span>
        </div>
      ))}
      {loading && (
        <div>
          <Image
            src={abc}
            alt="none"
            style={{ height: "50px", width: "90px" }}
          />
        </div>
      )}
      {/* <div className={styles.chatContainer}>
        <p>{words}</p>
      </div> */}
    </div>
  );
};
