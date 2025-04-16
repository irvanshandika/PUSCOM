/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect, useRef } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/src/config/FirebaseConfig";
import { ServiceRequest } from "@/src/types/service";
import { useChat } from "@ai-sdk/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, subMonths } from "date-fns";
import { id } from "date-fns/locale";
import RobotIcon from "@/src/components/icons/RobotIcon";
import { cn } from "@/src/lib/utils";
import { Paperclip, RefreshCw, Send, User } from "lucide-react";
import { Textarea } from "@/src/components/ui/textarea";
import { getAuth } from "firebase/auth";
import { app } from "@/src/config/FirebaseConfig";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/src/components/ui/sheet";
import { Bot, X } from "lucide-react";
import Image from "next/image";
import { Input } from "./ui/input";
import DocsIcon from "./icons/DocsIcon";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogHeader } from "@/src/components/ui/dialog";
import { Separator } from "./ui/separator";

// Custom colors for charts
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];
const DEVICE_COLORS = {
  laptop: "#0088FE",
  computer: "#00C49F",
};
const STATUS_COLORS = {
  pending: "#FFBB28",
  in_progress: "#0088FE",
  completed: "#00C49F",
  rejected: "#FF8042",
};

export default function RaniAIServiceAssistant() {
  const [user, setUser] = useState<any>(null);
  const [services, setServices] = useState<ServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activePeriod, setActivePeriod] = useState("week");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [files, setFiles] = useState<FileList | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Analytics state
  const [deviceTypeData, setDeviceTypeData] = useState<any[]>([]);

  // Untuk open/close chatbot
  const [isOpen, setIsOpen] = useState(false);
  const [statusData, setStatusData] = useState<any[]>([]);
  const [brandData, setBrandData] = useState<any[]>([]);
  const [dailyServiceData, setDailyServiceData] = useState<any[]>([]);

  // AI Chat integration
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

  useEffect(() => {
    fetchServices();
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

  const applyMarkdownFormatting = (text: string) => {
    // Convert bold (**text**)
    let formattedText = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
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

  useEffect(() => {
    if (services.length > 0) {
      prepareAnalyticsData();
    }
  }, [services, activePeriod]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchServices = async () => {
    try {
      setIsLoading(true);
      const servicesRef = collection(db, "service_requests");
      const q = query(servicesRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const servicesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ServiceRequest[];
      setServices(servicesData);
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const prepareAnalyticsData = () => {
    // Filter services based on active period
    let filteredServices = [...services];
    const now = new Date();

    if (activePeriod === "week") {
      const weekStart = startOfWeek(now, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
      filteredServices = services.filter((service) => {
        const serviceDate = new Date(service.date);
        return serviceDate >= weekStart && serviceDate <= weekEnd;
      });
    } else if (activePeriod === "month") {
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);
      filteredServices = services.filter((service) => {
        const serviceDate = new Date(service.date);
        return serviceDate >= monthStart && serviceDate <= monthEnd;
      });
    } else if (activePeriod === "year") {
      const yearStart = new Date(now.getFullYear(), 0, 1);
      const yearEnd = new Date(now.getFullYear(), 11, 31);
      filteredServices = services.filter((service) => {
        const serviceDate = new Date(service.date);
        return serviceDate >= yearStart && serviceDate <= yearEnd;
      });
    }

    // Device Type distribution
    const deviceTypes: Record<string, number> = filteredServices.reduce((acc, service) => {
      const type = service.deviceType.toLowerCase();
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    setDeviceTypeData(Object.entries(deviceTypes).map(([name, value]) => ({ name, value })));

    // Status distribution
    const statuses: Record<string, number> = filteredServices.reduce((acc, service) => {
      const status = service.status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    setStatusData(Object.entries(statuses).map(([name, value]) => ({ name, value })));

    // Brand distribution
    const brands: Record<string, number> = filteredServices.reduce((acc, service) => {
      let brand = service.brand || "Tidak Diketahui";
      if (brand === "Others" && service.customBrand) {
        brand = service.customBrand;
      }
      acc[brand] = (acc[brand] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Sort brands by count and take top 5
    const sortedBrands = Object.entries(brands)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    setBrandData(sortedBrands.map(([name, value]) => ({ name, value })));

    // Daily service data for the last 30 days
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = subMonths(now, 1);
      date.setDate(date.getDate() + i);
      return format(date, "yyyy-MM-dd");
    });

    const dailyCount = last30Days.map((dateStr) => {
      const count = filteredServices.filter((service) => format(new Date(service.date), "yyyy-MM-dd") === dateStr).length;
      return {
        date: format(new Date(dateStr), "dd MMM", { locale: id }),
        count,
      };
    });

    setDailyServiceData(dailyCount);
  };

  const getServiceAnalysisSummary = () => {
    const totalServices = services.length;
    const pendingCount = services.filter((s) => s.status === "pending").length;
    const inProgressCount = services.filter((s) => s.status === "in_progress").length;
    const completedCount = services.filter((s) => s.status === "completed").length;
    const rejectedCount = services.filter((s) => s.status === "rejected").length;

    // Get common issues
    const damageTexts = services.map((s) => s.damage.toLowerCase());
    const commonIssues: Record<string, number> = {};

    const issueKeywords = [
      "baterai",
      "battery",
      "layar",
      "screen",
      "keyboard",
      "hang",
      "blue screen",
      "mati total",
      "tidak menyala",
      "overheat",
      "panas",
      "lambat",
      "slow",
      "virus",
      "harddisk",
      "ssd",
      "ram",
      "memori",
      "booting",
      "windows",
      "install ulang",
    ];

    damageTexts.forEach((text) => {
      issueKeywords.forEach((keyword) => {
        if (text.includes(keyword)) {
          commonIssues[keyword] = (commonIssues[keyword] || 0) + 1;
        }
      });
    });

    // Sort and get top 5 issues
    const sortedIssues = Object.entries(commonIssues)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      totalServices,
      pendingCount,
      inProgressCount,
      completedCount,
      rejectedCount,
      topIssues: sortedIssues,
    };
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Left column: Analytics */}
        <div className="lg:col-span-2">
          <Card className="mb-4 md:mb-6">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                <RobotIcon className="h-5 w-5 md:h-6 md:w-6" />
                Dashboard Analitik Rani AI
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 md:p-6">
              <Tabs defaultValue="summary" className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
                  <TabsList className="mb-2 sm:mb-0">
                    <TabsTrigger value="summary">Ringkasan</TabsTrigger>
                    <TabsTrigger value="charts">Grafik</TabsTrigger>
                  </TabsList>

                  <div className="flex flex-wrap gap-2">
                    <Button variant={activePeriod === "week" ? "default" : "outline"} size="sm" onClick={() => setActivePeriod("week")}>
                      Mingguan
                    </Button>
                    <Button variant={activePeriod === "month" ? "default" : "outline"} size="sm" onClick={() => setActivePeriod("month")}>
                      Bulanan
                    </Button>
                    <Button variant={activePeriod === "year" ? "default" : "outline"} size="sm" onClick={() => setActivePeriod("year")}>
                      Tahunan
                    </Button>
                  </div>
                </div>

                <TabsContent value="summary">
                  {isLoading ? (
                    <p>Memuat data...</p>
                  ) : (
                    <div className="space-y-4 md:space-y-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
                        {/* Summary cards */}
                        <Card>
                          <CardContent className="pt-4 md:pt-6 px-2 sm:px-4">
                            <div className="text-center">
                              <div className="text-xl md:text-2xl font-bold">{services.length}</div>
                              <p className="text-xs text-muted-foreground">Total Servis</p>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="pt-4 md:pt-6 px-2 sm:px-4">
                            <div className="text-center">
                              <div className="text-xl md:text-2xl font-bold">{services.filter((s) => s.status === "pending").length}</div>
                              <p className="text-xs text-muted-foreground">Pending</p>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="pt-4 md:pt-6 px-2 sm:px-4">
                            <div className="text-center">
                              <div className="text-xl md:text-2xl font-bold">{services.filter((s) => s.status === "in_progress").length}</div>
                              <p className="text-xs text-muted-foreground">Sedang Dikerjakan</p>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="pt-4 md:pt-6 px-2 sm:px-4">
                            <div className="text-center">
                              <div className="text-xl md:text-2xl font-bold">{services.filter((s) => s.status === "completed").length}</div>
                              <p className="text-xs text-muted-foreground">Selesai</p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Common issues */}
                      <div>
                        <h3 className="text-base md:text-lg font-medium mb-2">Masalah Umum</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                          {getServiceAnalysisSummary().topIssues.map(([issue, count], index) => (
                            <Card key={index}>
                              <CardContent className="p-2 sm:p-4">
                                <div className="text-center">
                                  <div className="font-bold text-sm md:text-base">{count}</div>
                                  <p className="text-xs text-muted-foreground capitalize truncate">{issue}</p>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>

                      {/* Recent services */}
                      <div>
                        <h3 className="text-base md:text-lg font-medium mb-2">Service Terbaru</h3>
                        <div className="space-y-2">
                          {services.slice(0, 5).map((service, index) => (
                            <Card key={index}>
                              <CardContent className="p-3 sm:p-4">
                                <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2 sm:gap-0">
                                  <div>
                                    <p className="font-medium text-sm md:text-base">{service.name}</p>
                                    <p className="text-xs md:text-sm text-muted-foreground truncate">
                                      {service.deviceType} - {service.brand || service.customBrand || service.computerTypes}
                                    </p>
                                    <p className="text-xs text-muted-foreground">{format(new Date(service.date), "dd MMMM yyyy", { locale: id })}</p>
                                  </div>
                                  <div
                                    className={`self-start sm:self-auto px-2 py-1 rounded-full text-xs ${
                                      service.status === "pending"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : service.status === "in_progress"
                                        ? "bg-blue-100 text-blue-800"
                                        : service.status === "completed"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                    }`}>
                                    {service.status === "pending" ? "Pending" : service.status === "in_progress" ? "Proses" : service.status === "completed" ? "Selesai" : "Ditolak"}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="charts">
                  {isLoading ? (
                    <p>Memuat data...</p>
                  ) : (
                    <div className="space-y-4 md:space-y-6">
                      {/* Device Type Distribution */}
                      <div>
                        <h3 className="text-base md:text-lg font-medium mb-2">Distribusi Tipe Perangkat</h3>
                        <div className="h-[200px] md:h-[250px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie data={deviceTypeData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                                {deviceTypeData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={DEVICE_COLORS[entry.name as keyof typeof DEVICE_COLORS] || COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Status Distribution */}
                      <div>
                        <h3 className="text-base md:text-lg font-medium mb-2">Distribusi Status</h3>
                        <div className="h-[200px] md:h-[250px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie data={statusData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                                {statusData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS] || COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Top Brands */}
                      <div>
                        <h3 className="text-base md:text-lg font-medium mb-2">Top 5 Brand</h3>
                        <div className="h-[200px] md:h-[250px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={brandData}
                              margin={{
                                top: 5,
                                right: 20,
                                left: 10,
                                bottom: 5,
                              }}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                              <YAxis tick={{ fontSize: 10 }} />
                              <Tooltip />
                              <Bar dataKey="value" fill="#8884d8" name="Jumlah" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Daily Service Trend */}
                      <div>
                        <h3 className="text-base md:text-lg font-medium mb-2">Tren Service Harian (30 Hari Terakhir)</h3>
                        <div className="h-[200px] md:h-[250px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={dailyServiceData}
                              margin={{
                                top: 5,
                                right: 20,
                                left: 10,
                                bottom: 5,
                              }}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" tick={{ fontSize: 9 }} interval={window.innerWidth < 768 ? 3 : 1} />
                              <YAxis tick={{ fontSize: 10 }} />
                              <Tooltip />
                              <Bar dataKey="count" fill="#0088FE" name="Service Masuk" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Right column: Chatbot */}
        <div>
          {/* Floating button untuk membuka chat */}
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
                    <SheetTitle className="text-lg font-semibold text-foreground">Rani AI Assistant</SheetTitle>
                  </div>
                </div>

                {/* Messages container */}
                <div className="flex-grow overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6 opacity-70">
                      <Bot size={48} className="mb-2 text-blue-500" />
                      <h3 className="text-xl font-medium mb-2">Selamat datang di Rani AI</h3>
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
                            <span className="font-medium text-sm">{message.role === "user" ? user?.displayName || "User" : "Rani AI"}</span>
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
        </div>
      </div>
    </div>
  );
}
