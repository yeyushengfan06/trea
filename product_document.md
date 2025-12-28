# HashWarriors Product Requirement Document (PRD)

## 1. Product Overview
HashWarriors is a web-based auto-battler game where characters are deterministically generated from text inputs. Any string (name, sentence, code) is hashed to create a unique "Warrior" with specific stats, class, and pixel art appearance.

## 2. Core Mechanics

### 2.1 Hash Generation
- **Input**: Any text string.
- **Algorithm**: SHA-256 (via crypto-js).
- **Output**: A hex string (e.g., `a3f5...`).
- **Usage**: The hash is split into segments to determine all attributes.

### 2.2 Character Generation (The DNA)
The hash string is the DNA.
- **Class (Archetype)**: Derived from the first byte modulo 3.
  - 0: **Warrior** (High HP/DEF, Low SPD)
  - 1: **Mage** (High ATK, Low HP)
  - 2: **Rogue** (High SPD/CRIT, Low DEF)
- **Stats**:
  - **HP**: Base + (Hash segment 1)
  - **Attack**: Base + (Hash segment 2)
  - **Defense**: Base + (Hash segment 3)
  - **Speed**: Base + (Hash segment 4)
- **Visuals (Pixel Art)**:
  - **Color Palette**: Derived from hash colors.
  - **Shape**: 5x5 or 7x7 symmetrical grid.
  - **Weapon**: Optional overlay based on class.

### 2.3 Battle System
- **Format**: 1v1 Auto-battle.
- **Turn-based**: Based on Speed.
- **Actions**:
  - **Attack**: Deal damage (ATK - Enemy DEF). Minimum 1 dmg.
  - **Crit**: 2x Damage (Chance based on Speed/Class).
  - **Dodge**: 0 Damage (Chance based on Speed).
- **Win Condition**: Enemy HP <= 0.

## 3. Technical Architecture

### 3.1 Stack
- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **State**: React Context / Local State (No backend)

### 3.2 Directory Structure
- `src/utils/hash.ts`: Hashing logic.
- `src/utils/generator.ts`: Character generation logic (stats, class).
- `src/components/PixelAvatar.tsx`: Canvas component to draw the sprite.
- `src/components/BattleArena.tsx`: The fight logic and animation.

## 4. Visual Style
- **Theme**: Retro 8-bit / Pixel Art.
- **Colors**: Dark mode default. Neon accents.
- **Font**: Pixel font (Google Fonts: "Press Start 2P" or similar).

## 5. MVP Scope
- Input two names.
- Generate two cards side-by-side.
- Click "FIGHT".
- Show text log of battle + simple HP bar animation.
- Declare winner.
