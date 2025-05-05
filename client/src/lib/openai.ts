import { apiRequest } from "@/lib/queryClient";

// AI service for venue conflict resolution
export async function resolveVenueConflict(
  classId: number,
  venueId: number,
  occupiedVenueId: number,
  date: string
): Promise<{
  success: boolean;
  suggestedVenue?: {
    id: number;
    name: string;
    capacity: number;
    location: string;
    facilities: string;
  };
  timeAdjustment?: number;
  message?: string;
}> {
  try {
    const response = await apiRequest(
      "POST",
      "/api/ai/resolve-venue-conflict",
      {
        classId,
        venueId,
        occupiedVenueId,
        date,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData.message || "Failed to resolve venue conflict",
      };
    }

    const result = await response.json();
    return {
      success: true,
      suggestedVenue: result.suggestedVenue,
      timeAdjustment: result.timeAdjustment,
      message: result.message,
    };
  } catch (error) {
    console.error("Error resolving venue conflict:", error);
    return {
      success: false,
      message: "An error occurred while resolving the venue conflict",
    };
  }
}

// Function to analyze venue usage patterns
export async function analyzeVenueUsage(venueId: number): Promise<{
  success: boolean;
  patterns?: {
    peakHours: string[];
    lowUsageHours: string[];
    commonConflicts: number;
    suggestedImprovements: string[];
  };
  message?: string;
}> {
  try {
    const response = await apiRequest(
      "GET",
      `/api/ai/analyze-venue-usage/${venueId}`,
      undefined
    );

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        message: errorData.message || "Failed to analyze venue usage",
      };
    }

    const result = await response.json();
    return {
      success: true,
      patterns: result.patterns,
      message: result.message,
    };
  } catch (error) {
    console.error("Error analyzing venue usage:", error);
    return {
      success: false,
      message: "An error occurred while analyzing venue usage",
    };
  }
}
