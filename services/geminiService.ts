import { GoogleGenAI, Type } from "@google/genai";
import { House, MeterReading } from '../types';

const API_KEY = process.env.API_KEY;

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

if (!ai && API_KEY) {
  console.warn("Gemini AI initialization failed despite API key being present.");
} else if (!API_KEY) {
  console.log("API_KEY for Gemini not set. Sample data generation will use static fallback data.");
}

const schema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            house_number: { type: Type.STRING, description: "The house number, e.g., '88/123'." },
            owner_name: { type: Type.STRING, description: "A realistic Thai name for the homeowner." },
            readings: {
                type: Type.ARRAY,
                description: "An array of meter readings for the past 2-3 months.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                         month_key: { type: Type.STRING, description: "The reading key in 'YYYY-MM' format." },
                         month: { type: Type.STRING, description: "The month and year of the reading in Thai, e.g., 'มิถุนายน 2567'."},
                         previous_reading: { type: Type.NUMBER, description: "The meter reading from the previous month."},
                         current_reading: { type: Type.NUMBER, description: "The meter reading for the current month. Must be greater than previous_reading."},
                         units_used: { type: Type.NUMBER, description: "The difference between current and previous readings."},
                         total_amount: { type: Type.NUMBER, description: "The total cost (units_used * 5)."},
                         date_recorded: { type: Type.STRING, description: "The ISO 8601 string date of when the reading was recorded."}
                    },
                     required: ["month_key", "month", "previous_reading", "current_reading", "units_used", "total_amount", "date_recorded"],
                }
            }
        },
        required: ["house_number", "owner_name", "readings"],
    }
};

const staticFallbackData: Omit<House, 'id' | 'created_at'>[] = [
    { house_number: '11/22', owner_name: 'สมศักดิ์ รักไทย', readings: [
        { id: '', house_id: '', created_at: '2024-05-31T10:00:00.000Z', meter_image: null, month_key: '2024-05', month: 'พฤษภาคม 2567', previous_reading: 100, current_reading: 125, units_used: 25, total_amount: 125, date_recorded: '2024-05-31T10:00:00.000Z' },
        { id: '', house_id: '', created_at: '2024-06-30T10:00:00.000Z', meter_image: null, month_key: '2024-06', month: 'มิถุนายน 2567', previous_reading: 125, current_reading: 155, units_used: 30, total_amount: 150, date_recorded: '2024-06-30T10:00:00.000Z' }
    ] as MeterReading[]},
    { house_number: '33/44', owner_name: 'มานี มีนา', readings: [] },
    { house_number: '55/66', owner_name: 'สมศรี มีสุข', readings: [
        { id: '', house_id: '', created_at: '2024-06-30T11:00:00.000Z', meter_image: null, month_key: '2024-06', month: 'มิถุนายน 2567', previous_reading: 500, current_reading: 520, units_used: 20, total_amount: 100, date_recorded: '2024-06-30T11:00:00.000Z' }
    ] as MeterReading[]},
];

// Return type matches what's needed before inserting to DB (no id/created_at)
export async function generateSampleData(): Promise<Omit<House, 'id' | 'created_at'>[]> {
  if (!ai) {
    console.log("Using static fallback data for samples.");
    return staticFallbackData;
  }
  
  try {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Generate a list of 5 sample houses for a Thai village water billing system. Each house needs a 'house_number' (e.g., 123/45) and a realistic 'owner_name'. For 'readings', create 2-3 months of historical data. Meter readings should be logical (current > previous). Calculate 'units_used' and 'total_amount' (at a rate of 5 per unit). Format 'month' in Thai (e.g., 'มิถุนายน 2567'), 'month_key' as 'YYYY-MM', and 'date_recorded' as an ISO string. The response must use snake_case for all field names and strictly adhere to the provided JSON schema.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: schema,
            temperature: 0.9,
        }
    });

    const jsonText = response.text.trim();
    const sampleData = JSON.parse(jsonText);
    
    // Basic validation
    if (Array.isArray(sampleData) && sampleData.every(item => typeof item === 'object' && item.house_number)) {
        return sampleData;
    } else {
        console.error("Generated data does not match the expected format. Using fallback.", sampleData);
        return staticFallbackData;
    }

  } catch (error) {
    console.error("Error generating sample data from Gemini:", error);
    return staticFallbackData;
  }
}