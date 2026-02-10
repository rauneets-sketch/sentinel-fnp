import React, { useEffect, useRef, useState } from "react";
import Highcharts from "highcharts";
import "./CombinedPassFailChart.css";

interface DailyData {
  date: string;
  passedJobs: number;
  failedJobs: number;
}

const CombinedPassFailChart: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<Highcharts.Chart | null>(null);
  const [chartData, setChartData] = useState<DailyData[]>([]);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize with last 7 days data
  const initializeData = (): DailyData[] => {
    const data: DailyData[] = [];

    // Sample data for last 7 days (today and previous 6 days)
    const passedCounts = [18, 13, 18, 22, 42, 40, 25];
    const failedCounts = [1, 4, 5, 24, 6, 8, 3];

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
        passedJobs: passedCounts[i],
        failedJobs: failedCounts[i],
      });
    }

    console.log("📅 Initialized chart data:", data);
    return data;
  };

  // Check if we need to update the date range (new day detected)
  const checkAndUpdateDateRange = () => {
    setChartData((prevData) => {
      if (prevData.length === 0) return prevData;

      const today = new Date().toISOString().split("T")[0];
      const lastDate = prevData[prevData.length - 1].date;

      // If today is already the last date, no need to update
      if (lastDate === today) {
        return prevData;
      }

      // New day detected - reinitialize with fresh 7-day window
      console.log(
        `📅 New day detected! Updating date range from ${lastDate} to ${today}`,
      );
      return initializeData();
    });
  };

  // Increment passed jobs for today
  const incrementTodayCount = () => {
    console.log(
      "🔄 [CombinedPassFailChart] incrementTodayCount called at:",
      new Date().toLocaleTimeString(),
    );
    setChartData((prevData) => {
      const newData = [...prevData];
      const today = "2026-02-07"; // Hardcoded to Feb 7

      const todayIndex = newData.findIndex((item) => item.date === today);

      if (todayIndex !== -1) {
        const oldValue = newData[todayIndex].passedJobs;
        newData[todayIndex] = {
          ...newData[todayIndex],
          passedJobs: newData[todayIndex].passedJobs + 2,
        };
        console.log(
          `📈 [CombinedPassFailChart] Updated passed jobs for ${today}: ${oldValue} → ${newData[todayIndex].passedJobs}`,
        );
      } else {
        console.warn(
          `⚠️ [CombinedPassFailChart] Today's date (${today}) not found in chart data`,
        );
      }

      return newData;
    });
  };

  // Initialize data on mount
  useEffect(() => {
    const initialData = initializeData();
    setChartData(initialData);
    console.log(
      "📊 [CombinedPassFailChart] Initialized combined chart with 7 days data:",
      initialData,
    );

    // Set up auto-increment every 1 hour (adds +2 to passed jobs)
    const intervalMs = 60 * 60 * 1000; // 1 hour in milliseconds

    updateIntervalRef.current = setInterval(() => {
      console.log("⏰ [CombinedPassFailChart] 1-hour interval triggered");
      // Increment today's count
      incrementTodayCount();
    }, intervalMs);

    console.log(
      `⏰ [CombinedPassFailChart] Auto-update set for every 1 hour (+2 passed jobs per update)`,
    );

    return () => {
      console.log("🧹 [CombinedPassFailChart] Cleaning up interval");
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, []);

  // Render chart when data changes
  useEffect(() => {
    console.log("🎨 [CombinedPassFailChart] Chart render useEffect triggered");
    if (!chartRef.current || !chartData || chartData.length === 0) {
      console.log(
        "⏭️ [CombinedPassFailChart] Chart rendering skipped - missing ref or data",
      );
      return;
    }

    const categories = chartData.map((item) => {
      const date = new Date(item.date);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    });

    const passedData = chartData.map((item) => item.passedJobs);
    const failedData = chartData.map((item) => item.failedJobs);

    // If chart exists, just update the data instead of destroying and recreating
    if (chartInstance.current) {
      try {
        console.log(
          "✅ [CombinedPassFailChart] Updating existing chart data (NO DESTROY/RECREATE)",
        );
        chartInstance.current.series[0].setData(passedData, false);
        chartInstance.current.series[1].setData(failedData, true);
        console.log("✨ [CombinedPassFailChart] Chart data updated smoothly");
      } catch (error) {
        console.error(
          "❌ [CombinedPassFailChart] Error updating chart data:",
          error,
        );
        // If update fails, recreate the chart
        chartInstance.current = null;
      }
      return;
    }

    // Create chart only on first render
    console.log(
      "🆕 [CombinedPassFailChart] Creating new chart for the first time",
    );

    // Tooltip formatter function
    const tooltipFormatter: Highcharts.TooltipFormatterCallbackFunction =
      function () {
        const point = this as any;
        const dateIndex = categories.indexOf(point.x);
        const fullDate = dateIndex !== -1 ? chartData[dateIndex].date : "";
        const isToday = fullDate === new Date().toISOString().split("T")[0];

        let html = `<div style="padding: 12px;">`;
        html += `<b style="color: #333; font-size: 14px;">${point.x}</b><br/>`;
        html += `<span style="color: #666; font-size: 12px;">${fullDate}</span><br/><br/>`;

        point.points.forEach((p: any) => {
          html += `<div style="margin: 4px 0;">`;
          html += `<span style="color: ${p.series.color}; font-weight: bold;">●</span> `;
          html += `<span style="color: #333;">${p.series.name}: <b>${p.y}</b></span>`;
          html += `</div>`;
        });

        if (isToday) {
          html += `<br/><span style="color: #10b981; font-size: 11px; font-weight: 600;">● Auto-updating today</span>`;
        }

        html += `</div>`;
        return html;
      };

    const chartOptions: Highcharts.Options = {
      chart: {
        type: "line",
        backgroundColor: "transparent",
        height: 500,
        marginBottom: 100,
      },
      title: {
        text: undefined,
      },
      xAxis: {
        categories: categories,
        title: {
          text: "Date",
          style: {
            color: "#666666",
            fontSize: "16px",
            fontWeight: "600",
          },
        },
        labels: {
          style: {
            color: "#333333",
            fontSize: "13px",
            fontWeight: "500",
          },
        },
        lineWidth: 2,
        lineColor: "#666666",
      },
      yAxis: {
        min: 0,
        title: {
          text: "Number of Jobs",
          style: {
            color: "#666666",
            fontSize: "16px",
            fontWeight: "600",
          },
        },
        labels: {
          style: {
            color: "#333333",
            fontSize: "13px",
          },
        },
        gridLineColor: "#e0e0e0",
        gridLineDashStyle: "Dash",
      },
      legend: {
        enabled: true,
        align: "center",
        verticalAlign: "bottom",
        floating: false,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        borderColor: "#cccccc",
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        itemStyle: {
          color: "#333333",
          fontSize: "14px",
          fontWeight: "600",
        },
        itemHoverStyle: {
          color: "#000000",
        },
        symbolHeight: 12,
        symbolWidth: 12,
        symbolRadius: 6,
      },
      plotOptions: {
        series: {
          events: {
            legendItemClick: function (this: any) {
              // Standard toggle behavior: clicking a legend item toggles that series visibility
              // Highcharts handles this automatically, so we just return true to allow default behavior
              return true;
            },
          },
        },
        line: {
          dataLabels: {
            enabled: true,
            style: {
              fontSize: "12px",
              fontWeight: "bold",
              textOutline: "2px contrast",
            },
            formatter: function () {
              // Only show label if the series is visible
              return (this as any).series.visible ? (this as any).y : null;
            },
          },
          enableMouseTracking: true,
          marker: {
            enabled: true,
            radius: 6,
            lineWidth: 2,
            lineColor: "#ffffff",
          },
          lineWidth: 3,
        },
      },
      tooltip: {
        useHTML: true,
        shared: true,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderColor: "#cccccc",
        borderRadius: 8,
        borderWidth: 2,
        shadow: true,
        style: {
          fontSize: "13px",
        },
        formatter: tooltipFormatter,
      },
      series: [
        {
          type: "line",
          name: "Passed Jobs",
          data: passedData,
          color: "#10b981",
          marker: {
            fillColor: "#10b981",
          },
        },
        {
          type: "line",
          name: "Failed Jobs",
          data: failedData,
          color: "#ef4444",
          marker: {
            fillColor: "#ef4444",
          },
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
              legend: {
                layout: "horizontal",
              },
            },
          },
        ],
      },
    };

    chartInstance.current = Highcharts.chart(chartRef.current, chartOptions);
    console.log("🎉 [CombinedPassFailChart] Chart created successfully");

    // No cleanup needed here since we're not destroying on data updates
  }, [chartData]);

  // Cleanup chart only on component unmount
  useEffect(() => {
    return () => {
      console.log(
        "🧹 [CombinedPassFailChart] Component unmounting, destroying chart",
      );
      if (chartInstance.current) {
        try {
          chartInstance.current.destroy();
          chartInstance.current = null;
        } catch (error) {
          console.error(
            "❌ [CombinedPassFailChart] Error destroying chart:",
            error,
          );
        }
      }
    };
  }, []);

  return (
    <div className="combined-pass-fail-chart">
      <div ref={chartRef} className="chart-container"></div>
    </div>
  );
};

export default CombinedPassFailChart;
