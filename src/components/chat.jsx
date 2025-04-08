import React, { useState, useRef, useEffect } from 'react';
import './chat.css'; // Assuming you have a CSS file for styling

const ChatBot = () => {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi ' },
  ]);
  const [input, setInput] = useState('');
  const [step, setStep] = useState('greeting'); // Start in greeting mode
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [userDetails, setUserDetails] = useState({
    name: '',
    phone: '',
    email: '',
  });
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const validateInput = (step, text) => {
    switch (step) {
      case 'name':
        return /^[a-zA-Z\s]+$/.test(text);
      case 'phone':
        return /^\d{10}$/.test(text);
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text);
      case 'date':
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(text)) return false;
        const [year, month, day] = text.split('-').map(Number);
        const inputDate = new Date(year, month - 1, day);
        return !isNaN(inputDate.getTime());
      case 'time':
        const timeRegex = /^([1-9]|1[0-2]):[0-5][0-9]\s+(AM|PM)$/i;
        return timeRegex.test(text);
      default:
        return true;
    }
  };

  const resetChat = () => {
    setMessages([{ sender: 'bot', text: 'Hi' }]);
    setInput('');
    setStep('greeting');
    setSelectedDate(null);
    setSelectedTime(null);
    setUserDetails({
      name: '',
      phone: '',
      email: '',
    });
  };

  const handleSend = (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    setMessages((prev) => [...prev, { sender: 'user', text: trimmed }]);

    if (trimmed.toLowerCase() === 'cancel') {
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: 'Chat has been canceled. Starting over!' },
      ]);
      setTimeout(resetChat, 500);
      return;
    }

    if (step === 'greeting') {
      if (/hi|hello/i.test(trimmed)) {
        setMessages((prev) => [
          ...prev,
          { sender: 'bot', text: 'How is your day going? ' },
        ]);
        setStep('casual');
      } else {
        setMessages((prev) => [
          ...prev,
          { sender: 'bot', text: 'Please say Hi or Hello to start the conversation.' },
        ]);
      }
    } else if (step === 'casual') {
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: 'Ok..! Would you like to schedule a demo or booking?' },
      ]);
      setStep('initial');
    } else if (step === 'initial') {
      if (/yes/i.test(trimmed)) {
        setMessages((prev) => [
          ...prev,
          { sender: 'bot', text: 'Great! May I have your full name?' },
        ]);
        setStep('name');
      } else if (/no/i.test(trimmed)) {
        setMessages((prev) => [
          ...prev,
          { sender: 'bot', text: 'Alright! Let me know if you change your mind.' },
        ]);
        setStep('casual');
      } else {
        setMessages((prev) => [
          ...prev,
          { sender: 'bot', text: 'Please type "yes" to proceed with booking or "no" to chat casually.' },
        ]);
      }
    } else if (step === 'name') {
      if (validateInput('name', trimmed)) {
        setUserDetails((prev) => ({ ...prev, name: trimmed }));
        setMessages((prev) => [...prev, { sender: 'bot', text: 'Thanks! Your mobile number?' }]);
        setStep('phone');
      } else {
        setMessages((prev) => [...prev, { sender: 'bot', text: 'Please enter a valid name (letters only).' }]);
      }
    } else if (step === 'phone') {
      if (validateInput('phone', trimmed)) {
        setUserDetails((prev) => ({ ...prev, phone: trimmed }));
        setMessages((prev) => [...prev, { sender: 'bot', text: 'Cool. Your email address?' }]);
        setStep('email');
      } else {
        setMessages((prev) => [...prev, { sender: 'bot', text: 'Please enter a valid 10-digit phone number.' }]);
      }
    } else if (step === 'email') {
      if (validateInput('email', trimmed)) {
        setUserDetails((prev) => ({ ...prev, email: trimmed }));
        setMessages((prev) => [...prev, { sender: 'bot', text: 'Please enter a date for your appointment (YYYY-MM-DD, e.g., 2025-04-09 or today).' }]);
        setStep('date');
      } else {
        setMessages((prev) => [...prev, { sender: 'bot', text: 'Please enter a valid email ID.' }]);
      }
    } else if (step === 'date') {
      if (validateInput('date', trimmed)) {
        setSelectedDate(new Date(trimmed));
        setMessages((prev) => [...prev, { sender: 'bot', text: `Date selected: ${trimmed}. Now, enter the time and AM/PM (e.g., 2:30 AM).` }]);
        setStep('time');
      } else {
        setMessages((prev) => [...prev, { sender: 'bot', text: 'Please enter a valid date in YYYY-MM-DD format.' }]);
      }
    } else if (step === 'time') {
      if (validateInput('time', trimmed)) {
        setSelectedTime(trimmed);
        const timeMatch = trimmed.match(/^([1-9]|1[0-2]):([0-5][0-9])\s+(AM|PM)$/i);
        const hours = parseInt(timeMatch[1], 10);
        const minutes = parseInt(timeMatch[2], 10);
        const period = timeMatch[3].toUpperCase();

        const finalDateTime = new Date(selectedDate);
        finalDateTime.setHours(period === 'AM' ? hours : hours + 12, minutes, 0, 0);

        if (finalDateTime > new Date()) {
          const summary = `Here are your appointment details:
            - Name: ${userDetails.name}
            - Phone: ${userDetails.phone}
            - Email: ${userDetails.email}
            - Date: ${selectedDate.toLocaleDateString()}
            - Time: ${trimmed}
          `;
          setMessages((prev) => [
            ...prev,
            { sender: 'bot', text: summary.trim().replace(/\n/g, '\n- ') },
          ]);

          setTimeout(() => {
            setMessages((prev) => [
              ...prev,
              { sender: 'bot', text: 'Awesome! Your appointment is scheduled. We\'ll send you a reminder. Want to chat more or book another?' },
            ]);
            setStep('casual'); // Return to casual mode after scheduling
            setSelectedDate(null);
            setSelectedTime(null);
          }, 1000);
        } else {
          setMessages((prev) => [...prev, { sender: 'bot', text: 'Please select a future time. Try again.' }]);
          setStep('time');
        }
      } else {
        setMessages((prev) => [...prev, { sender: 'bot', text: 'Please enter a valid time in HH:MM AM/PM format (e.g., 2:30 AM).' }]);
      }
    }

    setInput('');
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>Booking Assistant</h2>
      </div>

      <div className="message-container">
        {messages.map((message, index) => (
          <div key={index} className={`message-wrapper ${message.sender}-wrapper`}>
            <div className={`profile-icon ${message.sender}-icon`} />
            <div className={`message ${message.sender}-message`}>
              <div className="message-text">
                {message.text.split('\n').map((line, i) => (
                  <div key={i} className="mb-1">
                    {line}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form className="input-container" onSubmit={handleSend}>
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder={step === 'date' ? 'Enter date (YYYY-MM-DD)' : step === 'time' ? 'Enter time (e.g., 2:30 AM)' : 'Type your message...'}
          className="chat-input"
        />
        <button type="submit" className="send-button">Send</button>
      </form>
    </div>
  );
};

export default ChatBot;
