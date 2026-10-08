import { initBotId } from "botid/client/core";

initBotId({
  protect: [
    { path: "/api/interviews/session", method: "POST" },
    { path: "/api/interviews/follow-up", method: "POST" },
    { path: "/api/interviews/feedback", method: "POST" },
    { path: "/api/interviews/speech", method: "GET" },
  ],
});
