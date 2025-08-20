import React, { useState, useEffect } from 'react';
// import axios from 'axios';


export function Form() {
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('typing');

  if (status === 'success') {
    return <h1>That's right!</h1>
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('submitting');
    try {
      await submitForm(answer);
      setStatus('success');
    } catch (err) {
      setStatus('typing');
      setError(err);
    }
  }

  function handleTextareaChange(e) {
    setAnswer(e.target.value);
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className="rounded-2xl shadow-lg border border-slate-200">
        {/* Header */}
        <div className="pb-3 p-4">
          <div className="flex items-center gap-2">
            <h4 className="text-lg font-semibold">City quiz</h4>
          </div>
          <p className="text-sm text-slate-600">
            What's on your mind today… Talk to the almighty GPT wrapper
          </p>
        </div>

        {/* Messages */}
        <div className="h-72 overflow-y-auto px-4 space-y-4">
          <div className="flex items-start gap-2 justify-start">
            <div className="max-w-[85%] bg-slate-100 text-slate-900 rounded-2xl rounded-bl-sm px-4 py-2 text-sm shadow-sm">
              Hey! I'm your City Quiz helper. Ask about a city, culture, food, or geography—I'll quiz you or answer!
            </div>
          </div>
        </div>
        <br></br>

        {/* Footer / Input */}
        <div className="p-4 border-t space-y-2">
          <form>
            <textarea
              placeholder="Ask a city question or say 'quiz me'…"
              className="w-full min-h-24 resize-y border rounded-lg p-2"
              style={{ fontSize: 18 }}
            />
            <div className="flex items-center justify-end gap-2 mt-2">
              <button
                type="submit"
                className="bg-slate-900 text-white px-4 py-2 rounded-2xl disabled:opacity-50"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


function submitForm(answer) {
  // Pretend it's hitting the network.
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      let shouldError = answer.toLowerCase() !== 'lima'
      if (shouldError) {
        reject(new Error('Good guess but a wrong answer. Try again!'));
      } else {
        resolve();
      }
    }, 1500);
  });
}

export default Form;
// function MyComponent() {
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {

//         const response = await axios.post('http://localhost:8080/api/ai/complete', formdata); // Replace with your Spring Boot API URL
//         setData(response.data);
//         setLoading(false);
//       } catch (err) {
//         setError(err);
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []); // Empty dependency array means this effect runs once on mount

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div>Error: {error.message}</div>;

//   return (
//     <div>
//       {/* Render your data here */}
//       {data.map(item => (
//         <p key={item.id}>{item.name}</p>
//       ))}
//     </div>
//   );
// }

