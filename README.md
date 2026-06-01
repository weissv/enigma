# Enigma // Cryptanalysis Platform (v3.0 Research Build)

A high-performance, web-based Enigma machine simulator and cryptanalysis tool designed for mechanistic interpretability and advanced brute-force attacks.

## 🚀 Phase 3 Upgrades
We have completely overhauled the architecture to shift from a linear MVP to a parallelized research environment, wrapped in a beautiful **Cyber-Ukiyo-e** aesthetic.

### 1. Swarm Intelligence (Web Workers)
The Turing Bombe logic is now powered by a **Multi-Agent Swarm** utilizing `navigator.hardwareConcurrency` and a `BroadcastChannel` Event Bus:
- **Agent Alpha:** Sweeps through the massive 17,576 * 60 rotor/reflector configurations. Upon finding a baseline Index of Coincidence (IC > 0.040), it broadcasts the configuration to the Swarm.
- **Agent Betas:** A dynamic pool of agents that listen to the Event Bus and perform parallelized Hill Climbing to find optimal Steckerbrett (plugboard) mutations.
- **Agent Gamma:** Dedicated to graph loop detection (Turing Menus) during Crib Dragging.

### 2. WebAssembly (WASM) Engine
The core mathematical brute-force engine has been ported from TypeScript to **AssemblyScript (WASM)**. This dramatically accelerates permutation testing and array manipulations, completely eliminating UI lag during deep tree searches.

### 3. Topological Entropy Visualization (Big Freeze)
Replaced the static 2D Shannon Entropy Matrix with `BigFreeze3D`—a stunning thermodynamic visualization of the $10^{23}$ keyspace. 
- **Chaos:** High entropy (gibberish text) causes 3,000 WebGL particles to fly in rapid Brownian motion with a Cinnabar heat-glow.
- **Big Freeze:** As the swarm discovers the key, the entropy drops to zero, and the simulation instantly "freezes" the particles into a rigid, gold-glowing crystalline lattice.

### 4. Cyber-Ukiyo-e Aesthetic
The UI has evolved from standard Brutalism to **Cyber-Ukiyo-e**:
- Deep Kuro-Tobi (Indigo) voids `#0a0b12`
- Cinnabar/Vermilion accents `#e34234`
- Faded Gold glows `#d4af37`
- Traditional Japanese Hanko seals used for graph nodes.
- Flowing bezier waves (`CatmullRomLine`) map the signal path through the Glass Box.

---

## 💻 Tech Stack
- **React 18 + Vite**
- **TypeScript** (Strict Mode)
- **WebAssembly (AssemblyScript)** for the Bombe engine
- **Web Workers + BroadcastChannel** for Swarm Orchestration
- **React Three Fiber / Drei** for WebGL visualizations
- **CSS3 Variables & Grid** (Zero-dependency styling)

## 🏃‍♂️ Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```

## 🌐 Localization (i18n)
The interface supports dynamic switching between English and Russian via the language toggle in the header.
