# LEVEL UP — Final Deployment Checklist

## Local
- Open `index.html`.
- Test Home → Case Studies → Newsroom → AI Desk → Research → About.
- Test search, filters and case-study navigation.
- Test the Research chart.

## Live
Use a static/serverless host such as Vercel.

## Environment variables
Put AI/news/market provider credentials in deployment environment variables, never in HTML or browser JS.

## Live data
The site contains fallback snapshots. Do not label those as live until secure API endpoints are connected.

## Academic presentation
Recommended demo path:
Home → Case Studies → one detailed case → Research chart → Newsroom → AI Desk.
