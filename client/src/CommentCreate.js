import React, { useState } from 'react';
import axios from 'axios';

const CommentCreate = ({ postId }) => {
  const [content, setContent] = useState('');

  const onSubmit = async (event) => {
    event.preventDefault();

    await axios.post(`http://192.168.33.10:31202/posts/${postId}/comments`, {
      content,
    });

    setContent('');
  };

  return (
    <div>
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label htmlFor="new-comment">New Commnet</label>
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            type="text"
            className="form-control"
            name="new-comment"
          />
        </div>
        <button className="btn btn-primary">Submit</button>
      </form>
    </div>
  );
};

export default CommentCreate;
