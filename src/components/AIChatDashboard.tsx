/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useChat } from "ai/react";
import MarkdownIt from "markdown-it";
import { Button } from "@/src/components/ui/button";
import { SendIcon } from "lucide-react";
import { Textarea } from "@/src/components/ui/textarea";
import { useState, useRef, useEffect } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuLabel } from "@/src/components/ui/dropdown-menu";
import { getAuth } from "firebase/auth";
import { app } from "@/src/config/FirebaseConfig";
import RobotIcon from "./icons/RobotIcon";
import PersonIcon from "./icons/PersonIcon";
import Image from "next/image";

const md = new MarkdownIt({
  html: true,
  linkify: true,
});

export default function Chat() {
  const [isFirstChat, setIsFirstChat] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<any>(null);
  const { messages, setMessages, input, handleInputChange, handleSubmit, error, reload, isLoading } = useChat({
    keepLastMessageOnError: true,
    api: "/api/chat/manajemen-servis",
  });

  useEffect(() => {
    const authInstance = getAuth(app);
    const unsubscribe = authInstance.onAuthStateChanged((user) => {
      setUser(user || null);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (messages.length === 0 && isFirstChat) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: "Halo! Saya Rani AI dari PUSCOM, asisten pembantu dalam manajemen servis.",
        },
      ]);
      setIsFirstChat(false);
    }
  }, [messages, isFirstChat, setMessages]);

  const handleDelete = (id: string) => {
    setMessages(messages.filter((message) => message.id !== id));
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "40px";
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="fixed bottom-4 right-4 rounded-full w-16 h-16 shadow-lg" variant="secondary" aria-label="Chat AI">
            <RobotIcon className="size-32" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="sm:max-w-[425px] h-[600px] flex flex-col p-0 mr-5">
          <DropdownMenuLabel className="p-4 bg-gray-100 dark:bg-slate-900 dark:text-slate-100">
            <h1 className="text-lg font-semibold">Rani AI</h1>
            <p className="text-sm text-gray-500">Asisten Pembantu Manajemen Servis</p>
          </DropdownMenuLabel>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`group relative max-w-[80%] px-4 py-2 rounded-lg ${message.role === "user" ? "bg-blue-500 text-white dark:bg-blue-600" : "bg-gray-100 dark:bg-slate-800 dark:text-slate-100"}`}>
                  {message.id !== "welcome" && (
                    <button
                      onClick={() => handleDelete(message.id)}
                      className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      ×
                    </button>
                  )}
                  <span className="flex items-center gap-2 mb-1">
                    {message.role ? (
                      <>
                        <RobotIcon className="h-5 w-5" />
                      </>
                    ) : user?.photoURL ? (
                      <>
                        <Image src={user.photoURL} alt={user.displayName} className="h-5 w-5 rounded-full" width={0} height={0} />
                      </>
                    ) : (
                      <>
                        <PersonIcon className="h-5 w-5" />
                      </>
                    )}
                    <h2>{message.role === "user" ? user?.displayName || "User" : "Rani AI"}</h2>
                  </span>
                  <div
                    className="text-sm prose dark:prose-invert max-w-none break-words"
                    dangerouslySetInnerHTML={{
                      __html: md.render(message.content),
                    }}
                  />
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />

            {error && (
              <div className="text-center">
                <p className="text-red-500 dark:text-red-400 text-sm">Terjadi kesalahan</p>
                <Button variant="destructive" size="sm" onClick={() => reload()} className="mt-2">
                  Coba Lagi
                </Button>
              </div>
            )}
            {isLoading && (
              <>
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <div className="animate-pulse flex items-center justify-left gap-2">
                    <h1>Thinking</h1>
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    <div className="h-2 w-2 rounded-full bg-blue-500 animation-delay-200"></div>
                    <div className="h-2 w-2 rounded-full bg-blue-500 animation-delay-400"></div>
                  </div>
                </div>
              </>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-4 border-t dark:border-slate-800">
            <div className="relative flex items-end gap-2">
              <div className="relative flex-1">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Ketik pesan..."
                  disabled={error != null || isLoading}
                  className="pr-24 min-h-[40px] max-h-[200px] resize-none dark:text-slate-100 dark:placeholder:text-slate-400"
                  rows={1}
                />
                <div className="absolute right-2 bottom-2 flex gap-1">
                  <Button type="submit" size="icon" disabled={!input.trim() || isLoading} className="h-7 w-7">
                    <SendIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <p>
              <span className="text-sm text-gray-500">
                Powered by{" "}
                <a href="https://ai.google.dev/docs/gemini_api_overview" className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer">
                  Gemini AI
                </a>
              </span>
            </p>
          </form>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
