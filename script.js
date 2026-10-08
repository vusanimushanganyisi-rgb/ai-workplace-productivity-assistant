````javascript
/* =========================================================
   PRODUCTIVITYAI — JAVASCRIPT
   ========================================================= */

/* ---------------------------------------------------------
   TOOL CONFIGURATION
--------------------------------------------------------- */

const toolConfig = {

    email: {
        title: "Professional Email Generator",
        number: "01",
        placeholder:
            "Example: Write an email to my manager explaining that I need to move tomorrow's meeting to Friday..."
    },

    meeting: {
        title: "Meeting Notes Summarizer",
        number: "02",
        placeholder:
            "Paste your meeting notes here. Include discussions, decisions, action items and deadlines if available."
    },

    tasks: {
        title: "AI Task Planner",
        number: "03",
        placeholder:
            "Example: Complete monthly report, prepare presentation, respond to client emails, attend project meeting..."
    },

    research: {
        title: "AI Research Assistant",
        number: "04",
        placeholder:
            "Enter a workplace topic you would like to understand, analyse or structure."
    },

    chat: {
        title: "AI Workplace Chatbot",
        number: "05",
        placeholder:
            "Ask a workplace productivity question, brainstorm an idea or request professional guidance..."
    }

};


/* ---------------------------------------------------------
   CURRENT TOOL
--------------------------------------------------------- */

let currentTool = "email";


/* ---------------------------------------------------------
   DOM ELEMENTS
--------------------------------------------------------- */

const userInput = document.getElementById("userInput");
const charCount = document.getElementById("charCount");
const generateButton = document.getElementById("generateButton");
const output = document.getElementById("output");
const copyButton = document.getElementById("copyButton");

const selectedToolTitle =
    document.getElementById("selectedToolTitle");

const emailOptions =
    document.getElementById("emailOptions");

const tone =
    document.getElementById("tone");

const audience =
    document.getElementById("audience");


/* ---------------------------------------------------------
   SELECT TOOL
--------------------------------------------------------- */

function selectTool(tool) {

    if (!toolConfig[tool]) {
        return;
    }

    currentTool = tool;

    const config = toolConfig[tool];

    /* Update title */

    if (selectedToolTitle) {
        selectedToolTitle.textContent = config.title;
    }

    /* Update placeholder */

    if (userInput) {
        userInput.placeholder = config.placeholder;
    }

    /* Update email-specific controls */

    if (emailOptions) {

        if (tool === "email") {
            emailOptions.style.display = "grid";
        } else {
            emailOptions.style.display = "none";
        }

    }

    /* Scroll to workspace */

    const workspace =
        document.getElementById("workspace");

    if (workspace) {

        workspace.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }

    /* Clear old input */

    if (userInput) {
        userInput.value = "";
        updateCharacterCount();
    }

    /* Clear previous output */

    showEmptyOutput();

}


/* ---------------------------------------------------------
   CHARACTER COUNTER
--------------------------------------------------------- */

function updateCharacterCount() {

    if (!userInput || !charCount) {
        return;
    }

    const length = userInput.value.length;

    charCount.textContent = length;

}


/* ---------------------------------------------------------
   EMPTY OUTPUT
--------------------------------------------------------- */

function showEmptyOutput() {

    if (!output) {
        return;
    }

    output.innerHTML = `
        <div class="empty-output">

            <div class="empty-icon">
                ✦
            </div>

            <h3>
                Your AI result will appear here
            </h3>

            <p>
                Enter your request and click
                <strong>Generate with AI</strong>.
            </p>

        </div>
    `;

}


/* ---------------------------------------------------------
   LOADING STATE
--------------------------------------------------------- */

function showLoading() {

    if (!output) {
        return;
    }

    output.innerHTML = `
        <div class="empty-output">

            <div class="empty-icon">
                ✦
            </div>

            <h3>
                AI is working...
            </h3>

            <p>
                Analysing your request and preparing
                a professional response.
            </p>

            <div class="loading">
                <div class="loading-dots">

                    <span></span>
                    <span></span>
                    <span></span>

                </div>
            </div>

        </div>
    `;

}


/* ---------------------------------------------------------
   ESCAPE HTML
--------------------------------------------------------- */

function escapeHtml(text) {

    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* ---------------------------------------------------------
   SIMPLE MARKDOWN FORMATTER
--------------------------------------------------------- */

function formatMarkdown(markdown) {

    if (!markdown) {
        return "";
    }

    let text = escapeHtml(markdown);

    /* Code blocks */

    text = text.replace(
        /```([\s\S]*?)```/g,
        "<pre><code>$1</code></pre>"
    );

    /* Headings */

    text = text.replace(
        /^### (.*)$/gm,
        "<h3>$1</h3>"
    );

    text = text.replace(
        /^## (.*)$/gm,
        "<h2>$1</h2>"
    );

    text = text.replace(
        /^# (.*)$/gm,
        "<h2>$1</h2>"
    );

    /* Bold */

    text = text.replace(
        /\*\*(.*?)\*\*/g,
        "<strong>$1</strong>"
    );

    /* Italic */

    text = text.replace(
        /\*(.*?)\*/g,
        "<em>$1</em>"
    );

    /* Bullet lists */

    text = text.replace(
        /^- (.*)$/gm,
        "<li>$1</li>"
    );

    text = text.replace(
        /(<li>.*<\/li>)/gs,
        "<ul>$1</ul>"
    );

    /* Numbered lists */

    text = text.replace(
        /^\d+\. (.*)$/gm,
        "<li>$1</li>"
    );

    /* Horizontal line */

    text = text.replace(
        /^---$/gm,
        "<hr>"
    );

    /* Paragraphs */

    const lines = text.split("\n");

    let result = "";

    let insideList = false;

    lines.forEach(line => {

        const trimmed = line.trim();

        if (!trimmed) {
            return;
        }

        if (
            trimmed.startsWith("<h2>") ||
            trimmed.startsWith("<h3>") ||
            trimmed.startsWith("<ul>") ||
            trimmed.startsWith("<li>") ||
            trimmed.startsWith("<hr>") ||
            trimmed.startsWith("<pre>")
        ) {
            result += trimmed;
            return;
        }

        result += `<p>${trimmed}</p>`;

    });

    /* Clean duplicated paragraph tags */

    result = result
        .replace(/<\/p><p>/g, "</p><p>")
        .replace(/<p>(<h[23]>)/g, "$1")
        .replace(/(<\/h[23]>)<\/p>/g, "$1");

    return result;

}


/* ---------------------------------------------------------
   DISPLAY OUTPUT
--------------------------------------------------------- */

function displayOutput(text) {

    if (!output) {
        return;
    }

    output.innerHTML = formatMarkdown(text);

    output.scrollTop = 0;

}


/* ---------------------------------------------------------
   DISPLAY ERROR
--------------------------------------------------------- */

function displayError(message) {

    if (!output) {
        return;
    }

    output.innerHTML = `
        <div class="empty-output">

            <div class="empty-icon">
                !
            </div>

            <h3>
                Something went wrong
            </h3>

            <p>
                ${escapeHtml(message)}
            </p>

        </div>
    `;

}


/* ---------------------------------------------------------
   GENERATE AI RESPONSE
--------------------------------------------------------- */

async function generateAIResponse() {

    if (!userInput) {
        return;
    }

    const input = userInput.value.trim();

    /* Validate input */

    if (!input) {

        displayError(
            "Please enter some information before generating a response."
        );

        userInput.focus();

        return;
    }

    /* Character limit */

    if (input.length > 6000) {

        displayError(
            "Your request is too long. Please keep it below 6,000 characters."
        );

        return;
    }

    /* Loading */

    showLoading();

    if (generateButton) {
        generateButton.disabled = true;
        generateButton.innerHTML = `
            <span class="button-icon">✦</span>
            AI is working...
        `;
    }

    try {

        /* Build request */

        const requestBody = {
            tool: currentTool,
            input: input
        };

        /* Email-specific options */

        if (currentTool === "email") {

            requestBody.tone =
                tone ? tone.value : "Professional";

            requestBody.audience =
                audience ? audience.value : "Manager";

        }

        /* Send request to backend */

        const response = await fetch(
            "/api/generate",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(requestBody)
            }
        );


        /* Parse response */

        const data = await response.json();


        /* Handle server errors */

        if (!response.ok) {

            throw new Error(
                data.error ||
                "The AI service could not complete your request."
            );

        }


        /* Display result */

        displayOutput(
            data.output ||
            "The AI returned no text."
        );


    } catch (error) {

        console.error(error);

        displayError(
            error.message ||
            "Unable to connect to the AI service."
        );

    } finally {

        if (generateButton) {

            generateButton.disabled = false;

            generateButton.innerHTML = `
                <span class="button-icon">✦</span>
                Generate with AI
                <span class="button-arrow">→</span>
            `;

        }

    }

}


/* ---------------------------------------------------------
   COPY OUTPUT
--------------------------------------------------------- */

async function copyOutput() {

    if (!output) {
        return;
    }

    const text = output.innerText.trim();

    if (!text) {
        return;
    }

    try {

        await navigator.clipboard.writeText(text);

        if (copyButton) {

            const originalText =
                copyButton.textContent;

            copyButton.textContent = "Copied!";

            setTimeout(() => {

                copyButton.textContent =
                    originalText;

            }, 1800);

        }

    } catch (error) {

        console.error(
            "Copy failed:",
            error
        );

        alert(
            "Unable to copy the result. Please select and copy the text manually."
        );

    }

}


/* ---------------------------------------------------------
   CHARACTER COUNTER EVENT
--------------------------------------------------------- */

if (userInput) {

    userInput.addEventListener(
        "input",
        updateCharacterCount
    );

}


/* ---------------------------------------------------------
   GENERATE BUTTON EVENT
--------------------------------------------------------- */

if (generateButton) {

    generateButton.addEventListener(
        "click",
        generateAIResponse
    );

}


/* ---------------------------------------------------------
   COPY BUTTON EVENT
--------------------------------------------------------- */

if (copyButton) {

    copyButton.addEventListener(
        "click",
        copyOutput
    );

}


/* ---------------------------------------------------------
   ENTER KEY SUPPORT
--------------------------------------------------------- */

if (userInput) {

    userInput.addEventListener(
        "keydown",
        function(event) {

            /*
             * Ctrl + Enter or Cmd + Enter
             * generates the response.
             */

            if (
                (event.ctrlKey || event.metaKey) &&
                event.key === "Enter"
            ) {

                event.preventDefault();

                generateAIResponse();

            }

        }
    );

}


/* ---------------------------------------------------------
   INITIALISE APPLICATION
--------------------------------------------------------- */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        currentTool = "email";

        updateCharacterCount();

        if (emailOptions) {
            emailOptions.style.display = "grid";
        }

    }
);
````

### How the three files connect

Your **`index.html`** should have these two lines:

```html
<link rel="stylesheet" href="style.css">
```

inside `<head>`, and:

```html
<script src="script.js"></script>
```

just before `</body>`.

So the relationship is:

```text
                 index.html
                     │
          ┌──────────┴──────────┐
          ↓                     ↓
      style.css             script.js
          │                     │
       DESIGN              FUNCTIONALITY
          │                     │
    colours/fonts          AI requests
    buttons/cards          tool selection
    layouts                character counter
    responsive design      copy button
```

And your existing **`server.js` remains separate** because it handles the connection between the website and the AI API.

**One important correction:** the JavaScript above expects your existing `/api/generate` endpoint from `server.js`, so the AI features will work when you run the full Node/Express project.
