# LEVEL UP AI Desk

`ai-desk.html` is a local, plain HTML/CSS/JS AI finance assistant.

## Local demo
Open `ai-desk.html`. It works without an API and provides curated demo explanations for common accounting/fintech questions.

## Connect a real model
1. Deploy the site with a server/serverless function.
2. Keep the model API key in an environment variable on the server.
3. Implement the POST request in `api/ai.js`.
4. Change `LIVE_AI.enabled` to `true` in `ai-desk.js`.
5. Keep the endpoint as `/api/ai` or change it to your deployed route.

Expected request:
`POST /api/ai`
`{"message":"Explain RPA in accounting"}`

Expected response:
`{"answer":"..."}`

Never place a private model API key in `ai-desk.js`.
