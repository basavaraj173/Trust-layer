# 🛡️ TrustLayer – Voice-First Anonymous Grievance System

**TrustLayer** is a civic tech platform designed to empower citizens to report local grievances anonymously in their native languages. Through AI-powered translation and transcription, community validations, and remote media storage, it bridges the gap between citizens and municipal administrators with maximum trust and transparency.

🚀 **Live Site**: [https://trustlayer-rust.vercel.app](https://trustlayer-rust.vercel.app)  
🤝 **Community Feed**: [https://trustlayer-rust.vercel.app/community](https://trustlayer-rust.vercel.app/community)

---

## 🌟 Key Features

### 1. 🎤 Voice-First Anonymous Reporting
- Citizens can report issues by simply speaking in their preferred language (e.g., Hindi, Kannada, Tamil, Telugu, Marathi, Bengali, or English).
- The built-in AI assistant automatically transcribes, translates, and synthesizes the description.
- Evaluates the urgency (severity level), categorizes the issue type (e.g., Water Supply, Road Infrastructure, waste management), and extracts location names.
- Zero logins or sign-ups required, guaranteeing 100% anonymity. Citizens receive a random **Grievance ID** and **Secret PIN** to track progress.

### 2. 🤝 Community Dashboard & Validation
- A public feed allowing neighbors to browse local issues.
- Supports **Community Validation** where citizens confirm that an issue is genuine.
- Neighbors can upload optional image proof to back up validations.

### 3. ⚡ Admin Resolution Console
- A secure portal for administrators to verify complaints, assign official officers, post updates, and update statuses (Submitted, Verified, Assigned, In-Progress, Resolved).
- Supports uploading **Resolution Proof Photos** before closing complaints.

### 4. ☁️ Cloud Storage (Cloudinary)
- Fully integrated with Cloudinary to handle all media storage (complaint attachments, resolution proofs, and validation photos) statelessly.
- Features automatic fallback to base64 Data URIs if remote cloud credentials are not supplied.

---

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Framer Motion, Lucide React Icons, Axios
- **Backend**: Node.js, Express, Multer (multipart form handling)
- **Database**: MongoDB (Mongoose ODM)
- **Media Storage**: Cloudinary SDK
- **Hosting**: Vercel (Serverless functions for Express API & static assets routing)

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have **Node.js** (v18+) and **MongoDB** installed and running on your system.

### 2. Installation
Clone the repository and install dependencies for both the client and server:
```bash
# Install root, client, and server dependencies in one step
npm install
```

### 3. Environment Setup
Create a `.env` file in the `server/` directory:
```env
# MongoDB Connection URI (Atlas or Local)
MONGODB_URI=mongodb://localhost:27017/trustlayer

# Port for the Express backend
PORT=5000

# Admin Portal Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123

# Cloudinary Credentials (For production image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 4. Seeding Demo Data
To quickly pre-fill the database with 10 realistic civic complaints:
```bash
npm run seed
```

### 5. Running Locally
Start both the Express backend (Port 5000) and the Vite frontend (Port 3000) simultaneously:
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 📦 Deployment to Vercel

The application is structured to be deployed from the root directory to Vercel:

1. **Vercel CLI Setup**:
   ```bash
   npx vercel --yes --name trustlayer
   ```
2. **Set Environment Variables**:
   Add the following variables in Vercel Project Settings:
   - `MONGODB_URI`
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
3. **Deploy to Production**:
   ```bash
   npx vercel --prod --yes
   ```

---

## 📂 Project Structure

```text
├── api/                  # Vercel serverless gateway
│   └── index.js
├── client/               # React Vite Frontend app
│   ├── src/
│   │   ├── components/   # Shared UI components
│   │   ├── context/      # App State & API Context
│   │   ├── pages/        # Main pages (Home, Reports, Dashboard)
│   │   └── App.jsx       # Routing rules
│   └── vite.config.js
├── server/               # Express backend API
│   ├── models/           # Mongoose Database Schemas
│   ├── routes/           # Endpoint controllers (complaints, admin, validations)
│   ├── utils/            # AI Mock Categorizers & Log Hash chains
│   ├── seed.js           # Database seeder script
│   └── index.js          # Entrypoint server configuration
├── vercel.json           # Vercel routing configuration
└── package.json          # Monorepo build script manager
```
