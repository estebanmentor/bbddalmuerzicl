import { GoogleGenAI, Type } from "@google/genai";
import type { ApiLog } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const logSchema = {
    type: Type.OBJECT,
    properties: {
        timestamp: { type: Type.STRING, description: 'An ISO 8601 timestamp for the request' },
        method: { type: Type.STRING, description: 'The HTTP method (e.g., GET)', enum: ['GET'] },
        status: { type: Type.INTEGER, description: 'The HTTP status code (e.g., 200, 404)' },
        statusText: { type: Type.STRING, description: 'The HTTP status text (e.g., OK, Not Found)' },
        ipAddress: { type: Type.STRING, description: 'A realistic-looking but fake IPv4 address' },
        userAgent: { type: Type.STRING, description: 'A common user agent string (e.g., from a browser or mobile device)' },
    },
    required: ['timestamp', 'method', 'status', 'statusText', 'ipAddress', 'userAgent']
};

export async function generateSimulatedLogs(prompt: string, apiUrl: string): Promise<Omit<ApiLog, 'id' | 'type'>[]> {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Generate a list of simulated API log entries based on this request: "${prompt}".
            The URL for all requests MUST be "${apiUrl}".
            Generate realistic status codes, including some errors like 404 or 500 if appropriate.
            Ensure timestamps are recent and sequential, but not identical.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: logSchema,
                },
            },
        });

        const jsonText = response.text.trim();
        if (!jsonText) {
            throw new Error("AI returned an empty response.");
        }
        
        const result = JSON.parse(jsonText);

        // Add the URL to each log as it's not in the schema
        return result.map((log: any) => ({...log, url: apiUrl }));

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof Error) {
           throw new Error(`Failed to generate simulated logs: ${error.message}`);
        }
        throw new Error("An unknown error occurred while generating simulated logs.");
    }
}