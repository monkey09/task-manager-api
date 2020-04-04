const express = require('express')
const Task = require('../models/task')
const auth = require('../middlewares/auth')
const router = new express.Router()
// GET ALL OR FILTERED TASKS
router.get('/tasks', auth, async (req, res) => {
  const match = {}
  const sort = {}
  if (req.query.completed) {
    match.completed = req.query.completed === 'true'
  }
  if (req.query.sortby) {
    const parts = req.query.sortby.split(':')
    sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
  }
  try {
    const user = req.user
    await user.populate({
      path: 'tasks',
      match,
      options: {
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip),
        sort
      },
    }).execPopulate()
    res.send(user.tasks)
  } catch (e) {
    res.status(500).send(e)
  }
})
// GET ONE TASK BY ID
router.get('/tasks/:id', auth, async (req, res) => {
  const _id = req.params.id

  try {
    const task = await Task.findOne({ _id, owner: req.user._id })
    if (!task) {
      return res.status(404).send()
    }
    res.send(task)
  } catch (e) {
    res.status(500).send(e)
  }
})
// ADD A NEW TASK
router.post('/tasks', auth, async (req, res) => {
  const task = new Task({
    ...req.body,
    'owner': req.user._id
  })

  try {
    await task.save()
    res.status(201).send(task)
  } catch (e) {
    res.status(400).send(e)
  }
})
// UPDATING A TASK BY ITS ID
router.patch('/tasks/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body)
  const allowedUpdates = ['description', 'completed']
  const isValidate = updates.every(update => allowedUpdates.includes(update))
  try {
    const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })
    if (!task) {
      return res.status(404).send()
    }
    if (!isValidate) {
      return res.status(400).send({ 'error': 'Invalid updates!' })
    }
    updates.forEach(update => task[update] = req.body[update])
    await task.save()
    res.send(task)
  } catch (e) {
    res.status(400).send(e)
  }
})
// DELETE TASK BY ITS ID
router.delete('/tasks/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })
    if (!task) {
      return res.status(404).send()
    }
    res.send(task)
  } catch (e) {
    res.status(500).send(e)
  }
})

module.exports = router
