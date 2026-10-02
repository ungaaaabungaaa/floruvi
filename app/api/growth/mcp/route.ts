import { handleGrowthMcp } from "@/lib/growth-mcp";

export const runtime = "nodejs";
export const maxDuration = 30;

export const POST = (request: Request) => handleGrowthMcp(request);
export const GET = (request: Request) => handleGrowthMcp(request);
export const DELETE = (request: Request) => handleGrowthMcp(request);
