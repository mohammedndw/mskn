# Design Guidelines: Tenant Contracts Portal

## Design Approach

**Selected Framework:** Modern SaaS Application Design
**Reference Inspiration:** Stripe Dashboard + Linear + Notion for professional, data-rich interfaces
**Rationale:** Information-dense utility application requiring clarity, professionalism, and efficient data presentation for Saudi Arabian real estate context.

**Core Principles:**
- Information hierarchy through typography and spacing, not color
- Trust-building through professional restraint and clear status communication
- Efficiency-focused layouts that minimize cognitive load
- Culturally appropriate for Saudi market (professional, trustworthy, clear)

---

## Typography System

**Font Stack:** Inter (Google Fonts) - exceptional readability for data-heavy interfaces

**Hierarchy:**
- Page Titles: text-3xl font-semibold (36px)
- Section Headers: text-xl font-semibold (20px)
- Card Titles: text-lg font-medium (18px)
- Body Text: text-base font-normal (16px)
- Metadata/Labels: text-sm font-medium (14px)
- Supporting Text: text-sm font-normal (14px)
- Currency/Numbers: font-mono for SAR amounts (tabular figures)

**SAR Currency Format:** "SAR 12,500.00" using font-mono with text-lg font-semibold for prominent amounts, text-base font-medium for secondary amounts

---

## Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24
- Micro spacing (icon-text gaps): 2
- Component internal padding: 4, 6
- Card padding: 6, 8
- Section spacing: 12, 16
- Page margins: 20, 24

**Container Structure:**
- Dashboard max-width: max-w-7xl (1280px)
- Content sections: px-6 md:px-8 lg:px-12
- Vertical rhythm: space-y-6 for card groups, space-y-8 for major sections

---

## Component Library

### Navigation Header
**Structure:** Sticky top bar with tenant name, contract overview stats, action buttons
- Height: h-16
- Padding: px-6 md:px-12
- Layout: Flex justify-between with logo/title left, stats center, actions right
- Stats Pills: Inline badges showing "2 Active Contracts" | "1 Expiring Soon"

### Contract Cards (Primary Component)
**Layout:** Grid display (grid-cols-1 lg:grid-cols-2 gap-6)
- Card padding: p-6
- Border radius: rounded-xl
- Shadow: shadow-md (soft elevation)
- Status Bar: 4px vertical accent on left edge or top-right status badge

**Card Anatomy:**
1. Header Row: Contract ID + Status Badge (flex justify-between items-start)
2. Property Details: Building name, unit number, property type (text-lg font-medium)
3. Duration Row: Start-End dates with calendar icons (text-sm, space-x-4)
4. Financial Row: Monthly rent (large SAR amount) + Total contract value (secondary)
5. Action Row: Primary CTA button + secondary action links (mt-4)

**Status Badges:** Rounded-full px-3 py-1 with Heroicons status icons
- Active: Checkmark circle icon
- Expiring Soon: Clock icon  
- Expired: X circle icon
- Pending Renewal: Arrow path icon

### Payment Timeline
**Structure:** Vertical timeline with connection lines
- Timeline Item: flex gap-4 structure
- Left: Date circle (w-12 h-12 rounded-full) with month/day
- Center: Vertical connector line (w-0.5 connecting circles)
- Right: Payment card (flex-1) with amount, status, pay button

**Payment Card Contents:**
- Payment period (e.g., "January 2024 Rent")
- SAR amount (font-mono text-xl)
- Due date and status indicator
- Action: "Pay Now" button or "Paid" checkmark

Timeline height: Natural flow, no forced viewport constraints

### Document Viewer Section
**Layout:** Two-column on desktop (grid-cols-1 lg:grid-cols-3 gap-6)
- Left Column (lg:col-span-2): Document preview area
- Right Column: Document list with metadata

**Document List Items:**
- Icon: Heroicons document-text icon (w-10 h-10)
- Title + file type badge
- Metadata: Size, upload date, uploaded by
- Actions: Download, view buttons (icon buttons)
- Padding: p-4, hover:shadow-lg transition

### Action Modals
**Modal Container:** Fixed overlay with backdrop blur
- Modal width: max-w-lg for forms, max-w-4xl for document viewer
- Padding: p-6
- Border radius: rounded-2xl
- Shadow: shadow-2xl

**Pay Rent Modal:**
- Header: Contract reference, amount due
- Payment method selector (radio cards)
- SAR amount display (large, font-mono)
- Confirmation checkbox
- Footer: Cancel + "Confirm Payment" buttons (flex justify-end gap-3)

**Renew Contract Modal:**
- Current terms summary card
- New terms comparison (side-by-side or stacked)
- Duration selector
- Rent adjustment display
- Agreement checkboxes
- Submit button

**Upload Addendum Modal:**
- Drag-drop zone (dashed border, rounded-lg, h-48)
- File type instructions (text-sm)
- Upload progress indicators
- Preview thumbnails for uploaded files
- Category selector dropdown
- Description textarea

### Status Indicators System
**Visual Coding:**
- Active: Solid indicator (not just color reference)
- Expiring: Pulsing animation on status badge
- Overdue: Bold border treatment
- Paid: Checkmark icon emphasis

Use icon differentiation primarily, not color alone for accessibility

### Dashboard Summary Section
**Top Section:** Stats grid (grid-cols-2 md:grid-cols-4 gap-4)
- Stat cards with large numbers, labels, trend indicators
- Cards: p-6, rounded-lg, shadow-sm
- Include: Active contracts count, Total monthly rent, Next payment due, Documents count

---

## Interaction Patterns

**Buttons:**
- Primary: px-6 py-3, rounded-lg, font-medium
- Secondary: px-4 py-2, rounded-lg, outline variant
- Text buttons: underline-offset-4 for inline actions
- Icon buttons: p-2, rounded-lg for actions

**Cards:** 
- Hover: shadow-lg transition (lift effect)
- Click: Scale down slightly (transform scale-[0.99])

**Animations:** Minimal, purposeful only
- Modal entry: fade + slide up
- Loading states: subtle pulse on skeleton loaders
- Status changes: gentle fade transition

---

## Icons
**Library:** Heroicons (outline for most, solid for filled states)
- Document: document-text
- Payment: credit-card, banknotes
- Calendar: calendar-days
- Status: check-circle, clock, x-circle
- Actions: arrow-down-tray (download), eye (view), pencil (edit)
- Navigation: home, document-duplicate, cog

---

## Accessibility & RTL Considerations

**Language Support:** Structure prepared for Arabic RTL (Saudi market)
- Flex layouts use logical properties ready for dir="rtl"
- Text alignment: text-start (not text-left)
- Spacing uses start/end instead of left/right

**Contrast:** All text maintains WCAG AA standards against backgrounds
**Focus States:** 2px ring offset with rounded corners matching component
**Keyboard Navigation:** Tab order follows visual hierarchy

---

## Images

**Hero Section:** None - this is an application portal, not a marketing page

**Property Images:** 
- Contract cards should include small property thumbnails (w-16 h-16 rounded-lg) showing building exterior
- Document thumbnails for PDF/image previews
- Placement: Top-right corner of contract cards as visual identifier

**Empty States:**
- Simple illustration for "No contracts" state
- Document icon with message for empty document sections