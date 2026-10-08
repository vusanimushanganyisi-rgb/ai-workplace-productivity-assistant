document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       GET HTML ELEMENTS
    ===================================================== */

    const toolCards =
        document.querySelectorAll(".tool-card");

    const inputArea =
        document.getElementById("inputArea");

    const generateBtn =
        document.getElementById("generateBtn");

    const outputArea =
        document.getElementById("outputArea");

    const toolTitle =
        document.getElementById("toolTitle");

    const charCount =
        document.getElementById("charCount");

    const copyBtn =
        document.getElementById("copyBtn");

    const toneSelect =
        document.getElementById("tone");

    const audienceSelect =
        document.getElementById("audience");


    /* =====================================================
       CURRENTLY SELECTED TOOL
    ===================================================== */

    let selectedTool = "email";


    /* =====================================================
       TOOL INFORMATION
    ===================================================== */

    const tools = {

        email: {

            title:
                "Professional Email Generator",

            placeholder:
                "Example: Write an email to my manager requesting leave for Friday because I have a personal appointment."

        },


        meeting: {

            title:
                "Meeting Notes Summarizer",

            placeholder:
                "Paste your meeting notes here. Include discussions, decisions, action items and deadlines."

        },


        tasks: {

            title:
                "AI Task Planner",

            placeholder:
                "Example: Complete monthly report, respond to client emails, prepare presentation and update database."

        },


        research: {

            title:
                "AI Research Assistant",

            placeholder:
                "Enter a workplace, business or technology topic you want to research."

        },


        chat: {

            title:
                "AI Workplace Chatbot",

            placeholder:
                "Ask a workplace productivity or professional communication question."

        }

    };


    /* =====================================================
       SWITCH TOOL
    ===================================================== */

    function selectTool(tool) {

        // Make sure tool exists
        if (!tools[tool]) {

            console.error(
                "Unknown tool:",
                tool
            );

            return;

        }


        // Update selected tool
        selectedTool = tool;


        // Remove active class
        toolCards.forEach((card) => {

            card.classList.remove("active");

        });


        // Find selected card
        const selectedCard =
            document.querySelector(
                `.tool-card[data-tool="${tool}"]`
            );


        // Add active class
        if (selectedCard) {

            selectedCard.classList.add("active");

        }


        // Change title
        if (toolTitle) {

            toolTitle.textContent =
                tools[tool].title;

        }


        // Change placeholder
        if (inputArea) {

            inputArea.placeholder =
                tools[tool].placeholder;

        }


        // Clear input
        if (inputArea) {

            inputArea.value = "";

        }


        // Reset character counter
        if (charCount) {

            charCount.textContent =
                "0 / 6000";

        }


        // Reset AI output
        if (outputArea) {

            outputArea.innerHTML = `

                <div class="empty-output">

                    <div class="empty-icon">
                        ✨
                    </div>

                    <h3>
                        Ready when you are
                    </h3>

                    <p>
                        Enter your information and click
                        <strong>Generate with AI</strong>.
                    </p>

                </div>

            `;

        }


        // Show/hide email options
        updateEmailOptions();

    }


    /* =====================================================
       EMAIL OPTIONS
    ===================================================== */

    function updateEmailOptions() {

        const emailOptions =
            document.querySelector(
                ".email-options"
            );


        if (!emailOptions) {

            return;

        }


        if (selectedTool === "email") {

            emailOptions.style.display =
                "grid";

        } else {

            emailOptions.style.display =
                "none";

        }

    }


    /* =====================================================
       ADD CLICK EVENTS TO ALL TABS
    ===================================================== */

    toolCards.forEach((card) => {

        card.addEventListener(
            "click",
            (event) => {

                event.preventDefault();

                const tool =
                    card.getAttribute(
                        "data-tool"
                    );

                selectTool(tool);

            }
        );

    });


    /* =====================================================
       CHARACTER COUNTER
    ===================================================== */

    if (inputArea) {

        inputArea.addEventListener(
            "input",
            () => {

                const length =
                    inputArea.value.length;


                if (charCount) {

                    charCount.textContent =
                        `${length} / 6000`;

                }

            }
        );

    }


    /* =====================================================
       GENERATE AI RESPONSE
    ===================================================== */

    if (generateBtn) {

        generateBtn.addEventListener(
            "click",
            async () => {

                const input =
                    inputArea.value.trim();


                // Check input
                if (!input) {

                    outputArea.innerHTML = `

                        <div class="error-message">

                            Please enter some information
                            before generating a response.

                        </div>

                    `;

                    return;

                }


                // Loading state
                generateBtn.disabled =
                    true;

                generateBtn.textContent =
                    "Generating...";


                outputArea.innerHTML = `

                    <div class="loading">

                        <div class="spinner"></div>

                        <p>
                            AI is generating your response...
                        </p>

                    </div>

                `;


                try {

                    const response =
                        await fetch(
                            "/api/generate",
                            {

                                method:
                                    "POST",

                                headers: {

                                    "Content-Type":
                                        "application/json"

                                },

                                body:
                                    JSON.stringify({

                                        tool:
                                            selectedTool,

                                        input:
                                            input,

                                        tone:
                                            toneSelect
                                                ? toneSelect.value
                                                : "Professional",

                                        audience:
                                            audienceSelect
                                                ? audienceSelect.value
                                                : "Manager"

                                    })

                            }
                        );


                    const data =
                        await response.json();


                    if (!response.ok) {

                        throw new Error(
                            data.error ||
                            "The AI service returned an error."
                        );

                    }


                    outputArea.innerHTML =
                        formatAIResponse(
                            data.output
                        );


                } catch (error) {

                    console.error(
                        "AI Error:",
                        error
                    );


                    outputArea.innerHTML = `

                        <div class="error-message">

                            <strong>
                                Unable to generate response.
                            </strong>

                            <p>
                                ${escapeHTML(
                                    error.message
                                )}
                            </p>

                        </div>

                    `;

                } finally {

                    generateBtn.disabled =
                        false;

                    generateBtn.textContent =
                        "Generate with AI";

                }

            }
        );

    }


    /* =====================================================
       COPY RESPONSE
    ===================================================== */

    if (copyBtn) {

        copyBtn.addEventListener(
            "click",
            async () => {

                const text =
                    outputArea.innerText.trim();


                if (!text) {

                    return;

                }


                try {

                    await navigator.clipboard
                        .writeText(text);


                    const originalText =
                        copyBtn.textContent;


                    copyBtn.textContent =
                        "✓ Copied!";


                    setTimeout(() => {

                        copyBtn.textContent =
                            originalText;

                    }, 2000);


                } catch (error) {

                    console.error(
                        "Copy error:",
                        error
                    );

                    alert(
                        "Unable to copy the response."
                    );

                }

            }
        );

    }


    /* =====================================================
       FORMAT AI RESPONSE
    ===================================================== */

    function formatAIResponse(text) {

        if (!text) {

            return `
                <p>
                    No response was received.
                </p>
            `;

        }


        let html =
            escapeHTML(text);


        // Markdown headings
        html = html.replace(
            /^## (.*)$/gm,
            "<h3>$1</h3>"
        );


        // Bold text
        html = html.replace(
            /\*\*(.*?)\*\*/g,
            "<strong>$1</strong>"
        );


        // Bullet points
        html = html.replace(
            /^- (.*)$/gm,
            "<li>$1</li>"
        );


        // Numbered lists
        html = html.replace(
            /^\d+\.\s+(.*)$/gm,
            "<li>$1</li>"
        );


        // Line breaks
        html = html.replace(
            /\n/g,
            "<br>"
        );


        return html;

    }


    /* =====================================================
       SECURITY
    ===================================================== */

    function escapeHTML(value) {

        return String(value)

            .replace(
                /&/g,
                "&amp;"
            )

            .replace(
                /</g,
                "&lt;"
            )

            .replace(
                />/g,
                "&gt;"
            )

            .replace(
                /"/g,
                "&quot;"
            )

            .replace(
                /'/g,
                "&#039;"
            );

    }


    /* =====================================================
       INITIALISE EMAIL TAB
    ===================================================== */

    selectTool("email");

});
