import React, { useEffect, useRef, useState } from "react";
import Highcharts from "highcharts";
import "./JourneyFailureTimeline.css";
import { loadJourneyFailureData } from "../data/journeyFailureData";

interface JourneyFailureData {
  journeyName: string;
  failedAttempts: number;
  time: string; // Format: "HH:MM" or timestamp
  totalSteps: number;
  timeframe?: string;
}

interface JourneyFailureTimelineProps {
  data?: JourneyFailureData[];
}

// Helper functions defined outside component
const generateTimeCategories = (): string[] => {
  const categories: string[] = [];
  for (let i = 0; i < 24; i++) {
    categories.push(`${i.toString().padStart(2, "0")}:00`);
  }
  return categories;
};

const extractHour = (timeString: string): number | null => {
  try {
    // Handle ISO timestamp
    if (timeString.includes("T") || timeString.includes("-")) {
      const date = new Date(timeString);
      return date.getHours();
    }

    // Handle HH:MM or HH:MM:SS format
    const timeParts = timeString.split(":");
    if (timeParts.length >= 2) {
      let hour = parseInt(timeParts[0], 10);
      // Return all hours 0-23 for 24-hour view
      if (hour >= 0 && hour < 24) {
        return hour;
      }
    }

    return null;
  } catch (error) {
    console.error("Error parsing time:", error);
    return null;
  }
};

const processJourneyData = (
  rawData: JourneyFailureData[],
): Highcharts.SeriesOptionsType[] => {
  console.log("🔧 Processing", rawData.length, "data items");
  // Group data by journey name
  const journeyMap = new Map<
    string,
    { hourData: number[]; rawStepsByHour: Map<number, any[]> }
  >();

  rawData.forEach((item) => {
    const hour = extractHour(item.time);

    if (hour !== null && hour >= 0 && hour < 24) {
      if (!journeyMap.has(item.journeyName)) {
        journeyMap.set(item.journeyName, {
          hourData: new Array(24).fill(0),
          rawStepsByHour: new Map(),
        });
        console.log("➕ New journey:", item.journeyName);
      }
      const journey = journeyMap.get(item.journeyName)!;
      journey.hourData[hour] += item.failedAttempts;
      journey.rawStepsByHour.set(hour, (item as any).rawSteps || []);
    }
  });

  console.log("📦 Total unique journeys:", journeyMap.size);

  // Convert to Highcharts series format
  const series: Highcharts.SeriesOptionsType[] = [];
  const colors = [
    "#ff6b6b",
    "#4ecdc4",
    "#45b7d1",
    "#f9ca24",
    "#6c5ce7",
    "#a29bfe",
    "#fd79a8",
    "#fdcb6e",
  ];

  let colorIndex = 0;
  journeyMap.forEach((journey, journeyName) => {
    console.log(
      "📊 Adding series:",
      journeyName,
      "with data:",
      journey.hourData,
    );

    // Attach raw steps metadata to each data point
    const dataWithMetadata = journey.hourData.map((value, hour) => ({
      y: value,
      rawSteps: journey.rawStepsByHour.get(hour) || [],
    }));

    series.push({
      type: "column",
      name: journeyName,
      data: dataWithMetadata,
      color: colors[colorIndex % colors.length],
    });
    colorIndex++;
  });

  console.log("✅ Total series created:", series.length);
  return series;
};

const JourneyFailureTimeline: React.FC<JourneyFailureTimelineProps> = ({
  data: propData,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<Highcharts.Chart | null>(null);
  const [data, setData] = useState<JourneyFailureData[]>(propData || []);
  const [isolatedSeries, setIsolatedSeries] = useState<string | null>(null);

  useEffect(() => {
    // Load data if not provided via props
    if (!propData || propData.length === 0) {
      console.log("Loading journey failure data...");
      loadJourneyFailureData().then((loadedData) => {
        console.log("Journey failure data loaded:", loadedData);
        setData(loadedData);
      });
    }
  }, [propData]);

  useEffect(() => {
    console.log("Chart useEffect triggered, data:", data);
    if (!chartRef.current || !data || data.length === 0) {
      console.log("Chart rendering skipped - missing ref or data");
      return;
    }

    // Process data to group by hour (12 AM to 12 PM)
    const processedData = processJourneyData(data);
    console.log("Processed data for chart:", processedData);

    // Destroy previous chart instance
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Create the chart
    chartInstance.current = Highcharts.chart(chartRef.current, {
      chart: {
        type: "column",
        backgroundColor: "transparent",
        height: window.innerWidth <= 768 ? 500 : 400,
        marginBottom: window.innerWidth <= 768 ? 180 : 100,
      },
      title: {
        text: undefined,
      },
      subtitle: {
        text: undefined,
      },
      xAxis: {
        categories: generateTimeCategories(), // 00:00, 01:00, 02:00, ..., 23:00
        title: {
          text: "Time of Day",
          style: {
            color: "#666666",
          },
        },
        labels: {
          enabled: true,
          y: 25,
          rotation: -45,
          style: {
            color: "#333333",
            fontSize: "11px",
          },
        },
        lineWidth: 1,
        lineColor: "#666666",
        tickLength: 5,
        tickColor: "#666666",
      },
      yAxis: {
        min: 0,
        title: {
          text: "Number of Failed Attempts",
          style: {
            color: "#666666",
          },
        },
        labels: {
          style: {
            color: "#333333",
          },
        },
        stackLabels: {
          enabled: true,
          style: {
            fontWeight: "bold",
            color: "#333333",
          },
        },
      },
      legend: {
        enabled: true,
        align: "center",
        verticalAlign: "top",
        floating: true,
        y: 10,
        x: 0,
        width: 620,
        itemWidth: 250,
        layout: "horizontal",
        backgroundColor: "#2a2a2a",
        borderColor: "#444444",
        borderWidth: 1,
        padding: 8,
        shadow: false,
        itemStyle: {
          color: "#ffffff",
          fontSize: "11px",
        },
        itemHoverStyle: {
          color: "#ff6b6b",
        },
        itemHiddenStyle: {
          color: "#666666",
        },
      },
      tooltip: {
        useHTML: true,
        formatter: function () {
          const point = this as any;
          const rawSteps = point.rawSteps || [];

          if (rawSteps.length > 0) {
            let html = `<div style="padding: 8px;"><b>Time: ${point.x}</b><br/><br/>`;
            rawSteps.forEach((step: any, index: number) => {
              html += `<div style="margin-bottom: 10px; border-left: 3px solid ${point.series.color}; padding-left: 8px;">`;
              html += `<b>Failure ${index + 1}:</b><br/>`;
              html += `1. status: "${step.status}"<br/>`;
              html += `2. step_name: "${step.step_name}"<br/>`;
              html += `3. end_time: "${step.end_time}"<br/>`;
              html += `</div>`;
            });
            html += `<b>Total: ${rawSteps.length} failures</b></div>`;
            return html;
          }

          return `<b>Time: ${point.x}</b><br/>${point.series.name}: ${point.y} failures<br/>Total: ${point.stackTotal}`;
        },
        backgroundColor: "#2a2a2a",
        borderColor: "#444444",
        style: {
          color: "#ffffff",
        },
      },
      plotOptions: {
        column: {
          stacking: "normal",
          dataLabels: {
            enabled: true,
            color: "#ffffff",
            formatter: function () {
              return this.y ? this.y : "";
            },
          },
          events: {
            legendItemClick: function (this: any) {
              const chart = this.chart;
              const clickedSeries = this;
              const clickedSeriesName = clickedSeries.name;

              console.log("Legend clicked:", clickedSeriesName);

              // Get current isolated series from our state
              const currentIsolated = isolatedSeries;
              console.log("Currently isolated:", currentIsolated);

              if (currentIsolated === clickedSeriesName) {
                // If clicking the currently isolated series, show all
                console.log("Showing all series - was isolated");
                chart.series.forEach((s: any) => {
                  s.setVisible(true, false);
                });
                setIsolatedSeries(null);
                chart.redraw();
              } else {
                // Hide all others, show only clicked one
                console.log("Isolating series:", clickedSeriesName);
                chart.series.forEach((s: any) => {
                  if (s.name !== clickedSeriesName) {
                    s.setVisible(false, false);
                  } else {
                    s.setVisible(true, false);
                  }
                });
                setIsolatedSeries(clickedSeriesName);
                chart.redraw();
              }

              // Prevent default legend click behavior
              return false;
            },
          },
        },
      },
      series: processedData,
      credits: {
        enabled: false,
      },
      responsive: {
        rules: [
          {
            condition: {
              maxWidth: 768,
            },
            chartOptions: {
              legend: {
                enabled: true,
              },
            },
          },
        ],
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  return (
    <div className="journey-failure-timeline">
      <div ref={chartRef} className="chart-container"></div>
    </div>
  );
};

export default JourneyFailureTimeline;
