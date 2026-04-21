# Nine-Grid Auto Battler

A strategic 3x3 turn-based auto-battle game. Place your units, manage your formation, and watch the automatic combat unfold with skills and ultimate attacks.

## Game Features

- **3x3 Grid Combat**: Strategic placement on a 9-cell battlefield
- **Auto Battle System**: Watch units fight automatically with skills and ultimate attacks
- **Unit Variety**: Multiple unit types with unique abilities
- **Turn-Based Progression**: Manage your formation between battles
- **Localization Support**: Multi-language support (English/Chinese)

## Tech Stack

- React 19 + TypeScript
- Vite for build tooling
- Vitest for testing
- Lucide React for icons

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Project Structure

```
src/
├── assets/              # Static assets
├── components/          # React components
│   └── game/            # Game-specific components
│       ├── BattleUnit.tsx   # Unit display component
│       └── GameGrid.tsx      # 3x3 grid component
├── config/              # Application configuration
│   ├── constants.ts     # Game constants (grid size, energy values)
│   ├── localization.ts  # i18n translations
│   └── themes.ts       # Theme definitions
├── constants/           # Static game data
│   └── game/
│       └── unitTemplates.ts  # Unit type definitions
├── hooks/               # React hooks
│   ├── gameLogic/      # Core game logic
│   │   ├── battleProgression.ts
│   │   ├── formationActions.ts
│   │   ├── initialization.ts
│   │   └── persistenceActions.ts
│   └── useGameLogic.ts # Main game state hook
├── pages/               # Screen components
│   ├── MainMenu.tsx
│   ├── GameScreen.tsx
│   ├── HelpScreen.tsx
│   └── SettingsScreen.tsx
├── services/            # Business logic services
│   ├── contentService.ts  # Unit template service
│   └── gameEngine.ts      # Battle simulation engine
├── types/                # TypeScript type definitions
│   └── types.ts
├── utils/                # Utility functions
│   ├── i18n.ts
│   └── performance/       # Performance monitoring
├── App.tsx
└── index.tsx
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run test` | Run all tests |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run benchmark:frontend` | Run frontend performance benchmarks |
| `npm run metrics:report` | Generate performance metrics report |

## License

MIT License - see [LICENSE](LICENSE) for details.
