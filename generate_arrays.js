const ROTOR_WIRINGS = {
  'I':     'EKMFLGDQVZNTOWYHXUSPAIBRCJ',
  'II':    'AJDKSIRUXBLHWTMCQGZNPYFVOE',
  'III':   'BDFHJLCPRTXVZNYEIWGAKMUSQO',
  'IV':    'ESOVPZJAYQUIRHXLNFTGKDCMWB',
  'V':     'VZBRGITYUPSDNHLXAWMJQOFECK',
  'Beta':  'LEYJVCNIXWPBQMDRTAKZGFUHOS',
  'Gamma': 'FSOKANUERHMBTIYCWLQPZXVGJD',
};

const REFLECTOR_WIRINGS = {
  'B':      'YRUHQSLDPXNGOKMIEBFZCWVJAT',
  'C':      'FVPJIAOYEDRZXWGCTKUQSBNMHL',
  'B_Thin': 'ENKQAUYWJICOPBLMDXZVFTHRGS',
  'C_Thin': 'RDOBJNTKVEHMLFCWZAXGYIPSUQ',
};

const ROTOR_NOTCHES = { 
  'I':     'Q',
  'II':    'E',
  'III':   'V',
  'IV':    'J',
  'V':     'Z',
  'Beta':  '',
  'Gamma': '',
};

function strToArray(str) {
  if (!str) return '[]';
  return '[' + str.split('').map(c => c.charCodeAt(0) - 65).join(', ') + ']';
}

function generate() {
  let output = `// Auto-generated constants\n\n`;
  for (const [key, val] of Object.entries(ROTOR_WIRINGS)) {
    output += `const WIRING_${key.toUpperCase()}: u8[] = ${strToArray(val)};\n`;
  }
  output += '\n';
  for (const [key, val] of Object.entries(REFLECTOR_WIRINGS)) {
    output += `const REFLECTOR_${key.toUpperCase()}: u8[] = ${strToArray(val)};\n`;
  }
  output += '\n';
  for (const [key, val] of Object.entries(ROTOR_NOTCHES)) {
    output += `const NOTCH_${key.toUpperCase()}: i32 = ${val ? val.charCodeAt(0) - 65 : -1};\n`;
  }
  console.log(output);
}
generate();
