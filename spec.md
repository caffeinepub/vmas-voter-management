# SurveyMitra

## Current State
- Dashboard page with stat cards, pie charts (category, gender), bar charts (education, profession), line chart (voter growth). Education/profession bar chart x-axis labels render at -35deg rotation but are clipping/invisible for many values.
- Sidebar has: Dashboard, Voters, Add Voter, Messaging, Tasks, Settings, Label Print.
- Public landing page at #landing with product showcase sections but generic UI.
- VoterRecord has fields: taluka, district, ward, boothNumber, caste, religion, constituency, categoryLabel, education, profession, gender.

## Requested Changes (Diff)

### Add
- New **Advanced Analytics** page in sidebar (all roles) with:
  - Filters: Taluka, Area/Ward, District, Caste, Religion, Category, Gender, Booth, Constituency
  - Charts: breakdown bar/pie charts for Caste distribution, Religion distribution, Area/Taluka distribution, District distribution, Booth-wise voter counts, Constituency breakdown, Category by Taluka cross-tab, Volunteer count by area
  - Summary stats: unique talukas, districts, castes, religions
  - All charts use vibrant multi-color palettes
- New `AdvancedAnalyticsPage.tsx` component
- Add "Analytics" nav item to Layout sidebar (BarChart icon, all roles)
- Add `analytics` route to PageRoute and App.tsx
- 4 India-centric AI images to landing page hero and feature sections

### Modify
- **Dashboard education/profession bar charts**: Fix missing x-axis labels by increasing chart height to 300px, bottom margin to 80px, and improving tick renderer to properly show all label text. Also add `interval={0}` on XAxis to force all labels.
- **LandingPage**: Replace generic hero with India campaign rally image. Add a new "Visual Story" section with 3 image cards (voting booth, analytics war room, voter outreach). Make overall UI more modern: glassmorphism hero overlay, bold typography, gradient accents.

### Remove
- Nothing removed

## Implementation Plan
1. Create `src/frontend/src/pages/AdvancedAnalyticsPage.tsx` with filter panel + 6 charts
2. Update `PageRoute` type in `Layout.tsx` to add `analytics`
3. Add Analytics nav item in `NAV_ITEMS` in `Layout.tsx`
4. Add `analytics` case in `App.tsx` renderPage switch
5. Fix education/profession chart heights and label rendering in `DashboardPage.tsx`
6. Update `LandingPage.tsx` with new AI images, modern hero section, image showcase cards
