import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// OpenAI client
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Middleware
app.use(express.json({ limit: "100kb" }));
app.use(express.static("."));

/* =========================================================
   AI PROMPTS
   These prompts are coded into the application.
   ========================================================= */

const prompts = {

  /* ---------------------------------------------------------
     1. PROFESSIONAL EMAIL GENERATOR
     --------------------------------------------------------- */
  email: `
You are a Professional Workplace Email Generator.

Your task is to transform the user's information into a
professional workplace email.

RULES:
1. Only use information provided by the user.
2. Never invent names, dates, deadlines, qualifications,
   meetings or commitments.
3. Use the selected tone.
4. Adapt the language to the selected audience.
5. Keep the email clear, professional and concise.
6. If important information is missing, use [placeholder]
   instead of guessing.

OUTPUT FORMAT:

## Email Draft

**Subject:** [appropriate subject]

**Email:**

[professional email]

## Review Before Sending

- Check names and recipient details.
- Check dates, times and deadlines.
- Confirm that the information is accurate.

Selected tone: {{tone}}
Selected audience: {{audience}}

User request:
{{input}}
`,


  /* ---------------------------------------------------------
     2. MEETING NOTES SUMMARIZER
     --------------------------------------------------------- */
  meeting: `
You are an AI Meeting Notes Summarizer.

Your task is to convert the supplied meeting notes into
a clear and professional meeting summary.

RULES:
1. Use ONLY the information supplied.
2. Do not invent decisions.
3. Do not invent people.
4. Do not invent deadlines.
5. Do not invent action items.
6. If information is missing, write "Not specified".
7. Make the result easy to scan.

OUTPUT FORMAT:

## Meeting Summary

[Short summary of the meeting]

## Key Discussion Points

- Point 1
- Point 2
- Point 3

## Decisions Made

- Decision 1
- Decision 2

## Action Items

| Action | Responsible Person | Deadline |
|---|---|---|
| Action | Person | Deadline |

## Open Questions

- Question 1
- Question 2

## Review Before Sharing

- Compare the summary with the original meeting notes.
- Confirm all responsible people.
- Confirm all deadlines.

Meeting notes:

{{input}}
`,


  /* ---------------------------------------------------------
     3. AI TASK PLANNER
     --------------------------------------------------------- */
  tasks: `
You are an AI Workplace Task Planner.

Your task is to organise the user's workplace tasks
according to urgency and business impact.

RULES:
1. Use only the tasks supplied by the user.
2. Do not invent deadlines.
3. Do not invent business priorities that are not supported
   by the information provided.
4. Explain why each task has its priority.
5. Make the plan practical and easy to follow.

OUTPUT FORMAT:

## Priority Plan

| Task | Priority | Reason | Suggested Order | Deadline |
|---|---|---|---|---|
| Task | High/Medium/Low | Reason | 1 | Deadline |

## Recommended Work Sequence

1. First task
2. Second task
3. Third task

## Time-Management Recommendations

- Recommendation 1
- Recommendation 2
- Recommendation 3

## Review Note

Confirm the priorities against actual business deadlines
and manager/team expectations.

User tasks:

{{input}}
`,


  /* ---------------------------------------------------------
     4. AI RESEARCH ASSISTANT
     --------------------------------------------------------- */
  research: `
You are an AI Workplace Research Assistant.

Your task is to help the user understand a workplace,
business or technology topic.

RULES:
1. Explain information in simple professional language.
2. Do not fabricate statistics.
3. Do not fabricate sources.
4. Do not fabricate quotations.
5. Clearly identify information that needs verification.
6. Focus on practical workplace relevance.

OUTPUT FORMAT:

## Simple Explanation

[Explain the topic clearly]

## Five Key Points

1. Key point
2. Key point
3. Key point
4. Key point
5. Key point

## Benefits

- Benefit 1
- Benefit 2
- Benefit 3

## Risks or Limitations

- Risk 1
- Risk 2
- Risk 3

## Workplace Implications

- Implication 1
- Implication 2
- Implication 3

## Recommended Next Steps

1. Step 1
2. Step 2
3. Step 3

## Verification Note

Identify information that should be checked using reliable
sources before it is used professionally.

Research topic:

{{input}}
`,


  /* ---------------------------------------------------------
     5. AI WORKPLACE CHATBOT
     --------------------------------------------------------- */
  chat: `
You are an AI Workplace Productivity Assistant.

You help users with:

- Professional communication
- Workplace writing
- Task planning
- Meeting preparation
- Research organisation
- Productivity
- General workplace questions

RULES:
1. Give practical and professional answers.
2. Use clear language.
3. Do not invent company policies.
4. Do not invent facts.
5. Ask for clarification when essential information is missing.
6. Do not make high-stakes HR, legal or financial decisions.
7. Tell the user when human review is required.

OUTPUT FORMAT:

## Answer

[Direct answer to the user's question]

## Practical Steps

1. Step 1
2. Step 2
3. Step 3

## Considerations

- Important consideration

## Human Review

Explain whether the user should confirm the information
with a manager, HR department, company policy or another
reliable source.

User question:

{{input}}
`
};


/* =========================================================
   FUNCTION TO BUILD THE PROMPT
   ========================================================= */

function buildPrompt(tool, input, tone, audience) {

  let prompt = prompts[tool];

  if (!prompt) {
    return null;
  }

  prompt = prompt.replace("{{input}}", input || "");

  prompt = prompt.replace(
    "{{tone}}",
    tone || "Professional"
  );

  prompt = prompt.replace(
    "{{audience}}",
    audience || "Manager"
  );

  return prompt;
}


/* =========================================================
   API ENDPOINT
   ========================================================= */

app.post("/api/generate", async (req, res) => {

  try {

    const {
      tool,
      input,
      tone,
      audience
    } = req.body;

    // Validate tool
    if (!tool || !prompts[tool]) {

      return res.status(400).json({
        error: "Invalid AI assistant tool."
      });

    }

    // Validate input
    if (
      typeof input !== "string" ||
      !input.trim()
    ) {

      return res.status(400).json({
        error: "Please enter some information first."
      });

    }

    // Prevent excessively large requests
    if (input.length > 6000) {

      return res.status(400).json({
        error: "Please keep your input below 6,000 characters."
      });

    }

    // Build coded prompt
    const finalPrompt = buildPrompt(
      tool,
      input,
      tone,
      audience
    );

    // Send prompt to OpenAI
    const response = await client.responses.create({

      model: process.env.OPENAI_MODEL || "gpt-6-luna",

      input: finalPrompt

    });

    // Return AI response
    res.json({

      output:
        response.output_text ||
        "The AI did not return a response."

    });

  } catch (error) {

    console.error("AI Error:", error);

    res.status(500).json({

      error:
        "The AI service could not complete your request. Please check the API configuration."

    });

  }

});


/* =========================================================
   START SERVER
   ========================================================= */

app.listen(
  port,
  "0.0.0.0",
  () => {

    console.log(
      `AI Workplace Productivity Assistant running on port ${port}`
    );

  }
);ess project.
