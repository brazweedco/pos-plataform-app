# BrazWeed POS - Project Context

## Project Overview
BrazWeed POS is a Point of Sale mobile/web application built with Expo/React Native. The app supports iOS, Android, and Web platforms.

## Tech Stack
- **Framework**: Expo SDK 54 with Expo Router v6
- **Language**: TypeScript
- **Styling**: React Native StyleSheet (responsive scaling system)
- **State Management**: Zustand
- **Data Fetching**: TanStack React Query
- **Animations**: React Native Reanimated

## Design System

### Figma Reference
- **File**: https://www.figma.com/design/surOePAdNbB359u6Mky6dS/BrazeWeed-POS
- **Design dimensions**: 440x956px (mobile-first)

### Colors (from `constants/layout.ts`)
```typescript
COLORS = {
  primary: "#E46C45",        // Orange - main brand color
  primaryDark: "#CF4A22",    // Dark orange - shadows
  secondary: "#003640",      // Dark teal - secondary buttons
  background: "#FEF9F3",     // Cream/beige - app background
  surface: "#FFFFFF",        // White - cards
  inputBackground: "#F7F5F3", // Light gray - input fields
  text: "#0F2F38",           // Dark - primary text
  textMuted: "#808080",      // Gray - placeholder text
  border: "rgba(241, 112, 73, 0.16)", // Light orange border
  borderFocused: "#E46C45",  // Orange - focused inputs
}
```

### Responsive Scaling System
Use the `useScale` hook for proportional sizing:
```typescript
const { s, sx, sy, isWeb, isLargeScreen } = useScale();

// sx(size) - horizontal scaling (widths, horizontal margins)
// sy(size) - vertical scaling (heights, vertical margins)
// s(size)  - uniform scaling (fonts, icons, border-radius)
```

## Project Structure

```
app/                    # Expo Router pages
├── _layout.tsx         # Root layout
├── index.tsx           # Splash screen
└── login.tsx           # Login screen

components/             # Reusable UI components
├── brazweed-logo.tsx   # Logo (iconOnly or with text)
├── button.tsx          # Button (primary/secondary variants)
├── decorative-pattern.tsx # Background pattern
├── input.tsx           # Text input with label
└── screen-container.tsx # Base screen wrapper

constants/
├── layout.ts           # Design constants (colors, breakpoints)
└── theme.ts            # Theme colors

hooks/
└── use-scale.ts        # Responsive scaling hook

services/
├── api.ts              # HTTP client with auto token refresh
├── auth.ts             # Authentication service
└── storage.ts          # Storage abstraction (web/native)

assets/images/
├── brazweed-logo.svg       # Flower icon
├── brazweed-logo-text.svg  # "brazweed" text
├── brazweed-pattern.svg    # Decorative pattern
└── fingerprint-icon.svg    # Biometric icon
```

## Components Usage

### ScreenContainer
Base wrapper for all screens:
```tsx
<ScreenContainer
  showPattern={true}    // Show decorative pattern
  avoidKeyboard={true}  // Enable keyboard avoiding
  scrollable={true}     // Enable scrolling
>
  {children}
</ScreenContainer>
```

### BrazweedLogo
```tsx
<BrazweedLogo />           // Full logo with text
<BrazweedLogo iconOnly />  // Just the flower icon
```

### Button
```tsx
<Button title="Sign In" onPress={...} />
<Button title="Face ID" variant="secondary" icon={...} />
<Button title="Loading..." disabled />
```

### Input
```tsx
<Input label="Email" placeholder="Your email" keyboardType="email-address" />
<Input label="Password" isPassword placeholder="***" />
```

## API Integration

### Base URL
```
http://localhost:8080
```

### Authentication Endpoints
| Endpoint | Method | Body | Response |
|----------|--------|------|----------|
| `/api/v1/auth/login` | POST | `{ email, password }` | `{ accessToken, refreshToken, user }` |
| `/api/v1/auth/refresh` | POST | `{ refreshToken }` | `{ accessToken, refreshToken, user }` |

### Auth Service Usage
```typescript
import { authService } from "@/services/auth";

// Login
await authService.login({ email, password });

// Refresh (automatic when 401)
await authService.refreshToken();

// Logout
await authService.logout();

// Check auth state
const isAuth = await authService.isAuthenticated();
```

## Code Patterns

### Creating New Screens
1. Create file in `app/` folder
2. Use `ScreenContainer` as wrapper
3. Use `useScale` for responsive dimensions
4. Use `useSafeAreaInsets` for safe areas

```tsx
import { ScreenContainer } from "@/components/screen-container";
import { useScale } from "@/hooks/use-scale";

export default function MyScreen() {
  const { s, sx, sy } = useScale();

  return (
    <ScreenContainer>
      {/* Content */}
    </ScreenContainer>
  );
}
```

### Creating New Components
1. Create in `components/` folder
2. Use `useScale` for responsive sizing
3. Use colors from `COLORS` constant
4. Export as named export

### Styling Guidelines
- Use `StyleSheet.create()` for styles
- Use `useScale` helpers for all dimensions
- Reference Figma coordinates directly (they scale automatically)
- Use COLORS constant instead of hardcoded colors

## Commands

```bash
npm start          # Start Expo dev server
npm run android    # Run on Android
npm run ios        # Run on iOS
npm run web        # Run on Web
npm run lint       # Run ESLint
```

## Web Responsiveness
- Mobile/small screens: Full-width layout
- Large screens (>480px): Centered mobile frame (440px max-width)
- Content scales proportionally within the frame
