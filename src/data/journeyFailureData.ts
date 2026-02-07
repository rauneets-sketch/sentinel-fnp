// Sample journey failure data
// Replace this with your actual data from the JSON/API

export interface JourneyFailureData {
  journeyName: string;
  failedAttempts: number;
  time: string; // Format: "HH:MM" or ISO timestamp
  totalSteps: number;
  timeframe?: string;
  rawSteps?: ActualJourneyData[]; // Store original failed steps for tooltip
}

// Interface for your actual JSON data
export interface ActualJourneyData {
  status: string;
  step_name: string;
  end_time: string; // ISO timestamp like "2026-02-04T12:00:25.767+00:00"
  // Add other fields from your JSON if needed
}

// Function to convert your actual JSON data to chart format
export const convertActualDataToChartFormat = (
  jsonData: ActualJourneyData[],
): JourneyFailureData[] => {
  // Filter only FAILED status
  const failedSteps = jsonData.filter((item) => item.status === "FAILED");

  // Group by step_name and hour, storing raw steps
  const groupedData = new Map<
    string,
    Map<number, { count: number; steps: ActualJourneyData[] }>
  >();

  failedSteps.forEach((item) => {
    const date = new Date(item.end_time);
    const hour = date.getHours();

    // Include all hours (0-23)
    if (!groupedData.has(item.step_name)) {
      groupedData.set(item.step_name, new Map());
    }

    const hourMap = groupedData.get(item.step_name)!;
    if (!hourMap.has(hour)) {
      hourMap.set(hour, { count: 0, steps: [] });
    }
    const hourData = hourMap.get(hour)!;
    hourData.count += 1;
    hourData.steps.push(item);
  });

  // Convert to JourneyFailureData format
  const result: JourneyFailureData[] = [];
  groupedData.forEach((hourMap, stepName) => {
    hourMap.forEach((data, hour) => {
      result.push({
        journeyName: stepName,
        failedAttempts: data.count,
        time: `${hour.toString().padStart(2, "0")}:00`,
        totalSteps: data.count,
        timeframe: getTimeframe(hour),
        rawSteps: data.steps,
      });
    });
  });

  return result;
};

const getTimeframe = (hour: number): string => {
  if (hour >= 0 && hour < 6) return "early morning";
  if (hour >= 6 && hour < 9) return "morning";
  if (hour >= 9 && hour < 12) return "late morning";
  if (hour >= 12 && hour < 15) return "early afternoon";
  if (hour >= 15 && hour < 18) return "afternoon";
  if (hour >= 18 && hour < 21) return "evening";
  if (hour >= 21 && hour < 24) return "night";
  return "unknown";
};

// Sample data (for demonstration - replace with your actual data)
// To use your actual JSON data:
// 1. Import your JSON file or fetch from API
// 2. Use convertActualDataToChartFormat(yourJsonData)
export const sampleJourneyFailureData: JourneyFailureData[] = [
  {
    journeyName: "Homepage Exploration",
    failedAttempts: 15,
    time: "09:00",
    totalSteps: 5,
    timeframe: "late morning",
  },
  {
    journeyName: "Homepage Exploration",
    failedAttempts: 25,
    time: "14:00",
    totalSteps: 5,
    timeframe: "early afternoon",
  },
  {
    journeyName: "Homepage Exploration",
    failedAttempts: 18,
    time: "22:00",
    totalSteps: 5,
    timeframe: "night",
  },
  {
    journeyName: "User Login",
    failedAttempts: 8,
    time: "08:00",
    totalSteps: 3,
    timeframe: "morning",
  },
  {
    journeyName: "User Login",
    failedAttempts: 12,
    time: "10:00",
    totalSteps: 3,
    timeframe: "late morning",
  },
  {
    journeyName: "User Login",
    failedAttempts: 9,
    time: "20:00",
    totalSteps: 3,
    timeframe: "evening",
  },
  {
    journeyName: "Product Search",
    failedAttempts: 5,
    time: "07:00",
    totalSteps: 4,
    timeframe: "morning",
  },
  {
    journeyName: "Product Search",
    failedAttempts: 18,
    time: "11:00",
    totalSteps: 4,
    timeframe: "late morning",
  },
  {
    journeyName: "Product Search",
    failedAttempts: 14,
    time: "19:00",
    totalSteps: 4,
    timeframe: "evening",
  },
  {
    journeyName: "Checkout Process",
    failedAttempts: 20,
    time: "10:00",
    totalSteps: 8,
    timeframe: "late morning",
  },
  {
    journeyName: "Checkout Process",
    failedAttempts: 10,
    time: "06:00",
    totalSteps: 8,
    timeframe: "early morning",
  },
  {
    journeyName: "Checkout Process",
    failedAttempts: 16,
    time: "18:00",
    totalSteps: 8,
    timeframe: "afternoon",
  },
  {
    journeyName: "Account Creation",
    failedAttempts: 7,
    time: "09:00",
    totalSteps: 6,
    timeframe: "late morning",
  },
  {
    journeyName: "Account Creation",
    failedAttempts: 14,
    time: "15:00",
    totalSteps: 6,
    timeframe: "afternoon",
  },
  {
    journeyName: "Account Creation",
    failedAttempts: 11,
    time: "23:00",
    totalSteps: 6,
    timeframe: "night",
  },
  {
    journeyName: "International Phone Number Change",
    failedAttempts: 2,
    time: "14:01",
    totalSteps: 4,
    timeframe: "early afternoon",
  },
  {
    journeyName: "International Phone Number Change",
    failedAttempts: 2,
    time: "15:01",
    totalSteps: 4,
    timeframe: "afternoon",
  },
  {
    journeyName: "International Phone Number Change",
    failedAttempts: 1,
    time: "19:24",
    totalSteps: 4,
    timeframe: "evening",
  },
  {
    journeyName: "International Phone Number Change",
    failedAttempts: 2,
    time: "20:25",
    totalSteps: 4,
    timeframe: "evening",
  },
];

// Function to load data from your actual source
export const loadJourneyFailureData = async (): Promise<
  JourneyFailureData[]
> => {
  console.log("🚀 Starting to load journey failure data...");
  try {
    // Load the actual JSON data from your file
    console.log("📡 Fetching from: /run_id_e3de93d4_4c94_4cb4.json");
    const response = await fetch("/run_id_e3de93d4_4c94_4cb4.json");
    console.log("📥 Response status:", response.status, response.statusText);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const runs = await response.json();
    console.log("📊 Total runs in JSON:", runs.length);

    // Extract all steps_brief from all runs and filter for FAILED status
    const allFailedSteps: ActualJourneyData[] = [];

    runs.forEach((run: any) => {
      if (run.steps_brief && Array.isArray(run.steps_brief)) {
        run.steps_brief.forEach((step: any) => {
          if (step.status === "FAILED") {
            allFailedSteps.push({
              status: step.status,
              step_name: step.step_name,
              end_time: step.end_time,
            });
          }
        });
      }
    });

    console.log("❌ Total FAILED steps found:", allFailedSteps.length);
    console.log("📝 Sample failed steps:", allFailedSteps.slice(0, 3));

    // Convert to chart format
    const chartData = convertActualDataToChartFormat(allFailedSteps);
    console.log("📈 Chart data generated:", chartData.length, "data points");
    console.log("📊 Sample chart data:", chartData.slice(0, 5));

    return chartData;
  } catch (error) {
    console.error("💥 Error loading journey failure data:", error);
    console.log("⚠️ Falling back to sample data");
    // Fallback to sample data if file not found
    return sampleJourneyFailureData;
  }
};

// Function to parse data from your JSON structure
export const parseJourneyDataFromJson = (
  jsonData: any[],
): JourneyFailureData[] => {
  // Adapt this function based on your actual JSON structure
  // Example transformation:
  return jsonData.map((item) => ({
    journeyName: item.journey_name || item.name || "Unknown Journey",
    failedAttempts: item.failed_attempts || item.failures || 0,
    time: item.time || item.timestamp || new Date().toISOString(),
    totalSteps: item.total_steps || item.steps || 0,
    timeframe: item.timeframe || extractTimeframe(item.time),
  }));
};

// Helper function to determine timeframe from time
const extractTimeframe = (time: string): string => {
  try {
    const date = new Date(time);
    const hour = date.getHours();

    if (hour >= 0 && hour < 6) return "early morning";
    if (hour >= 6 && hour < 9) return "morning";
    if (hour >= 9 && hour < 12) return "late morning";
    if (hour >= 12 && hour < 15) return "early afternoon";
    if (hour >= 15 && hour < 18) return "afternoon";
    if (hour >= 18 && hour < 21) return "evening";
    return "night";
  } catch (error) {
    return "unknown";
  }
};
