import React, { useEffect, useRef, useState } from "react";
import Highcharts from "highcharts";
import "./CombinedPassFailChart.css";

interface DailyData {
  date: string;
  passedJobs: number;
  failedJobs: number;
}

interface PlatformSpecificChartProps {
  platform: 'desktop' | 'mobile' | 'oms' | 'partner' | 'overall';
}

const PlatformSpecificChart: React.FC<PlatformSpecificChartProps> = ({ platform }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<Highcharts.Chart | null>(null);
  const [chartData, setChartData] = useState<DailyData[]>([]);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Platform-specific data configurations - ACTUAL DATA FROM USER
  const platformConfigs = {
    desktop: {
      name: 'Desktop Site',
      // Feb 5-11: Passed and Failed data (Feb 11: +1 passed, +1 failed = 14 passed, 1 failed)
      passedCounts: [23, 19, 10, 5, 6, 12, 16],
      failedCounts: [3, 3, 14, 13, 7,12, 5],
      color: '#3b82f6'
    },
    mobile: {
      name: 'Mobile Site',
      // Feb 5-11: Passed and Failed data (Feb 11: -1 passed = 10)
      passedCounts: [22, 20, 11, 6, 5, 14, 12],
      failedCounts: [2, 1, 13, 12, 7, 8, 9],
      color: '#8b5cf6'
    },
    oms: {
      name: 'OMS',
      // Feb 5-11: Passed and Failed data (Feb 7 has 1 failure, not 2)
      passedCounts: [4, 3, 4, 4, 4, 4, 3],
      failedCounts: [0, 1, 0, 0, 0, 0, 0],
      color: '#f59e0b'
    },
    partner: {
      name: 'Partner Panel',
      // Feb 5-11: Passed and Failed data (Feb 7 has 1 failure, not 2)
      passedCounts: [4, 3, 4, 4, 4, 4, 3],
      failedCounts: [0, 1, 0, 0, 0, 0, 0],
      color: '#10b981'
    },
   overall: {
      name: 'Overall (All Platforms)',
      // Feb 5-11: Total Passed across all platforms (Feb 11: 14+10+1+1=26)
      passedCounts: [48, 43, 24, 17, 15, 32, 34],
      // Feb 5-11: Total Failed across all platforms (Feb 11: 1+3+0+0=4)
      failedCounts: [5, 2, 13, 25, 14, 20, 14],
      color: '#4f46e5' // Darker indigo for better contrast
    }
  };

  // Initialize with last 7 days data for selected platform
  const initializeData = (): DailyData[] => {
    const data: DailyData[] = [];
    const config = platformConfigs[platform];

    const dates = [
      "2026-02-14",
      "2026-02-15",
      "2026-02-16",
      "2026-02-17",
      "2026-02-18",
      "2026-02-19",
      "2026-02-20",
    ];

    for (let i = 0; i < 7; i++) {
      data.push({
        date: dates[i],
        passedJobs: config.passedCounts[i],
        failedJobs: config.failedCounts[i],
      });
    }

    console.log(`📅 Initialized ${config.name} chart data:`, data);
    return data;
  };

  // Increment passed jobs for today
  const incrementTodayCount = () => {
    console.log(
      `🔄 [${platformConfigs[platform].name}] incrementTodayCount called at:`,
      new Date().toLocaleTimeString(),
    );
    setChartData((prevData) => {
      const newData = [...prevData];
      const today = "2026-02-11"; // Current date

      const todayIndex = newData.findIndex((item) => item.date === today);

      if (todayIndex !== -1) {
        const oldValue = newData[todayIndex].passedJobs;
        // Increment by 1 for platform-specific charts
        newData[todayIndex] = {
          ...newData[todayIndex],
          passedJobs: newData[todayIndex].passedJobs + 1,
        };
        console.log(
          `📈 [${platformConfigs[platform].name}] Updated passed jobs for ${today}: ${oldValue} → ${newData[todayIndex].passedJobs}`,
        );
      }

      return newData;
    });
  };

  // Initialize data on mount or when platform changes
  useEffect(() => {
    const initialData = initializeData();
    setChartData(initialData);
    console.log(
      `📊 [${platformConfigs[platform].name}] Initialized chart with 7 days data:`,
      initialData,
    );

    // Set up auto-increment every 1 hour (adds +1 to passed jobs)
    const intervalMs = 60 * 60 * 1000; // 1 hour in milliseconds

    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
    }

    updateIntervalRef.current = setInterval(() => {
      console.log(`⏰ [${platformConfigs[platform].name}] 1-hour interval triggered`);
      incrementTodayCount();
    }, intervalMs);

    console.log(
      `⏰ [${platformConfigs[platform].name}] Auto-update set for every 1 hour (+1 passed job per update)`,
    );

    return () => {
      console.log(`🧹 [${platformConfigs[platform].name}] Cleaning up interval`);
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [platform]);

  // Render chart when data changes
  useEffect(() => {
    console.log(`🎨 [${platformConfigs[platform].name}] Chart render useEffect triggered`);
    if (!chartRef.current || !chartData || chartData.length === 0) {
      console.log(
        `⏭️ [${platformConfigs[platform].name}] Chart rendering skipped - missing ref or data`,
      );
      return;
    }

    const config = platformConfigs[platform];
    const categories = chartData.map((item) => {
      const date = new Date(item.date);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    });

    const passedData = chartData.map((item) => item.passedJobs);
    const failedData = chartData.map((item) => item.failedJobs);

    // If chart exists, just update the data
    if (chartInstance.current) {
      try {
        console.log(
          `✅ [${config.name}] Updating existing chart data`,
        );
        chartInstance.current.series[0].setData(passedData, false);
        chartInstance.current.series[1].setData(failedData, true);
        console.log(`✨ [${config.name}] Chart data updated smoothly`);
      } catch (error) {
        console.error(
          `❌ [${config.name}] Error updating chart data:`,
          error,
        );
        chartInstance.current = null;
      }
      return;
    }

    // Create chart only on first render
    console.log(
      `🆕 [${config.name}] Creating new chart for the first time`,
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
          html += `<br/><span style="color: ${config.color}; font-size: 11px; font-weight: 600;">● Auto-updating today</span>`;
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
        text: `${config.name} - Test Execution Trend`,
        style: {
          color: config.color,
          fontSize: "18px",
          fontWeight: "600",
        },
      },
      subtitle: {
        text: 'Last 7 Days Performance',
        style: {
          color: '#666666',
          fontSize: '13px',
        },
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
            legendItemClick: function () {
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
    console.log(`🎉 [${config.name}] Chart created successfully`);
  }, [chartData, platform]);

  // Cleanup chart only on component unmount
  useEffect(() => {
    return () => {
      console.log(
        `🧹 [${platformConfigs[platform].name}] Component unmounting, destroying chart`,
      );
      if (chartInstance.current) {
        try {
          chartInstance.current.destroy();
          chartInstance.current = null;
        } catch (error) {
          console.error(
            `❌ [${platformConfigs[platform].name}] Error destroying chart:`,
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

export default PlatformSpecificChart;
