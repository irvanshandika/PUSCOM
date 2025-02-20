/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useRef } from "react";
import { collection, getDocs, query, orderBy, where, Timestamp, DocumentData } from "firebase/firestore";
import { db } from "@/src/config/FirebaseConfig";
import { ServiceRequest } from "@/src/types/service";
import { useChat } from "@ai-sdk/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import MarkdownIt from "markdown-it";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, subMonths } from "date-fns";
import { id } from "date-fns/locale";
import RobotIcon from "@/src/components/icons/RobotIcon";
import PersonIcon from "@/src/components/icons/PersonIcon";
import { cn } from "@/src/lib/utils";
import { Send } from "lucide-react";
import { Textarea } from "@/src/components/ui/textarea";

const md = new MarkdownIt();

// Custom colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
const DEVICE_COLORS = {
  laptop: '#0088FE',
  computer: '#00C49F'
};
const STATUS_COLORS = {
  pending: '#FFBB28',
  in_progress: '#0088FE',
  completed: '#00C49F',
  rejected: '#FF8042'
};

export default function RaniAIServiceAssistant() {
  const [services, setServices] = useState<ServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activePeriod, setActivePeriod] = useState("week");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  
  // Analytics state
  const [deviceTypeData, setDeviceTypeData] = useState<any[]>([]);
  const [statusData, setStatusData] = useState<any[]>([]);
  const [brandData, setBrandData] = useState<any[]>([]);
  const [dailyServiceData, setDailyServiceData] = useState<any[]>([]);

  // AI Chat integration
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    initialMessages: [
      {
        id: "welcome",
        role: "assistant",
        content: "Halo! Saya Rani AI, asisten virtual PUSCOM yang siap membantu Anda menganalisa kerusakan dan data servis. Apa yang bisa saya bantu hari ini?"
      }
    ],
    api: "/api/chat/manajemen-servis",
    body: {
      // Passing service data context to the AI
      serviceData: true
    }
  });

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (services.length > 0) {
      prepareAnalyticsData();
    }
  }, [services, activePeriod]);

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
      filteredServices = services.filter(service => {
        const serviceDate = new Date(service.date);
        return serviceDate >= weekStart && serviceDate <= weekEnd;
      });
    } else if (activePeriod === "month") {
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);
      filteredServices = services.filter(service => {
        const serviceDate = new Date(service.date);
        return serviceDate >= monthStart && serviceDate <= monthEnd;
      });
    } else if (activePeriod === "year") {
      const yearStart = new Date(now.getFullYear(), 0, 1);
      const yearEnd = new Date(now.getFullYear(), 11, 31);
      filteredServices = services.filter(service => {
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

    const dailyCount = last30Days.map(dateStr => {
      const count = filteredServices.filter(service => 
        format(new Date(service.date), "yyyy-MM-dd") === dateStr
      ).length;
      return {
        date: format(new Date(dateStr), "dd MMM", { locale: id }),
        count
      };
    });

    setDailyServiceData(dailyCount);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  };

  const getServiceAnalysisSummary = () => {
    const totalServices = services.length;
    const pendingCount = services.filter(s => s.status === "pending").length;
    const inProgressCount = services.filter(s => s.status === "in_progress").length;
    const completedCount = services.filter(s => s.status === "completed").length;
    const rejectedCount = services.filter(s => s.status === "rejected").length;
    
    // Get common issues
    const damageTexts = services.map(s => s.damage.toLowerCase());
    const commonIssues: Record<string, number> = {};
    
    const issueKeywords = [
      "baterai", "battery", "layar", "screen", "keyboard", "hang", "blue screen",
      "mati total", "tidak menyala", "overheat", "panas", "lambat", "slow", "virus",
      "harddisk", "ssd", "ram", "memori", "booting", "windows", "install ulang"
    ];
    
    damageTexts.forEach(text => {
      issueKeywords.forEach(keyword => {
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
      topIssues: sortedIssues
    };
  };

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Analytics */}
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RobotIcon className="h-6 w-6" />
                Dashboard Analitik Rani AI
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="summary" className="space-y-4">
                <div className="flex justify-between items-center">
                  <TabsList>
                    <TabsTrigger value="summary">Ringkasan</TabsTrigger>
                    <TabsTrigger value="charts">Grafik</TabsTrigger>
                  </TabsList>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant={activePeriod === "week" ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setActivePeriod("week")}
                    >
                      Mingguan
                    </Button>
                    <Button 
                      variant={activePeriod === "month" ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setActivePeriod("month")}
                    >
                      Bulanan
                    </Button>
                    <Button 
                      variant={activePeriod === "year" ? "default" : "outline"} 
                      size="sm"
                      onClick={() => setActivePeriod("year")}
                    >
                      Tahunan
                    </Button>
                  </div>
                </div>

                <TabsContent value="summary">
                  {isLoading ? (
                    <p>Memuat data...</p>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* Summary cards */}
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-center">
                              <div className="text-2xl font-bold">{services.length}</div>
                              <p className="text-xs text-muted-foreground">Total Servis</p>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-center">
                              <div className="text-2xl font-bold">{services.filter(s => s.status === "pending").length}</div>
                              <p className="text-xs text-muted-foreground">Pending</p>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-center">
                              <div className="text-2xl font-bold">{services.filter(s => s.status === "in_progress").length}</div>
                              <p className="text-xs text-muted-foreground">Sedang Dikerjakan</p>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-center">
                              <div className="text-2xl font-bold">{services.filter(s => s.status === "completed").length}</div>
                              <p className="text-xs text-muted-foreground">Selesai</p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Common issues */}
                      <div>
                        <h3 className="text-lg font-medium mb-2">Masalah Umum</h3>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                          {getServiceAnalysisSummary().topIssues.map(([issue, count], index) => (
                            <Card key={index}>
                              <CardContent className="p-4">
                                <div className="text-center">
                                  <div className="font-bold">{count}</div>
                                  <p className="text-xs text-muted-foreground capitalize">{issue}</p>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>

                      {/* Recent services */}
                      <div>
                        <h3 className="text-lg font-medium mb-2">Service Terbaru</h3>
                        <div className="space-y-2">
                          {services.slice(0, 5).map((service, index) => (
                            <Card key={index}>
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-medium">{service.name}</p>
                                    <p className="text-sm text-muted-foreground">{service.deviceType} - {service.brand || service.customBrand || service.computerTypes}</p>
                                    <p className="text-xs text-muted-foreground">{format(new Date(service.date), "dd MMMM yyyy", { locale: id })}</p>
                                  </div>
                                  <div className={`px-2 py-1 rounded-full text-xs ${
                                    service.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                                    service.status === "in_progress" ? "bg-blue-100 text-blue-800" :
                                    service.status === "completed" ? "bg-green-100 text-green-800" :
                                    "bg-red-100 text-red-800"
                                  }`}>
                                    {service.status === "pending" ? "Pending" :
                                    service.status === "in_progress" ? "Proses" :
                                    service.status === "completed" ? "Selesai" :
                                    "Ditolak"}
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
                    <div className="space-y-6">
                      {/* Device Type Distribution */}
                      <div>
                        <h3 className="text-lg font-medium mb-2">Distribusi Tipe Perangkat</h3>
                        <div className="h-[250px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={deviceTypeData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                              >
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
                        <h3 className="text-lg font-medium mb-2">Distribusi Status</h3>
                        <div className="h-[250px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={statusData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                              >
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
                        <h3 className="text-lg font-medium mb-2">Top 5 Brand</h3>
                        <div className="h-[250px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={brandData}
                              margin={{
                                top: 5,
                                right: 30,
                                left: 20,
                                bottom: 5,
                              }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Bar dataKey="value" fill="#8884d8" name="Jumlah" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Daily Service Trend */}
                      <div>
                        <h3 className="text-lg font-medium mb-2">Tren Service Harian (30 Hari Terakhir)</h3>
                        <div className="h-[250px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={dailyServiceData}
                              margin={{
                                top: 5,
                                right: 30,
                                left: 20,
                                bottom: 5,
                              }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" />
                              <YAxis />
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
          <Card className="h-full flex flex-col">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <CardTitle className="flex items-center gap-2">
                <RobotIcon className="h-6 w-6" />
                <div>
                  <h1 className="text-lg font-bold">Rani AI</h1>
                  <p className="text-xs text-blue-100">Asisten Teknisi & Admin PUSCOM</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0">
              <ScrollArea className="flex-1 h-[600px] p-4" ref={scrollAreaRef}>
                <div className="space-y-4">
                  {messages.map((m) => (
                    <div key={m.id} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                      <div className={cn("max-w-[90%] rounded-2xl px-4 py-2", m.role === "user" ? "bg-blue-600 text-white" : "bg-muted")}>
                        <span className={`flex gap-2 mb-1 ${m.role === "user" ? "justify-end items-end" : "justify-start items-start"}`}>
                          {m.role === "user" ? <PersonIcon className="h-5 w-5" /> : <RobotIcon className="h-5 w-5" />}
                          <span>{m.role === "user" ? "Anda" : "Rani AI"}</span>
                        </span>
                        <div 
                          dangerouslySetInnerHTML={{ __html: md.render(m.content) }} 
                          className="prose prose-sm dark:prose-invert max-w-none" 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="p-4 border-t">
                <form ref={formRef} className="flex items-end gap-2" onSubmit={handleSubmit}>
                  <div className="relative flex-grow">
                    <Textarea 
                      value={input} 
                      onChange={handleInputChange} 
                      onKeyDown={handleKeyDown}
                      placeholder="Tanyakan tentang analisis kerusakan, rekapitulasi data, atau bantuan lainnya..." 
                      className="pr-10 resize-none" 
                      rows={2} 
                    />
                    <Button type="submit" size="icon" className="absolute right-2 bottom-2 h-8 w-8">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}