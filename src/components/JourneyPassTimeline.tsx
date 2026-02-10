import React, { useEffect, useRef, useState } from "react";
import Highcharts from "highcharts";
import "./JourneyPassTimeline.css";

interface DailyPassData {
  date: string;
  passedJobs: number;
}

interface JourneyPassTimelineProps {
  data?: DailyPassData[];
}

// Helper function to generate last 7 days categories
const generateDayCategories = (data: DailyPassData[]): string[] => {
  return data.map((item) => {
    const date = new Date(item.date);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  });
};

const JourneyPassTimeline: React.FC<JourneyPassTimelineProps> = ({
  data: propData,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<Highcharts.Chart | null>(null);
  const [chartData, setChartData] = useState<DailyPassData[]>([]);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize with last 7 days data
  const initializeData = (): DailyPassData[] => {
    const data: DailyPassData[] = [];

    // Sample data for last 7 days (Day 1 = Feb 1, Day 7 = Feb 7)
    const sampleCounts = [18, 13, 18, 22, 42, 40, 38]

    // Force dates to be Feb 1-7, 2026
    const dates = [
      "2026-02-04",
      "2026-02-05",
      "2026-02-06",
      "2026-02-07",
      "2026-02-08",
      "2026-02-09",
      "2026-02-10",
    ];

    for (let i = 0; i < 7; i++) {
      data.push({
        date: dates[i],
        passedJobs: sampleCounts[i],
      });
    }

    return data;
  };

  // Increment passed jobs for today
  const incrementTodayCount = () => {
    console.log(
      "🔄 [JourneyPassTimeline] incrementTodayCount called at:",
      new Date().toLocaleTimeString(),
    );
    setChartData((prevData) => {
      const newData = [...prevData];
      const today = "2026-02-07"; // Hardcoded to Feb 7

      // Find today's entry
      const todayIndex = newData.findIndex((item) => item.date === today);

      if (todayIndex !== -1) {
        const oldValue = newData[todayIndex].passedJobs;
        // Increment today's count by 2
        newData[todayIndex] = {
          ...newData[todayIndex],
          passedJobs: newData[todayIndex].passedJobs + 2,
        };
        console.log(
          `📈 [JourneyPassTimeline] Updated passed jobs for ${today}: ${oldValue} → ${newData[todayIndex].passedJobs}`,
        );
      } else {
        console.warn(
          `⚠️ [JourneyPassTimeline] Today's date (${today}) not found in chart data`,
        );
      }

      return newData;
    });
  };

  // Check and refresh data at midnight
  const checkAndRefreshData = () => {
    const now = new Date();
    const currentDate = now.toISOString().split("T")[0];

    setChartData((prevData) => {
      const lastDate = prevData[prevData.length - 1]?.date;

      // If the last date in our data is not today, refresh the entire dataset
      if (lastDate !== currentDate) {
        console.log(
          `📅 Date changed! Refreshing 7-day window from ${lastDate} to ${currentDate}`,
        );
        return initializeData();
      }

      return prevData;
    });
  };

  // Initialize data on mount
  useEffect(() => {
    const initialData = propData || initializeData();
    setChartData(initialData);
    console.log(
      "📊 [JourneyPassTimeline] Initialized chart with 7 days data:",
      initialData,
    );

    // Set up auto-increment every 2 minutes (adds +2 each time)
    const intervalMs = 2 * 60 * 1000; // 2 minutes in milliseconds

    updateIntervalRef.current = setInterval(() => {
      console.log("⏰ [JourneyPassTimeline] 2-minute interval triggered");
      incrementTodayCount();
    }, intervalMs);

    console.log(
      `⏰ [JourneyPassTimeline] Auto-update set for every 2 minutes (+2 jobs per update)`,
    );

    // Cleanup on unmount
    return () => {
      console.log("🧹 [JourneyPassTimeline] Cleaning up interval");
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [propData]);

  // Render chart when data changes
  useEffect(() => {
    console.log(
      "🎨 [JourneyPassTimeline] Chart render useEffect triggered, data:",
      chartData,
    );
    if (!chartRef.current || !chartData || chartData.length === 0) {
      console.log(
        "⏭️ [JourneyPassTimeline] Chart rendering skipped - missing ref or data",
      );
      return;
    }

    // Format data for Highcharts
    const categories = generateDayCategories(chartData);
    const seriesData = chartData.map((item) => item.passedJobs);

    // If chart exists, just update the data instead of destroying and recreating
    if (chartInstance.current) {
      try {
        console.log(
          "✅ [JourneyPassTimeline] Updating existing chart data (NO DESTROY/RECREATE)",
        );
        chartInstance.current.series[0].setData(seriesData, true);
        console.log("✨ [JourneyPassTimeline] Chart data updated smoothly");
      } catch (error) {
        console.error(
          "❌ [JourneyPassTimeline] Error updating chart data:",
          error,
        );
        // If update fails, recreate the chart
        chartInstance.current = null;
      }
      return;
    }

    // Create chart only on first render
    console.log(
      "🆕 [JourneyPassTimeline] Creating new chart for the first time",
    );
    const chartOptions: Highcharts.Options = {
      chart: {
        type: "line",
        backgroundColor: "transparent",
        height: window.innerWidth <= 768 ? 500 : 400,
        marginBottom: window.innerWidth <= 768 ? 100 : 80,
      },
      title: {
        text: undefined,
      },
      subtitle: {
        text: undefined,
      },
      xAxis: {
        categories: categories,
        title: {
          text: "Date",
          style: {
            color: "#666666",
            fontSize: "14px",
          },
        },
        labels: {
          enabled: true,
          style: {
            color: "#333333",
            fontSize: "12px",
          },
        },
        lineWidth: 2,
        lineColor: "#666666",
      },
      yAxis: {
        min: 0,
        title: {
          text: "Number of Passed Jobs",
          style: {
            color: "#666666",
            fontSize: "14px",
          },
        },
        labels: {
          style: {
            color: "#333333",
          },
        },
        gridLineColor: "#444444",
      },
      legend: {
        enabled: false,
      },
      tooltip: {
        useHTML: true,
        formatter: function () {
          const point = this as any;
          const dateIndex = categories.indexOf(point.x);
          const fullDate = dateIndex !== -1 ? chartData[dateIndex].date : "";
          const isToday = fullDate === new Date().toISOString().split("T")[0];

          return `
            <div style="padding: 10px; background: #2a2a2a; border: 1px solid #444; border-radius: 4px;">
              <b style="color: #4ecdc4;">${point.x}</b><br/>
              <span style="color: #fff;">Full Date: ${fullDate}</span><br/>
              <span style="color: #fff;">Passed Jobs: <b>${point.y}</b></span>
              ${isToday ? '<br/><span style="color: #10b981; font-size: 11px;">● Auto-updating today</span>' : ""}
            </div>
          `;
        },
        backgroundColor: "transparent",
        borderWidth: 0,
        shadow: false,
      },
      plotOptions: {
        line: {
          dataLabels: {
            enabled: true,
            color: "#ffffff",
            style: {
              fontSize: "13px",
              fontWeight: "bold",
              textOutline: "2px contrast",
            },
          },
          enableMouseTracking: true,
          marker: {
            enabled: true,
            radius: 7,
            fillColor: "#4ecdc4",
            lineWidth: 3,
            lineColor: "#ffffff",
          },
          lineWidth: 3,
          color: "#4ecdc4",
        },
      },
      series: [
        {
          type: "line",
          name: "Passed Jobs",
          data: seriesData,
        },
      ],
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
              chart: {
                height: 400,
              },
              xAxis: {
                labels: {
                  rotation: -45,
                },
              },
            },
          },
        ],
      },
    };

    chartInstance.current = Highcharts.chart(chartRef.current, chartOptions);
    console.log("🎉 [JourneyPassTimeline] Chart created successfully");

    // No cleanup needed here since we're not destroying on data updates
  }, [chartData]);

  // Cleanup chart only on component unmount
  useEffect(() => {
    return () => {
      console.log(
        "🧹 [JourneyPassTimeline] Component unmounting, destroying chart",
      );
      if (chartInstance.current) {
        try {
          chartInstance.current.destroy();
          chartInstance.current = null;
        } catch (error) {
          console.error(
            "❌ [JourneyPassTimeline] Error destroying chart:",
            error,
          );
        }
      }
    };
  }, []);

  return (
    <div className="journey-pass-timeline">
      <div ref={chartRef} className="chart-container"></div>
    </div>
  );
};

export default JourneyPassTimeline;










