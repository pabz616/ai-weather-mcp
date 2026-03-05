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
      location: z.string().describe("The location to get the weather for"),
    }),
  },
  async ({ location }: { location: string }) => {
    //In a real implementation, you would call a weather API here
    return {
      content: [
        {
          type: "text",
          text: `The weather in ${location} is sunny with a high of 25°C and a low of 15°C.`,
        },
      ],
    };
  },
);

//Create a new StdioServerTransport and start the MCP server
const transport = new StdioServerTransport();
mcpServer.connect(transport);    
