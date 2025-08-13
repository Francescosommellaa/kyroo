#!/usr/bin/env node

/**
 * Script per creare un utente admin iniziale
 * Uso: node scripts/seed-admin.js
 *
 * Richiede variabili d'ambiente:
 * - SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 * - ADMIN_EMAIL
 * - ADMIN_PASSWORD
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

// Carica variabili d'ambiente
config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;

if (!supabaseUrl || !supabaseServiceKey || !adminEmail || !adminPassword) {
  console.error("❌ Variabili d'ambiente mancanti:");
  console.error("   - SUPABASE_URL");
  console.error("   - SUPABASE_SERVICE_ROLE_KEY");
  console.error("   - ADMIN_EMAIL");
  console.error("   - ADMIN_PASSWORD");
  process.exit(1);
}

// Client admin con service role
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdmin() {
  try {
    console.log("🔄 Creazione utente admin...");

    // Crea utente admin
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true, // Conferma automaticamente l'email
        user_metadata: {
          display_name: "Administrator",
        },
      });

    if (authError) {
      if (authError.message.includes("already registered")) {
        console.log("⚠️  Utente già esistente, aggiorno il ruolo...");

        // Trova l'utente esistente
        const { data: existingUser, error: findError } =
          await supabase.auth.admin.listUsers();
        if (findError) throw findError;

        const user = existingUser.users.find((u) => u.email === adminEmail);
        if (!user) throw new Error("Utente non trovato");

        // Aggiorna il profilo a admin
        const { error: updateError } = await supabase
          .from("user")
          .update({ role: "admin" })
          .eq("id", user.id);

        if (updateError) throw updateError;

        console.log("✅ Ruolo admin aggiornato con successo!");
        console.log(`   Email: ${adminEmail}`);
        console.log(`   ID: ${user.id}`);
      } else {
        throw authError;
      }
    } else {
      // Nuovo utente creato, aggiorna il ruolo a admin
      const { error: updateError } = await supabase
        .from("user")
        .update({ role: "admin" })
        .eq("id", authData.user.id);

      if (updateError) throw updateError;

      console.log("✅ Utente admin creato con successo!");
      console.log(`   Email: ${adminEmail}`);
      console.log(`   ID: ${authData.user.id}`);
    }

    console.log("\n🎉 Setup admin completato!");
    console.log("   Ora puoi accedere con le credenziali admin.");
  } catch (error) {
    console.error("❌ Errore durante la creazione dell'admin:", error.message);
    process.exit(1);
  }
}

createAdmin();
