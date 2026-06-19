import React, { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import ReactMarkdown from 'react-markdown'
import { usechat } from './usechat'
import '../style/dashboard.scss'

const historyList = [
  { id: 1, title: 'My first design brief' },
  { id: 2, title: 'Ideas for home landing page' },
]

const ToggleMenu = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
const NewChatIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
const SendArrow = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>

const casualSuggestions = [
  { title: 'Plan an app design layout', desc: 'Get creative structural frameworks and wireframe patterns step-by-step.' },
  { title: 'Suggest cozy color palettes', desc: 'Mix warm dark tokens with sleek contrast levels for dark interfaces.' },
  { title: 'Write an easy layout guide', desc: 'Draft simple UI/UX guidelines for dynamic web viewport grids.' },
]

const Dashboard = () => {
  const chat = usechat()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 860)

  const containerRef = useRef(null)
  const sidebarRef = useRef(null)
  const mainPanelRef = useRef(null)
  const navbarRef = useRef(null)
  const inputBarRef = useRef(null)
  const sendBtnRef = useRef(null)
  const messagesEndRef = useRef(null)
  
  const cardsRef = useRef([])
  const historyRefs = useRef([])
  const indicatorRefs = useRef([])

  const welcomeTextWords = "What would you like to create today?".split(" ")

  useEffect(() => {
    chat?.intializesocket?.()
    const handleResize = () => {
      if (window.innerWidth > 860) setSidebarOpen(true)
      else setSidebarOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // 1. MASTER INITIAL INTRO TIMELINE
  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } })
    
    tl.fromTo(sidebarRef.current, { x: -260 }, { x: 0, duration: 0.8 })
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

  // 2. SIDEBAR DRAPE ACCORDION
  useEffect(() => {
    const isMobile = window.innerWidth <= 860
    gsap.to(sidebarRef.current, {
      x: sidebarOpen ? 0 : -260,
      marginLeft: (sidebarOpen && !isMobile) ? 0 : (isMobile ? 0 : -260),
      duration: 0.4,
      ease: 'power3.inOut'
    })
  }, [sidebarOpen])

  // 3. ULTRA SMOOTH FLUID MOUSE CARD RESPONSES
  const handleCardMouseMove = (e, index) => {
    const card = cardsRef.current[index]
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2

    gsap.to(card, {
      rotationY: x * 0.1,
      rotationX: -y * 0.1,
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
    gsap.to(card, {
      rotationY: 0,
      rotationX: 0,
      y: 0,
      backgroundColor: 'rgba(33, 31, 31, 0.65)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      duration: 0.5,
      ease: 'power3.out'
    })
  }

  // 4. MECHANICAL SIDEBAR SELECTION HOVER POWER
  const handleHistoryHover = (index, isEntering) => {
    const dot = indicatorRefs.current[index]
    const text = historyRefs.current[index]
    if (!dot || !text) return

    if (isEntering) {
      gsap.to(dot, { opacity: 1, height: 16, duration: 0.25, ease: 'power2.out' })
      gsap.to(text, { x: 4, color: '#e6e2dd', duration: 0.25 })
    } else {
      gsap.to(dot, { opacity: 0, height: 0, duration: 0.25, ease: 'power2.in' })
      gsap.to(text, { x: 0, color: '#a39f99', duration: 0.25 })
    }
  }

  // 5. CINEMATIC INPUT DOCK FOCUS LAYER
  const handleInputFocus = (isFocused) => {
    gsap.to(inputBarRef.current, {
      borderColor: isFocused ? 'rgba(255, 255, 255, 0.35)' : 'rgba(255, 255, 255, 0.08)',
      boxShadow: isFocused ? '0 25px 55px -10px rgba(0,0,0,0.9)' : '0 20px 45px -15px rgba(0,0,0,0.8)',
      duration: 0.3
    })

    if (window.innerWidth > 860) {
      gsap.to(mainPanelRef.current, {
        scale: isFocused ? 0.992 : 1,
        borderRadius: isFocused ? '16px' : '0px',
        duration: 0.4,
        ease: 'power2.out'
      })
    }

    gsap.to(sendBtnRef.current, {
      scale: isFocused ? 1.06 : 1,
      rotation: isFocused ? 45 : 0,
      duration: 0.3
    })
  }

  // 6. STAGGERED BUBBLE VELOCITY RENDER WITH SIDE-BY-SIDE SUPPORT
  const streamNewMessage = (promptContent) => {
    if (!promptContent.trim()) return

    const userMessageId = Date.now()
    const aiMessageId = userMessageId + 1

    setMessages((prev) => [...prev, { id: userMessageId, role: 'user', text: promptContent }])
    setInput('')

    // Render elastic entry for user block (Right Aligned)
    setTimeout(() => {
      const wrappers = document.querySelectorAll('.message-wrapper.user-align')
      const lastWrapper = wrappers[wrappers.length - 1]
      if (lastWrapper) {
        gsap.fromTo(lastWrapper, 
          { opacity: 0, y: 20, scale: 0.96 },
          { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: 'back.out(1.2)' }
        )
      }
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 10)

    // AI dynamic Markdown streaming reply simulation (Left Aligned)
    setTimeout(() => {
      // Markdown payload template highlighting list, bold nodes and code samples
      const markdownPayload = `Here is a structured overview based on your prompt:\n\n1. **Core Point**: This layout dynamically parses raw data structures smoothly.\n2. **Dynamic Tokens**: Utilizing values like \`$card-bg\` without breaking visual contrast grids.\n\n\`\`\`javascript\n// Pure operational runtime\nconst coreElement = true;\nconsole.log("Interface Ready");\n\`\`\``

      setMessages((prev) => [...prev, { id: aiMessageId, role: 'ai', text: markdownPayload }])
      
      setTimeout(() => {
        const aiWrappers = document.querySelectorAll('.message-wrapper.ai-align')
        const lastAiWrapper = aiWrappers[aiWrappers.length - 1]
        if (lastAiWrapper) {
          gsap.fromTo(lastAiWrapper, 
            { opacity: 0, y: 25 },
            { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
          )
          gsap.fromTo(lastAiWrapper.querySelector('.status-pill'), 
            { x: -10, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.35, delay: 0.1 }
          )
        }
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 10)
    }, 850)
  }

  return (
    <div className="dashboard-container" ref={containerRef}>
      {sidebarOpen && window.innerWidth <= 860 && (
        <div 
          style={{ position: 'absolute', inset: 0, zIndex: 190, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className="sidebar" ref={sidebarRef}>
        <div className="sidebar-top">
          <div className="sidebar-brand">Sketch<span>AI</span></div>
          <button className="icon-trigger" onClick={() => setMessages([])} title="New Space"><NewChatIcon /></button>
        </div>
        <div className="chat-history">
          {historyList.map((item, index) => (
            <div 
              key={item.id} 
              className="history-item-wrapper"
              onMouseEnter={() => handleHistoryHover(index, true)}
              onMouseLeave={() => handleHistoryHover(index, false)}
            >
              <div className="active-indicator" ref={el => indicatorRefs.current[index] = el} />
              <button 
                ref={el => historyRefs.current[index] = el}
                className="history-item" 
                onClick={() => window.innerWidth <= 860 && setSidebarOpen(false)}
              >
                {item.title}
              </button>
            </div>
          ))}
        </div>
      </aside>

      {/* Workspace Core Area */}
      <main className="main-panel" ref={mainPanelRef}>
        <header className="navbar" ref={navbarRef}>
          <button className="icon-trigger" onClick={() => setSidebarOpen(!sidebarOpen)}><ToggleMenu /></button>
          <div className="navbar-heading">Personal Space</div>
          <div style={{ width: 38 }} />
        </header>

        {/* Dynamic Chat / Suggestion Stream Canvas */}
        <section className="chat-area">
          {messages.length === 0 ? (
            <div className="welcome-screen">
              <div className="hero-block">
                <h1>
                  {welcomeTextWords.map((word, i) => (
                    <span key={i} className="word">{word}</span>
                  ))}
                </h1>
              </div>

              {/* Suggestions Cards Array */}
              <div className="kinetic-cascade-deck">
                {casualSuggestions.map((suggest, i) => (
                  <div 
                    key={i} 
                    ref={el => cardsRef.current[i] = el}
                    className="kinetic-card"
                    onMouseMove={(e) => handleCardMouseMove(e, i)}
                    onMouseLeave={() => handleCardMouseLeave(i)}
                    onClick={() => streamNewMessage(suggest.title)}
                  >
                    <h4>{suggest.title}</h4>
                    <p>{suggest.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="messages-list">
              {messages.map((m) => (
                <div 
                  key={m.id} 
                  className={`message-wrapper ${m.role === 'user' ? 'user-align' : 'ai-align'}`}
                >
                  <div className="message-box">
                    <span className="author-tag">{m.role === 'user' ? 'You' : 'Sketch AI'}</span>
                    <div className="bubble">
                      {m.role === 'ai' ? (
                        <>
                          <div className="status-pill">Response Stream</div>
                          <div className="markdown-body">
                            {/* Seamless Markdown Processing Engine */}
                            <ReactMarkdown>{m.text}</ReactMarkdown>
                          </div>
                        </>
                      ) : (
                        m.text
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </section>

        {/* Input Interface Track */}
        <div className="input-dock-container">
          <form 
            className="message-input-bar" 
            ref={inputBarRef}
            onSubmit={(e) => { e.preventDefault(); streamNewMessage(input); }}
          >
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={() => handleInputFocus(true)}
              onBlur={() => handleInputFocus(false)}
              placeholder="Ask anything or bounce an idea..."
            />
            <button type="submit" className="send-action-btn" ref={sendBtnRef}><SendArrow /></button>
          </form>
        </div>
      </main>
    </div>
  )
}

export default Dashboard;