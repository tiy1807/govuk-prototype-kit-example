const express = require('express')
const router = express.Router()

// Add your routes here - above the module.exports line
router.use('/juggling/current/', require('./views/juggling/current/_routes'))
router.use('/juggling/1/', require('./views/juggling/1/_routes'))

module.exports = router
