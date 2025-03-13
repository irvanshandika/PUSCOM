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
// import { cn } from "@/src/lib/utils";
import RobotIcon from "./icons/RobotIcon";
import PersonIcon from "./icons/PersonIcon";
import DocsIcon from "./icons/DocsIcon";
import { RefreshCw } from "lucide-react";

const md = new MarkdownIt();

export default function Chat() {
  const { messages, input, reload, error, handleInputChange, handleSubmit } = useChat({
    keepLastMessageOnError: true,
    api: "/api/chat/gemini",
  });
  const [files, setFiles] = useState<FileList | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [scrollAreaRef]);

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
        <Button variant="secondary" aria-label="Chat Bot" size="icon" className="fixed bottom-4 right-4 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow">
          <RobotIcon className="size-32" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <SheetTitle className="text-white">
            <div className="flex items-center gap-2">
              <RobotIcon className="size-8" />
              <div>
                <h1 className="text-lg font-bold">Jackie AI</h1>
                <p className="text-xs text-blue-100">Asisten web cerdas PUSCOM</p>
              </div>
            </div>
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            <div className="flex flex-col justify-start max-w-[80%] rounded-2xl px-4 py-2 bg-gray-200 dark:bg-neutral-900 rounded-bl-none">
              <span className="flex gap-2 mb-1 justify-start items-start">
                <RobotIcon className="h-5 w-5" />
                <span>Jackie AI</span>
              </span>
              <div className="prose prose-sm dark:prose-invert max-w-none">Halo! Saya Jackie AI dari PUSCOM, asisten web cerdas yang siap membantu Anda dengan segala hal seputar komputer dan laptop.</div>
            </div>
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} mb-4`}>
                <div className={`flex flex-col max-w-[80%] rounded-2xl px-4 py-2 ${m.role === "user" ? "bg-blue-500 text-white rounded-br-none" : "bg-gray-200 dark:bg-neutral-900 rounded-bl-none"}`}>
                  <span className="flex gap-2 mb-1 items-center">
                    {m.role === "user" ? <PersonIcon className="h-5 w-5" /> : <RobotIcon className="h-5 w-5" />}
                    <span>{m.role === "user" ? "Anda" : "Jackie AI"}</span>
                  </span>
                  <div dangerouslySetInnerHTML={{ __html: md.render(m.content) }} className="prose prose-sm dark:prose-invert max-w-none" />
                  {m?.experimental_attachments?.map((attachment, index) => {
                    if (attachment.contentType?.startsWith("image/")) {
                      return <Image key={`${m.id}-${index}`} src={attachment.url || "/placeholder.svg"} width={200} height={200} alt={attachment.name ?? `attachment-${index}`} className="mt-2 rounded-md" />;
                    }
                    if (attachment.contentType?.startsWith("application/pdf")) {
                      return <iframe key={`${m.id}-${index}`} src={attachment.url} width="200" height="200" title={attachment.name ?? `attachment-${index}`} className="mt-2 rounded-md" />;
                    }
                    // For all other file types
                    return (
                      <div key={`${m.id}-${index}`} className="mt-2 p-3 bg-muted rounded-md">
                        <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm hover:underline">
                          <DocsIcon className="h-4 w-4" />
                          {attachment.name || `File ${index + 1}`}
                        </a>
                      </div>
                    );
                  })}
                  <div className={`flex ${m.role === "user" ? "hidden" : "block"}`}>
                    <Button variant="outline" size="sm" className="mt-2 ml-[-2px]" onClick={() => reload()}>
                      <RefreshCw className="h-4 w-4" /> Regenerate
                    </Button>
                  </div>
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
              <div className="flex-1 truncate">
                {Array.from(files).map((file, index) => (
                  <div key={index} className="flex items-center gap-2">
                    {file.type.startsWith("image/") ? (
                      <>
                        <Image src={URL.createObjectURL(file)} alt={file.name} width={40} height={40} className="rounded object-cover" />
                        <span className="text-sm">{file.name}</span>
                      </>
                    ) : (
                      <>
                        <DocsIcon className="h-4 w-4" />
                        <span className="text-sm">{file.name}</span>
                      </>
                    )}
                  </div>
                ))}
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
