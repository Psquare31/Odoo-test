import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const QuestionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newAnswer, setNewAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchQuestionAndAnswers();
  }, [id]);

  const fetchQuestionAndAnswers = async () => {
    try {
      const [questionRes, answersRes] = await Promise.all([
        axios.get(`/api/questions/${id}`),
        axios.get(`/api/questions/${id}/answers`)
      ]);
      setQuestion(questionRes.data);
      setAnswers(answersRes.data);
    } catch (error) {
      console.error('Error fetching question:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!newAnswer.trim()) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/questions/${id}/answers`, {
        text: newAnswer
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setNewAnswer('');
      fetchQuestionAndAnswers(); // Refresh answers
    } catch (error) {
      console.error('Error submitting answer:', error);
      if (error.response?.status === 401) {
        alert('Please login to answer questions');
        navigate('/login');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (answerId, voteType) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/answers/${answerId}/vote`, {
        voteType
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchQuestionAndAnswers(); // Refresh to get updated votes
    } catch (error) {
      console.error('Error voting:', error);
      if (error.response?.status === 401) {
        alert('Please login to vote');
        navigate('/login');
      }
    }
  };

  const handleDeleteQuestion = async () => {
    if (!window.confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/questions/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      alert('Question deleted successfully!');
      navigate('/');
    } catch (error) {
      console.error('Error deleting question:', error);
      if (error.response?.status === 401) {
        alert('Please login to delete questions');
        navigate('/login');
      } else if (error.response?.status === 403) {
        alert('You can only delete your own questions');
      } else {
        alert('Error deleting question. Please try again.');
      }
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading question...</div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold mb-4">Question not found</h2>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const canDeleteQuestion = user && question.user && user.id === question.user._id;

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Question */}
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-3xl font-bold handwritten-title">{question.title}</h1>
          {canDeleteQuestion && (
            <button
              onClick={handleDeleteQuestion}
              disabled={deleting}
              className="bg-red-500 text-white px-4 py-2 rounded btn disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleting ? 'Deleting...' : 'Delete Question'}
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <span>Asked by {question.user?.username || 'Anonymous'}</span>
          <span>{new Date(question.createdAt).toLocaleDateString()}</span>
          <span>{answers.length} answers</span>
        </div>
        
        {question.tags && question.tags.length > 0 && (
          <div className="flex gap-2 mb-4">
            {question.tags.map((tag, index) => (
              <span
                key={index}
                className="bg-blue-100 px-3 py-1 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        
        <div 
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: question.description }}
        />
      </div>

      {/* Answers */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 handwritten-title">
          {answers.length} Answer{answers.length !== 1 ? 's' : ''}
        </h2>
        
        {answers.length === 0 ? (
          <p className="text-gray-500">No answers yet. Be the first to answer!</p>
        ) : (
          <div className="space-y-6">
            {answers.map((answer) => (
              <div key={answer._id} className="border rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center gap-2">
                    <button
                      onClick={() => handleVote(answer._id, 'up')}
                      className="vote-button"
                    >
                      ▲
                    </button>
                    <span className="font-semibold">{answer.votes}</span>
                    <button
                      onClick={() => handleVote(answer._id, 'down')}
                      className="vote-button"
                    >
                      ▼
                    </button>
                  </div>
                  
                  <div className="flex-1">
                    <div 
                      className="prose max-w-none mb-4"
                      dangerouslySetInnerHTML={{ __html: answer.text }}
                    />
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Answered by {answer.user?.username || 'Anonymous'}</span>
                      <span>{new Date(answer.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Answer Form */}
      <div className="border-t pt-8">
        <h3 className="text-xl font-bold mb-4 handwritten-title">Your Answer</h3>
        <div className="border rounded-lg mb-4">
          <ReactQuill
            value={newAnswer}
            onChange={setNewAnswer}
            placeholder="Write your answer here..."
            modules={{
              toolbar: [
                [{ 'header': [1, 2, false] }],
                ['bold', 'italic', 'underline'],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                ['link', 'code-block'],
                ['clean']
              ],
            }}
            style={{ minHeight: '200px' }}
          />
        </div>
        <button
          onClick={handleSubmitAnswer}
          disabled={submitting || !newAnswer.trim()}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg btn disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Posting Answer...' : 'Post Answer'}
        </button>
      </div>
    </div>
  );
};

export default QuestionDetail; 