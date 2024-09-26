const fs = require("fs");
const bip39 = require("bip39");
const BIP32Factory = require("bip32").default;
const ecc = require("tiny-secp256k1");

function generatePrivateKey(seed, derivationPath) {
  // Generate seed buffer from the mnemonic
  const seedBuffer = bip39.mnemonicToSeedSync(seed);

  // Create the BIP32 instance
  const bip32 = BIP32Factory(ecc);

  // Create the BIP32 master key
  const root = bip32.fromSeed(seedBuffer);

  // Derive the key using the derivation path
  const child = root.derivePath(derivationPath);

  // Get the private key in hexadecimal format
  const privateKey = child.privateKey.toString("hex");

  return privateKey;
}

function main() {
  // Define the base derivation path with a placeholder for the last index
  // For example: "m/44'/0'/0'/0/{N}"
  const baseDerivationPath = "m/44'/0'/0'/0/{}";

  // Specify the range for the last index
  const startIndex = 0; // Start of the range (inclusive)
  const endIndex = 10; // End of the range (inclusive)

  // Read seeds from seeds.txt
  let seeds;
  try {
    seeds = fs
      .readFileSync("seeds.txt", "utf8")
      .split("\n")
      .filter((line) => line.trim() !== "");
  } catch (err) {
    console.error("Error: 'seeds.txt' file not found.");
    process.exit(1);
  }

  // Open the privatekeys.txt file for writing
  const output = fs.createWriteStream("privatekeys.txt", { flags: "w" });

  // Iterate over each seed
  seeds.forEach((seed) => {
    seed = seed.trim();
    try {
      // Generate private keys for the specified index range
      for (let index = startIndex; index <= endIndex; index++) {
        const derivationPath = baseDerivationPath.replace("{}", index);

        // Generate the private key
        const privateKey = generatePrivateKey(seed, derivationPath);

        // Write the seed, derivation path, and private key to the file
        output.write(`Seed: ${seed}\n`);
        output.write(`Derivation Path: ${derivationPath}\n`);
        output.write(`Private Key: ${privateKey}\n`);
        output.write("\n"); // Add an empty line between entries
      }
    } catch (e) {
      console.error(
        `Error processing seed: '${seed}'. Exception: ${e.message}`,
      );
    }
  });

  output.end(() => {
    console.log(
      "Private keys have been generated and saved to 'privatekeys.txt'.",
    );
  });
}

main();
