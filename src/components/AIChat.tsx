/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useChat } from "@ai-sdk/react";
import React, { useRef, useState, useEffect, type KeyboardEvent } from "react";
import Image from "next/image";
import MarkdownIt from "markdown-it";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import { Paperclip, Send, X } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger } from "@/src/components/ui/dropdown-menu";
import RobotIcon from "./icons/RobotIcon";
import PersonIcon from "./icons/PersonIcon";
import { Textarea } from "./ui/textarea";

export default function Chat() {
  const { messages, input, reload, error, handleInputChange, handleSubmit, setMessages } = useChat({
    keepLastMessageOnError: true,
    api: "/api/chat/gemini",
  });
  const [isFirstChat, setIsFirstChat] = useState(true);
  const [files, setFiles] = useState<FileList | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const md = new MarkdownIt();

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

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles(event.target.files);
    }
  };

  const removeFile = () => {
    setFiles(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" className="fixed bottom-4 right-4 rounded-full w-16 h-16 shadow-lg hover:scale-105 transition-transform">
            <RobotIcon className="size-32" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="sm:max-w-[425px] h-[600px] flex flex-col p-0 mr-5">
          <DropdownMenuLabel className="p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white sticky top-0 z-10">
            <h1 className="text-lg font-bold">Jackie AI</h1>
            <p className="text-sm text-blue-100">Asisten web cerdas PUSCOM</p>
          </DropdownMenuLabel>
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${m.role === "user" ? "bg-blue-600 text-white rounded-br-none" : "bg-gray-100 dark:bg-gray-800 rounded-bl-none"}`}>
                    <span className={`flex gap-2 mb-1 ${m.role === "user" ? "justify-end items-end" : "justify-start items-start"}`}>
                      {m.role === "user" ? <PersonIcon className="h-5 w-5" /> : <RobotIcon className="h-5 w-5" />}
                      <span>{m.role === "user" ? "Anda" : "Jackie AI"}</span>
                    </span>
                    <div dangerouslySetInnerHTML={{ __html: md.render(m.content) }} className="whitespace-pre-wrap break-words" />
                    {m?.experimental_attachments
                      ?.filter((attachment) => attachment?.contentType?.startsWith("image/") || attachment?.contentType?.startsWith("application/pdf"))
                      .map((attachment, index) =>
                        attachment.contentType?.startsWith("image/") ? (
                          <Image key={`${m.id}-${index}`} src={attachment.url || "/placeholder.svg"} width={200} height={200} alt={attachment.name ?? `attachment-${index}`} className="mt-2 rounded-md" />
                        ) : attachment.contentType?.startsWith("application/pdf") ? (
                          <iframe key={`${m.id}-${index}`} src={attachment.url} width="200" height="200" title={attachment.name ?? `attachment-${index}`} className="mt-2 rounded-md" />
                        ) : null
                      )}
                  </div>
                </div>
              ))}
              {error && (
                <div className="text-center">
                  <p className="text-red-500 dark:text-red-400 text-sm">Terjadi kesalahan</p>
                  <Button variant="destructive" size="sm" onClick={() => reload()} className="mt-2">
                    Coba Lagi
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
          <div className="p-4 border-t bg-background sticky bottom-0">
            {files && (
              <div className="flex items-center mb-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <div className="flex-1 truncate text-sm">
                  {Array.from(files)
                    .map((file) => file.name)
                    .join(", ")}
                </div>
                <Button variant="ghost" size="icon" onClick={removeFile} className="ml-2">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            <form
              ref={formRef}
              className="flex items-center space-x-2 relative"
              onSubmit={(event) => {
                handleSubmit(event, { experimental_attachments: files || undefined });
                setFiles(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}>
              <div className="relative flex-grow">
                <Textarea value={input} onChange={handleInputChange} onKeyDown={handleKeyDown} placeholder="Type your message..." className="flex-grow min-h-[2.5rem] max-h-[10rem] resize-none" rows={1} />
                <div className="absolute right-2 bottom-1/2 translate-y-1/2 flex gap-1">
                  <Input type="file" onChange={handleFileChange} multiple ref={fileInputRef} className="hidden" id="file-upload" />
                  <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => fileInputRef.current?.click()}>
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button type="submit" variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
