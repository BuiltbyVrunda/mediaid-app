import React, { useState, useEffect, useRef } from 'react';

// Icons
const HeartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
  </svg>
);

const SunIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.364-6.364l-1.414 1.414M6.05 6.05L4.636 4.636m12.728 12.728l-1.414 1.414M6.05 17.95l-1.414 1.414"/>
  </svg>
);

const MapIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
  </svg>
);

const PhoneIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
  </svg>
);

// Symptom database
const symptom_database = {
  'chest discomfort': {
    symptoms: ['chest pressure', 'chest pain', 'shortness of breath', 'nausea', 'sweating', 'arm pain', 'jaw pain', 'chest tightness', 'heart racing'],
    severity: 'critical',
    gentle_title: 'Chest Discomfort',
    reassurance: "I understand you're experiencing chest discomfort. This can be concerning, but let's work together to get you the right care.",
    first_aid: [
      'Find a comfortable position to sit and rest',
      'Try to stay calm and breathe slowly',
      'If you have aspirin and no allergies, you may take one (300mg chewed)',
      'Loosen any tight clothing around your chest',
      'It would be wise to call emergency services (100) or have someone nearby do so',
      'Stay with someone if possible while waiting for help'
    ],
    questions: [
      'How would you describe the sensation in your chest?',
      'When did you first notice this feeling?',
      'Does the discomfort spread to your arm, neck, or jaw?',
      'Are you feeling nauseated or sweaty?',
      'Have you experienced anything like this before?'
    ]
  },
  'headache': {
    symptoms: ['head pain', 'pressure', 'tension', 'sensitivity to light', 'neck stiffness'],
    severity: 'mild-moderate',
    gentle_title: 'Headache',
    reassurance: "Headaches are very common and usually respond well to simple treatments. Let's help you feel better.",
    first_aid: [
      'Rest in a quiet, dimly lit room',
      'Apply a cold or warm compress to your head or neck',
      'Stay hydrated and avoid dehydration',
      'Try gentle neck and shoulder stretches',
      'Consider over-the-counter pain relief if needed',
      'Practice relaxation techniques like deep breathing'
    ],
    questions: [
      'How long have you had this headache?',
      'On a scale of 1-10, how would you rate the pain?',
      'Are you sensitive to light or sound?',
      'Have you been stressed or anxious recently?',
      'When did you last eat or drink water?'
    ]
  },
  'anxiety or panic': {
    symptoms: ['rapid heartbeat', 'fear', 'shortness of breath', 'sweating', 'trembling', 'chest tightness'],
    severity: 'moderate',
    gentle_title: 'Anxiety or Panic',
    reassurance: "What you're experiencing is real and manageable. Let's work together to help you feel calmer.",
    first_aid: [
      'Find a quiet, comfortable place to sit',
      'Practice slow, deep breathing - in for 4, hold for 4, out for 6',
      'Focus on your surroundings - name 5 things you can see',
      'Remind yourself that this feeling will pass',
      'If symptoms persist or worsen, consider calling a helpline or doctor',
      'Try progressive muscle relaxation'
    ],
    questions: [
      'How long have you been feeling this way?',
      'Can you identify what might have triggered these feelings?',
      'Have you experienced panic attacks before?',
      'Are you feeling like you cannot catch your breath?',
      'On a scale of 1-10, how intense are these feelings right now?'
    ]
  }
};

export default function MediAidApp() {
  const [darkMode, setDarkMode] = useState(false);
  const [messages, setMessages] = useState([
    {
      from: 'bot',
      text: "Hi! I'm MediAid, your caring health companion. Please describe your symptoms and I'll help assess them and provide guidance.",
      severity: 'unknown',
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyHospitals, setNearbyHospitals] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  };

  const findNearbyHospitals = async () => {
    const mockHospitals = [
      { name: "City General Hospital", address: "123 Main St", distance: "1.2 km" },
      { name: "Emergency Medical Center", address: "456 Health Ave", distance: "2.1 km" },
      { name: "Community Hospital", address: "789 Care Blvd", distance: "3.5 km" }
    ];
    setNearbyHospitals(mockHospitals);
    return mockHospitals;
  };

  const analyzeUserInput = (userInput) => {
    const normalized = userInput.toLowerCase();
    let best_match = null;
    let best_score = 0;

    for (const [condition, data] of Object.entries(symptom_database)) {
      let score = 0;
      if (normalized.includes(condition)) {
        score += 10;
      }
      for (const symptom of data.symptoms) {
        if (normalized.includes(symptom)) {
          score += 5;
        }
      }
      if (score > best_score) {
        best_score = score;
        best_match = { condition, data, score };
      }
    }

    return best_match;
  };

  const formatFirstAid = (steps) => {
    if (!steps) return '';
    return '\n\n📋 First Aid Steps:\n' + steps.map((step, i) => `${i + 1}. ${step}`).join('\n');
  };

  const formatHospitals = (hospitals) => {
    if (!hospitals || hospitals.length === 0) return '';
    return '\n\n🏥 Nearby Hospitals:\n' + hospitals.map(h => `• ${h.name} - ${h.distance} (${h.address})`).join('\n');
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMsg = { 
      from: 'user', 
      text: input,
      timestamp: new Date().toISOString()
    };
    
    setMessages(msgs => [...msgs, userMsg]);
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Handle follow-up questions
      if (currentQuestion) {
        const responses = { ...currentQuestion.responses, [currentQuestion.index]: input };
        
        if (currentQuestion.index + 1 < currentQuestion.questions.length) {
          // Ask next question
          const nextQ = currentQuestion.questions[currentQuestion.index + 1];
          setCurrentQuestion({
            ...currentQuestion,
            index: currentQuestion.index + 1,
            responses
          });
          
          const botMsg = {
            from: 'bot',
            text: `${nextQ}\n\n💡 Question ${currentQuestion.index + 2} of ${currentQuestion.questions.length}`,
            severity: 'unknown',
            timestamp: new Date().toISOString(),
            isFollowUp: true
          };
          
          setMessages(msgs => [...msgs, botMsg]);
        } else {
          // All questions done
          let finalText = 'Thank you for answering all my questions. ';
          
          // Simple assessment based on responses
          const responseText = Object.values(responses).join(' ').toLowerCase();
          if (responseText.includes('severe') || responseText.includes('10') || responseText.includes('9')) {
            finalText += 'Based on your responses, I recommend seeking immediate medical attention. Please call emergency services (100).';
          } else if (responseText.includes('stress') || responseText.includes('anxiety') || responseText.includes('work')) {
            finalText += 'Your symptoms may be stress-related. While still important to monitor, focusing on stress management techniques may help.';
          } else {
            finalText += 'Please continue following the first aid steps and monitor your symptoms.';
          }
          
          finalText += '\n\n💡 Remember: This assessment is not a substitute for professional medical evaluation.';
          
          const finalMsg = {
            from: 'bot',
            text: finalText,
            severity: 'moderate',
            timestamp: new Date().toISOString()
          };
          
          setMessages(msgs => [...msgs, finalMsg]);
          setCurrentQuestion(null);
        }
        
        setInput('');
        setLoading(false);
        return;
      }
      
      // Analyze new symptoms
      const match = analyzeUserInput(input);
      
      if (!match) {
        const botMsg = {
          from: 'bot',
          text: "I want to help you, but I need more details. Could you describe:\n\n• What you're feeling\n• Where you feel it\n• When it started\n• How severe it is\n\n💡 Even if it seems minor, I'm here to support you.",
          severity: 'unknown',
          timestamp: new Date().toISOString()
        };
        
        setMessages(msgs => [...msgs, botMsg]);
        setInput('');
        setLoading(false);
        return;
      }
      
      const { condition, data } = match;
      let botText = data.reassurance;
      botText += formatFirstAid(data.first_aid);
      
      // Show hospitals for critical conditions
      if (data.severity === 'critical') {
        const hospitals = await findNearbyHospitals();
        botText += formatHospitals(hospitals);
        botText += '\n\n🚨 EMERGENCY: This appears to be a serious condition. Please call emergency services (100) immediately.';
      }
      
      botText += '\n\n💡 Remember: This is not a substitute for professional medical advice.';
      
      const botMsg = {
        from: 'bot',
        text: botText,
        severity: data.severity,
        condition: data.gentle_title,
        isEmergency: data.severity === 'critical',
        timestamp: new Date().toISOString()
      };
      
      setMessages(msgs => [...msgs, botMsg]);
      
      // Start follow-up questions
      if (data.questions && data.questions.length > 0) {
        setTimeout(() => {
          const firstQ = data.questions[0];
          setCurrentQuestion({
            condition,
            questions: data.questions,
            index: 0,
            responses: {}
          });
          
          let qText = `I'd like to ask you a few questions to better understand your situation.\n\n${firstQ}`;
          if (data.severity === 'critical') {
            qText = `While this may be serious, let me ask a few questions to assess if stress might be a factor.\n\n${firstQ}`;
          }
          qText += `\n\n💡 Question 1 of ${data.questions.length}`;
          
          const qMsg = {
            from: 'bot',
            text: qText,
            severity: 'unknown',
            timestamp: new Date().toISOString(),
            isFollowUp: true
          };
          
          setMessages(msgs => [...msgs, qMsg]);
        }, 2000);
      }
      
      setInput('');
      
    } catch (error) {
      console.error('Error:', error);
      setMessages(msgs => [...msgs, { 
        from: 'bot', 
        text: "I'm sorry, I'm having trouble processing your request. Please try again.",
        severity: 'unknown',
        timestamp: new Date().toISOString()
      }]);
    }
    
    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getTheme = () => ({
    background: darkMode ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    cardBg: darkMode ? 'rgba(45, 55, 72, 0.95)' : 'rgba(255, 255, 255, 0.95)',
    textColor: darkMode ? '#e2e8f0' : '#2c3e50',
    mutedColor: darkMode ? '#a0aec0' : '#6c757d',
    borderColor: darkMode ? '#4a5568' : '#dee2e6',
    inputBg: darkMode ? 'rgba(45, 55, 72, 0.9)' : 'rgba(255, 255, 255, 0.95)',
    buttonBg: darkMode ? '#4c51bf' : '#0d6efd',
    buttonHover: darkMode ? '#553c9a' : '#0b5ed7'
  });

  const getSeverityColor = (severity) => {
    const colors = {
      critical: '#dc3545',
      moderate: '#ffc107',
      'mild-moderate': '#28a745',
      mild: '#28a745',
      unknown: darkMode ? '#4a5568' : '#e9ecef'
    };
    return colors[severity] || colors.unknown;
  };

  const theme = getTheme();

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '2rem auto', 
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      padding: '0 1rem',
      minHeight: '100vh',
      background: theme.background
    }}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .message-animation {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
      
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '2rem',
        padding: '1rem',
        backgroundColor: theme.cardBg,
        borderRadius: '12px',
        border: `1px solid ${theme.borderColor}`,
        backdropFilter: 'blur(10px)',
        position: 'relative'
      }}>
        <button
          onClick={() => setDarkMode(!darkMode)}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: theme.textColor,
            padding: '8px',
            borderRadius: '8px'
          }}
        >
          {darkMode ? <SunIcon /> : <MoonIcon />}
        </button>
        
        <h1 style={{ 
          color: theme.textColor, 
          marginBottom: '0.5rem',
          fontSize: '2rem',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}>
          <HeartIcon />
          MediAid
        </h1>
        <p style={{ color: theme.mutedColor, margin: 0, fontSize: '1rem' }}>
          Your AI-powered health companion for symptom assessment
        </p>
      </div>

      {/* Chat Area */}
      <div style={{
        border: `1px solid ${theme.borderColor}`,
        borderRadius: '12px',
        padding: '16px',
        height: '500px',
        overflowY: 'auto',
        backgroundColor: theme.cardBg,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 2px 20px rgba(0,0,0,0.1)',
        backdropFilter: 'blur(10px)'
      }}>
        {messages.map((msg, i) => (
          <div
            key={i}
            className="message-animation"
            style={{
              alignSelf: msg.from === 'user' ? 'flex-end' : 'flex-start',
              backgroundColor: msg.from === 'user' 
                ? theme.buttonBg
                : msg.isEmergency 
                  ? '#dc3545' 
                  : getSeverityColor(msg.severity),
              color: msg.from === 'user' || msg.isEmergency ? 'white' : 
                     msg.severity === 'moderate' ? '#000' : 
                     darkMode ? '#e2e8f0' : '#000',
              borderRadius: '18px',
              padding: '12px 16px',
              marginBottom: '12px',
              whiteSpace: 'pre-wrap',
              maxWidth: '85%',
              wordWrap: 'break-word',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            {msg.from === 'bot' && (
              <div style={{
                fontSize: '12px',
                opacity: 0.8,
                marginBottom: '4px'
              }}>
                MediAid
                {msg.isFollowUp && (
                  <span style={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    padding: '2px 6px',
                    borderRadius: '10px',
                    fontSize: '10px',
                    marginLeft: '6px'
                  }}>
                    Follow-up
                  </span>
                )}
              </div>
            )}
            <div>{msg.text}</div>
            {msg.isEmergency && (
              <div style={{
                marginTop: '8px',
                padding: '8px',
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: '8px',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <PhoneIcon />
                <span>Call Emergency Services (100) Now!</span>
              </div>
            )}
          </div>
        ))}
        
        {loading && (
          <div style={{
            alignSelf: 'flex-start',
            fontStyle: 'italic',
            color: theme.mutedColor,
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div style={{
              width: '16px',
              height: '16px',
              border: `2px solid ${darkMode ? '#4a5568' : '#f3f3f3'}`,
              borderTop: `2px solid ${theme.buttonBg}`,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            MediAid is analyzing your symptoms...
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div style={{ marginTop: '16px' }}>
        {nearbyHospitals.length > 0 && (
          <div style={{
            marginBottom: '12px',
            padding: '12px',
            backgroundColor: theme.cardBg,
            borderRadius: '8px',
            border: `1px solid ${theme.borderColor}`
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px',
              color: theme.textColor,
              fontWeight: '500'
            }}>
              <MapIcon />
              Nearby Hospitals
            </div>
            {nearbyHospitals.map((hospital, index) => (
              <div key={index} style={{
                padding: '8px',
                marginBottom: '4px',
                backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                borderRadius: '6px',
                fontSize: '14px'
              }}>
                <div style={{ fontWeight: '500', color: theme.textColor }}>{hospital.name}</div>
                <div style={{ color: theme.mutedColor, fontSize: '12px' }}>
                  {hospital.address} • {hospital.distance}
                </div>
              </div>
            ))}
          </div>
        )}
        
        <textarea
          rows={3}
          value={input}
          disabled={loading}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe your symptoms in detail..."
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '16px',
            borderRadius: '12px',
            border: `1px solid ${theme.borderColor}`,
            resize: 'none',
            fontFamily: 'inherit',
            outline: 'none',
            backgroundColor: theme.inputBg,
            color: theme.textColor,
            boxSizing: 'border-box'
          }}
          onKeyDown={handleKeyPress}
        />
        
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          style={{
            marginTop: '12px',
            width: '100%',
            padding: '12px 24px',
            backgroundColor: loading ? '#6c757d' : theme.buttonBg,
            color: 'white',
            fontSize: '16px',
            fontWeight: '500',
            border: 'none',
            borderRadius: '12px',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          {loading ? (
            <>
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid rgba(255,255,255,0.3)',
                borderTop: '2px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              Analyzing...
            </>
          ) : (
            <>
              <HeartIcon />
              Get Health Guidance
            </>
          )}
        </button>
      </div>
      
      {/* Disclaimer */}
      <div style={{
        textAlign: 'center',
        marginTop: '2rem',
        padding: '1rem',
        backgroundColor: theme.cardBg,
        borderRadius: '8px',
        fontSize: '14px',
        color: theme.mutedColor
      }}>
        <p style={{ margin: 0 }}>
          ⚠️ <strong>Disclaimer:</strong> MediAid is for informational purposes only and should not replace professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare providers for medical concerns.
        </p>
      </div>
    </div>
  );
}