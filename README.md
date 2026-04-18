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
├── components/          # React components
│   ├── screens/        # Game screens (MainMenu, GameScreen, HelpScreen, SettingsScreen)
│   ├── BattleUnit.tsx  # Unit display component
│   └── GameGrid.tsx    # 3x3 grid component
├── hooks/              # React hooks
│   └── gameLogic/      # Core game logic hooks
├── services/           # Game services
│   └── gameEngine.ts   # Battle simulation engine
├── constants/          # Game constants and themes
├── data/               # Unit templates and configuration
├── types.ts            # TypeScript type definitions
└── utils/              # Utility functions
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

Private project.
