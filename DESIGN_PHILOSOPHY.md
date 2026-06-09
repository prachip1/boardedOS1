# 🎨 Boarded - Design Philosophy

## Pure Black, White & Gray Aesthetic

Inspired by Linear.app's minimalist approach - we use **only black, white, and shades of gray** for all main interface elements.

---

## Color Usage Rules

### ✅ **Main Elements (Black/White/Gray Only)**

- **Buttons**: White background, black text
- **Text**: White, gray shades only
- **Backgrounds**: Pure black → Dark grays
- **Borders**: Dark gray shades
- **Cards**: Dark gray backgrounds
- **Avatars**: White circles with black text
- **Logos**: White on black or black on white
- **Gradients**: Black to dark gray (shadowy)

### 🎯 **Tiny Accents (Color Allowed)**

Colors are **ONLY** used for small decorative elements:

- **Dots** (status indicators, badges)
- **Small icons** (2-3px decorative elements)
- **Notification badges** (tiny dots)
- **Status borders** (1px lines)

#### Accent Colors (for tiny elements only):
- Green: `#10b981` - Success/active states
- Blue: `#5e6ad2` - Information
- Purple: `#8b5cf6` - Special highlights
- Red: `#ef4444` - Errors/warnings
- Yellow: `#f59e0b` - Attention

---

## Typography

- **Font**: Inter (Google Fonts)
- **Colors**: White → Light Gray → Dark Gray
- **Never colored text** (except in tiny badges/dots)

---

## Gradients

All gradients are **dark and shadowy**:

```css
/* Dark gradient backgrounds */
linear-gradient(to bottom, #000000, #0a0a0a, #111111)
linear-gradient(135deg, #0a0a0a, #1a1a1a)
radial-gradient(circle, #1a1a1a, #000000)
```

**No bright or colored gradients!**

---

## Shadows

Subtle, dark shadows for depth:

```css
box-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
```

---

## Examples

### ✅ **Correct Usage**

```jsx
// Button - white on black
<button className="bg-white text-black">Click me</button>

// Avatar - white circle
<div className="bg-white text-black">JD</div>

// Status dot - tiny color accent
<div className="w-2 h-2 bg-accent-green rounded-full"></div>

// Card with dark gradient
<div className="bg-gradient-subtle">Content</div>
```

### ❌ **Incorrect Usage**

```jsx
// NO - colored button
<button className="bg-blue-500">Click me</button>

// NO - colored text
<p className="text-purple-500">Hello</p>

// NO - bright gradient
<div className="bg-gradient-to-r from-blue-500 to-purple-500"></div>
```

---

## The Philosophy

**"Less is more"**

By limiting our color palette to black, white, and gray:
1. Focus stays on content
2. Interface feels professional
3. Colors become meaningful when used
4. Consistent, cohesive experience
5. Timeless, elegant design

When we **do** use color (tiny dots), it draws attention exactly where needed.

---

## Linear.app Inspiration

Just like Linear.app:
- Ultra-minimal color usage
- Dark backgrounds (black)
- White text and elements
- Subtle gradients (dark to darker)
- Professional, focused aesthetic
- Clean and uncluttered

---

## Component Examples

### Homepage
- ✅ White buttons
- ✅ White/gray text
- ✅ Dark gradients
- ✅ Tiny colored dots on step numbers

### Dashboard
- ✅ White avatars
- ✅ Gray cards
- ✅ Black backgrounds
- ✅ Tiny status dots (colored)

### Forms
- ✅ White focus borders
- ✅ Gray placeholders
- ✅ Black inputs
- ✅ No colored buttons

---

## Summary

**Main Rule**: If it's visible and large → Black/White/Gray
**Tiny Rule**: If it's a dot or 2px element → Can use color

This creates a **professional, minimalist, and timeless** design.

---

**"Simplicity is the ultimate sophistication"**

