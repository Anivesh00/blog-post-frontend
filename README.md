# Blog Post Frontend

Modern, production-ready SvelteKit 5 frontend for the Serverless Blog Platform. Built with Svelte Runes, Tailwind CSS v4, and TypeScript.

## 🚀 Features

- **Authentication**: Login/Register with JWT token management
- **Post Management**: Create, edit, delete, and publish blog posts
- **Comments**: Nested comment system with threaded replies
- **Image Upload**: Direct S3 upload with presigned URLs
- **Dark/Light Theme**: System preference detection with localStorage persistence
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Type-Safe**: Full TypeScript support throughout
- **SEO Optimized**: Server-side rendering with Svelte Kit

## 📋 Tech Stack

- **Framework**: SvelteKit 5
- **Styling**: Tailwind CSS v4 + CSS custom properties
- **Language**: TypeScript
- **State Management**: Svelte Runes (`$state`, `$derived`, `$effect`)
- **API Client**: Fetch API with auto-retry on 401
- **Deployment**: Netlify (CI/CD via GitHub Actions)

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

```bash
# Clone repository
git clone https://github.com/Anivesh00/blog-post-frontend.git
cd blog-post-frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your API endpoint
```

### Environment Variables

Create a `.env` file:

```env
PUBLIC_API_BASE_URL=https://your-api-endpoint.com/dev
PUBLIC_S3_BUCKET_URL=https://your-bucket.s3.region.amazonaws.com
```

### Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
src/
├── lib/
│   ├── api/              # API client & endpoint functions
│   ├── components/       # Reusable UI components
│   ├── stores/           # Svelte Runes state management
│   └── utils/            # Utilities (formatting, validation, S3)
├── routes/               # SvelteKit routes
├── app.css              # Global styles with CSS custom properties
└── app.html             # HTML template

.github/
└── workflows/
    └── deploy.yml       # GitHub Actions CI/CD pipeline

netlify.toml            # Netlify configuration
.env.example            # Environment variables template
```

## 🔐 Authentication Flow

1. **Register** → Create account → JWT tokens stored
2. **Login** → Authenticate → Tokens stored securely
3. **Protected Routes** → Auto-redirect to login if needed
4. **Token Refresh** → Auto-refresh on 401 response
5. **Logout** → Clear all local state

## 🎨 Features

- **Live Validation**: Real-time field validation
- **Preview Mode**: Preview posts before publishing
- **Image Upload**: Direct S3 upload with presigned URLs
- **Nested Comments**: Reply threading up to 3 levels
- **Dark Mode**: CSS variable-based theme switching
- **Responsive**: Mobile-first design

## 🚀 Deployment to Netlify

### Step 1: Connect to Netlify

```bash
# Go to https://app.netlify.com
# Click "Add new site" → "Import an existing project"
# Select GitHub and authorize
# Choose this repository
```

### Step 2: Configure Environment Variables

In Netlify Dashboard → Site settings → Build & deploy → Environment:

```
PUBLIC_API_BASE_URL = https://your-api-endpoint.com/dev
PUBLIC_S3_BUCKET_URL = https://your-bucket.s3.region.amazonaws.com
```

### Step 3: Setup GitHub Actions Secrets

Go to your GitHub repo → Settings → Secrets → New repository secret

Add these secrets:
- `NETLIFY_AUTH_TOKEN`: Get from [Netlify Settings](https://app.netlify.com/user/applications/personal)
- `NETLIFY_SITE_ID`: Found in Netlify Site settings
- `PUBLIC_API_BASE_URL`: Your API endpoint
- `PUBLIC_S3_BUCKET_URL`: Your S3 bucket URL

### Step 4: Auto-Deploy

After secrets are added:
- Push to `main` → Automatic production deployment
- Push to `develop` → Preview deployment

## 📦 Available Scripts

```bash
npm run dev          # Start dev server at localhost:5173
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint (if configured)
npm run format       # Format code with Prettier (if configured)
```

## 🔄 CI/CD Pipeline

**GitHub Actions Workflow** (`.github/workflows/deploy.yml`):

1. **Triggers**: Push to main/develop, Pull requests
2. **Checks**:
   - Node.js 18 setup
   - Dependency installation
   - Code linting
   - Production build
3. **Deploy**: 
   - Main branch → Netlify production
   - Other branches → Preview deployments

## 🌐 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers

## 🐛 Troubleshooting

### Port 5173 Already in Use
```bash
npm run dev -- --port 5174
```

### Clear Cache
```bash
rm -rf .svelte-kit node_modules/.vite
npm install && npm run dev
```

### Build Fails
```bash
# Verify environment variables
echo $PUBLIC_API_BASE_URL
echo $PUBLIC_S3_BUCKET_URL

# Rebuild
npm run build
```

## 📚 Learn More

- [SvelteKit Documentation](https://kit.svelte.dev)
- [Svelte 5 Runes Guide](https://svelte.dev/docs/svelte/runes)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [Netlify Deployment](https://docs.netlify.com/deploying/overview/)

## 📄 License

MIT License - use freely in your projects

## 👤 Author

Created for Serverless Blog Platform

---

**Made with ❤️ using SvelteKit 5, Tailwind CSS & Netlify**
