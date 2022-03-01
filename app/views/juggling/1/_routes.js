const express = require('express')
const router = express.Router()

// Run this code when a form is submitted to 'juggling-balls-answer'
router.post('/juggling-trick', function (req, res) {
  // Make a variable and give it the value from 'how-many-balls'
  var howManyBalls = req.session.data['how-many-balls']

  // Check whether the variable matches a condition
  if (howManyBalls === '3 or more') {
    // Send user to next page
    res.redirect('juggling-trick')
  } else {
    // Send user to ineligible page
    res.redirect('ineligible')
  }
})

module.exports = router