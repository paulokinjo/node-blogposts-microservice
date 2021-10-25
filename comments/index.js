const express = require('express');
const { randomBytes } = require('crypto');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(express.json());
app.use(cors());

const commentsByPostId = {};

app.get('/posts/:id/comments', (req, res) => {
  res.send(commentsByPostId[req.params.id]);
});

app.post('/posts/:id/comments', async (req, res) => {
  const commentId = randomBytes(4).toString('hex');
  const { content } = req.body;

  const comments = commentsByPostId[req.params.id] || [];

  comments.push({ id: commentId, content, status: 'pending' });
  commentsByPostId[req.params.id] = comments;

  await axios.post('http://event-bus-service:4005/events', {
    type: 'CommentCreated',
    data: {
      id: commentId,
      content,
      postId: req.params.id,
      status: 'pending',
    },
  });

  res.status(201).send(comments);
});

app.post('/events', (req, res) => {
  console.log('Received Event', req.body.type);

  const { type, data } = req.body;

  if (type === 'CommentModerated') {
    setTimeout(async () => {
      const { postId, id, status } = data;

      const comments = commentsByPostId[postId];
      const comment = comments.find((c) => c.id === id);

      comment.status = status;

      let message = comment.content;
      if (status === 'rejected') {
        message = 'This comment has been rejected';
      }

      await axios.post('http://event-bus-service:4005/events', {
        type: 'CommentUpdated',
        data: {
          ...comment,
          postId,
          content: message,
        },
      });
    }, 5000);
  }

  res.send({});
});

app.listen(4001, () => console.log('Listening on 4001'));
