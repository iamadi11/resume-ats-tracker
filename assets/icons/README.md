# 3D Realistic Icons

Professional 3D-style icons for the Resume ATS Tracker Chrome Extension.

## Icon Files

- **icon16.png** (512 bytes) - 16x16 pixels (toolbar)
- **icon48.png** (1.5 KB) - 48x48 pixels (extension management)
- **icon128.png** (4.4 KB) - 128x128 pixels (Chrome Web Store)

## Design Features

### Visual Elements
- **3D Gradient Background**: Blue theme matching extension (#0ea5e9 → #0369a1)
- **Realistic Document**: White paper/resume with depth effects
- **Shadow Effects**: Multi-layer shadows for 3D appearance
- **Highlights**: Light reflection on document surface
- **Green Checkmark Badge**: ATS score indicator (success green)
- **Text Lines**: Simulated resume content for realism
- **Rounded Corners**: Modern, polished appearance

### 3D Effects
1. **Gradient Background**: Linear gradient from light to dark blue
2. **Document Shadow**: Offset shadow beneath the paper
3. **Depth Shadow**: Side shadow for dimensional effect
4. **Highlight Gradient**: Top-to-bottom light reflection
5. **Radial Badge Gradient**: Circular gradient on checkmark badge
6. **Glow Effect**: Subtle glow around the icon

## Regenerating Icons

To regenerate the icons (e.g., after design changes):

```bash
cd assets/icons
node generate-icons.js
```

Then rebuild the extension:

```bash
npm run build
```

## Icon Generator Script

The `generate-icons.js` script uses:
- **Node.js Canvas API** (`canvas` package)
- **ES Module syntax** (compatible with project setup)
- **Programmatic generation** for consistent results

## Customization

To customize the icons, edit `generate-icons.js`:

### Colors
- Background: Modify `bgGradient` color stops
- Document: Change `#ffffff` to desired paper color
- Badge: Update `badgeGradient` colors

### Sizes & Proportions
- Document size: Adjust `docWidth` and `docHeight` multipliers
- Badge size: Modify `badgeSize` multiplier
- Shadow offset: Change shadow position values

### Effects
- Shadow intensity: Adjust `rgba(0, 0, 0, alpha)` values
- Highlight strength: Modify highlight gradient opacity
- Glow intensity: Change `shadowBlur` and `shadowColor` alpha

## Requirements

- Node.js (v14+)
- `canvas` package (installed as dev dependency)

## Notes

- Icons are automatically copied to `dist/` during build
- All icons use RGBA format for transparency support
- Icons are optimized for their respective display contexts
- For production, consider additional optimization if needed

---

**Status:** ✅ Professional 3D icons ready for use
