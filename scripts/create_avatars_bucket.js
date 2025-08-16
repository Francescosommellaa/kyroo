import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variabili d\'ambiente mancanti:');
  if (!supabaseUrl) console.error('  - VITE_SUPABASE_URL');
  if (!supabaseServiceKey) console.error('  - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAvatarsBucket() {
  console.log('🔧 Setup Supabase Storage per Avatar');
  console.log('=' .repeat(40));
  
  try {
    // Verifica se il bucket esiste già
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Errore nel recupero dei bucket:', listError.message);
      return false;
    }
    
    const avatarsBucket = buckets.find(bucket => bucket.id === 'avatars');
    
    if (avatarsBucket) {
      console.log('✅ Bucket \'avatars\' già esistente');
      return true;
    }
    
    // Crea il bucket
    const { data, error } = await supabase.storage.createBucket('avatars', {
      public: true,
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
      fileSizeLimit: 5242880 // 5MB
    });
    
    if (error) {
      console.error('❌ Errore nella creazione del bucket:', error.message);
      return false;
    }
    
    console.log('✅ Bucket \'avatars\' creato con successo');
    return true;
    
  } catch (error) {
    console.error('❌ Errore imprevisto:', error.message);
    return false;
  }
}

async function main() {
  const success = await createAvatarsBucket();
  
  if (success) {
    console.log('\n📋 Prossimi passi:');
    console.log('1. ✅ Bucket \'avatars\' creato/verificato');
    console.log('2. 🔐 Le policy di sicurezza dovrebbero essere già configurate');
    console.log('3. 🧪 Testa l\'upload dell\'avatar nell\'app');
  } else {
    console.log('\n❌ Setup fallito. Controlla le credenziali e riprova.');
    process.exit(1);
  }
}

main();