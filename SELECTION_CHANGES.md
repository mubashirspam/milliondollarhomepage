# Selection System Changes

## Overview

Updated the pixel selection and cart system to use **shift+drag only** for selecting areas instead of individual pixel selection.

## Key Changes

### 1. Cart Store (lib/store.ts)

- **Changed from**: Individual pixel storage (`Set<string>`)
- **Changed to**: Area-based storage (`CartArea[]`)
- Each cart item now represents a rectangular area with:
  - `id`: Unique identifier
  - `minX, minY, maxX, maxY`: Area boundaries
  - `pixelCount`: Number of pixels in area

### 2. Pixel Canvas (components/Canvas/PixelCanvas.tsx)

- **Removed**: Single-click to add to cart
- **Added**: Click to view pixel details in sidebar (without adding to cart)
- **Shift+Drag**: Creates selection rectangle and adds entire area to cart
- **Performance**: Areas are added as single items instead of iterating through each pixel

### 3. Cart Modal (components/Modals/CartModal.tsx)

- **Displays**: Selected areas with dimensions (e.g., "10×15 Area")
- **Shows**: Pixel count and coordinate range for each area
- **Pricing**: Calculated per area based on total pixels

### 4. Sidebar (components/UI/Sidebar.tsx)

- **Removed**: Add/Remove from cart buttons
- **Changed**: Shows instruction to use Shift+Drag for available pixels
- **Kept**: View pixel details and edit functionality for owned pixels

### 5. Selection Hint (components/UI/SelectionHint.tsx)

- **New**: Floating hint showing "Shift + Drag to select pixels"
- **Dismissable**: Can be closed and won't show again (localStorage)

## User Flow

1. **View pixels**: Click any pixel to see details in sidebar
2. **Select area**: Hold Shift and drag to create selection rectangle
3. **Add to cart**: Release mouse - area is automatically added to cart and modal opens
4. **Review**: See all selected areas with pixel counts and prices
5. **Checkout**: Proceed with all areas together

## Benefits

✅ **Better Performance**: No iteration through individual pixels on drag
✅ **Clearer Pricing**: One item per selected area
✅ **Simpler UX**: Only one way to select (shift+drag)
✅ **No Unresponsiveness**: Eliminated the drag performance issues
✅ **Area Pricing**: Customers purchase rectangular areas, not scattered pixels

## Technical Details

### Data Structure

```typescript
interface CartArea {
  id: string;
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  pixelCount: number;
}
```

### Selection Flow

1. User holds Shift
2. Mouse down → `selection.startSelection(x, y)`
3. Mouse move → `selection.updateSelection(x, y)`
4. Mouse up → `addArea(minX, minY, maxX, maxY)` → Open cart modal
