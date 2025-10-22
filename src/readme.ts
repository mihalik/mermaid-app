import { html } from 'hono/html'

/**
 * This is a really simple HTML page using pico.css to provide some basic styling and
 * and uses document.write to dynamically insert the MCP URL.  This is just fine for
 * a simple page like this.
 */
export default function renderReadme(c, name: string) {
    return c.html(
        html`
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light dark">
    <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.classless.min.css"
    > 
    <title>Mermaid Apps SDK Example</title>
  </head>
  <body>
    <header>
        <h1>Mermaid Apps SDK Example</h1>
    </header>
    <main>
        <p>
            An MCP Tool and HTML for rendering Mermaid diagrams in ChatGPT.
            <pre>
                <script>
                    document.write(window.location.origin + "/mcp");
                </script>
            </pre>
        </p>
    </main>
    <footer>
        <p>
            This server is powered by <a href="https://github.com/mihalik/mermaid-app">Mermaid App</a>.
        </p>
    </footer>
  </body>
</html>
`
    )
}
