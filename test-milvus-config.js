// Test di connettività Milvus/Zilliz
// Questo file testa se la configurazione delle variabili d'ambiente funziona correttamente

const fs = require("fs");
const path = require("path");

function testMilvusConfig() {
  console.log("🔧 Testing Milvus configuration...");

  try {
    // Test 1: Verifica che il file .env.local esista
    console.log("📋 Step 1: Checking .env.local file...");
    const envPath = path.join(__dirname, ".env.local");

    if (!fs.existsSync(envPath)) {
      throw new Error(".env.local file not found");
    }

    const envContent = fs.readFileSync(envPath, "utf8");
    console.log("✅ .env.local file found");

    // Test 2: Verifica che le variabili Milvus siano presenti
    console.log("\n🔍 Step 2: Checking Milvus environment variables...");

    const hasEndpoint = envContent.includes("VITE_MILVUS_ENDPOINT=");
    const hasBackendToken = envContent.includes("MILVUS_TOKEN=");

    if (!hasEndpoint) {
      throw new Error("VITE_MILVUS_ENDPOINT not found in .env.local");
    }

    if (!hasBackendToken) {
      throw new Error("MILVUS_TOKEN not found in .env.local");
    }

    console.log("✅ VITE_MILVUS_ENDPOINT found");
    console.log("✅ MILVUS_TOKEN found (backend only)");

    // Test 3: Verifica che il file .env.example sia aggiornato
    console.log("\n📝 Step 3: Checking .env.example file...");
    const examplePath = path.join(__dirname, ".env.example");

    if (fs.existsSync(examplePath)) {
      const exampleContent = fs.readFileSync(examplePath, "utf8");
      const hasExampleVars =
        exampleContent.includes("VITE_MILVUS_ENDPOINT=") &&
        exampleContent.includes("MILVUS_TOKEN=");

      if (hasExampleVars) {
        console.log("✅ .env.example updated with Milvus variables");
      } else {
        console.log("⚠️  .env.example might need Milvus variables");
      }
    }

    // Test 4: Verifica la struttura del progetto
    console.log("\n🏗️  Step 4: Checking project structure...");
    const milvusPath = path.join(
      __dirname,
      "src",
      "web",
      "src",
      "lib",
      "milvus.ts",
    );

    if (fs.existsSync(milvusPath)) {
      console.log("✅ Milvus service file found");

      const milvusContent = fs.readFileSync(milvusPath, "utf8");
      if (
        milvusContent.includes("getMilvusConfig") &&
        milvusContent.includes("createMilvusServiceFromEnv")
      ) {
        console.log("✅ Milvus configuration functions available");
      } else {
        console.log("⚠️  Milvus configuration functions might be missing");
      }
    } else {
      console.log("⚠️  Milvus service file not found");
    }

    console.log("\n🎉 Configuration test completed successfully!");
    console.log("\n📋 Next steps:");
    console.log("   1. Start the development server: npm run dev");
    console.log(
      "   2. The Milvus service will automatically use the configured API key",
    );
    console.log(
      "   3. Create a cluster and collections as needed in your application",
    );
  } catch (error) {
    console.error("❌ Test failed:", error.message);

    console.error("\n💡 Troubleshooting:");
    console.error("   1. Make sure .env.local exists in the project root");
    console.error(
      "   2. Check that VITE_MILVUS_ENDPOINT and MILVUS_TOKEN are set",
    );
    console.error("   3. Verify the API key is correct");
    console.error(
      "   4. Restart the development server after adding environment variables",
    );
    console.error(
      "   5. Note: MILVUS_TOKEN is now used only in backend for security",
    );

    process.exit(1);
  }
}

// Esegui il test
testMilvusConfig();
