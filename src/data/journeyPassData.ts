// Journey pass data for successful test executions
// This mirrors the structure of journeyFailureData but for PASSED tests

export interface JourneyPassData {
  journeyName: string;
  passedAttempts: number;
  time: string; // Format: "HH:MM" or ISO timestamp
  totalSteps: number;
  timeframe?: string;
  rawSteps?: ActualJourneyData[];
}

// Interface for actual JSON data
export interface ActualJourneyData {
  status: string;
  step_name: string;
  end_time: string; // ISO timestamp
}

// Function to convert actual JSON data to chart format for PASSED tests
export const convertActualDataToPassFormat = (
  jsonData: ActualJourneyData[],
): JourneyPassData[] => {
  // Filter only PASSED status
  const passedSteps = jsonData.filter((item) => item.status === "PASSED");

  // Group by step_name and hour, storing raw steps
  const groupedData = new Map<
    string,
    Map<number, { count: number; steps: ActualJourneyData[] }>
  >();

  passedSteps.forEach((item) => {
    const date = new Date(item.end_time);
    const hour = date.getHours();

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

  // Convert to JourneyPassData format
  const result: JourneyPassData[] = [];
  groupedData.forEach((hourMap, stepName) => {
    hourMap.forEach((data, hour) => {
      result.push({
        journeyName: stepName,
        passedAttempts: data.count,
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

// Sample data for passed tests
export const sampleJourneyPassData: JourneyPassData[] = [
  {
    journeyName: "Homepage Exploration",
    passedAttempts: 45,
    time: "09:00",
    totalSteps: 5,
    timeframe: "late morning",
  },
  {
    journeyName: "Homepage Exploration",
    passedAttempts: 38,
    time: "14:00",
    totalSteps: 5,
    timeframe: "early afternoon",
  },
  {
    journeyName: "User Login",
    passedAttempts: 52,
    time: "09:00",
    totalSteps: 4,
    timeframe: "late morning",
  },
  {
    journeyName: "User Login",
    passedAttempts: 41,
    time: "11:00",
    totalSteps: 4,
    timeframe: "late morning",
  },
  {
    journeyName: "Product Search",
    passedAttempts: 35,
    time: "10:00",
    totalSteps: 6,
    timeframe: "late morning",
  },
  {
    journeyName: "Product Search",
    passedAttempts: 48,
    time: "18:00",
    totalSteps: 6,
    timeframe: "evening",
  },
  {
    journeyName: "Checkout Process",
    passedAttempts: 30,
    time: "10:00",
    totalSteps: 7,
    timeframe: "late morning",
  },
  {
    journeyName: "Checkout Process",
    passedAttempts: 42,
    time: "19:00",
    totalSteps: 7,
    timeframe: "evening",
  },
  {
    journeyName: "Account Creation",
    passedAttempts: 28,
    time: "15:00",
    totalSteps: 5,
    timeframe: "afternoon",
  },
  {
    journeyName: "Account Creation",
    passedAttempts: 36,
    time: "21:00",
    totalSteps: 5,
    timeframe: "night",
  },
];

// Function to load data from actual source
export const loadJourneyPassData = async (): Promise<JourneyPassData[]> => {
  console.log("🚀 Starting to load journey pass data...");
  try {
    // Try to load from your actual data source
    const response = await fetch("/data/test-results.json");

    if (response.ok) {
      const jsonData = await response.json();
      console.log("✅ Loaded JSON data:", jsonData);

      // Convert to pass format
      const passData = convertActualDataToPassFormat(jsonData);
      console.log("✅ Converted to pass format:", passData);
      return passData;
    }
  } catch (error) {
    console.log("⚠️ Could not load actual data, using sample data");
  }

  // Fallback to sample data
  return sampleJourneyPassData;
};
