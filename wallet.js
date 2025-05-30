const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.sendStatus(403);
  jwt.verify(token, process.env.JWT_SECRET, (err, data) => {
    if (err) return res.sendStatus(403);
    req.userId = data.id;
    next();
  });
}

router.get('/', auth, async (req, res) => {
  const user = await User.findById(req.userId);
  res.json({ balance: user.balance });
});

router.post('/deposit', auth, async (req, res) => {
  const user = await User.findById(req.userId);
  user.balance += req.body.amount;
  await user.save();
  res.json({ balance: user.balance });
});

router.post('/bet', auth, async (req, res) => {
  const user = await User.findById(req.userId);
  const { amount } = req.body;
  if (user.balance < amount) return res.status(400).json({ error: 'Insufficient funds' });
  user.balance -= amount;
  await user.save();
  res.json({ balance: user.balance });
});

module.exports = router;
