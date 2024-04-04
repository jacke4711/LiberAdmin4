import { useState, FormEvent } from 'react';

const Home = () => {
  const [question, setQuestion] = useState<string>('');
  const [answer, setAnswer] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const predefinedQuestions = [
    { id: 1, text: 'How do I teach alphabet recognition?' },
    { id: 2, text: 'What are effective classroom management strategies?' },
    { id: 3, text: 'Can you suggest activities for developing fine motor skills?' },
    { id: 4, text: 'How to engage parents in education?' },
  ];

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question }),
    });
    const data = await response.json();
    setAnswer(data.answer);
    setIsLoading(false);
  }

  return (
    <div style={{ backgroundColor: '#f0f0f0', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
      <h1 style={{ color: '#333' }}>AI Chatbot for Teachers</h1>
      <div style={{ margin: '20px' }}>
        {predefinedQuestions.map(({ id, text }) => (
          <button key={id} onClick={() => setQuestion(text)} style={{ background: '#d0d0d0', border: 'none', borderRadius: '20px', padding: '10px 20px', margin: '5px', cursor: 'pointer' }}>
            {text}
          </button>
        ))}
      </div>
      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question or click one of the options above"
          rows={4}
          style={{ width: '100%', padding: '10px', margin: '10px 0', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        <button type="submit" disabled={isLoading} style={{ background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', padding: '10px 20px', cursor: 'pointer' }}>Submit</button>
      </form>
      {isLoading && <p>Processing...</p>}
      {answer && <div style={{ marginTop: '20px', background: '#e0e0e0', padding: '20px', borderRadius: '5px', width: '100%', maxWidth: '500px', textAlign: 'left' }}>Answer: {answer}</div>}
    </div>
  );
};

export default Home;
