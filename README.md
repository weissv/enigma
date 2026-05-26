# Enigma Simulator

A modern web-based implementation of the legendary **Enigma cryptographic machine** from World War II, built with React and TypeScript. This simulator allows you to encrypt and decrypt messages using historically accurate rotor and reflector configurations.

## 🎯 Overview

The **Enigma Machine** was an electromechanical encryption device used by Nazi Germany during WWII. This project faithfully recreates its mechanism with all the mathematical precision of the original hardware:

- **5 interchangeable rotors** (I, II, III, IV, V) with historically accurate wiring
- **2 reflectors** (Type B and C) for signal reflection
- **Rotor stepping mechanism** with the famous "double-step anomaly"
- **Ring settings** for advanced cipher configuration
- **Reciprocal encryption** – encrypt and decrypt with the same settings

### Key Features

✨ **Full Enigma Functionality**
- Configure all three rotor positions, types, and ring settings
- Choose between two reflectors
- Real-time encryption/decryption
- Historically accurate electrical signal flow

🎨 **Modern User Interface**
- Dark theme with cyan accents (hacker aesthetic)
- Responsive design (mobile & desktop)
- Smooth controls for all parameters
- Live preview of encrypted output

🔧 **Developer-Friendly**
- Written in TypeScript with full type safety
- Clean component-based architecture
- Service layer separation for cryptographic logic
- Well-documented code with detailed comments

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ with npm or yarn
- Modern web browser with JavaScript support

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

The application will be available at `http://localhost:5173` (default Vite port).

### Building for Production

```bash
# Build optimized bundle
npm run build

# Preview production build locally
npm run preview
```

## 📖 How to Use

### Basic Encryption/Decryption

1. **Enter your message** in the "Input Text" field
2. **Configure the rotors**:
   - Select rotor types (I-V) for each slot
   - Set starting positions (A-Z)
   - Adjust ring settings if needed (default: A)
3. **Choose a reflector** (B or C)
4. **View the encrypted output** in the "Output Text" field

### Example

**Settings:**
- Slot 1 (Leftmost): Rotor I, Position A, Ring A
- Slot 2 (Middle): Rotor II, Position A, Ring A
- Slot 3 (Rightmost): Rotor III, Position A, Ring A
- Reflector: B

**Input:** `HELLO WORLD`
**Output:** `MFNQZ VZZLL` (output will vary based on rotor mechanics)

### Decryption

To decrypt a message, use the **exact same settings** as used for encryption (because Enigma is reciprocal):

1. Enter the encrypted message in the Input field
2. Use identical rotor and reflector configuration
3. Click "Reset All Settings & Text" to clear and start over

## 🔐 How Enigma Works

### The Signal Path

```
INPUT → [Rotor Right] → [Rotor Middle] → [Rotor Left] → [Reflector] → 
         [Rotor Left] → [Rotor Middle] → [Rotor Right] → OUTPUT
```

### Rotor Mechanism

Each rotor has:
- **26 internal wiring paths** connecting input to output
- **Position setting** (0-25, representing A-Z) that rotates before each character
- **Ring setting** (0-25) that offsets the wiring relative to the rotor's position
- **Notch position** that triggers the next rotor to step when passed

**Rotor Notches** (when rotor steps from this position, next rotor advances):
- Rotor I: Q → R
- Rotor II: E → F
- Rotor III: V → W
- Rotor IV: J → K
- Rotor V: Z → A

### Stepping Logic

Before each character is processed:
1. **Rightmost rotor always steps**
2. **If rightmost rotor is at its notch**: middle rotor steps
3. **If middle rotor is at its notch**: left rotor steps (double-step anomaly)

This creates the famous mechanical turnover behavior.

### Reflector

The reflector creates a "return path" after all rotors:
- **Type B:** `YRUHQSLDPXNGOKMIEBFZCWVJAT`
- **Type C:** `FVPJIAOYEDRZXWGCTKUQSBNMHL`

The reflector ensures **reciprocity** – if A encrypts to Q, then Q encrypts to A.

## 📁 Project Structure

```
enigma/
├── App.tsx                          # Main React component with UI layout
├── index.tsx                        # React DOM entry point
├── index.html                       # HTML page template
├── constants.ts                     # Rotor wirings, reflectors, alphabet
├── types.ts                         # TypeScript interfaces
├── vite.config.ts                   # Vite build configuration
├── tsconfig.json                    # TypeScript configuration
├── package.json                     # Project dependencies
├── components/
│   ├── RotorConfigControl.tsx       # Rotor configuration UI
│   ├── ReflectorConfigControl.tsx   # Reflector selection UI
│   └── LetterSelect.tsx             # Reusable dropdown for A-Z selection
└── services/
    └── enigmaService.ts            # Core Enigma machine logic
```

### Key Files Explained

#### `App.tsx`
Main application component that:
- Manages input/output text state
- Handles rotor and reflector configuration
- Processes text through EnigmaMachine
- Provides UI controls for all settings

#### `services/enigmaService.ts`
Core cryptographic engine (`EnigmaMachine` class):
- Implements accurate rotor stepping mechanics
- Handles signal path through rotors and reflector
- Processes characters with proper position/ring adjustments
- Maintains rotor internal state

**Key Methods:**
- `processCharacter(char)` – Encrypts a single character
- `processString(text)` – Encrypts entire messages
- `stepRotors()` – Implements M3 Enigma stepping with double-step

#### `constants.ts`
Static configuration:
- `ROTOR_WIRINGS` – Internal wiring for all 5 rotor types
- `ROTOR_NOTCHES` – Stepping positions for each rotor
- `REFLECTOR_WIRINGS` – Wiring for B and C reflectors
- `ALPHABET` – Standard 26-letter alphabet
- `INITIAL_ROTOR_SETTINGS` – Default machine configuration

#### `components/RotorConfigControl.tsx`
Handles single rotor UI:
- Rotor type selection (I-V)
- Starting position picker
- Ring setting adjustment

#### `components/LetterSelect.tsx`
Reusable component for A-Z selection dropdowns

#### `components/ReflectorConfigControl.tsx`
Reflector selection UI (B or C)

## 🛠 Technical Architecture

### Technology Stack

| Tool | Purpose |
|------|---------|
| **React 19** | UI framework with hooks |
| **TypeScript** | Type-safe JavaScript |
| **Vite** | Lightning-fast build tool |
| **Tailwind CSS** | Utility-first styling |
| **ESM** | Native ES modules |

### Component Hierarchy

```
App
├── RotorConfigControl (×3 for each slot)
│   └── LetterSelect (for position & ring)
├── ReflectorConfigControl
└── Text Input/Output Areas
```

### State Management

Uses React's built-in hooks:
- `useState` for local component state
- `useCallback` for optimized event handlers
- `useEffect` for reactive text processing

### Props Flow

```
App State
  ↓
rotorSettings: RotorSetting[]
reflectorType: ReflectorName
inputText: string
  ↓
RotorConfigControl (reusable)
ReflectorConfigControl
TextAreas
  ↓
onChange callbacks → update App state → re-process text
```

## 📊 Data Types

### `RotorSetting` (types.ts)
```typescript
interface RotorSetting {
  id: string;              // Unique identifier (e.g., "rotorSlot1")
  type: RotorName;         // Rotor type: 'I' | 'II' | 'III' | 'IV' | 'V'
  initialPosition: number; // Starting position 0-25 (A-Z)
  ringSetting: number;     // Ring adjustment 0-25 (A-Z)
}
```

### `EnigmaConfig` (types.ts)
```typescript
interface EnigmaConfig {
  rotors: RotorSetting[];
  reflector: ReflectorName;
}
```

## 🎓 Educational Value

This simulator is perfect for learning about:

📚 **Cryptography Fundamentals**
- Substitution ciphers and their vulnerabilities
- Polyalphabetic encryption (rotor machinery)
- Historical cipher breaking techniques

🔬 **Mathematics of Encryption**
- Modular arithmetic (mod 26)
- Permutations and transpositions
- Reciprocal properties

💻 **Software Engineering**
- Component composition in React
- Type safety with TypeScript
- Separation of concerns (UI vs. logic)
- Service layer architecture

## ⚠️ Important Notes

### Historical Accuracy

This implementation faithfully recreates the **Enigma I / M3** machine:
- Rotor wiring matches WW2-era specifications
- Stepping mechanism includes the double-step anomaly
- Reflectors B and C are historically accurate

However, it **does not include**:
- Plugboard (Steckerboard) – would require additional 20 letter pair swaps
- Multiple rotor sets (only uses the standard I-V)
- Turnover behavior differences between Enigma models

### Security Warning ⚠️

**Do NOT use this for actual encryption.** Modern Enigma machines are:
1. **Mathematically broken** – the rotor and reflector mechanism is vulnerable to frequency analysis
2. **Historically exploited** – Polish/British codebreakers developed techniques during WWII
3. **Computationally weak** – modern computers can brute-force all settings (~10^15 combinations... still manageable)

For actual secure communication, use modern cryptography (AES-256, RSA, etc.).

## 🎨 UI/UX Features

### Dark Theme
- Background: `#1a202c` (slate-900)
- Accents: Cyan for active elements
- Text: Light slate colors for contrast

### Responsive Design
- Mobile-first approach
- Grid layout that stacks on small screens
- Touch-friendly button sizes

### Accessibility
- Proper `<label>` elements for all inputs
- Descriptive placeholder text
- High contrast ratios
- Keyboard navigation support

## 🐛 Known Limitations

1. **Non-alphabetic characters** – Numbers, spaces, punctuation are passed through unchanged
2. **Case sensitivity** – Input is converted to uppercase automatically
3. **No plugboard** – This is the main difference from historical Enigma
4. **Fixed 3-rotor configuration** – Machine is hardcoded for 3 rotors

## 🔮 Future Enhancements

Potential improvements:
- [ ] Add plugboard configuration
- [ ] Implement Enigma II/III variants
- [ ] Support for 4-rotor Kriegsmarine variant
- [ ] Export/import settings as JSON
- [ ] Keyboard shortcut support
- [ ] Dark/Light theme toggle
- [ ] Preset historical configurations (Bletchley Park examples)
- [ ] Step-by-step visualization of signal flow
- [ ] Statistical analysis tools

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Areas for improvement:
- Additional rotor variants
- Enhanced visualization
- Performance optimizations
- Documentation improvements
- Bug reports and feature requests

Please open an issue or submit a pull request on GitHub.

## 📚 References

- **History:** [Enigma Machine – Wikipedia](https://en.wikipedia.org/wiki/Enigma_machine)
- **Technical Details:** [Enigma Rotor Wiring](https://en.wikipedia.org/wiki/Enigma_rotor_wiring)
- **Cryptanalysis:** [Rejewski's Method](https://en.wikipedia.org/wiki/Marian_Rejewski)
- **Code Breaking:** [Bletchley Park](https://en.wikipedia.org/wiki/Bletchley_Park)

## 💡 How It's Used

### Encryption Example

```
Settings:
- Rotor I at position A, Ring A
- Rotor II at position B, Ring A  
- Rotor III at position C, Ring A
- Reflector B

Plaintext:  "ENIGMA"
Ciphertext: (depends on rotor mechanics)
```

To decrypt the ciphertext, use the **exact same settings** and the output will be "ENIGMA" again.

---

**Built with ❤️ for cryptography enthusiasts and history buffs.**

**Last Updated:** May 2025
