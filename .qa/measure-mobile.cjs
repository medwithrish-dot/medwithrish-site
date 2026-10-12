// This standalone CommonJS browser probe runs outside the Next application.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const WebSocket = require("ws");

const ws = new WebSocket(process.argv[2]);
let step = 0;
const send = (method, params = {}) => ws.send(JSON.stringify({ id: ++step, method, params }));

ws.on("open", () => {
  send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  });
  send("Page.navigate", { url: "http://localhost:3000/medicforest/account" });
  setTimeout(() => send("Runtime.evaluate", {
    expression: `JSON.stringify({
      innerWidth,
      clientWidth: document.documentElement.clientWidth,
      bodyClientWidth: document.body.clientWidth,
      bodyScrollWidth: document.body.scrollWidth,
      htmlScrollWidth: document.documentElement.scrollWidth,
      shell: document.querySelector("[data-interview-shell]")?.getBoundingClientRect().toJSON(),
      grid: document.querySelector("[data-interview-shell-grid]")?.getBoundingClientRect().toJSON(),
      main: document.querySelector("#medicforest-content")?.getBoundingClientRect().toJSON(),
      account: document.querySelector("#medicforest-content > div")?.getBoundingClientRect().toJSON(),
      mainScrollWidth: document.querySelector("#medicforest-content")?.scrollWidth,
    })`,
    returnByValue: true,
  }), 3000);
});

ws.on("message", (data) => {
  const message = JSON.parse(data);
  if (message.id === 3) {
    console.log(message.result.result.value);
    ws.close();
  }
});
