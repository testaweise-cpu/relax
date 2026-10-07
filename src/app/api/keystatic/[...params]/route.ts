import { makeRouteHandler } from "@keystatic/next/route-handler";
import { keystaticEnabled } from "@/keystatic/enabled";
import config from "../../../../../keystatic.config";

const handlers = makeRouteHandler({ config });
const disabled = () => new Response("Not Found", { status: 404 });

export const GET = keystaticEnabled ? handlers.GET : disabled;
export const POST = keystaticEnabled ? handlers.POST : disabled;
