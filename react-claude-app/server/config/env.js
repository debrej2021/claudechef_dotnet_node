// Load environment variables FIRST before any other imports
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current directory (ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from project root (up two directories from config/)
const envPath = join(__dirname, '..', '..', '.env');
console.log('📁 Loading .env from:', envPath);

const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('❌ Error loading .env:', result.error.message);
} else {
  console.log('✅ Environment variables loaded successfully');
  console.log('🔑 OPENAI_API_KEY:', !!process.env.OPENAI_API_KEY ? 'CONFIGURED' : 'NOT SET');
  console.log('🔑 CLAUDE_API_KEY:', !!process.env.CLAUDE_API_KEY ? 'CONFIGURED' : 'NOT SET');
  console.log('🤖 AI_PROVIDER:', process.env.AI_PROVIDER || 'openai (default)');
}

export default {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  aiProvider: process.env.AI_PROVIDER || 'openai',
  openaiApiKey: process.env.OPENAI_API_KEY,
  claudeApiKey: process.env.CLAUDE_API_KEY
};
