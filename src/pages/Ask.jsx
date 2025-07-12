import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';

const Ask = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      const response = await axios.post('/api/questions', {
        title: title.trim(),
        description: description.trim(),
        tags: tagArray
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      navigate(`/question/${response.data._id}`);
    } catch (error) {
      console.error('Error creating question:', error);
      if (error.response?.status === 401) {
        alert('Please login to ask a question');
        navigate('/login');
      } else {
        alert('Error creating question. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 handwritten-title">Ask a Question</h1>
        <p className="text-gray-600">
          Share your knowledge and help others by asking a well-formulated question.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What's your question? Be specific."
            className="w-full border rounded-lg px-4 py-3"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            Imagine you're asking another person
          </p>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <div className="border rounded-lg">
            <ReactQuill
              value={description}
              onChange={setDescription}
              placeholder="Provide all the information someone would need to answer your question..."
              modules={{
                toolbar: [
                  [{ 'header': [1, 2, false] }],
                  ['bold', 'italic', 'underline', 'strike'],
                  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                  ['link', 'code-block'],
                  ['clean']
                ],
              }}
              style={{ minHeight: '200px' }}
            />
          </div>
        </div>

        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <input
            id="tags"
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Add up to 5 tags separated by commas (e.g., javascript, react, web-development)"
            className="w-full border rounded-lg px-4 py-3"
          />
          <p className="text-sm text-gray-500 mt-1">
            Add up to 5 tags to help categorize your question
          </p>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg btn disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Posting Question...' : 'Post Question'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="bg-gray-300 px-6 py-3 rounded-lg btn"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default Ask; 