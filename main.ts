import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

//Create a new MCP server with the specified name, description, and version
const mcpServer = new McpServer({
  name: "Weather Server",
  description: "A server that provides weather information.",
  version: "1.0.0",
});

//Define Tools. Tools are functions that AI agents can call
mcpServer.registerTool(
  "getWeather",
  {
    description: "Tool to get the weather of a specific location",
    inputSchema: z.object({
      location: z
        .string()
        .describe("The name of the location to get the weather for"),
    }),
  },
  async ({ location }: { location: string }) => {
    try {
      //Get the coordinates for the location using the Open-Meteo Geocoding API
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${location}`,
      );
      const geoData = await geoResponse.json();

      //If the location is not found, return an error message
      if (!geoData.results || geoData.results.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: `Sorry, I couldn't find the location "${location}". Please try another location.`,
            },
          ],
        };
      }

      //Get the weather data using latitude and longitude coordinates
      const { latitude, longitude } = geoData.results[0];
      const weatherResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code&hourly=temperature_2m,precipitation&forecast_days=1`,
      );
      const weatherData = await weatherResponse.json();

      //Return the weather information as a response JSON object
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(weatherData, null, 2),
          },
        ],
      };
    } catch (error: unknown) {
      //If there is an error during the API calls, return an error message
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: "text",
            text: `Error fetching weather data: ${errorMessage}`,
          },
        ],
      };
    }
  },
);

//Create a new StdioServerTransport and start the MCP server
const transport = new StdioServerTransport();
mcpServer.connect(transport);
