import React, { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import ReactMarkdown from 'react-markdown'
import { usechat } from './usechat'
import '../style/dashboard.scss'

// Premium Styled Icons
const ToggleMenu = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
const NewChatIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
const SendArrow = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
const ThreeDotsIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
const TrashIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
const MicIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="mic-svg"><path d="M12 1v11a3 3 0 0 1-3-3V4a3 3 0 0 1 6 0v5a3 3 0 0 1-3 3z"/><path d="M19 10v1a7 7 0 0 1-14 0v-1M12 19v4M8 23h8"/></svg>
const PlusIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
const CloseIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>

// New Document Icon for PDF Previews
const FileDocIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff4d4d" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>

const casualSuggestions = [
  { title: 'Plan an app design layout', desc: 'Get creative structural frameworks and wireframe patterns step-by-step.' },
  { title: 'Suggest cozy color palettes', desc: 'Mix warm dark tokens with sleek contrast levels for dark interfaces.' },
  { title: 'Write an easy layout guide', desc: 'Draft simple UI/UX guidelines for dynamic web viewport grids.' },
]

const Dashboard = () => {
  // Destructuring optimization directly from hook layer
  const { handleSendMessage, handleGetChats, handleGetMessages, handleSelectChat, handleDeleteChat } = usechat()
  
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef(null)

  // System Core States
  const [selectedFile, setSelectedFile] = useState(null) 
  const [filePreviewUrl, setFilePreviewUrl] = useState('') 
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef(null)

  const [chatsList, setChatsList] = useState([])
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [currentChatId, setCurrentChatId] = useState(null)
  
  const [sidebarOpen, setSidebarOpen] = useState(typeof window !== 'undefined' ? window.innerWidth > 860 : false)
  const [activeMenuChatId, setActiveMenuChatId] = useState(null)

  // Animation Refs
  const containerRef = useRef(null)
  const sidebarRef = useRef(null)
  const mainPanelRef = useRef(null)
  const navbarRef = useRef(null)
  const inputBarRef = useRef(null)
  const sendBtnRef = useRef(null)
  const messagesEndRef = useRef(null)
  const dropdownRef = useRef(null)
  
  const cardsRef = useRef([])
  const historyRefs = useRef([])
  const indicatorRefs = useRef([])

  const welcomeTextWords = "What would you like to create today?".split(" ")

  useEffect(() => {
    const dismissMenu = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setActiveMenuChatId(null)
      }
    }
    document.addEventListener('mousedown', dismissMenu)
    return () => document.removeEventListener('mousedown', dismissMenu)
  }, [])

  useEffect(() => {
    const fetchSidebarHistory = async () => {
      if (handleGetChats) {
        try {
          const resData = await handleGetChats()
          if (resData && Array.isArray(resData.chat)) {
            setChatsList(resData.chat)
          } else if (resData && Array.isArray(resData)) {
            setChatsList(resData)
          }
        } catch (err) {
          console.error("Failed fetching workspace spaces data stream:", err)
        }
      }
    }
    fetchSidebarHistory()

    const handleResize = () => {
      if (window.innerWidth > 860) setSidebarOpen(true)
      else setSidebarOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Web Speech API
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'
      recognition.onstart = () => setIsListening(true)
      recognition.onend = () => setIsListening(false)
      recognition.onresult = (event) => setInput(event.results[0][0].transcript)
      recognition.onerror = () => setIsListening(false)
      recognitionRef.current = recognition
    }
  }, [])

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) return alert("Web Speech API not supported.")
    isListening ? recognitionRef.current.stop() : recognitionRef.current.start()
  }

  const handleFilePick = (e) => {
    const file = e.target.files[0]
    if (!file) return

    setSelectedFile(file)
    setFilePreviewUrl(URL.createObjectURL(file))
    
    setTimeout(() => {
      gsap.fromTo('.input-image-preview-node', 
        { opacity: 0, scale: 0.8, y: 10 }, 
        { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: 'back.out(1.5)' }
      )
    }, 10)
  }

  const removePickedFile = () => {
    setSelectedFile(null)
    setFilePreviewUrl('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // Animations Timelines
  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })
    const initX = window.innerWidth <= 860 ? -280 : -260
    const targetX = window.innerWidth <= 860 ? (sidebarOpen ? 0 : -280) : 0

    tl.fromTo(sidebarRef.current, { x: initX }, { x: targetX, duration: 0.8 })
      .fromTo(navbarRef.current, { opacity: 0, y: -15 }, { opacity: 1, y: 0, duration: 0.5 }, '-=0.5')
      
    if (messages.length === 0) {
      tl.fromTo('.hero-block h1 .word', 
        { opacity: 0, y: 35, rotationZ: -4, scale: 0.9 },
        { opacity: 1, y: 0, rotationZ: 0, scale: 1, stagger: 0.05, duration: 0.75, ease: 'back.out(1.5)' },
        '-=0.3'
      )
      .fromTo('.kinetic-card', 
        { opacity: 0, scale: 0.9, y: 30, rotationX: 15 },
        { opacity: 1, scale: 1, y: 0, rotationX: 0, stagger: 0.08, duration: 0.8, ease: 'power3.out' },
        '-=0.5'
      )
    }
  }, [messages.length])

  useEffect(() => {
    const isMobile = window.innerWidth <= 860
    gsap.to(sidebarRef.current, {
      x: sidebarOpen ? 0 : (isMobile ? -280 : -260),
      duration: 0.4,
      ease: 'power3.inOut'
    })
  }, [sidebarOpen])

  const handleCardMouseMove = (e, index) => {
    if (window.innerWidth <= 860) return 
    const card = cardsRef.current[index]
    if (!card) return
    const rect = card.getBoundingClientRect()
    gsap.to(card, {
      rotationY: (e.clientX - rect.left - rect.width / 2) * 0.1,
      rotationX: -(e.clientY - rect.top - rect.height / 2) * 0.1,
      transformPerspective: 1000,
      y: -8,
      backgroundColor: 'rgba(45, 43, 43, 0.85)',
      borderColor: 'rgba(255, 255, 255, 0.25)',
      duration: 0.3,
      ease: 'power2.out'
    })
  }

  const handleCardMouseLeave = (index) => {
    const card = cardsRef.current[index]
    if (!card) return
    gsap.to(card, { rotationY: 0, rotationX: 0, y: 0, backgroundColor: 'rgba(33, 31, 31, 0.65)', borderColor: 'rgba(255, 255, 255, 0.1)', duration: 0.5, ease: 'power3.out' })
  }

  const handleHistoryHover = (index, isEntering) => {
    if (window.innerWidth <= 860) return 
    const dot = indicatorRefs.current[index]
    const text = historyRefs.current[index]
    if (!dot || !text) return
    gsap.to(dot, { opacity: isEntering ? 1 : 0, height: isEntering ? 16 : 0, duration: 0.25 })
    gsap.to(text, { x: isEntering ? 4 : 0, color: isEntering ? '#e6e2dd' : '#a39f99', duration: 0.25 })
  }

  const handleInputFocus = (isFocused) => {
    gsap.to(inputBarRef.current, { borderColor: isFocused ? 'rgba(255, 255, 255, 0.35)' : 'rgba(255, 255, 255, 0.08)', boxShadow: isFocused ? '0 25px 55px -10px rgba(0,0,0,0.9)' : '0 20px 45px -15px rgba(0,0,0,0.8)', duration: 0.3 })
    if (window.innerWidth > 860) {
      gsap.to(mainPanelRef.current, { scale: isFocused ? 0.992 : 1, borderRadius: isFocused ? '16px' : '0px', duration: 0.4, ease: 'power2.out' })
    }
    gsap.to(sendBtnRef.current, { scale: isFocused ? 1.06 : 1, rotation: isFocused ? 45 : 0, duration: 0.3 })
  }

  const selectChatContext = async (chatId) => {
    if (!chatId || chatId === 'undefined') return
    setCurrentChatId(chatId)
    if (handleSelectChat) handleSelectChat(chatId)
    if (handleGetMessages) {
      try {
        const historyMessages = await handleGetMessages(chatId)
        if (historyMessages && Array.isArray(historyMessages)) {
          setMessages(historyMessages.map(msg => ({
            id: msg._id || msg.id || Math.random().toString(),
            role: msg.role === 'user' ? 'user' : 'ai',
            text: msg.content || msg.text || '',
            image: msg.image || msg.pdf || null, 
            isPdf: !!msg.pdf
          })))
        } else {
          setMessages([])
        }
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
      } catch (err) { console.error(err) }
    }
    if (window.innerWidth <= 860) setSidebarOpen(false)
  }

  const executeDeleteChat = async (chatId, e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    setActiveMenuChatId(null)
    try {
      if (handleDeleteChat) await handleDeleteChat(chatId)
      setChatsList((prev) => prev.filter(c => (c._id || c.id) !== chatId))
      if (currentChatId === chatId) { setMessages([]); setCurrentChatId(null); }
    } catch (err) { console.error(err) }
  }

  // ✅ FIXED CORE STREAM SUBMISSION: Ab koi alag upload call nahi hoga, direct single-payload stream chalega
  const streamNewMessage = async (promptContent) => {
    if (!promptContent.trim() && !selectedFile) return

    setIsUploading(true)
    const displayFilePreview = filePreviewUrl 
    const currentIsPdf = selectedFile?.type === "application/pdf"
    const fileToUpload = selectedFile || null // Capture raw file context local reference

    // Optimistic UI update: User side bubble text & immediate local preview state render
    const userMessageId = Date.now()
    setMessages((prev) => [...prev, { 
      id: userMessageId, 
      role: 'user', 
      text: promptContent, 
      image: displayFilePreview,
      isPdf: currentIsPdf
    }])
    
    setInput('')
    removePickedFile()

    setTimeout(() => {
      const wrappers = document.querySelectorAll('.message-wrapper.user-align')
      if (wrappers[wrappers.length - 1]) {
        gsap.fromTo(wrappers[wrappers.length - 1], { opacity: 0, y: 20, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: 'back.out(1.2)' })
      }
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 10)

    try {
      let res = null
      
      // 🔥 FIX 2: handleSendMessage ko pure parameters pass karein (Message, Current ID, Raw File Object)
      if (handleSendMessage) {
        res = await handleSendMessage(promptContent, currentChatId, fileToUpload)
      }
      
      if (!res) throw new Error("Empty response map.")

      // Space dynamic alignment verification
      if (res?.chatId && res.chatId !== currentChatId) {
        setCurrentChatId(res.chatId)
        if (handleGetChats) {
          const freshChats = await handleGetChats()
          if (freshChats && Array.isArray(freshChats.chat)) setChatsList(freshChats.chat)
          else if (freshChats && Array.isArray(freshChats)) setChatsList(freshChats)
        }
      }

      const aiText = res?.aimessage?.content || res?.aimessage?.text || res?.text || 'Response unresolvable.'
      setMessages((prev) => [...prev, { id: userMessageId + 1, role: 'ai', text: aiText }])

      setTimeout(() => {
        const aiWrappers = document.querySelectorAll('.message-wrapper.ai-align')
        if (aiWrappers[aiWrappers.length - 1]) {
          gsap.fromTo(aiWrappers[aiWrappers.length - 1], { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' })
        }
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 10)
    } catch (error) {
      console.error("Pipeline breakdown error:", error)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="dashboard-container" ref={containerRef}>
      {sidebarOpen && window.innerWidth <= 860 && (
        <div className="sidebar-mobile-backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className="sidebar" ref={sidebarRef}>
        <div className="sidebar-top">
          <div className="sidebar-brand">Sketch<span>AI</span></div>
          <button className="icon-trigger" onClick={() => { setMessages([]); setCurrentChatId(null); if(window.innerWidth <= 860) setSidebarOpen(false); }} title="New Space"><NewChatIcon /></button>
        </div>
        
        <div className="chat-history">
          {chatsList.map((item, index) => {
            const itemId = item._id || item.id
            const isActive = currentChatId === itemId
            const isMenuOpen = activeMenuChatId === itemId

            return (
              <div key={itemId} className="history-item-wrapper" onMouseEnter={() => handleHistoryHover(index, true)} onMouseLeave={() => handleHistoryHover(index, false)}>
                <div className="active-indicator" ref={el => indicatorRefs.current[index] = el} style={{ opacity: isActive ? 1 : 0, height: isActive ? '16px' : '0px' }} />
                
                {/* 🛠️ FIX 1: 'Deserted' attribute warning completely resolved by casing standard html data layout */}
                <button ref={el => historyRefs.current[index] = el} className={`history-item ${isActive ? 'active' : ''}`} onClick={() => selectChatContext(itemId)}>
                  {item.title || item.heading || `Chat session ${index + 1}`}
                </button>
                <button className="menu-trigger-btn" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveMenuChatId(isMenuOpen ? null : itemId) }}><ThreeDotsIcon /></button>
                {isMenuOpen && (
                  <div className="action-dropdown-menu" ref={dropdownRef} onClick={(e) => e.stopPropagation()}>
                    <button className="dropdown-action-btn" onClick={(e) => executeDeleteChat(itemId, e)}><TrashIcon /> Delete Space</button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </aside>

      <main className="main-panel" ref={mainPanelRef}>
        <header className="navbar" ref={navbarRef}>
          <button className="icon-trigger" onClick={() => setSidebarOpen(!sidebarOpen)}><ToggleMenu /></button>
          <div className="navbar-heading">Personal Space</div>
          <div style={{ width: 38 }} />
        </header>

        <section className="chat-area">
          {messages.length === 0 ? (
            <div className="welcome-screen">
              <div className="hero-block">
                <h1>{welcomeTextWords.map((word, i) => <span key={i} className="word">{word} </span>)}</h1>
              </div>
              <div className="kinetic-cascade-deck">
                {casualSuggestions.map((suggest, i) => (
                  <div key={i} ref={el => cardsRef.current[i] = el} className="kinetic-card" onMouseMove={(e) => handleCardMouseMove(e, i)} onMouseLeave={() => handleCardMouseLeave(i)} onClick={() => streamNewMessage(suggest.title)}>
                    <h4>{suggest.title}</h4>
                    <p>{suggest.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="messages-list">
              {messages.map((m) => (
                <div key={m.id} className={`message-wrapper ${m.role === 'user' ? 'user-align' : 'ai-align'}`}>
                  <div className="message-box">
                    <span className="author-tag">{m.role === 'user' ? 'You' : 'Sketch AI'}</span>
                    <div className="bubble">
                      
                      {m.role === 'user' && m.image && (
                        <div className="chat-message-image-container">
                          {m.isPdf ? (
                            <div className="pdf-attachment-bubble">
                              <FileDocIcon />
                              <span>Document Attached (PDF)</span>
                            </div>
                          ) : (
                            <img src={m.image} alt="User Upload Content" className="chat-message-rendered-img" />
                          )}
                        </div>
                      )}
                      
                      {m.role === 'ai' ? (
                        <>
                          <div className="status-pill">Response Stream</div>
                          <div className="markdown-body">
                            <ReactMarkdown>{m.text}</ReactMarkdown>
                          </div>
                        </>
                      ) : ( m.text )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </section>

        <div className="input-dock-container">
          {filePreviewUrl && (
            <div className="input-image-preview-node">
              <div className="preview-image-wrapper">
                {selectedFile?.type === "application/pdf" ? (
                  <div className="pdf-preview-node">
                    <FileDocIcon />
                    <span className="pdf-title">{selectedFile.name}</span>
                  </div>
                ) : (
                  <img src={filePreviewUrl} alt="Upload Target Track" />
                )}
                <button type="button" className="remove-preview-btn" onClick={removePickedFile}>
                  <CloseIcon />
                </button>
              </div>
              {isUploading && <div className="preview-upload-shimmer">Processing Asset...</div>}
            </div>
          )}

          <form className="message-input-bar" ref={inputBarRef} onSubmit={(e) => { e.preventDefault(); streamNewMessage(input); }}>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept="image/*,application/pdf" 
              onChange={handleFilePick} 
            />

            <button 
              type="button" 
              className="plus-attachment-btn" 
              onClick={() => fileInputRef.current?.click()}
              title="Upload Image or PDF"
            >
              <PlusIcon />
            </button>

            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={() => handleInputFocus(true)}
              onBlur={() => handleInputFocus(false)}
              placeholder={isUploading ? "Uploading files..." : "Ask anything..."}
              disabled={isUploading}
            />
            
            <button type="button" className={`mic-action-btn ${isListening ? 'active-listening' : ''}`} onClick={toggleVoiceInput} disabled={isUploading}>
              <MicIcon />
            </button>
            
            <button type="submit" className="send-action-btn" ref={sendBtnRef} disabled={isUploading} style={{ opacity: isUploading ? 0.5 : 1 }}>
              <SendArrow />
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}

export default Dashboard;