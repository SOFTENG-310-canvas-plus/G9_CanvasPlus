import React, { useState, useEffect } from 'react';
import axios from 'axios';


export function Form() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [responseData, setResponseData] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponseData(null);

    try {
      const response = await axios.post('http://localhost:8080/api/ai/complete', {
        question: input,
      },
        {
          headers: {
            'Content-Type': 'text/plain'
          }
        });

      setResponseData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className="rounded-2xl shadow-lg border border-slate-200">
        {/* Header */}
        <div className="pb-3 p-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">Ask Chat....</h3>
          </div>
          <p className="text-sm text-slate-600">
            What's on your mind today… Talk to the almighty GPT wrapper
          </p>
        </div>


        {/* Footer / Input */}
        <div className="p-4 border-t space-y-2">
          <form onSubmit={handleSubmit}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything...."
              className=" min-h-24 resize-y border rounded-lg p-2"
              style={{ fontSize: 18, resize: 'none' }}
              rows={3.5}
              cols={35}

            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-slate-900 text-white px-6 py-3 rounded-2xl disabled:opacity-50"
              style={{ position: 'relative', left: 20, bottom: 31, width: 200, height: 70 }}
            >
              {loading ? 'Submitting...' : 'Submit'}
            </button>
            {responseData && (
              <div className="mt-4 text-green-600">{JSON.stringify(responseData)}</div>
            )}
            {error && (
              <div className="mt-4 text-red-600">{error}</div>
            )}
          </form>
        </div>
      </div >
    </div >
  );
}

export default Form;