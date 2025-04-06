/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { Send, Bot, User, Paperclip, X, RefreshCw } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Textarea } from "@/src/components/ui/textarea";
import { Separator } from "@/src/components/ui/separator";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/src/components/ui/sheet";
import { cn } from "@/src/lib/utils";
import Image from "next/image";
import DocsIcon from "./icons/DocsIcon";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { getAuth } from "firebase/auth";
import { app } from "@/src/config/FirebaseConfig";

const AIChat: React.FC = () => {
  const [user, setUser] = React.useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, input, reload, error, handleInputChange, handleSubmit } = useChat({
    keepLastMessageOnError: true,
    api: "/api/chat/gemini",
  });
  const [files, setFiles] = useState<FileList | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const authInstance = getAuth(app);
    const unsubscribe = authInstance.onAuthStateChanged((user) => {
      setUser(user || null);
    });
    return () => unsubscribe();
  }, []);

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

  // Apply markdown formatting to the message content
  const applyMarkdownFormatting = (text: string) => {
    // Convert bold (**text**)
    let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Convert italic (*text*)
    formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Convert code (`text`)
    formattedText = formattedText.replace(/`([^`]*)`/g, '<code>$1</code>');
    // Convert headings (#, ##, ###)
    formattedText = formattedText.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    formattedText = formattedText.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    formattedText = formattedText.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    // Convert links [text](url)
    formattedText = formattedText.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
    // Convert lists (- or *)
    formattedText = formattedText.replace(/^\* (.*$)/gim, '<ul><li>$1</li></ul>');
    formattedText = formattedText.replace(/^\- (.*$)/gim, '<ul><li>$1</li></ul>');
    // Convert numbered lists (1. 2. etc)
    formattedText = formattedText.replace(/^\d+\. (.*$)/gim, '<ol><li>$1</li></ol>');

    return formattedText;
  };

  // Auto scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button className="h-14 w-14 rounded-full shadow-lg bg-blue-600 hover:bg-blue-500 text-white" aria-label="Open chat">
            <Bot size={24} />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="sm:max-w-[400px] h-[600px] p-0 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <Bot size={20} className="text-blue-500" />
              <SheetTitle className="text-lg font-semibold text-foreground">Jackie AI Assistant</SheetTitle>
            </div>
          </div>

          {/* Messages container */}
          <div className="flex-grow overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 opacity-70">
                <Bot size={48} className="mb-2 text-blue-500" />
                <h3 className="text-xl font-medium mb-2">Selamat datang di Jackie AI</h3>
                <p className="text-muted-foreground">Asisten AI kami siap membantu Anda untuk menemukan komputer, laptop, spare part, atau servis yang sesuai dengan kebutuhan Anda.</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} mb-4`}>
                  <div className={cn("rounded-xl p-3", message.role === "user" ? "bg-blue-500 text-foreground rounded-tr-none" : "bg-muted text-foreground rounded-tl-none")}>
                    <div className="flex items-center gap-2 mb-1">
                      {message.role === "assistant" ? (
                        <Bot size={16} className="text-blue-500" />
                      ) : user?.photoURL ? (
                        <>
                          <Image src={user.photoURL} className="w-6 h-6 rounded-full" alt={user.displayName} width={0} height={0} />
                        </>
                      ) : (
                        <>
                          <User size={16} />
                        </>
                      )}
                      <span className="font-medium text-sm">{message.role === "user" ? user?.displayName || "User" : "Jackie AI"}</span>
                    </div>
                    {/* Apply markdown formatting to assistant messages */}
                    <p className="text-sm whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: message.role === "assistant" ? applyMarkdownFormatting(message.content) : message.content }} />
                    {message?.experimental_attachments?.map((attachment, index) => {
                      if (attachment.contentType?.startsWith("image/")) {
                        return (
                          <div key={`${message.id}-${index}`}>
                            <Dialog>
                              <DialogTrigger>
                                <Image key={`${message.id}-${index}`} src={attachment.url || "/placeholder.svg"} width={200} height={200} alt={attachment.name ?? `attachment-${index}`} className="mt-2 rounded-md" />
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>{attachment.name || `Image ${index + 1}`}</DialogTitle>
                                </DialogHeader>
                                <Image
                                  key={`${message.id}-${index}`}
                                  src={attachment.url || "/placeholder.svg"}
                                  width={800}
                                  height={800}
                                  alt={attachment.name ?? `attachment-${index}`}
                                  className="rounded-md bg-auto bg-no-repeat bg-center"
                                />
                              </DialogContent>
                            </Dialog>
                          </div>
                        );
                      }
                      if (attachment.contentType?.startsWith("application/pdf")) {
                        return <iframe key={`${message.id}-${index}`} src={attachment.url} width="200" height="200" title={attachment.name ?? `attachment-${index}`} className="mt-2 rounded-md" />;
                      }
                      return (
                        <div key={`${message.id}-${index}`} className="mt-2 p-3 bg-muted rounded-md">
                          <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm hover:underline">
                            <DocsIcon className="h-4 w-4" />
                            {attachment.name || `File ${index + 1}`}
                          </a>
                        </div>
                      );
                    })}
                    <div className={`flex ${message.role === "user" ? "hidden" : "block"}`}>
                      <Button variant="outline" size="sm" className="mt-2 ml-[-2px]" onClick={() => reload()}>
                        <RefreshCw className="h-4 w-4" /> Regenerate
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}

            {error && (
              <div className="flex justify-center mb-4">
                <div className="bg-red-500 text-white p-3 rounded-lg">
                  <p className="text-sm">{error.message || String(error)}</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <Separator />

          {/* Input area */}
          <div className="p-3">
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
                <Textarea
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e, { experimental_attachments: files || undefined });
                      setFiles(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }
                  }}
                  placeholder="Ketik pesan Anda..."
                  className="pr-20 resize-none"
                  rows={1}
                />
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
            <p className="text-xs text-muted-foreground mt-2 text-center">Tekan Enter untuk mengirim, Shift+Enter untuk baris baru</p>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AIChat;
