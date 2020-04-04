const express = require('express')
const User = require('../models/user')
const auth = require ('../middlewares/auth')
const multer = require('multer')
const sharp = require('sharp')
const { sendWelcomeMail, sendGoodByeEmail } = require('../emails/account')
const router = new express.Router()
// GET USER PROFILE
router.get('/users/me', auth, async (req, res) => {
  res.send(req.user)
})
// USER LOGIN
router.post('/users/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password)
    const token = await user.generateAuthToken()
    res.send({ user, token })
  } catch (e) {
    res.status(400).send(e)
  }
})
// ADD A NEW USER (SINGUP)
router.post('/users', async (req, res) => {
  const user = new User(req.body)
  try {
    await user.save()
    sendWelcomeMail(user.email, user.name)
    const token = await user.generateAuthToken()
    res.send({ user, token })
  } catch (e) {
    res.status(400).send(e)
  }
})
// UPDATING A USER PROFILE
router.patch('/users/me', auth, async (req, res) => {
  const updates = Object.keys(req.body)
  const allowedUpdates = ['name', 'email', 'age', 'password']
  const isValidate = updates.every(update => allowedUpdates.includes(update))
  if (!isValidate) {
    return res.status(400).send({ error: 'Indalid updates!' })
  }

  try {
    const user = req.user
    updates.forEach(update => user[update] = req.body[update])
    await user.save()
    res.send(user)
  } catch (e) {
    res.status(400).send(e)
  }
})
// ADD AVATAR TO USER
const upload = multer({
  limits: {
    fileSize: 1000000
  },
  fileFilter (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|png|jpeg)$/)) {
      return cb(new Error('Please select a valid image!'))
    }
    cb(undefined, true)
  }
}) 
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
  const Buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
  req.user.avatar = Buffer
  await req.user.save()
  res.send()
}, (error, req, res, next) => {
  res.status(400).send({ error: error.message })
})
// GET USER AVATR
router.get('/users/:id/avatar', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)

    if (!user || !user.avatar) {
      throw new Error()
    }

    res.set('Content-Type', 'image/png')
    res.send(user.avatar)
  } catch (e) {
    res.status(404).send()
  }
})
// DELETE USER AVATAR
router.delete('/users/me/delete-avatar', auth, async (req, res) => {
  try {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
  } catch (e) {
    res.status(500).send(e)
  }
})
// LOGOUT FROM ONE SESSION
router.post('/users/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(token => {
      return token.token !== req.token
    })
    await req.user.save()
    res.send()
  } catch (e) {
    res.status(500).send()
  }
})
// LOGOUT FROM ALL SESSIONS
router.post('/users/logoutall', auth, async(req, res) => {
  try {
    req.user.tokens = []
    await req.user.save()
    res.send()
  } catch (e) {
    res.status(500).send()
  }
})
// DELETE A USER PROFILE
router.delete('/users/me', auth, async (req, res) => {
  try {
    await req.user.remove()
    sendGoodByeEmail(req.user.email, req.user.name)
    res.send(req.user)
  } catch (e) {
    res.status(500).send(e)
  }
})

module.exports = router
