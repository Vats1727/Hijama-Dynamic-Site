import React, { useState, useEffect, useRef } from 'react';
import ChatMessage from '../ui/ChatMessage';
import QuickReply from '../ui/QuickReply';
import { crudService } from '../../services/crud';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', text: "Assalamu Alaikum! 👋 Welcome to Al-Shifa Hijama Clinic. I'm here to help you with any questions about our services, pricing, or bookings. How can I assist you today?" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [showBadge, setShowBadge] = useState(true);
  const messagesEndRef = useRef(null);

  // Dynamic database states
  const [services, setServices] = useState([]);
  const [contactData, setContactData] = useState(null);
  const [doctors, setDoctors] = useState([]);

  // Fetch dynamic data from system API
  const fetchData = async () => {
    try {
      const [serv, contact, doc] = await Promise.all([
        crudService.getAll('service_list'),
        crudService.getAll('book_your_appointment'),
        crudService.getAll('doctors_list')
      ]);

      if (Array.isArray(serv)) {
        setServices(serv.filter(s => s.status?.toLowerCase() === 'active'));
      }
      if (Array.isArray(contact)) {
        const activeContact = contact.find(c => c.status === 'Active') || contact[0];
        setContactData(activeContact || null);
      }
      if (Array.isArray(doc)) {
        setDoctors(doc.filter(d => d.status?.toLowerCase() === 'active'));
      }
    } catch (error) {
      console.error('ChatBot data loading error:', error);
    }
  };

  useEffect(() => {
    fetchData();

    // Real-time hot swapping via editor events
    const handleMsg = (event) => {
      if (event.data && event.data.type === 'LIVE_DATA_REFRESH') {
        fetchData();
      }
    };
    window.addEventListener('message', handleMsg);
    return () => window.removeEventListener('message', handleMsg);
  }, []);

  const getDynamicBotResponses = () => {
    // Adaptive Dynamic Fallbacks
    let servicesText = "We offer premium, specialized cupping therapy services at affordable rates. Please let me know if you would like to know more!";
    let pricesText = "Our services are competitively priced. Standard cupping sessions are fully tailored to each patient's specific condition and health history.";
    let bookingText = "To book an appointment, you can fill the form in the Contact section below! We recommend booking in advance.";
    let appointmentText = "I'd be happy to help you book! Please scroll down to the 'Book Your Appointment' section.";
    let hoursText = "🕐 Our clinic hours are updated regularly. Please visit our contact section for exact timing details.";
    let doctorsText = "We have expert, certified practitioners to care for your health and wellness.";
    let contactText = "You can reach us through our contact section on this page! Just scroll down to fill the booking form.";
    let locationText = "📍 Please refer to our Contact section below for our full address and clinic location map.";

    // 1. Fill Dynamic Services & Prices
    if (services.length > 0) {
      const list = services.map(s => `• ${s.name}${s.price ? ` — from ${s.price}` : ''}`).join('\n');
      servicesText = `We offer ${services.length} active services:\n\n${list}\n\nWould you like to know more about any specific service?`;
      
      const priceList = services.map(s => `• ${s.name}: ${s.price || 'Consultation Required'}`).join('\n');
      pricesText = `Our services start from:\n${priceList}\n\nFinal pricing depends on the number of cups and treatment. Shall I help you book an appointment?`;
    }

    // 2. Fill Dynamic Contacts & Hours
    if (contactData) {
      const p1 = contactData.phone;
      const p2 = contactData.phone_2;
      const em = contactData.email;
      const addr = contactData.address;
      const hours = contactData.clinic_hours;
      
      let contactDetails = [];
      if (p1) contactDetails.push(`📞 Call us: ${p1}`);
      if (p2) contactDetails.push(`📞 Alt Phone: ${p2}`);
      if (em) contactDetails.push(`📧 Email: ${em}`);

      if (contactDetails.length > 0) {
        bookingText = `To book an appointment, you can:\n\n📋 Fill the form below ↓\n${contactDetails.join('\n')}\n\nShall I scroll you to the booking form?`;
        appointmentText = `I'd be happy to help you book! Please scroll down to the 'Book Your Appointment' section${p1 ? `, or call us at ${p1}` : ''}. 📅`;
        contactText = `You can reach us through:\n\n${contactDetails.join('\n')}${addr ? `\n📍 Visit: ${addr}` : ''}\n\nOr just scroll down to fill the booking form on this page! 📋`;
      }

      if (hours) {
        hoursText = `🕐 Our clinic hours are:\n\n${hours}\n\nWe recommend calling ahead on public holidays to confirm timings.`;
      }

      if (addr) {
        locationText = `📍 We are located at:\n\n${addr}\n\nEasy parking available. Close to public transport. Reply 'hours' for opening times.`;
      }
    }

    // 3. Fill Dynamic Doctors List
    if (doctors.length > 0) {
      const docList = doctors.map(d => `👤 ${d.name} – ${d.title || 'Specialist'}${d.experience ? ` (${d.experience})` : ''}`).join('\n');
      doctorsText = `We have ${doctors.length} expert practitioners available:\n\n${docList}\n\nFemale patients can specifically request our female doctors for sessions. Would you like to know more about any doctor?`;
    }

    return {
      'what is hijama': "Hijama (حجامة) is the Islamic practice of wet cupping therapy. It involves creating suction on the skin and making small incisions to draw out stagnant blood and toxins. The Prophet Muhammad ﷺ recommended it as one of the best forms of medical treatment. Modern research confirms its benefits for pain relief, circulation, and detoxification. 🌙",
      'hijama': "Hijama is wet cupping therapy — an ancient Sunnah practice that removes stagnant blood and toxins from the body. It promotes healing, reduces pain, boosts immunity, and restores energy flow. Our certified practitioners follow strict sterile protocols for your safety. ✨",
      'services': servicesText,
      'price': pricesText,
      'book': bookingText,
      'appointment': appointmentText,
      'hours': hoursText,
      'opening': hoursText,
      'doctor': doctorsText,
      'pain': "Hijama is highly effective for pain management! It's commonly used for:\n\n✅ Back & neck pain\n✅ Migraines & headaches\n✅ Joint & knee pain\n✅ Shoulder stiffness\n✅ Sciatica\n✅ Sports injuries\n\nShall I help you book a consultation?",
      'safe': "Yes, Hijama at Al-Shifa is completely safe! 🛡️\n\n✅ Single-use disposable equipment\n✅ Certified medical practitioners\n✅ Sterile, clinical environment\n✅ Pre-session health screening\n✅ Post-care instructions provided\n\nWe follow international hygiene standards. Any concerns? Feel free to ask!",
      'sunnah': "📅 Recommended Sunnah dates for Hijama (Islamic lunar calendar):\n\n🌙 17th, 19th, and 21st of the lunar month\n\nThe Prophet ﷺ said: 'The best treatment is cupping.' We schedule sessions on these dates — ask reception for the next available Sunnah date when booking!",
      'location': locationText,
      'contact': contactText,
      'women': "Yes! We have dedicated services and private rooms for female patients. 🌸 All female sessions are conducted in a fully private setting with our experienced female practitioners.",
    };
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) setShowBadge(false);
  };

  const handleSend = (text) => {
    const userMsg = text || inputValue;
    if (!userMsg.trim()) return;

    setMessages(prev => [...prev, { type: 'user', text: userMsg }]);
    setInputValue('');

    const botResponses = getDynamicBotResponses();
    const fallbackPhone = contactData?.phone || "+91 98765 43210";

    setTimeout(() => {
      let botReply = `I'm not sure about that. Could you please rephrase? Or call us at ${fallbackPhone} for immediate assistance! 😊`;
      const m = userMsg.toLowerCase();
      
      for (const key in botResponses) {
        if (m.includes(key)) {
          botReply = botResponses[key];
          break;
        }
      }

      setMessages(prev => [...prev, { type: 'bot', text: botReply }]);
    }, 600);
  };

  const quickReplies = [
    'What is Hijama?',
    'Services & Prices',
    'Book appointment',
    'Opening hours'
  ];

  return (
    <>
      <button className="chat-toggle" id="chatToggle" onClick={toggleChat}>
        {isOpen ? '✕' : '💬'}
        {showBadge && !isOpen && <span className="chat-badge">1</span>}
      </button>

      <div className={`chatbot-window ${isOpen ? 'open' : ''}`} id="chatbotWindow">
        <div className="chat-header">
          <div className="chat-header-left">
            <div className="chat-avatar">🤖</div>
            <div>
              <div className="chat-name">Shifa Assistant</div>
              <div className="chat-status"><span className="online-dot"></span> Online — replies instantly</div>
            </div>
          </div>
          <button className="chat-close" onClick={toggleChat}>✕</button>
        </div>
        <div className="chat-messages" id="chatMessages">
          {messages.map((msg, i) => (
            <ChatMessage key={i} type={msg.type} text={msg.text} />
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="quick-replies" id="quickReplies">
          {quickReplies.map((reply, i) => (
            <QuickReply key={i} text={reply} onClick={handleSend} />
          ))}
        </div>
        <div className="chat-input-area">
          <input 
            type="text" 
            id="chatInput" 
            placeholder="Type your message..." 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button className="chat-send-btn" onClick={() => handleSend()}>➤</button>
        </div>
      </div>
    </>
  );
};

export default ChatBot;
