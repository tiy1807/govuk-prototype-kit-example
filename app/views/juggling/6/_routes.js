const express = require('express')
const router = express.Router()

function getErrorNameFromID (id) {
  // Removes dashes and converts to camelcase and adds error to the front
  return 'error' + id.toLowerCase().split('-').map(function (word) {
    return word.replace(word[0], word[0].toUpperCase())
  }).join('')
}

function addError (errors, id, errorMessage, href = '') {
  errors.errorList.push({
    text: errorMessage,
    href: '#' + id + href
  })
  errors[getErrorNameFromID(id)] = { text: errorMessage }
}

function checkCompleted (req, errors, id, errorMessage) {
  if (!req.session.data[id]) {
    addError(errors, id, errorMessage)
  }
}

// Run this code when a form is submitted to 'juggling-balls-answer'
router.post('/juggling-balls-submit', function (req, res) {
  // Create a variable to hold the errors
  var error = { errorList: [] }

  checkCompleted(req, error, 'how-many-balls', 'Select the number of balls you can juggle')

  if (error.errorList.length > 0) {
    res.render(req.baseUrl.substring(1) + '/juggling-balls', error)
  } else {
    var howManyBalls = req.session.data['how-many-balls']
    // Check whether the variable matches a condition
    if (howManyBalls === '3 or more') {
      // Send user to next page
      res.redirect('juggling-trick')
    } else {
      // Send user to ineligible page
      res.redirect('ineligible')
    }
  }
})

router.post('/juggling-trick-submit', function (req, res) {
  // Create a variable to hold the errors
  var error = { errorList: [] }

  // Make a variable and give it the value from 'how-many-balls'
  checkCompleted(req, error, 'most-impressive-trick', 'Enter a description of your most impressive trick')

  var howManyBalls = req.session.data['most-impressive-trick']
  if (howManyBalls && howManyBalls.length < 10) {
    addError(error, 'most-impressive-trick', 'Juggling trick description must be 10 characters or more')
  }

  if (error.errorList.length > 0) {
    res.render(req.baseUrl.substring(1) + '/juggling-trick', error)
  } else {
    res.redirect('check-answers')
  }
})

module.exports = router
