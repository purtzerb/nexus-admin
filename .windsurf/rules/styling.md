---
trigger: model_decision
description: When styling front-end UI
---

Global Color Theme: All colors must be defined within a global theme object (e.g., theme.js).

Theme Color Access: Access colors exclusively from this theme object.

No Hardcoded Colors: No hardcoded color values in component styles.

Styling Solution Choice:

If Tailwind CSS: Configure tailwind.config.js with theme colors.

If not Tailwind: Choose a consistent styling approach (e.g., CSS Modules, Styled Components, Emotion).

Responsiveness Focus: Application is for desktop web only. Focus on a good desktop experience.

UI Quality: Aim for a clean, professional, and intuitive UI. Refer to Figma designs where available; make reasonable choices for missing states.

Table Styling: All tables must follow these guidelines:
- Wrapper: Use "overflow-x-auto shadow ring-1 ring-black ring-opacity-5 rounded-lg"
- Table: Use "min-w-full divide-y divide-gray-200"
- Header: Use "bg-gray-50" with column headers using "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
- Body: Use "bg-white divide-y divide-gray-200" with rows using "hover:bg-gray-50"
- Cells: Use "px-6 py-4 whitespace-nowrap" with text using "text-sm text-gray-900"
- Actions: Use "text-indigo-600 hover:text-indigo-900" for action buttons