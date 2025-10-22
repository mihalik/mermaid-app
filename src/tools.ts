import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const mermaidDiagramTypes = [
    "flowchart",
    "graph",            // alias for flowchart
    "sequenceDiagram",
    "classDiagram",
    "stateDiagram",
    "stateDiagram-v2",
    "gantt",
    "pie",
    "erDiagram",
    "journey",
    "gitGraph",
    "xyChart",
    "xychart-beta",
    "mindmap",
    "timeline",
    "C4Context",
    "C4Container",
    "C4Component",
    "C4Dynamic"
];

function isMermaidDiagram(content: string) {
    const normalized = content.trim().split(/\s+/)[0]; // get first word/token
    return mermaidDiagramTypes.some(type =>
        normalized.startsWith(type)
    );
}

export default function registerTools(server: McpServer) {
    server.registerTool(
        "render-mermaid",
        {
            title: "Mermaid Rendering App",
            description: "Renders mermaid diagrams.  Provide a string in Mermaid format.  IMPORTANT: Whitespace is significant for mermaid format.  Include all line returns and spaces or tabs in your inputs.  Do not omit line returns.",
            inputSchema: {
                diagram: z.string().describe(`A mermaid formatted string to render.  Just the text for the diagram.  <example>\nflowchart LR\n\tA[Input] --> B[Processing]\n\tB --> C[Output]\n</example>.`.trim())
            },
            _meta: {
                "openai/outputTemplate": "ui://widget/mermaid.html",
                "openai/toolInvocation/invoking": "Displaying diagram",
                "openai/toolInvocation/invoked": "Displayed diagram"
            }
        },
        async ({ diagram }) => {
            console.log(diagram);
            // Ideally this would validate the mermaid diagram so that we could return
            // valid error messages to the model rather than displaying an error in the
            // UI.  Unfortunately, mermaid is really only designed to run in the browser
            // and would require too much polyfilling and unsafe code to do as an example.
            if (isMermaidDiagram(diagram)) {
                return { content: [{ type: "text", "text": diagram }] };
            } else {
                return {
                    isError: true,
                    content: [{ type: "text", text: "`diagram` does not appear to be a valid Mermaid formatted diagram.  Please provide a valid mermaid diagram." }],
                };
            }
        }
    );
    server.registerResource(
        "html",
        "ui://widget/mermaid.html",
        {},
        async (req) => {
            console.log("resource");
            return {
                contents: [
                    {
                        uri: "ui://widget/mermaid.html",
                        mimeType: "text/html+skybridge",
                        text: `
                            <script src="https://cdn.jsdelivr.net/npm/mermaid@11.12.0/dist/mermaid.min.js"></script>
                            <script type="module">
                                mermaid.initialize({ startOnLoad: false });
                                // Renders a mermaid diagram
                                async function renderDiagram(diagram) {
                                    if (diagram) {
                                        let el = document.getElementById("mermaid-root");
                                        const a = await mermaid.render("mermaid", diagram);
                                        el.innerHTML = a.svg;
                                    }
                                }
                                // Attempt to load the diagram from global.  This will be set at start for
                                // a reloaded widget. Otherwise this loads empty. 
                                let toolText = window.openai?.toolOutput?.text;
                                await renderDiagram(toolText);
                                // This is the event OpenAI calls when globals are updated
                                window.addEventListener("openai:set_globals", async (event) => {
                                    // We could use toolInput because we get the full diagram on input
                                    // but this is more realistic as the server returning something
                                    const toolOutput = event.detail.globals["toolOutput"];
                                    if (toolOutput !== undefined) {
                                        if (toolOutput?.text && toolText !== toolOutput?.text) {
                                            toolText = toolOutput.text;
                                            await renderDiagram(toolText);
                                        }
                                    }
                                }, {passive: true});
                            </script>
                            <div id="mermaid-root"></div>
                    `.trim(),
                        _meta: {
                            "openai/widgetCSP": {
                                connect_domains: [],
                                // I think this is a default included CDN but it seems safest to be explicit
                                resource_domains: ["https://cdn.jsdelivr.net"],
                            }
                        },
                    },
                ],
            }
        }
    )

}
