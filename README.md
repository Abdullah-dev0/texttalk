# TextTalk - A Modern Fullstack Platform

Built with the Next.js 16 App Router, React 19, TypeScript, Prisma & Tailwind CSS 4.

## Features

- 🛠️ Complete SaaS Built From Scratch
- 💻 Beautiful Landing Page & Pricing Page Included ( coming soon )
- 💳 Free & Pro Plan Using polar.sh ( coming soon )
- 📄 A Beautiful And Highly Functional PDF Viewer
- 🔄 Streaming API Responses in Real-Time using Vercel Ai sdk
- 🔒 Authentication Using clerk
- 🎨 Clean, Modern UI Using 'shadcn-ui'
- 🚀 Optimistic UI Updates for a Great UX
- 📤 Intuitive Drag n’ Drop Uploads
- ✨ Instant Loading States
- 🧠 Vercel Ai sdk
- 🌲 Pinecone as our Vector Storage
- 📊 Prisma as our ORM
- 🔤 100% written in TypeScript
- 🎁 ...much more

## Getting Started

Follow these steps to set up and run the project locally:

### 1. Clone the repository

```bash
git clone https://github.com/Abdullah-dev0/TextTalk.git
cd texttalk
```

### 2. Install dependencies

Install Node.js 24 or newer, then install the dependencies:

```bash
npm install
```

### 3. Set up environment variables

1. Duplicate the `.env.example` file and rename it to `.env`.

2. Fill in the required environment variables in the `.env` file:

   ```plaintext
   # Clerk for secure, fast authentication - https://clerk.dev
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
   CLERK_SECRET_KEY=
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL=/dashboard
   NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/dashboard
   WEBHOOK_SECRET=

   # Database for storing everything except PDF files - (Provider up to you, I like PlanetScale)
   DATABASE_URL=

   # Uploadthing for storing PDF files - https://uploadthing.com/dashboard
   UPLOADTHING_SECRET=
   UPLOADTHING_APP_ID=
   UPLOADTHING_TOKEN=

   # Mistral API for answering PDF questions - https://console.mistral.ai/
   MISTRAL_API_KEY=

   # Pinecone for vector storage - https://www.pinecone.io/
   PINECONE_API_KEY=

   # Upstash Redis (optional) - https://upstash.com/
   UPSTASH_REDIS_REST_URL=
   UPSTASH_REDIS_REST_TOKEN=

   # Environment
   NODE_ENV=development
   ```

   **Required Services:**
   - **Clerk** - Authentication ([Get started](https://clerk.dev))
   - **Database** - MongoDb
   - **Uploadthing** - PDF file storage ([Get started](https://uploadthing.com/dashboard))
   - **Mistral API** - AI for answering PDF questions ([Get API key](https://console.mistral.ai/))
   - **Pinecone** - Vector database for embeddings ([Get started](https://www.pinecone.io/))
   - **Upstash Redis** - For caching and rate limiting

### 4. Start the development server

Once the environment variables are configured, start the server:

```bash
npm run dev
```

### 5. Access the application

Open your browser and navigate to `http://localhost:3000` to view the application.

---
