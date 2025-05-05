import OpenAI from "openai";
import { Class, Venue } from "@shared/schema";
import { storage } from "../storage";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Resolves a venue conflict by finding an alternative venue
 */
export async function resolveVenueConflict(cls: Class, currentVenue: Venue, date: string): Promise<{
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
    // Find available venues that match the capacity requirement
    const availableVenues = await storage.getAvailableVenuesForDate(
      date,
      cls.startTime,
      cls.endTime,
      currentVenue.capacity
    );

    if (availableVenues.length === 0) {
      return {
        success: false,
        message: "No alternative venues available"
      };
    }

    // If there are available venues, use GPT-4o to select the best one
    const prompt = `
      You are an AI assistant helping a university manage classroom venue conflicts.
      
      Current class details:
      - Start time: ${cls.startTime}
      - End time: ${cls.endTime}
      - Current venue: ${currentVenue.name}
      - Current venue capacity: ${currentVenue.capacity}
      - Current venue facilities: ${currentVenue.facilities || "None specified"}
      
      Available alternative venues:
      ${availableVenues.map((venue, index) => `
      ${index + 1}. ${venue.name}
         - Capacity: ${venue.capacity}
         - Location: ${venue.location}
         - Facilities: ${venue.facilities || "None specified"}
      `).join('\n')}
      
      Based on the available information, please:
      1. Select the best alternative venue for this class
      2. Determine if a time adjustment is needed (in minutes, can be positive or negative)
      3. Provide a brief explanation for your decision
      
      Respond with JSON in this format:
      {
        "selectedVenueIndex": number,
        "timeAdjustment": number,
        "explanation": string
      }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a helpful AI assistant for university classroom management." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    // Parse the response
    const result = JSON.parse(response.choices[0].message.content);
    
    const selectedVenueIndex = result.selectedVenueIndex;
    if (selectedVenueIndex < 1 || selectedVenueIndex > availableVenues.length) {
      return {
        success: false,
        message: "Invalid venue selection by AI"
      };
    }

    const suggestedVenue = availableVenues[selectedVenueIndex - 1];
    const timeAdjustment = Math.max(-30, Math.min(30, result.timeAdjustment)); // Limit to ±30 minutes

    return {
      success: true,
      suggestedVenue: {
        id: suggestedVenue.id,
        name: suggestedVenue.name,
        capacity: suggestedVenue.capacity,
        location: suggestedVenue.location,
        facilities: suggestedVenue.facilities || ""
      },
      timeAdjustment,
      message: result.explanation
    };
  } catch (error) {
    console.error("Error resolving venue conflict with OpenAI:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "An error occurred while resolving venue conflict"
    };
  }
}

/**
 * Analyzes venue usage patterns
 */
export async function analyzeVenueUsage(venue: Venue): Promise<{
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
    // In a real implementation, you would fetch actual venue usage data
    // For this demo, we'll generate synthetic data with GPT-4o
    
    const prompt = `
      You are an AI assistant analyzing venue usage patterns for a university.
      
      Venue details:
      - Name: ${venue.name}
      - Capacity: ${venue.capacity}
      - Location: ${venue.location}
      - Facilities: ${venue.facilities || "None specified"}
      
      Please analyze this venue and generate realistic usage patterns. Include:
      1. Peak usage hours (times when the venue is most frequently used)
      2. Low usage hours (times when the venue is rarely used)
      3. Number of booking conflicts typically experienced in a term
      4. Suggested improvements for venue management
      
      Respond with JSON in this format:
      {
        "peakHours": string[],
        "lowUsageHours": string[],
        "commonConflicts": number,
        "suggestedImprovements": string[]
      }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a helpful AI assistant for university venue analysis." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    const patterns = JSON.parse(response.choices[0].message.content);

    return {
      success: true,
      patterns: {
        peakHours: patterns.peakHours,
        lowUsageHours: patterns.lowUsageHours,
        commonConflicts: patterns.commonConflicts,
        suggestedImprovements: patterns.suggestedImprovements
      }
    };
  } catch (error) {
    console.error("Error analyzing venue usage with OpenAI:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "An error occurred while analyzing venue usage"
    };
  }
}
