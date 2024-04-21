import { useState, FormEvent, useRef, useEffect, KeyboardEvent } from 'react';

const Home = () => {
  const [question, setQuestion] = useState<string>('');
  const [messages, setMessages] = useState<Array<{type: string, text: string}>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const endOfMessagesRef = useRef<null | HTMLDivElement>(null);

  const predefinedQuestions = [
    'How do I teach alphabet recognition?',
    'What are effective classroom management strategies?',
    'Can you suggest activities for developing fine motor skills?',
    'How to engage parents in education?'
  ];

  const sendMessage = async () => {
    if (!question.trim()) return;
    setIsLoading(true);
    setMessages(prev => [...prev, {type: 'user', text: question}, {type: 'bot', text: 'Processing...'}]);
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question }),
    });
    const data = await response.json();
    setIsLoading(false);
    setMessages(prev => [...prev.slice(0, -1), {type: 'bot', text: data.answer || 'Error getting response'}]);
    setQuestion('');
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === ' ' && e.ctrlKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="app-container">
      <div className="sidebar">Threads or Other Information</div>
      <div className="chat-container">
        <div className="messages">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.type}`}>
              {msg.text}
            </div>
          ))}
          <div ref={endOfMessagesRef}></div>
          {isLoading && <div className="loader">Loading...</div>}
        </div>
        <div className="predefined-questions">
          {predefinedQuestions.map((q, index) => (
            <button key={index} onClick={() => setQuestion(q)} style={{ margin: '5px' }}>
              {q}
            </button>
          ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="input-form">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a question..."
            rows={3}
          />
          <button type="submit" disabled={isLoading}>Send</button>
        </form>
      </div>
      <style jsx>{`
        .app-container {
          display: flex;
          height: 100vh;
        }
        .sidebar {
          width: 16.666%; // Fixed percentage width or you can use a fixed pixel value
          min-width: 200px; // Ensures it doesn't get too narrow on smaller screens
          background-color: #222222;
          padding: 20px;
          overflow-y: auto; // Adds scroll to sidebar if content overflows
          height: 100vh; // Full viewport height
          position: fixed; // Keeps the sidebar fixed during scrolling
          left: 0; // Aligns the sidebar to the left edge of the viewport
          top: 0; // Aligns the sidebar to the top of the viewport
        }
      
        .chat-container {
          flex-grow: 1;
          margin-left: 16.666%; // Adjust this value to match the sidebar width if needed
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          border-left: 1px solid #ccc;
        }
        .predefined-questions {
          display: flex;
          justify-content: center;
          padding: 10px;
          flex-wrap: wrap;
        }
        .messages {
          overflow-y: auto;
          padding: 20px;
          flex-grow: 1;
        }
        .message {
          margin-bottom: 12px;
          padding: 8px 12px;
          border-radius: 10px;
          max-width: 75%;
        }
        .user {
          background-color: #007bff;
          color: white;
          align-self: flex-end;
        }
        .bot {
          background-color: #e0e0e0;
          color: black;
          align-self: flex-start;
        }
        .input-form {
          display: flex;
          padding: 10px;
          background: #222222;
          border-top: 1px solid #ccc;
        }
        textarea {
          flex-grow: 1;
          resize: none;
          border-radius: 8px;
          padding: 8px;
          margin-right: 8px;
        }
        button {
          padding: 10px 20px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }
        button:disabled {
          opacity: 0.5;
          cursor: default;
        }
        .loader,
        .loader:before,
        .loader:after {
          background: #ffffff;
          -webkit-animation: load1 1s infinite ease-in-out;
          animation: load1 1s infinite ease-in-out;
          width: 1em;
          height: 4em;
        }
        .loader {
          color: #ffffff;
          text-indent: -9999em;
          margin: 88px auto;
          position: relative;
          font-size: 11px;
          -webkit-transform: translateZ(0);
          -ms-transform: translateZ(0);
          transform: translateZ(0);
          -webkit-animation-delay: -0.16s;
          animation-delay: -0.16s;
        }
        .loader:before,
        .loader:after {
          position: absolute;
          top: 0;
          content: '';
        }
        .loader:before {
          left: -1.5em;
          -webkit-animation-delay: -0.32s;
          animation-delay: -0.32s;
        }
        .loader:after {
          left: 1.5em;
        }
        @-webkit-keyframes load1 {
          0%,
          80%,
          100% {
            box-shadow: 0 0;
            height: 4em;
          }
          40% {
            box-shadow: 0 -2em;
            height: 5em;
          }
        }
        @keyframes load1 {
          0%,
          80%,
          100% {
            box-shadow: 0 0;
            height: 4em;
          }
          40% {
            box-shadow: 0 -2em;
            height: 5em;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;
