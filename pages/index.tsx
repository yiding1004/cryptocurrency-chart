"use client";

import { Inter } from "next/font/google";
import { useState, useEffect } from "react";
import {
  ChartsAxisHighlight,
  ChartsReferenceLine,
  ChartsTooltip,
  ChartsXAxis,
  ChartsYAxis,
  LineHighlightPlot,
  LinePlot,
  MarkPlot,
  ResponsiveChartContainer,
} from "@mui/x-charts";
import { ChartsLegend } from "@mui/x-charts/ChartsLegend";

const inter = Inter({ subsets: ["latin"] });

const inputData = {
  json: {
    tokens: [
      "ibc/C4CFF46FD6DE35CA4CF4CE031E643C8FDC9BA4B99AE598E9B0ED98FE3A2319F9",
      "untrn",
    ],
    chainId: "neutron-1",
    dateRange: "D7",
  },
};
const jsonString = JSON.stringify(inputData);
const urlEncodedString = encodeURIComponent(jsonString);

export default function Home() {
  const [ATOM, setATOM] = useState<any[]>([]);
  const [NTRN, setNTRN] = useState<any[]>([]);
  const [minOrMaxATOMValue, setMinOrMaxATOMValue] = useState<number[]>([]);
  const [minOrMaxNTRNValue, setMinOrMaxNTRNValue] = useState<number[]>([]);
  const [avgValue, setAvgValue] = useState<number[]>([]);
  const [dates, setDates] = useState<any[]>([]);

  const getDates = (series: any[]): number[] => series.map((item) => item.time);
  const getY = (series: any[]): number[] => series.map((item) => item.value);

  const getAvgValue = (series: any[]): number => {
    if (series.length === 0) {
      return 0;
    }
    const sum = series.reduce(
      (accumulator, currentValue) => accumulator + currentValue,
      0
    );
    const average = sum / series.length;
    return Number(average.toFixed(2));
  };

  const getReadableDate = (item: number) => {
    const date = new Date(item * 1000);
    const formattedTime = date.toLocaleString("en-US", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    });
    return formattedTime;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `https://app.astroport.fi/api/trpc/charts.prices?input=${urlEncodedString}`
        );
        const {
          result: {
            data: { json },
          },
        } = await response.json();
        const ibc =
          json[
            "ibc/C4CFF46FD6DE35CA4CF4CE031E643C8FDC9BA4B99AE598E9B0ED98FE3A2319F9"
          ];
        const untrn = json["untrn"];
        setDates(getDates(ibc.series));
        setATOM(getY(ibc.series));
        setNTRN(getY(untrn.series));
        setMinOrMaxATOMValue([ibc.minValue, ibc.maxValue]);
        setMinOrMaxNTRNValue([untrn.minValue, untrn.maxValue]);
        setAvgValue([
          getAvgValue(getY(ibc.series)),
          getAvgValue(getY(untrn.series)),
        ]);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
    >
      <ResponsiveChartContainer
        xAxis={[
          {
            data: dates,
            id: "x-axis-id",
            scaleType: "time",
            valueFormatter: getReadableDate,
            label: "Time",
          },
          { labelFontSize: 50 },
        ]}
        yAxis={[{ label: "Price" }]}
        series={[
          { type: "line", label: `ATOM (Average:${avgValue[0]})`, data: ATOM },
          { type: "line", label: `NTRN (Average:${avgValue[1]})`, data: NTRN },
        ]}
        height={600}
        margin={{
          left: 96,
          right: 96,
        }}
      >
        <LinePlot />
        <ChartsXAxis />
        <ChartsYAxis />
        <MarkPlot />
        <ChartsLegend />
        <LineHighlightPlot />
        <ChartsAxisHighlight x="line" />
        <ChartsTooltip trigger="axis" />
        <ChartsReferenceLine
          y={minOrMaxATOMValue[0] || 0}
          label={`ATOM Min: ${minOrMaxATOMValue[0]}`}
          labelAlign="end"
          lineStyle={{ stroke: "#128128", strokeDasharray: "3 3" }}
        />
        <ChartsReferenceLine
          y={minOrMaxATOMValue[1] || 0}
          label={`ATOM Max: ${minOrMaxATOMValue[1]}`}
          labelAlign="end"
          lineStyle={{ stroke: "#128128", strokeDasharray: "3 3" }}
        />
        <ChartsReferenceLine
          y={minOrMaxNTRNValue[0] || 0}
          spacing={-14}
          label={`NTRN Min: ${minOrMaxNTRNValue[0]}`}
          labelAlign="end"
          lineStyle={{ stroke: "#998909", strokeDasharray: "3 3" }}
        />
        <ChartsReferenceLine
          y={minOrMaxNTRNValue[1] || 0}
          label={`NTRN Max: ${minOrMaxNTRNValue[1]}`}
          labelAlign="end"
          lineStyle={{ stroke: "#998909", strokeDasharray: "3 3" }}
        />
      </ResponsiveChartContainer>
    </main>
  );
}
