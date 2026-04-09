# ChronicleChain

ChronicleChain is a decentralized news forecasting and prediction platform. It integrates real-time news via GNews and provides a type-safe prediction layer powered by Supabase and Drizzle ORM.

## 🚀 Getting Started

### 1. Clone & Install
```bash
# Clone the repository
git clone <your-repo-url>
cd NottsHack

# Install dependencies using pnpm
pnpm install
```

### 2. Environment Variables
Create a `.env` file in the root directory and populate it with the following:

```env
# GNews API Key (https://gnews.io/)
GNEWS_API_KEY=your_gnews_api_key

# Drizzle Database connection string (Supabase Transaction Pooler)
DATABASE_URL="postgresql://postgres.[PROJ_ID]:[PASS]@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres"
```

### 3. Database Setup
We use Drizzle ORM for database management. Sync your schema with your Supabase instance:

```bash
# Generate the SQL migrations
pnpm drizzle-kit generate

# Push the schema to your database
pnpm drizzle-kit push
```

### 4. Storage Setup
Ensure you have a public storage bucket named **`assets`** in your Supabase project to handle file uploads.

### 5. Start Development
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🛠️ Tech Stack
- **Frontend**: Next.js 15 (App Router), Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **ORM**: Drizzle ORM
- **News API**: GNews API v4
- **Blockchain**: Ethers.js integration for wallet interactions

## 📂 Project Structure
- `src/db/`: Database schema and Drizzle client.
- `src/lib/gnews/`: Comprehensive GNews API integration.
- `src/lib/supabase/`: File storage utilities.
- `src/lib/`: Core logic for predictions, stories, and blockchain interactions.
