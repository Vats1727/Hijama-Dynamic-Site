import React, { useState, useEffect, useRef } from 'react';
import ChatMessage from '../ui/ChatMessage';
import QuickReply from '../ui/QuickReply';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', text: "Assalamu Alaikum! 👋 Welcome to Al-Shifa Hijama Clinic. I'm here to help you with any questions about our services, pricing, or bookings. How can I assist you today?" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [showBadge, setShowBadge] = useState(true);
  const messagesEndRef = useRef(null);

  const botResponses = {
    'what is hijama': "Hijama (حجامة) is the Islamic practice of wet cupping therapy. It involves creating suction on the skin and making small incisions to draw out stagnant blood and toxins. The Prophet Muhammad ﷺ recommended it as one of the best forms of medical treatment. Modern research confirms its benefits for pain relief, circulation, and detoxification. 🌙",
    'hijama': "Hijama is wet cupping therapy — an ancient Sunnah practice that removes stagnant blood and toxins from the body. It promotes healing, reduces pain, boosts immunity, and restores energy flow. Our certified practitioners follow strict sterile protocols for your safety. ✨",
    'services': "We offer 6 main services:\n\n🩸 Wet Cupping (Hijama) — from ₹800\n🔵 Dry Cupping — from ₹500\n🔥 Fire Cupping — from ₹600\n💆 Massage Cupping — from ₹700\n🌿 Herbal Cupping — from ₹900\n👶 Paediatric Cupping — from ₹450\n\nWould you like to know more about any specific service?",
    'price': "Our services start from:\n• Wet Cupping: ₹800\n• Dry Cupping: ₹500\n• Fire Cupping: ₹600\n• Massage Cupping: ₹700\n• Herbal Cupping: ₹900\n• Paediatric: ₹450\n\nFinal pricing depends on the number of cups and session duration. Shall I help you book an appointment?",
    'book': "To book an appointment, you can:\n\n📋 Fill the form in the Contact section below ↓\n📞 Call us: +91 98765 43210\n📧 Email: appointments@alshifaclinic.com\n\nWe recommend booking 1-2 days in advance. Shall I scroll you to the booking form?",
    'appointment': "I'd be happy to help you book! Please scroll down to the 'Book Your Appointment' section, or call us at +91 98765 43210. We're available Sat–Thu 9AM–8PM, and Fri 2PM–8PM. 📅",
    'hours': "🕐 Our clinic hours are:\n\nSaturday – Thursday: 9:00 AM – 8:00 PM\nFriday: 2:00 PM – 8:00 PM (After Jumu'ah prayers)\n\nWe're closed on certain Islamic holidays. Call ahead to confirm on public holidays.",
    'opening': "🕐 Clinic Hours:\n• Saturday – Thursday: 9 AM – 8 PM\n• Friday: 2 PM – 8 PM\n\nBest time to call: 10 AM – 12 PM for quick booking.",
    'doctor': "We have 4 expert doctors:\n\n👨‍⚕️ Dr. Ahmed Al-Farsi – Chief Practitioner (15+ yrs)\n👩‍⚕️ Dr. Fatima Siddiqui – Women's Specialist (10+ yrs)\n👨‍⚕️ Dr. Yusuf Hassan – Sports & Rehab (8+ yrs)\n👩‍⚕️ Dr. Maryam Ansari – Paediatric Care (7+ yrs)\n\nFemale patients can specifically request our female doctors. Would you like to know more about any doctor?",
    'pain': "Hijama is highly effective for pain management! It's commonly used for:\n\n✅ Back & neck pain\n✅ Migraines & headaches\n✅ Joint & knee pain\n✅ Shoulder stiffness\n✅ Sciatica\n✅ Sports injuries\n\nDr. Ahmed (pain) and Dr. Yusuf (sports injuries) specialise in pain-related conditions. Shall I help you book a consultation?",
    'safe': "Yes, Hijama at Al-Shifa is completely safe! 🛡️\n\n✅ Single-use disposable equipment\n✅ Certified medical practitioners\n✅ Sterile, clinical environment\n✅ Pre-session health screening\n✅ Post-care instructions provided\n\nWe follow international hygiene standards. Any concerns? Feel free to ask!",
    'sunnah': "📅 Recommended Sunnah dates for Hijama (Islamic lunar calendar):\n\n🌙 17th, 19th, and 21st of the lunar month\n\nThe Prophet ﷺ said: 'The best treatment is cupping.' We schedule sessions on these dates — ask reception for the next available Sunnah date when booking!",
    'location': "📍 We are located at:\n\n123 Al-Shifa Plaza\nNear Jama Masjid\nAhmedabad, Gujarat 380001\n\nEasy parking available. Close to public transport. Reply 'hours' for opening times.",
    'contact': "You can reach us through:\n\n📞 Phone: +91 98765 43210\n📧 Email: info@alshifaclinic.com\n📍 Visit: 123 Al-Shifa Plaza, Ahmedabad\n\nOr just scroll down to fill the booking form on this page! 📋",
    'women': "Yes! We have dedicated services and a private room for female patients. 🌸\n\nDr. Fatima Siddiqui and Dr. Maryam Ansari are our female practitioners specialising in:\n• Women's hormonal health\n• Fertility support\n• Menstrual concerns\n• General wellness\n\nAll female sessions are conducted in a fully private setting.",
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

    setTimeout(() => {
      let botReply = "I'm not sure about that. Could you please rephrase? Or call us at +91 98765 43210 for immediate assistance! 😊";
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
