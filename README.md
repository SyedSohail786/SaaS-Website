# 🚀 AI Studio - Full Stack AI Application

A complete SaaS platform integrating Google TTS, Replicate AI models, and user authentication.

## 🌟 Features
- **Text-to-Speech** (Google TTS API)
- **AI Model Integration** (Replicate API)
- **User Authentication** (JWT)
- **MongoDB Database**
- **React Frontend** (Vite)
- **Node.js Backend** (Express)

## 🛠️ Prerequisites
- Node.js v18+
- MongoDB (local or cloud)
- Google Cloud account (for TTS)
- Replicate account (for AI models)

## 🔧 Environment Setup

### Frontend (`.env`)
```env
VITE_BACKEND_URL=http://localhost:8000
```

### Backend (.env)

```
GOOGLE_TTS_API_KEY=your_google_cloud_tts_api_key
REPLICATE_API_TOKEN=your_replicate_api_token
PORT=8000
MONGODB_URI=mongodb://localhost:27017/ai_studio
JWT_SECRET=yourSuperSecretKeyForJWT
FRONTEND_URL=your frontend url
```
## 🚀 Installation
### Clone the repository
```
git clone https://github.com/SyedSohail786/SaaS-Website
cd SaaS-Website
```

### Install dependencies

### Backend
```
cd backend

npm install
```
### Frontend
```
cd ../frontend

npm install
```

## 🛡️ Security
JWT authentication

Environment variables for secrets

Password hashing (bcrypt)

Rate limiting

CORS configuration

## 📜 License
MIT License - See LICENSE for details.
