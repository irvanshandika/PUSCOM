"use client";

import { useChat } from "@ai-sdk/react";
import type React from "react";
import { useRef, useState, useEffect, type KeyboardEvent } from "react";
import Image from "next/image";
import MarkdownIt from "markdown-it";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import { Paperclip, Send, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/src/components/ui/sheet";
import { Textarea } from "@/src/components/ui/textarea";
import { cn } from "@/src/lib/utils";
import RobotIcon from "./icons/RobotIcon";

const md = new MarkdownIt();

export default function Chat() {
  const { messages, input, reload, error, handleInputChange, handleSubmit, setMessages } = useChat({
    keepLastMessageOnError: true,
    api: "/api/chat/manajemen-servis",
  });
  const [isFirstChat, setIsFirstChat] = useState(true);
  const [files, setFiles] = useState<FileList | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (messages.length === 0 && isFirstChat) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: "Halo! Saya Rani AI, asisten cerdas pembantu manajemen permintaan servis.",
        },
      ]);
      setIsFirstChat(false);
    }
  }, [messages, isFirstChat, setMessages]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [scrollAreaRef]); //Corrected dependency

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
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="secondary" size="icon" className="fixed bottom-4 right-4 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow">
          <RobotIcon className="size-32" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <SheetTitle className="text-white">
            <div className="flex items-center gap-2">
              <RobotIcon className="size-8" />
              <div>
                <h1 className="text-lg font-bold">Rani AI</h1>
                <p className="text-xs text-blue-100">Asisten web cerdas PUSCOM</p>
              </div>
            </div>
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((m) => (
              <div key={m.id} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                <div className={cn("max-w-[80%] rounded-2xl px-4 py-2", m.role === "user" ? "bg-blue-600 text-white" : "bg-muted")}>
                  <div dangerouslySetInnerHTML={{ __html: md.render(m.content) }} className="prose prose-sm dark:prose-invert max-w-none" />
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
                <p className="text-destructive text-sm">Terjadi kesalahan</p>
                <Button variant="outline" size="sm" onClick={() => reload()} className="mt-2">
                  Coba Lagi
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="p-4 border-t bg-background">
          {files && (
            <div className="flex items-center mb-2 p-2 bg-muted rounded-lg">
              <div className="flex-1 truncate text-sm">
                {Array.from(files)
                  .map((file) => file.name)
                  .join(", ")}
              </div>
              <Button variant="ghost" size="icon" onClick={removeFile} className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          <form
            ref={formRef}
            className="flex items-end gap-2"
            onSubmit={(event) => {
              handleSubmit(event, { experimental_attachments: files || undefined });
              setFiles(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = "";
              }
            }}>
            <div className="relative flex-grow">
              <Textarea value={input} onChange={handleInputChange} onKeyDown={handleKeyDown} placeholder="Ketik pesan Anda..." className="pr-20 resize-none" rows={1} />
              <div className="absolute right-2 bottom-1.5 flex gap-1">
                <Input type="file" onChange={handleFileChange} multiple ref={fileInputRef} className="hidden" id="file-upload" />
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => fileInputRef.current?.click()}>
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button type="submit" size="icon" className="h-8 w-8">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
