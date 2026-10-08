import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const app = express();

const port =
    process.env.PORT || 3000;


/* =====================================================
   OPENAI
===================================================== */

const client =
    new OpenAI({
        apiKey:
            process.env.OPENAI_API_KEY
    });


/* =====================================================
   MIDDLEWARE
===================================================== */

app.use(
    express.json({
        limit: "100kb"
    })
);

app.use(
    express.static(".")
);


/* =====================================================
   AI PROMPTS
===================================================== */

const prompts = {

    email: `
You are a Professional Workplace Email Generator.

Create a clear, professional workplace email.

Rules:
- Only use information supplied by the user.
- Never invent names, dates or commitments.
- Adapt the email to the selected tone and audience.
- If information is missing, use [placeholder].
- Keep the email concise.

Return:

## Email Draft

**Subject:** [subject]

**Email:**

[email]

## Review Before Sending

- Check recipient details.
- Check dates and deadlines.
- Confirm the information is accurate.

Tone:
{{tone}}

Audience:
{{audience}}

User request:
{{input}}
`,


    meeting: `
You are an AI Meeting Notes Summarizer.

Summarise the supplied meeting notes.

Rules:
- Do not invent information.
- Do not invent decisions.
- Do not invent people.
- Do not invent deadlines.
- Use "Not specified" when information is missing.

Return:

## Meeting Summary

[summary]

## Key Discussion Points

- Point

## Decisions Made

- Decision

## Action Items

| Action | Responsible Person | Deadline |
|---|---|---|

## Open Questions

- Question

## Review Before Sharing

- Compare with the original notes.
- Confirm owners and deadlines.

Meeting notes:

{{input}}
`,


    tasks: `
You are an AI Workplace Task Planner.

Organise the user's tasks using urgency and business impact.

Do not invent deadlines.

Return:

## Priority Plan

| Task | Priority | Reason | Suggested Order | Deadline |
|---|---|---|---|---|

## Recommended Work Sequence

1. Step
2. Step
3. Step

## Time-Management Recommendations

- Recommendation
- Recommendation
- Recommendation

## Review Note

Confirm priorities against actual deadlines and
manager/team expectations.

User tasks:

{{input}}
`,


    research: `
You are an AI Workplace Research Assistant.

Explain the supplied workplace or technology topic.

Rules:
- Do not fabricate sources.
- Do not fabricate statistics.
- Do not fabricate quotations.
- Identify information requiring verification.

Return:

## Simple Explanation

[explanation]

## Five Key Points

1. Point
2. Point
3. Point
4. Point
5. Point

## Benefits

- Benefit

## Risks or Limitations

- Risk

## Workplace Implications

- Implication

## Recommended Next Steps

1. Step
2. Step
3. Step

## Verification Note

Identify claims that should be verified.

Research topic:

{{input}}
`,


    chat: `
You are an AI Workplace Productivity Assistant.

Help with:
- Workplace communication
- Professional writing
- Task planning
- Meeting preparation
- Research
- Productivity

Rules:
- Do not invent workplace policies.
- Do not invent facts.
- Do not make high-stakes HR, legal or financial decisions.
- Recommend human review when appropriate.

Return:

## Answer

[answer]

## Practical Steps

1. Step
2. Step
3. Step

## Considerations

- Consideration

## Human Review

Explain when the user should confirm the information
with a manager, HR, policy document or reliable source.

User question:

{{input}}
`

};


/* =====================================================
   BUILD PROMPT
===================================================== */

function buildPrompt(
    tool,
    input,
    tone,
    audience
) {

    let prompt =
        prompts[tool];


    if (!prompt) {

        return null;

    }


    prompt =
        prompt.replace(
            "{{input}}",
            input
        );


    prompt =
        prompt.replace(
            "{{tone}}",
            tone ||
            "Professional"
        );


    prompt =
        prompt.replace(
            "{{audience}}",
            audience ||
            "Manager"
        );


    return prompt;

}


/* =====================================================
   API
===================================================== */

app.post(
    "/api/generate",
    async (req, res) => {

        try {

            const {
                tool,
                input,
                tone,
                audience
            } = req.body;


            if (
                !tool ||
                !prompts[tool]
            ) {

                return res
                    .status(400)
                    .json({
                        error:
                            "Invalid AI tool."
                    });

            }


            if (
                typeof input !== "string" ||
                !input.trim()
            ) {

                return res
                    .status(400)
                    .json({
                        error:
                            "Please enter some information."
                    });

            }


            if (
                input.length > 6000
            ) {

                return res
                    .status(400)
                    .json({
                        error:
                            "Input must be 6,000 characters or less."
                    });

            }


            const finalPrompt =
                buildPrompt(
                    tool,
                    input,
                    tone,
                    audience
                );


            const response =
                await client.responses.create({

                    model:
                        process.env.OPENAI_MODEL ||
                        "gpt-6-luna",

                    input:
                        finalPrompt

                });


            res.json({

                output:
                    response.output_text ||
                    "No AI response was returned."

            });


        } catch (error) {

            console.error(
                "Server error:",
                error
            );


            res
                .status(500)
                .json({

                    error:
                        "The AI service could not complete the request."

                });

        }

    }
);


/* =====================================================
   START SERVER
===================================================== */

app.listen(
    port,
    "0.0.0.0",
    () => {

        console.log(
            `AI Workplace Productivity Assistant running on port ${port}`
        );

    }
);
