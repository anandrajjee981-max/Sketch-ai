# Sketch AI 🚀

An AI-powered research and productivity platform inspired by modern AI assistants like Perplexity. Sketch AI combines conversational AI, real-time communication, web search, voice input, image uploads, and document intelligence into a single application.

live link https://sketch-ai-earj.onrender.com

---

## ✨ Features

### 🤖 AI Chat Assistant

* Context-aware AI conversations
* Powered by Google Gemini and LangChain
* Maintains chat history
* Generates intelligent responses

### 🌐 Real-Time Web Search

* Integrated Tavily Search API
* Retrieves live information from the web
* Provides up-to-date answers
* AI-powered web research experience

### 🎤 Voice to Text Queries

* Speak instead of typing
* Converts speech into text
* Seamless integration with chat interface
* Faster interaction experience

### 🖼️ Image Upload Support

* Upload images directly into conversations
* Cloud image storage using ImageKit
* Optimized image delivery
* Secure media management

### ⚡ Real-Time Communication

* Built with Socket.IO
* Instant message delivery
* Live updates
* Real-time chat synchronization

### 🔐 Authentication System

* User registration and login
* Secure authentication flow
* Protected routes
* Session management

### 📧 Email Integration

* Nodemailer integration
* Email notifications
* Future support for AI-powered email workflows

### 📜 Chat History Management

* Persistent conversation storage
* Organized chat sessions
* Auto-generated conversation titles
* MongoDB-backed history

---

## 🛠️ Tech Stack

### Frontend

* React.js
* Redux Toolkit
* React Router
* Axios
* SCSS

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose

### AI & Search

* Google Gemini
* LangChain
* Tavily Search API

### Real-Time

* Socket.IO

### File Handling

* Multer
* ImageKit

### Utilities

* Morgan
* Nodemailer
* JWT Authentication

---

## 🏗️ Architecture

User
↓
React Frontend
↓
Express API
↓
MongoDB

↓

LangChain
↓
Gemini

↓

Tavily Search
↓
Live Web Results

↓

ImageKit
↓
Image Storage

↓

Socket.IO
↓
Real-Time Updates



## 🚀 Future Roadmap

### 📄 RAG (Retrieval Augmented Generation)

Planned implementation:

PDF Upload
↓
Text Extraction
↓
Chunking
↓
Embeddings
↓
Vector Database
↓
Semantic Retrieval
↓
Gemini Response

Features:

* Chat with PDFs
* Document Question Answering
* Knowledge Base Search
* Context-Aware Responses
* Semantic Search
* Multi-document Support

### 🔍 Hybrid Search

Combine:

* Vector Search
* Keyword Search
* Web Search

To provide more accurate answers.

### 🤖 Agentic AI Workflows

Future AI agents will:

* Decide when web search is needed
* Retrieve document context automatically
* Choose the best information source
* Perform multi-step reasoning

### 🎙️ Voice Assistant Mode

* Continuous voice conversations
* AI voice responses
* Hands-free interaction

### 📊 Analytics Dashboard

* Usage tracking
* Query insights
* Chat statistics

---

## 🔧 Environment Variables

```env
PORT=
MONGODB_URI=

JWT_SECRET=

GOOGLE_API_KEY=
TAVILY_API_KEY=
MISTRAL_API_KEY=

IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_PRIVATE_KEY=
IMAGEKIT_URL_ENDPOINT=

EMAIL_USER=
EMAIL_PASS=
```

## 🎯 Learning Outcomes

This project demonstrates:

* Full Stack MERN Development
* AI Application Development
* LangChain Integration
* LLM Workflows
* Real-Time Systems
* Cloud Media Management
* Authentication & Security
* API Design
* Search-Augmented AI
* Retrieval-Augmented Generation (Planned)

---

## 🌟 Vision

Sketch AI aims to evolve from a conversational AI assistant into a complete AI-powered research platform that combines:

* Chat
* Search
* Documents
* Voice
* Images
* Real-Time Collaboration

within a unified intelligent workspace.
