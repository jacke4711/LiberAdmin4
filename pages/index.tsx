import { useState, FormEvent, useRef, useEffect, KeyboardEvent, Suspense } from 'react';
import { GetServerSideProps } from "next"
import type { Session } from "next-auth"
import { useSession, getSession } from "next-auth/react"
//import "../styles/globals.css";
import styles from '../styles/LiberAdmin.module.css';
import Image from 'next/image';
import { Message } from '@/services/OpenAIService';
/*import UserThreads from '@/app/ui/UserThreads';
import {
  UserThreadsSkeleton,
} from '@/app/ui/skeletons';
*/


const Home = () => {
  const [question, setQuestion] = useState<string>('');
  const [threadId, setThreadId] = useState<string>('');
  const [messages, setMessages] = useState<Array<Message>>([]);
  const [userThreads, setUserThreads] = useState<Array<{ userId: string, threadId: string, title: string }>>([]);
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
    setMessages(prev => [...prev, { id: '', role: 'user', content: question, threadId: ''}, { id: '', role: 'assistant', content: 'Processing...', threadId: ''}]); // TODO: Add correct id

    const response = await fetch('/api/assistant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'sendMessage', question, threadId }),
    });
    const data = await response.json();
    setIsLoading(false);
    // Save the threadId for future messages
    setThreadId(data.threadId);
    setMessages(prev => [...prev.slice(0, -1), data]);
    setQuestion('');
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === ' ' && e.ctrlKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const reloadMessages = async (threadId: string) => {
    // Fetch new chat data based on the threadId
    // Update the state of the chat container to trigger a re-render
    // TODO: Handle scrolling of messages.
    setThreadId(threadId);
    setIsLoading(true);
    setMessages(prev => [...prev, { id: '', role: 'assistant', content: 'Processing...', threadId: ''}]); 

    const response = await fetch('/api/assistant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'listMessages', threadId }),
    });
    const data = await response.json();
    setIsLoading(false);
    // Save the threadId for future messages
    //setMessages(prev => [...prev.slice(0, -1), ...data]);
    setMessages(data);
    setQuestion('');

  };

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('/api/UserThreadsApi', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();
      setUserThreads(data);
    };

    fetchData();
  }, []);

  return (

    <div className={styles['app-container']}>
      <div className={styles['sidebar']}>
        Threads or Other Information
        {/* 
        <Suspense fallback={<UserThreadsSkeleton />}>
          <UserThreads />
        </Suspense> 
        */}
        {userThreads.map((thread, i) => {
          return (
            <div key={thread.threadId} className={styles['thread']}>
              <button onClick={() => reloadMessages(thread.threadId)}>
                {thread.title}
              </button>
            </div>
          );
        })}

        <div className={styles['user_panel']}>
        <Image
          src={session?.user?.image as string}
          alt="User image"
          width={50} // replace with your desired width
          height={50} // replace with your desired height
          className={styles['small-rounded-image']}
        />
        {session?.user?.name}
        </div>
      </div>
      <div className={styles['chat-container']}>
        <div className={styles['messages']}>
          {messages.map((msg, index) => (
            <div key={index} className={`${styles['message']} ${styles[msg.role]}`}>
              {msg.content}
            </div>
          ))}
          <div ref={endOfMessagesRef}></div>
          {isLoading && <div className={styles['loader']}>Loading...</div>}
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
//<style jsx>{styles['LiberAdmin}</style>

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
