# SurveyMitra

## Current State
- Public landing page exists at LandingPage.tsx explaining the app
- VLP module exists in VLPPage.tsx with Election Results visual dashboard, Caste Analysis, Field Notes, AI Insights, Report Generation, and Mock Data sections
- Report Generation currently prints text-based data with election results in a basic table

## Requested Changes (Diff)

### Add
- New features section on public landing page covering: VLP (Village Level Program), Advanced Analytics, Field Notes, AI Insights, Bulk Messaging with templates, Task Manager, Excel Import/Export
- Each feature on landing page with practical use case description (real-world campaign scenario)
- Graphs/charts in VLP Report Generation (bar chart for election results by party/candidate, pie chart for caste breakdown, progress bars for AI win probability)
- Improved election results data format in the printed/PDF report (visual winner/runner-up highlight, rank column, vote %, margin, party color badges)

### Modify
- Landing page: add a comprehensive "Features" section with practical use cases per feature, update existing sections to mention VLP and Advanced Analytics
- VLP Report Generation: include recharts-based bar chart for election results, pie chart for caste analysis, formatted election results table with ranks/percentages/highlights instead of raw data dump

### Remove
- Nothing removed

## Implementation Plan
1. Update LandingPage.tsx: add a features grid section with icons, feature names, descriptions, and practical use case examples for all major features
2. Update VLPPage.tsx Report Generation section:
   - Add BarChart for election results (party vs votes) rendered via recharts
   - Add PieChart for caste breakdown
   - Improve election results table in report with rank, vote%, winner highlight, margin display
   - Use print-friendly CSS for charts in reports
