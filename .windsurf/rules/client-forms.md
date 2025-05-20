# Client Forms Styling and Structure Rules

## Modal Components
- All client-related modals must use the shared `Modal` component from `@/components/ui/Modal`
- Modal titles should be descriptive and follow the pattern "Add New Client" or "Edit Client"
- Use `maxWidth="2xl"` for client modals to accommodate complex forms

## Form Structure
- Forms should be organized in clear sections with appropriate headings
- Required fields should be marked with an asterisk (*)
- Form validation should be implemented with clear error messages
- Follow the exact layout from mockups for consistency

## Input Styling
- All inputs should use the standard project input styling:
  - Border: `border-buttonBorder`
  - Rounded corners: `rounded`
  - Padding: `p-2`
  - Error state: `border-error`
- Use consistent spacing between form elements (`space-y-4`)

## Client Form Specific Requirements
- Company information section should be at the top
- Department management should include add/remove functionality
- User management should include a table-like interface with columns for name, email, phone, department, exceptions, and access
- Solutions Engineer assignment should use a dropdown with add/remove functionality
- Follow the exact styling from mockups for all elements
