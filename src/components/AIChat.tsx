/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useChat } from "ai/react";
import MarkdownIt from "markdown-it";
import { Button } from "@/src/components/ui/button";
import { SparklesIcon, SendIcon, Brain } from "lucide-react";
import { Textarea } from "@/src/components/ui/textarea";
import { useState, useRef, useEffect, useCallback } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel } from "@/src/components/ui/dropdown-menu";

import RobotIcon from "./icons/RobotIcon";
import PersonIcon from "./icons/PersonIcon";

const md = new MarkdownIt({
  html: true,
  linkify: true,
});

const PROMPTS = [
  {
    id: "spek",
    title: "Rekomendasi Spesifikasi",
    prompt: "Berikan rekomendasi spesifikasi laptop/komputer terbaik untuk kebutuhan kuliah teknik informatika dengan budget Rp 10-15 juta.",
  },
  {
    id: "troubleshoot",
    title: "Troubleshooting Komputer",
    prompt: "Bantu saya mengatasi masalah umum pada laptop seperti lambat, error sistem, atau masalah hardware.",
  },
  {
    id: "upgrade",
    title: "Panduan Upgrade Komponen",
    prompt: "Jelaskan cara upgrade RAM, SSD, atau komponen lain pada laptop untuk meningkatkan performa.",
  },
];

export default function Chat() {
  // const [open, setOpen] = useState(false);
  const [isFirstChat, setIsFirstChat] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, setMessages, input, handleInputChange, handleSubmit, error, reload, isLoading } = useChat({
    keepLastMessageOnError: true,
    api: "/api/chat/gemini",
  });

  useEffect(() => {
    if (messages.length === 0 && isFirstChat) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: "Halo! Saya Jackie AI dari PUSCOM, asisten web cerdas yang siap membantu Anda dengan segala hal seputar komputer dan laptop.",
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

  const handlePromptSelect = useCallback(
    (prompt: string) => {
      if (textareaRef.current) {
        textareaRef.current.value = prompt;
        const event = new Event("input", { bubbles: true });
        textareaRef.current.dispatchEvent(event);
        handleInputChange({ target: { value: prompt } } as any);
      }
    },
    [handleInputChange]
  );

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
            <h1 className="text-lg font-semibold">Jackie AI</h1>
            <p className="text-sm text-gray-500">Asisten web cerdas PUSCOM</p>
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
                    {message.role === "user" ? <PersonIcon className="h-5 w-5" /> : <RobotIcon className="h-5 w-5" />}
                    <h2>{message.role === "user" ? "Anda" : "Jackie AI"}</h2>
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
            <div className="mb-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button type="button" variant="ghost" disabled={isLoading} className="bg-transparent">
                    <div className="flex justify-center items-center gap-x-2">
                      <SparklesIcon className="h-4 w-4 text-blue-500 dark:text-blue-400" /> <span>Pilih Prompt</span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="dark:bg-gray-800 dark:border-gray-700 w-64">
                  {PROMPTS.map((prompt) => (
                    <DropdownMenuItem key={prompt.id} onSelect={() => handlePromptSelect(prompt.prompt)} className="dark:hover:bg-gray-700 dark:text-gray-200">
                      {prompt.title}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
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
            <Button className="flex gap-2 my-1 justify-center items-center" variant="ghost">
              <Brain className="h-5 w-5" />
              Jackie Think
            </Button>
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
