/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import {  ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/src/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { collection, getDocs, query,  orderBy } from "firebase/firestore";
import { db } from "@/src/config/FirebaseConfig";

const chartConfig = {
  komputer: {
    label: "Komputer",
    color: "hsl(var(--chart-1))",
  },
  laptop: {
    label: "Laptop",
    color: "hsl(var(--chart-2))",
  },
};

export default function ChartServicesComponent() {
  const [timeRange, setTimeRange] = React.useState("90d");
  const [chartData, setChartData] = React.useState<any[]>([]);

  // Fetch service requests and process data
  const fetchServiceData = async () => {
    try {
      const servicesRef = collection(db, "service_requests");
      const q = query(servicesRef, orderBy("createdAt", "asc"));
      const querySnapshot = await getDocs(q);
      const services = querySnapshot.docs.map((doc) => doc.data());

      // Process data to aggregate by date
      const aggregatedData: { date: string; komputer: number; laptop: number }[] = [];

      services.forEach((service: any) => {
        const date = service.createdAt.toDate();
        const month = date.toLocaleString("default", { month: "short", year: "numeric" }); // Format month (e.g., "Apr 2024")
        const existingData = aggregatedData.find((entry) => entry.date === month);

        if (existingData) {
          if (service.deviceType === "Komputer") {
            existingData.komputer += 1;
          } else if (service.deviceType === "Laptop") {
            existingData.laptop += 1;
          }
        } else {
          aggregatedData.push({
            date: month,
            komputer: service.deviceType === "Komputer" ? 1 : 0,
            laptop: service.deviceType === "Laptop" ? 1 : 0,
          });
        }
      });

      setChartData(aggregatedData);
    } catch (error) {
      console.error("Error fetching service data:", error);
    }
  };

  React.useEffect(() => {
    fetchServiceData();
  }, [timeRange]);

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date);
    const referenceDate = new Date();
    let daysToSubtract = 90;
    if (timeRange === "30d") {
      daysToSubtract = 30;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return date >= startDate;
  });

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>Area Chart - Interactive</CardTitle>
          <CardDescription>Showing the number of services by device type</CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[160px] rounded-lg sm:ml-auto" aria-label="Select a value">
            <SelectValue placeholder="Last 3 months" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90d" className="rounded-lg">
              Last 3 months
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              Last 30 days
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              Last 7 days
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillKomputer" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-komputer)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-komputer)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillLaptop" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-laptop)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-laptop)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area dataKey="laptop" type="natural" fill="url(#fillLaptop)" stroke="var(--color-laptop)" stackId="a" />
            <Area dataKey="komputer" type="natural" fill="url(#fillKomputer)" stroke="var(--color-komputer)" stackId="a" />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}