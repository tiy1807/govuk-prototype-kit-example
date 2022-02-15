const express = require('express')
const router = express.Router()

function getErrorNameFromID(id) {
    // Removes dashes and converts to camelcase and adds error to the front
    return "error" + id.toLowerCase().split('-').map(function(word) {
      return word.replace(word[0], word[0].toUpperCase());
    }).join('');
}

// Run this code when a form is submitted to 'juggling-balls-answer'
router.post('/juggling-balls-submit', function (req, res) {
  // Create a variable to hold the errors
  var error = {errorList: []}

  // Make a variable and give it the value from 'how-many-balls'
  var id = "how-many-balls"
  var howManyBalls = req.session.data[id]

  if (!howManyBalls) {
    var errorMessage = "Select the number of balls you can juggle"
    error.errorList.push({
      text: errorMessage,
      href: "#how-many-balls"
      })
    error[getErrorNameFromID(id)] = {text: errorMessage}
  }

  if (error.errorList.length > 0) {
    res.render(req.baseUrl.substring(1) + '/juggling-balls', error)
  } else {
      // Check whether the variable matches a condition
      if (howManyBalls == "3 or more"){
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
  var error = {errorList: []}

  // Make a variable and give it the value from 'how-many-balls'
  var id = "most-impressive-trick"
  var mostImpressiveTrick = req.session.data[id]

  if (!mostImpressiveTrick) {
    var errorMessage = "Enter a description of your most impressive trick"
    error.errorList.push({
      text: errorMessage,
      href: "#" + id
      })
    error[getErrorNameFromID(id)] = {text: errorMessage}
  }

  if (error.errorList.length > 0) {
    res.render(req.baseUrl.substring(1) + '/juggling-trick', error)
  } else {
    res.redirect('check-answers')
  }
})

module.exports = router