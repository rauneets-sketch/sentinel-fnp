/**
 * Data Conversion Utilities
 * Use these functions to convert your actual journey failure data
 * into the format required by the JourneyFailureTimeline component
 */

import { JourneyFailureData } from './journeyFailureData';

/**
 * Example 1: Convert from your JSON structure
 * Modify this based on your actual data structure
 */
export const convertFromYourJsonFormat = (rawData: any[]): JourneyFailureData[] => {
  return rawData.map((item) => ({
    journeyName: item.journeyName || item.name || item.journey_name || "Unknown Journey",
    failedAttempts: item.failedAttempts || item.failed || item.failures || 0,
    time: item.time || item.timestamp || item.datetime || new Date().toISOString(),
    totalSteps: item.totalSteps || item.steps || item.total_steps || 0,
    timeframe: item.timeframe || determineTimeframe(item.time),
  }));
};

/**
 * Example 2: Convert from API response
 */
export const convertFromApiResponse = (apiResponse: any): JourneyFailureData[] => {
  // Assuming API returns { data: [...], status: 'success' }
  if (!apiResponse || !apiResponse.data) {
    console.error('Invalid API response format');
    return [];
  }

  return apiResponse.data.map((item: any) => ({
    journeyName: item.journey_name,
    failedAttempts: parseInt(item.failed_attempts, 10) || 0,
    time: item.time_of_failure,
    totalSteps: parseInt(item.total_steps, 10) || 0,
    timeframe: item.timeframe,
  }));
};

/**
 * Example 3: Convert from CSV data
 */
export const convertFromCsvData = (csvRows: string[][]): JourneyFailureData[] => {
  // Assuming first row is headers: journey_name, failed_attempts, time, total_steps
  const headers = csvRows[0];
  const dataRows = csvRows.slice(1);

  return dataRows.map((row) => {
    const item: any = {};
    headers.forEach((header, index) => {
      item[header] = row[index];
    });

    return {
      journeyName: item.journey_name || "Unknown",
      failedAttempts: parseInt(item.failed_attempts, 10) || 0,
      time: item.time,
      totalSteps: parseInt(item.total_steps, 10) || 0,
      timeframe: determineTimeframe(item.time),
    };
  });
};

/**
 * Example 4: Filter data for specific time range (12 AM - 12 PM)
 */
export const filterByTimeRange = (
  data: JourneyFailureData[],
  startHour: number = 0,
  endHour: number = 12
): JourneyFailureData[] => {
  return data.filter((item) => {
    const hour = extractHourFromTime(item.time);
    return hour !== null && hour >= startHour && hour <= endHour;
  });
};

/**
 * Example 5: Aggregate data by journey and hour
 */
export const aggregateByJourneyAndHour = (data: JourneyFailureData[]): JourneyFailureData[] => {
  const aggregated = new Map<string, JourneyFailureData>();

  data.forEach((item) => {
    const hour = extractHourFromTime(item.time);
    if (hour === null) return;

    const key = `${item.journeyName}_${hour}`;
    
    if (aggregated.has(key)) {
      const existing = aggregated.get(key)!;
      existing.failedAttempts += item.failedAttempts;
    } else {
      aggregated.set(key, {
        ...item,
        time: `${hour.toString().padStart(2, '0')}:00`,
      });
    }
  });

  return Array.from(aggregated.values());
};

/**
 * Example 6: Sort data by time
 */
export const sortByTime = (data: JourneyFailureData[]): JourneyFailureData[] => {
  return [...data].sort((a, b) => {
    const hourA = extractHourFromTime(a.time) || 0;
    const hourB = extractHourFromTime(b.time) || 0;
    return hourA - hourB;
  });
};

/**
 * Example 7: Get top N failing journeys
 */
export const getTopFailingJourneys = (
  data: JourneyFailureData[],
  topN: number = 5
): string[] => {
  const journeyTotals = new Map<string, number>();

  data.forEach((item) => {
    const current = journeyTotals.get(item.journeyName) || 0;
    journeyTotals.set(item.journeyName, current + item.failedAttempts);
  });

  return Array.from(journeyTotals.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map((entry) => entry[0]);
};

/**
 * Example 8: Filter by specific journeys
 */
export const filterByJourneys = (
  data: JourneyFailureData[],
  journeyNames: string[]
): JourneyFailureData[] => {
  return data.filter((item) => journeyNames.includes(item.journeyName));
};

// ====== Helper Functions ======

/**
 * Determine timeframe from time string
 */
function determineTimeframe(timeString: string): string {
  const hour = extractHourFromTime(timeString);
  
  if (hour === null) return "unknown";
  if (hour >= 0 && hour < 6) return "early morning";
  if (hour >= 6 && hour < 9) return "morning";
  if (hour >= 9 && hour < 12) return "late morning";
  if (hour >= 12 && hour < 15) return "early afternoon";
  if (hour >= 15 && hour < 18) return "afternoon";
  if (hour >= 18 && hour < 21) return "evening";
  return "night";
}

/**
 * Extract hour from various time formats
 */
function extractHourFromTime(timeString: string): number | null {
  try {
    // Handle ISO timestamp (2024-02-04T14:30:00Z)
    if (timeString.includes('T') || timeString.includes('-')) {
      const date = new Date(timeString);
      return date.getHours();
    }
    
    // Handle HH:MM or HH:MM:SS format
    const timeParts = timeString.split(':');
    if (timeParts.length >= 2) {
      return parseInt(timeParts[0], 10);
    }
    
    // Handle hour only (e.g., "14")
    const hourOnly = parseInt(timeString, 10);
    if (!isNaN(hourOnly) && hourOnly >= 0 && hourOnly <= 23) {
      return hourOnly;
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting hour from time:', error);
    return null;
  }
}

/**
 * Validate journey failure data
 */
export const validateData = (data: any[]): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!Array.isArray(data)) {
    errors.push('Data must be an array');
    return { valid: false, errors };
  }

  if (data.length === 0) {
    errors.push('Data array is empty');
    return { valid: false, errors };
  }

  data.forEach((item, index) => {
    if (!item.journeyName) {
      errors.push(`Item ${index}: Missing journeyName`);
    }
    if (typeof item.failedAttempts !== 'number' || item.failedAttempts < 0) {
      errors.push(`Item ${index}: Invalid failedAttempts`);
    }
    if (!item.time) {
      errors.push(`Item ${index}: Missing time`);
    }
    if (typeof item.totalSteps !== 'number' || item.totalSteps < 0) {
      errors.push(`Item ${index}: Invalid totalSteps`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Example: Load data from a file
 */
export const loadFromJsonFile = async (filePath: string): Promise<JourneyFailureData[]> => {
  try {
    const response = await fetch(filePath);
    const data = await response.json();
    return convertFromYourJsonFormat(data);
  } catch (error) {
    console.error('Error loading JSON file:', error);
    return [];
  }
};

/**
 * Example: Load data from API endpoint
 */
export const loadFromApi = async (apiUrl: string): Promise<JourneyFailureData[]> => {
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    return convertFromApiResponse(data);
  } catch (error) {
    console.error('Error loading from API:', error);
    return [];
  }
};

/**
 * Example usage:
 * 
 * import { convertFromYourJsonFormat, filterByTimeRange, sortByTime } from './dataConversionUtils';
 * 
 * // Convert your data
 * const convertedData = convertFromYourJsonFormat(yourRawData);
 * 
 * // Filter for 12 AM - 12 PM
 * const filteredData = filterByTimeRange(convertedData, 0, 12);
 * 
 * // Sort by time
 * const sortedData = sortByTime(filteredData);
 * 
 * // Use in your component
 * <JourneyFailureTimeline data={sortedData} />
 */
