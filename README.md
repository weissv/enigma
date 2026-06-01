# Enigma Cryptanalysis Platform

A modern, highly accurate web-based implementation of the legendary **Enigma M3** cryptographic machine from World War II. Built with React and TypeScript, this project has evolved from a basic simulator into a full-fledged research platform for **mechanistic interpretability** and **cryptanalysis**.

## 🎯 Overview

The Enigma Cryptanalysis Platform allows you to not only encrypt and decrypt messages with historical accuracy but also to "look inside the box" to understand exactly how the electrical signals flow through the machine. Furthermore, it provides built-in statistical tools and a brute-force engine to simulate historical code-breaking techniques.

### Key Modules

#### 1. ⚙️ Core Enigma Engine
- **Accurate Simulation**: M3 Wehrmacht Enigma with 5 interchangeable rotors (I-V) and 2 reflectors (B, C).
- **Mechanical Precision**: Implements correct wiring, ring settings, and the famous "double-step anomaly" for the rotor turnover mechanism.

#### 2. 🔍 Glass Box (Mechanistic Interpretability)
- **Signal Trace**: A complete 9-step electrical trace of every character processed (Input → R → M → L → Reflector → L⁻¹ → M⁻¹ → R⁻¹ → Output).
- **SVG Diagrams**: Visualizes the exact path of the signal through the components.
- **Timeline**: A clickable timeline to inspect the internal state of the machine at any point during the message.

#### 3. 📊 Cryptanalysis Dashboard
- **Frequency Analysis**: Real-time evaluation of character distribution compared against standard English frequencies, complete with a custom SVG chart and $\chi^2$ statistic.
- **Index of Coincidence (IC)**: Visual meter assessing the randomness of the ciphertext to identify monoalphabetic vs. polyalphabetic properties.

#### 4. 💣 Turing Bombe (Brute-Force)
- **Web Worker Engine**: A multi-threaded brute-force search engine running in a background Web Worker to avoid freezing the UI.
- **Crib-based Cracking**: Input a known plaintext "crib" to search for the correct initial rotor positions, types, and reflector.
- **Candidate Scoring**: Automatically evaluates potential solutions using the Index of Coincidence to rank candidates.

## 🎨 UI & Design

The platform features a custom **Cyberpunk / Noir aesthetic**, strictly avoiding generic utility classes in favor of a bespoke vanilla CSS design system.
- Monospaced typography for high information density.
- Zero external UI dependencies (no D3, no Recharts, no Tailwind).
- Dynamic CSS grid layout (Dashboard mode).

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ with npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/weissv/enigma.git
cd enigma

# Install dependencies
npm install

# Start development server
npm run dev
```
The application will be available at `http://localhost:5173`.

### Building for Production
```bash
npm run build
```
Builds are heavily optimized, with the Turing Bombe offloaded to a separate chunk.

## 🛠 Technical Architecture

The codebase is structured to enforce a strict separation of concerns, isolating complex cryptographic logic from React components.

```
enigma/
├── src/
│   ├── components/       # UI Components (shared, layout, glassbox, cryptanalysis)
│   ├── hooks/            # React Hooks (useEnigma, useBombe, useSignalTrace, etc.)
│   ├── services/         # Core Logic Classes (EnigmaService, BombeService, etc.)
│   ├── types/            # Strict TypeScript definitions
│   ├── utils/            # Math and formatting helpers
│   ├── workers/          # Web Workers (bombe.worker.ts)
│   ├── App.tsx           # Dashboard layout orchestrator
│   └── index.css         # Cyberpunk design system tokens
```

### Key Services
- `enigmaService.ts`: The core M3 emulator. Supports `processStringTraced()` which captures the machine state before and after every character.
- `SignalTraceService.ts`: Manages the trace timeline and normalizes component states for the Glass Box UI.
- `CryptanalysisService.ts`: Static utilities for text metrics (IC, Chi-Squared).
- `BombeService.ts`: Manages the lifecycle of the Web Worker and parses messages into React state.

## 📖 Educational Context

This platform is designed to teach both cryptography and modern web engineering:
- **Cryptography**: Demonstrates why simple substitution fails, how polyalphabetic ciphers work, and how a known-plaintext attack (Crib) can reduce a massive search space.
- **Engineering**: Showcases state management with complex domains, separating heavy computation into Web Workers, and rendering custom SVG visualizations from scratch.

## ⚠️ Security Warning

This simulator uses historically accurate WWII algorithms. It is **fundamentally broken** and insecure by modern standards. It can be cracked by the built-in Turing Bombe simulator in your browser within seconds. Do not use this for actual secure communication.

## 🔮 Future Roadmap (Phase 2)

- **Plugboard (Steckerbrett)**: Add the missing piece of the M3 machine to increase the cryptographic complexity.
- **Animated Signal Path**: Step-by-step playback of the electrical current.
- **Crib-graph Visualization**: Display the "menus" (loops of letters) used by the historical Bombe to eliminate incorrect settings.

## 📄 License

Open source under the MIT License.
