/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useRef, useEffect } from "react";
import { X, Maximize2, Minimize2, Send, Paperclip, Bot, User, RefreshCw } from "lucide-react";
import Draggable from "react-draggable";
import { useChat } from "@ai-sdk/react";
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { Textarea } from "@/src/components/ui/textarea";
import { Separator } from "@/src/components/ui/separator";
import Image from "next/image";
import DocsIcon from "@/src/components/icons/DocsIcon";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/src/components/ui/dialog";
import { getAuth } from "firebase/auth";
import { app } from "@/src/config/FirebaseConfig";
import { motion, AnimatePresence } from "framer-motion";

const RaniAIServiceAssistant: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false); // Changed to false for initial state
  const [isMaximized, setIsMaximized] = useState(false);
  const [isDraggable, setIsDraggable] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [files, setFiles] = useState<FileList | null>(null);
  const draggableNodeRef = useRef<HTMLDivElement>(null!);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Using useChat for chat API
  const { messages, input, handleInputChange, handleSubmit, reload, error } = useChat({
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        content: "Halo! Saya Rani AI, asisten virtual PUSCOM yang siap membantu Anda menganalisa kerusakan dan data servis. Apa yang bisa saya bantu hari ini?",
      },
    ],
    api: "/api/chat/manajemen-servis",
    body: {
      // Passing service data context to the AI
      serviceData: true,
    },
  });

  useEffect(() => {
    const authInstance = getAuth(app);
    const unsubscribe = authInstance.onAuthStateChanged((user) => {
      setUser(user || null);
    });
    return () => unsubscribe();
  }, []);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const toggleChatVisibility = () => {
    setIsVisible(!isVisible);
  };

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
    setIsDraggable(!isMaximized);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(e.target.files);
    }
  };

  const removeFile = () => {
    setFiles(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Apply markdown formatting to the message content with added table support
  const applyMarkdownFormatting = (text: string) => {
    // Match and process table pattern
    // Handle table pattern first to avoid conflicts with other patterns
    const processedText = processTablesInMarkdown(text);

    // Convert bold (**text**)
    let formattedText = processedText.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    // Convert italic (*text*)
    formattedText = formattedText.replace(/\*(.*?)\*/g, "<em>$1</em>");
    // Convert code (`text`)
    formattedText = formattedText.replace(/`([^`]*)`/g, "<code>$1</code>");
    // Convert headings (#, ##, ###)
    formattedText = formattedText.replace(/^### (.*$)/gim, "<h3>$1</h3>");
    formattedText = formattedText.replace(/^## (.*$)/gim, "<h2>$1</h2>");
    formattedText = formattedText.replace(/^# (.*$)/gim, "<h1>$1</h1>");
    // Convert links [text](url)
    formattedText = formattedText.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
    // Convert lists (- or *)
    formattedText = formattedText.replace(/^\* (.*$)/gim, "<ul><li>$1</li></ul>");
    formattedText = formattedText.replace(/^\- (.*$)/gim, "<ul><li>$1</li></ul>");
    // Convert numbered lists (1. 2. etc)
    formattedText = formattedText.replace(/^\d+\. (.*$)/gim, "<ol><li>$1</li></ol>");

    return formattedText;
  };

  // Process tables in markdown format and convert to HTML tables
  const processTablesInMarkdown = (text: string) => {
    // Split the text by lines
    const lines = text.split("\n");
    const processedLines = [];
    let inTable = false;
    let tableContent = "";

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check if this line contains a pipe character, indicating it might be a table row
      if (line.includes("|") && (line.trim().startsWith("|") || line.trim().endsWith("|"))) {
        // If we're not already in a table, start a new one
        if (!inTable) {
          inTable = true;
          tableContent = '<div class="overflow-auto w-full my-2"><table class="min-w-full border-collapse border border-slate-300 bg-slate-800 text-white">\n';

          // Check if the next line is a separator (---) line
          const isHeaderRow = i + 1 < lines.length && lines[i + 1].includes("|") && lines[i + 1].includes("-");

          // Process header row
          if (isHeaderRow) {
            tableContent += '<thead class="bg-slate-700">\n<tr>\n';

            // Split the line by pipes and remove empty elements
            const cells = line
              .split("|")
              .map((cell) => cell.trim())
              .filter((cell) => cell !== "");

            // Add table headers
            for (const cell of cells) {
              tableContent += `<th class="border border-slate-600 px-4 py-2 text-center">${cell}</th>\n`;
            }

            tableContent += "</tr>\n</thead>\n<tbody>\n";
            i++; // Skip the separator line
          } else {
            // If there's no separator line, just start the body
            tableContent += "<tbody>\n";
          }
        } else {
          // We're already in a table, process this row
          tableContent += "<tr>\n";

          // Split the line by pipes and remove empty elements
          const cells = line
            .split("|")
            .map((cell) => cell.trim())
            .filter((cell) => cell !== "");

          // Add table cells
          for (const cell of cells) {
            tableContent += `<td class="border border-slate-600 px-4 py-2">${cell}</td>\n`;
          }

          tableContent += "</tr>\n";
        }
      } else if (inTable) {
        // This line is not part of a table but we were in a table before
        inTable = false;
        tableContent += "</tbody>\n</table></div>";
        processedLines.push(tableContent);
        processedLines.push(line); // Add the current non-table line
      } else {
        // Not in a table and not a table line
        processedLines.push(line);
      }
    }

    // If we ended the text while still in a table, close it
    if (inTable) {
      tableContent += "</tbody>\n</table></div>";
      processedLines.push(tableContent);
    }

    return processedLines.join("\n");
  };

  // Animation variants for the chat button
  const chatButtonVariants = {
    hidden: { scale: 0, opacity: 0, rotate: -180 },
    visible: {
      scale: 1,
      opacity: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
      },
    },
    exit: {
      scale: 0,
      opacity: 0,
      rotate: 180,
      transition: {
        duration: 0.3,
      },
    },
  };

  // Animation variants for the chat window
  const chatWindowVariants = {
    hidden: {
      opacity: 0,
      y: 50,
      scale: 0.9,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
      },
    },
    exit: {
      opacity: 0,
      y: 20,
      scale: 0.95,
      transition: {
        duration: 0.2,
      },
    },
  };

  // Animation variants for maximized window
  const maximizedVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 30,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: {
        duration: 0.2,
      },
    },
  };

  // Button to open the chat
  const chatButton = (
    <AnimatePresence mode="wait">
      {!isVisible && (
        <motion.div key="chat-button" initial="hidden" animate="visible" exit="exit" variants={chatButtonVariants} className="fixed bottom-4 right-4 z-50">
          <Button onClick={toggleChatVisibility} className="rounded-full h-14 w-14 bg-blue-500 hover:bg-blue-600 text-white shadow-lg">
            <span className="sr-only">Buka Rani AI</span>
            <Bot size={24} />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const chatWindow = (
    <Card
      className={cn("flex flex-col overflow-hidden transition-all duration-300 shadow-xl border bg-card", isMaximized ? "fixed inset-0 rounded-none h-full w-full" : "w-[350px] sm:w-[380px] md:w-[420px] h-[500px] md:h-[550px] rounded-lg")}>
      {/* Window Header */}
      <div className={cn("bg-puscom text-white px-4 py-3 flex items-center justify-between", isDraggable && !isMaximized ? "cursor-move" : "")} ref={draggableNodeRef}>
        <div className="flex items-center gap-2">
          <Bot size={20} />
          <h3 className="font-medium text-lg">Rani AI Assistant</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={toggleMaximize} className="focus:outline-none hover:bg-puscom-light rounded p-1 transition-colors" aria-label={isMaximized ? "Kecilkan" : "Perbesar"}>
            {isMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
          <button onClick={toggleChatVisibility} className="focus:outline-none hover:bg-puscom-light rounded p-1 transition-colors" aria-label="Tutup">
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-grow overflow-y-auto p-4 space-y-3" ref={chatContainerRef}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 opacity-70">
            <Bot size={48} className="mb-2 text-puscom" />
            <h3 className="text-xl font-medium mb-2">Selamat datang di Rani AI</h3>
            <p className="text-muted-foreground">Asisten AI kami siap membantu Anda untuk menemukan komputer, laptop, spare part, atau servis yang sesuai dengan kebutuhan Anda.</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={index} className={cn("animate-fade-in", isMaximized ? "max-w-full sm:max-w-[80%] md:max-w-[70%] lg:max-w-[60%] mx-auto" : "max-w-[80%]", message.role === "user" ? "ml-auto" : "mr-auto")}>
              <div className={cn("p-3 rounded-lg", message.role === "user" ? "bg-blue-500 text-white rounded-br-none" : "bg-muted text-foreground rounded-bl-none")}>
                <div className="flex items-center gap-2 mb-1">
                  {message.role === "assistant" ? (
                    <Bot size={16} className="text-puscom" />
                  ) : user?.photoURL ? (
                    <>
                      <Image src={user.photoURL} width={16} height={16} alt={user.displayName} className="rounded-full" />
                    </>
                  ) : (
                    <>
                      <User size={16} />
                    </>
                  )}
                  <span className="font-medium text-sm">{message.role === "user" ? user?.displayName || "Anda" : "Rani AI"}</span>
                </div>
                {/* Apply markdown formatting to assistant messages */}
                <div className="text-sm whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: message.role === "assistant" ? applyMarkdownFormatting(message.content) : message.content }} />

                {/* Display attachments */}
                {message?.experimental_attachments?.map((attachment, attachIndex) => {
                  if (attachment.contentType?.startsWith("image/")) {
                    return (
                      <div key={`${index}-${attachIndex}`}>
                        <Dialog>
                          <DialogTrigger>
                            <Image src={attachment.url || "/placeholder.svg"} width={200} height={200} alt={attachment.name ?? `attachment-${attachIndex}`} className="mt-2 rounded-md" />
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>{attachment.name || `Image ${attachIndex + 1}`}</DialogTitle>
                            </DialogHeader>
                            <Image src={attachment.url || "/placeholder.svg"} width={800} height={800} alt={attachment.name ?? `attachment-${attachIndex}`} className="rounded-md bg-auto bg-no-repeat bg-center" />
                          </DialogContent>
                        </Dialog>
                      </div>
                    );
                  }
                  if (attachment.contentType?.startsWith("application/pdf")) {
                    return <iframe key={`${index}-${attachIndex}`} src={attachment.url} width="200" height="200" title={attachment.name ?? `attachment-${attachIndex}`} className="mt-2 rounded-md" />;
                  }
                  return (
                    <div key={`${index}-${attachIndex}`} className="mt-2 p-3 bg-muted rounded-md">
                      <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm hover:underline">
                        <DocsIcon className="h-4 w-4" />
                        {attachment.name || `File ${attachIndex + 1}`}
                      </a>
                    </div>
                  );
                })}

                {/* Regenerate button for assistant messages */}
                {message.role === "assistant" && (
                  <div className="mt-2">
                    <Button variant="outline" size="sm" className="text-xs" onClick={() => reload()}>
                      <RefreshCw className="h-3 w-3 mr-1" /> Regenerate
                    </Button>
                  </div>
                )}
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
      </div>

      <Separator />

      {/* Display file attachments */}
      {files && (
        <div className="p-3 bg-muted/30 border-t">
          <div className="flex flex-wrap items-center justify-between">
            <div className="flex flex-wrap gap-2 truncate max-w-[80%]">
              {Array.from(files).map((file, fileIndex) => (
                <div key={fileIndex} className="flex items-center gap-2 bg-slate-100 rounded-md px-2 py-1">
                  {file.type.startsWith("image/") ? (
                    <>
                      <Image src={URL.createObjectURL(file)} alt={file.name} width={20} height={20} className="rounded object-cover" />
                      <span className="text-xs truncate max-w-[120px] sm:max-w-[150px]">{file.name}</span>
                    </>
                  ) : (
                    <>
                      <DocsIcon className="h-4 w-4" />
                      <span className="text-xs truncate max-w-[120px] sm:max-w-[150px]">{file.name}</span>
                    </>
                  )}
                </div>
              ))}
            </div>
            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={removeFile}>
              <X size={14} />
            </Button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <form
        ref={formRef}
        onSubmit={(event) => {
          handleSubmit(event, { experimental_attachments: files || undefined });
          setFiles(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }}
        className={cn("p-3 border-t bg-background", isMaximized && "max-w-3xl mx-auto w-full")}>
        {/* Contoh Prompt Komputer - Dropdown */}
        <div className="mb-3">
          <label htmlFor="prompt-dropdown" className="block text-xs font-medium mb-1 text-muted-foreground">
            Contoh Prompt
          </label>
          <select
            id="prompt-dropdown"
            className="w-full border rounded-md p-2 text-xs sm:text-sm bg-muted focus:outline-none focus:ring-2 focus:ring-blue-300"
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) {
                handleInputChange({ target: { value: e.target.value } } as any);
              }
            }}>
            <option value="" disabled>
              Pilih contoh prompt...
            </option>
            <option value="Cara mengatasi laptop lemot">Cara mengatasi laptop lemot</option>
            <option value="Bagaimana menghapus virus di komputer?">Bagaimana menghapus virus di komputer?</option>
            <option value="Kenapa komputer sering blue screen?">Kenapa komputer sering blue screen?</option>
            <option value="Tips merawat baterai laptop">Tips merawat baterai laptop</option>
            <option value="Cara install ulang Windows 10">Cara install ulang Windows 10</option>
            <option value="Penjelasan tentang SSD vs HDD">Penjelasan tentang SSD vs HDD</option>
            <option value="Bagaimana memperbaiki keyboard error">Bagaimana memperbaiki keyboard error</option>
            <option value="Cara cek kesehatan RAM">Cara cek kesehatan RAM</option>
            <option value="Solusi komputer overheat">Solusi komputer overheat</option>
            <option value="Cara backup data penting">Cara backup data penting</option>
            <option value="Tampilkan perbandingan laptop gaming dalam bentuk tabel">Tampilkan perbandingan laptop gaming dalam bentuk tabel</option>
            <option value="Tabel harga spare part komputer terbaru">Tabel harga spare part komputer terbaru</option>
          </select>
        </div>

        <div className="relative">
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
            placeholder="Ketik pesan Anda di sini..."
            className="min-h-[60px] max-h-[120px] resize-none text-sm bg-background pr-[90px]"
            rows={2}
          />
          <div className="absolute right-2 bottom-2 flex items-center gap-1">
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="rounded-full p-2 hover:bg-muted transition-colors">
                <Paperclip size={18} className="text-muted-foreground" />
              </div>
              <input id="file-upload" type="file" className="hidden" multiple onChange={handleFileChange} ref={fileInputRef} />
            </label>
            <Button type="submit" disabled={(!input.trim() && !files) || false} className="bg-puscom hover:bg-puscom-light text-white h-8 w-8 rounded-full p-0">
              <Send size={16} />
              <span className="sr-only">Kirim</span>
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">Tekan Enter untuk mengirim, Shift+Enter untuk baris baru</p>
      </form>
    </Card>
  );

  return (
    <>
      {chatButton}

      <AnimatePresence mode="wait">
        {isVisible && (
          <div className={cn("fixed z-50", isMaximized ? "inset-0" : "bottom-4 right-4")}>
            {isMaximized ? (
              <motion.div className="w-full h-full flex items-center justify-center" initial="hidden" animate="visible" exit="exit" variants={maximizedVariants}>
                <div className={cn("w-full h-full lg:w-3/4 lg:h-5/6 xl:w-2/3", isMaximized ? "max-w-screen-2xl" : "")}>{chatWindow}</div>
              </motion.div>
            ) : (
              <Draggable handle=".cursor-move" nodeRef={draggableNodeRef} bounds="parent" disabled={!isDraggable || isMaximized}>
                <motion.div initial="hidden" animate="visible" exit="exit" variants={chatWindowVariants}>
                  {chatWindow}
                </motion.div>
              </Draggable>
            )}
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default RaniAIServiceAssistant;
