import { useState, FormEvent, useRef, useEffect, KeyboardEvent } from 'react';
import { GetServerSideProps } from "next"
import type { Session } from "next-auth"
import { useSession, getSession } from "next-auth/react"
//import "../styles/globals.css";
import styles from '../styles/LiberAdmin.module.css';
import Image from 'next/image';


const Home = () => {
  const [question, setQuestion] = useState<string>('');
  const [threadId, setThreadId] = useState<string>('');
  const [messages, setMessages] = useState<Array<{ type: string, text: string, id: string }>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const endOfMessagesRef = useRef<null | HTMLDivElement>(null);

  // As this page uses Server Side Rendering, the `session` will be already
  // populated on render without needing to go through a loading stage.
  // This is possible because of the shared context configured in `_app.js` that
  // is used by `useSession()`.
  const { data: session, status } = useSession()
  const loading = status === 'loading'


  const predefinedQuestions = [
    'How do I teach alphabet recognition?',
    'What are effective classroom management strategies?',
    'Can you suggest activities for developing fine motor skills?',
    'How to engage parents in education?'
  ];

  const sendMessage = async () => {
    if (!question.trim()) return;
    setIsLoading(true);
    setMessages(prev => [...prev, { type: 'user', text: question, id: '' }, { type: 'bot', text: 'Processing...', id: '' }]); // TODO: Add correct id

    const response = await fetch('/api/assistant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question, threadId }),
    });
    const data = await response.json();
    setIsLoading(false);
    // Save the threadId for future messages
    setThreadId(data.threadId);
    setMessages(prev => [...prev.slice(0, -1), { type: 'bot', text: data.content || 'Error getting response', id: data.id }]);
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

    <div className={styles['app-container']}>
      <div className={styles.sidebar}>
        Threads or Other Information
        <Image
          src={session?.user?.image as string}
          alt="User image"
          width={50} // replace with your desired width
          height={50} // replace with your desired height
          className={styles['small-rounded-image']}
        />
        {session?.user?.name}
      </div>
      <div className={styles['chat-container']}>
        <div className={styles.messages}>
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.type}`}>
              {msg.text}
            </div>
          ))}
          <div ref={endOfMessagesRef}></div>
          {isLoading && <div className={styles.loader}>Loading...</div>}
        </div>
        <div className={styles['predefined-questions']}>
          {predefinedQuestions.map((q, index) => (
            <button key={index} onClick={() => setQuestion(q)} style={{ margin: '5px' }}>
              {q}
            </button>
          ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className={styles['input-form']}>
          <textarea className={styles['input-form-textarea']}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a question..."
            rows={3}
          />
          <button className={styles['input-form-button']} type="submit" disabled={isLoading}>Send</button>
        </form>
      </div>
    </div>
  );
};
//<style jsx>{styles.LiberAdmin}</style>

// Export the `session` prop to use sessions with Server Side Rendering
export const getServerSideProps: GetServerSideProps<{
  session: Session | null
}> = async (context) => {
  return {
    props: {
      session: await getSession(context),
    },
  }
}

export default Home;
