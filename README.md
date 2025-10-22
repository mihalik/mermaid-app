# Mermaid Apps SDK App

Mermaid App is an example project that uses ChatGPT Apps SDK to render [Mermaid](https://mermaid.js.org/) diagrams. It uses Hono and Cloudflare Workers for deployment but can be used an a simple example of what it takes to build a ChatGPT App.

## What this project demonstrates
- **Remote tool powered by the Apps SDK metadata**: `src/tools.ts` registers the `render-mermaid` MCP tool.
- **Custom widget for ChatGPT**: The HTML resource returned at `ui://widget/mermaid.html` listens for `openai:set_globals` events and uses Mermaid.js to draw the diagram supplied by the model.
- **Cloudflare Worker deployment**: `src/index.ts` uses the standard Typescript MCP SDK with Hono that you can run locally with Wrangler or deploy globally to Cloudflare.
- **Validation guard-rails**: The helper in `src/tools.ts` checks that the submitted text looks like a Mermaid diagram before returning it to ChatGPT, giving you a pattern for returning graceful tool errors.

## Prerequisites
- Node.js 20+ and npm
- A paid ChatGPT account for testing

## Quick start (running locally)
1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Run locally**
   ```bash
   npm run dev
   ```
   Wrangler exposes a local Worker URL. The MCP endpoint lives at `/mcp`; the UI preview page is available at `/`.
3. **Setup a tunnel**
   Your service needs to run on a publicly accessible URL. The easiest way to do this is with Cloudflare tunnels or ngrok.
   ```bash
   cloudflared tunnel --url http://localhost:8787
   ```
4. **Connect the tool to ChatGPT**  
   - Put ChatGPT in Developer mode (Apps & Connectors -> Advanced Settings)
   - In ChatGPT, create a new App. (Apps & Connectors -> Create)
   - Add the tunnel URL you just created along with `/mcp`. Set a name and "No Authentication"
   - ChatGPT will discover the `render-mermaid` tool and automatically load the `ui://widget/mermaid.html` widget whenever the tool returns Mermaid text.

## Debugging

I found debugging issues to be difficult since the events and event structures are not well documented.  And my favorite debugging technique `console.log` is blocked in the environment.  So add this little DOM logger to the script if you want to get details on what events occur and what data is available on them.

```javascript
let log = "";
function writeLog(newLog) {
   log = log + newLog;
      document.getElementById("debug").innerHTML = "<pre>" + log + "</pre>\\n";
   }
}

...

writeLog("event: " + JSON.stringify(event, null, 2));

...

<div id="debug"></div>
```

## Deployment
Deploy the Worker:

```bash
npm run deploy
```

After deployment, update your ChatGPT App to reference the deployed Worker’s `/mcp` endpoint.

## Project layout
- `src/index.ts`: Hono app that binds the MCP server to Cloudflare Worker routes.
- `src/tools.ts`: Registers `render-mermaid`, defines its Zod schema, validation logic, and the HTML widget resource.
- `src/readme.ts`: Serves a lightweight landing page that links to your MCP endpoint.
- `wrangler.jsonc`: Worker configuration and environment variables.
- `public/`: Static assets.

## Troubleshooting
- If ChatGPT reports that it cannot reach the tool, verify the `/mcp` endpoint is accessible over HTTPS and that your Cloudflare Worker is running.
- If the widget loads but no diagram appears, check the console logs for errors. The errors might be vague and stack traces are unlikely to be useful.
- ChatGPT caches widget resources. After updating the HTML, use the "Refresh" button in the Apps settings to force it to refetch.

## License
Distributed under the MIT License. See `LICENSE` for details.
