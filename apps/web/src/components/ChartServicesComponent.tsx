"use client";
import React, { useState, useEffect } from "react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@repo/ui/components/ui/chart";
import { format, subMonths } from "date-fns";
import { id } from "date-fns/locale";

const chartData = [
  { month: "January", komputer: 186, laptop: 80 },
  { month: "February", komputer: 305, laptop: 200 },
  { month: "March", komputer: 237, laptop: 120 },
  { month: "April", komputer: 73, laptop: 190 },
  { month: "May", komputer: 209, laptop: 130 },
  { month: "June", komputer: 214, laptop: 140 },
];

const chartConfig = {
  komputer: {
    label: "Komputer",
    color: "hsl(var(--chart-1))",
  },
  laptop: {
    label: "Laptop",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export default function ChartServicesComponent() {
  const [dateRange, setDateRange] = useState("");

  useEffect(() => {
    const startDate = subMonths(new Date(), 1);
    const endDate = new Date();
    setDateRange(`${format(startDate, "MMM yyyy", { locale: id })} - ${format(endDate, "MMM yyyy", { locale: id })}`);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Servis Masuk</CardTitle>
        <CardDescription>{dateRange}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => value.slice(0, 3)} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line dataKey="komputer" type="monotone" stroke="var(--color-komputer)" strokeWidth={2} dot={false} />
            <Line dataKey="laptop" type="monotone" stroke="var(--color-laptop)" strokeWidth={2} dot={false} />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
