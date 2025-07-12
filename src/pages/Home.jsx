import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingQuestions, setDeletingQuestions] = useState(new Set());

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await axios.get('/api/questions');
      setQuestions(response.data);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
      return;
    }

    setDeletingQuestions(prev => new Set(prev).add(questionId));
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/questions/${questionId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Remove the question from the list
      setQuestions(prev => prev.filter(q => q._id !== questionId));
      alert('Question deleted successfully!');
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
      setDeletingQuestions(prev => {
        const newSet = new Set(prev);
        newSet.delete(questionId);
        return newSet;
      });
    }
  };

  const filteredQuestions = questions.filter(question =>
    question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    question.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading questions...</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 handwritten-title">Welcome to Odoo Q&A</h1>
        <p className="text-gray-600 mb-4">
          Find answers to your questions or help others by answering theirs.
        </p>
        
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border rounded px-4 py-2"
          />
          <Link
            to="/ask"
            className="bg-blue-500 text-white px-6 py-2 rounded btn"
          >
            Ask Question
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No questions found.</p>
            <Link
              to="/ask"
              className="text-blue-500 hover:text-blue-600 mt-2 inline-block"
            >
              Be the first to ask a question!
            </Link>
          </div>
        ) : (
          filteredQuestions.map((question) => {
            const canDeleteQuestion = user && question.user && user.id === question.user._id;
            const isDeleting = deletingQuestions.has(question._id);
            
            return (
              <div
                key={question._id}
                className="border rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <Link to={`/question/${question._id}`} className="flex-1">
                    <h2 className="text-xl font-semibold text-blue-600">
                      {question.title}
                    </h2>
                  </Link>
                  {canDeleteQuestion && (
                    <button
                      onClick={() => handleDeleteQuestion(question._id)}
                      disabled={isDeleting}
                      className="ml-4 bg-red-500 text-white px-3 py-1 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                  )}
                </div>
                
                <p className="text-gray-600 mb-3 line-clamp-2">
                  {question.description}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-4">
                    <span>Asked by {question.user?.username || 'Anonymous'}</span>
                    <span>{new Date(question.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>{question.answers?.length || 0} answers</span>
                    {question.tags && question.tags.length > 0 && (
                      <div className="flex gap-1">
                        {question.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="bg-gray-100 px-2 py-1 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Home; 