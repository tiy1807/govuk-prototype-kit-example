const express = require('express')
const router = express.Router()

function getErrorNameFromID(id) {
    // Removes dashes and converts to camelcase and adds error to the front
    return "error" + id.toLowerCase().split('-').map(function(word) {
      return word.replace(word[0], word[0].toUpperCase());
    }).join('');
}

function addError(errors, id, errorMessage, href="") {
  errors.errorList.push({
      text: errorMessage,
      href: "#" + id + href
      })
  errors[getErrorNameFromID(id)] = {text: errorMessage}
}

function checkCompleted(req, errors, id, errorMessage) {
  if (!req.session.data[id]) {
    addError(errors, id, errorMessage)
  }
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function convertIDToAttributeName(id) {
    return id.toLowerCase().split('-').map(function(word) {
      return word.replace(word[0], word[0].toUpperCase());
    }).join('');
}

function checkDateCompleted(req, errors, id, dateName) {
    let day = req.session.data[id + '-day'];
    let month = req.session.data[id + '-month'];
    let year = req.session.data[id + '-year'];

    if (day && month && year) {
        // The date is complete, there's a value in each field
        var regExp = /^[0-9]*$/;

        if (!regExp.test(day) || !regExp.test(month) || !regExp.test(year)) {
            // Add an error if any input has characters that aren't numbers in the input
            addError(errors, id, capitalizeFirstLetter(dateName) + " must be a real date")
            if (!regExp.test(day)) {
                errors["error" + convertIDToAttributeName(id)].dayError = " govuk-input-error"
            }
            if (!regExp.test(month)) {
                errors["error" + convertIDToAttributeName(id)].monthError = " govuk-input-error"
            }
            if (!regExp.test(year)) {
                errors["error" + convertIDToAttributeName(id)].yearError = " govuk-input-error"
            }
        }
        else
        {
            // All inputs are numbers
            dayValue = parseInt(day)
            monthValue = parseInt(month)
            yearValue = parseInt(year)
            currentYear = new Date().getFullYear()

            if ((month > 12) ||
                (dayValue > 29 && monthValue == 2) ||
                (dayValue > 30 && [4, 6, 9, 11].includes(monthValue)) ||
                (dayValue > 31 && [1, 3, 5, 7, 8, 10, 12].includes(monthValue)) ||
                (yearValue < (currentYear - 120))) {
                addError(errors, id, capitalizeFirstLetter(dateName) + " must be a real date")
                if (monthValue > 12) {
                    errors["error" + convertIDToAttributeName(id)].monthError = " govuk-input--error"
                }
                if ((dayValue > 29 && monthValue == 2) ||
                    (dayValue > 30 && [4, 6, 9, 11].includes(monthValue)) ||
                    (dayValue > 31 && [1, 3, 5, 7, 8, 10, 12].includes(monthValue))) {
                    errors["error" + convertIDToAttributeName(id)].dayError = " govuk-input--error"
                }
                if (yearValue < (currentYear - 120)) {
                    errors["error" + convertIDToAttributeName(id)].yearError = " govuk-input--error"
                }
            }
        }
    } else {
        // At least one input is empty
        let missingValues = []
        if (!day) {
            missingValues.push("day")
        }
        if (!month) {
            missingValues.push("month")
        }
        if (!year) {
            missingValues.push("year")
        }
        if (!day && !month && !year) {
            // All the fields are empty
            addError(errors, id, "Enter " + dateName, "-day")
        } else {
            missingString = missingValues.join(' and ')
            addError(errors, id, capitalizeFirstLetter(dateName) + " must include a " + missingString, "-day")
        }
        if (!day) {
            errors["error" + convertIDToAttributeName(id)].dayError = " govuk-input--error"
        }
        if (!month) {
            errors["error" + convertIDToAttributeName(id)].monthError = " govuk-input--error"
        }
        if (!year) {
            errors["error" + convertIDToAttributeName(id)].yearError = " govuk-input--error"
        }
    }
}

function checkDateFuture(req, errors, id, dateName, allowToday) {
    let day = req.session.data[id + '-day'];
    let month = req.session.data[id + '-month'];
    let year = req.session.data[id + '-year'];

    today = new Date();
    enteredDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

    if ((allowToday && (enteredDate <= today)) || (!allowToday && (enteredDate < today))) {
        if (allowToday) {
            addError(errors, id, capitalizeFirstLetter(dateName) + " must be today or in the future", "-day")
        } else {
            addError(errors, id, capitalizeFirstLetter(dateName) + " must be in the future", "-day")
        }
        errors["error" + convertIDToAttributeName(id)].dayError = " govuk-input--error"
        errors["error" + convertIDToAttributeName(id)].monthError = " govuk-input--error"
        errors["error" + convertIDToAttributeName(id)].yearError = " govuk-input--error"
    }
}

function checkDatePast(req, errors, id, dateName, allowToday) {
    let day = req.session.data[id + '-day'];
    let month = req.session.data[id + '-month'];
    let year = req.session.data[id + '-year'];

    today = new Date();
    enteredDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

    if ((allowToday && (enteredDate >= today)) || (!allowToday && (enteredDate > today))) {
        if (allowToday) {
            addError(errors, id, capitalizeFirstLetter(dateName) + " must be today or in the past", "-day")
        } else {
            addError(errors, id, capitalizeFirstLetter(dateName) + " must be in the past", "-day")
        }
        errors["error" + convertIDToAttributeName(id)].dayError = " govuk-input--error"
        errors["error" + convertIDToAttributeName(id)].monthError = " govuk-input--error"
        errors["error" + convertIDToAttributeName(id)].yearError = " govuk-input--error"
    }
}

// Run this code when a form is submitted to 'juggling-balls-answer'
router.post('/juggling-balls-submit', function (req, res) {
  // Create a variable to hold the errors
  var error = {errorList: []}

  checkCompleted(req, error, 'how-many-balls', "Select the number of balls you can juggle")

  if (error.errorList.length > 0) {
    res.render(req.baseUrl.substring(1) + '/juggling-balls', error)
  } else {
      var howManyBalls = req.session.data['how-many-balls']
      // Check whether the variable matches a condition
      if (howManyBalls == "3 or more"){
        // Send user to next page
        res.redirect('juggling-trick')
      } else if (howManyBalls = "1 or 2") {
        // Send user to reminder page
        res.redirect('reminder')
      } else if (howManyBallys = "None - I cannot juggle") {
        res.redirect('ineligible')
      }
  }
})

router.post('/juggling-trick-submit', function (req, res) {
  // Create a variable to hold the errors
  var error = {errorList: []}

  // Make a variable and give it the value from 'how-many-balls'
  checkCompleted(req, error, 'most-impressive-trick', "Enter a description of your most impressive trick")

  var howManyBalls = req.session.data['most-impressive-trick']
  if (howManyBalls && howManyBalls.length < 10) {
    addError(error, 'most-impressive-trick', "Juggling trick description must be 10 characters or more")
  }

  if (error.errorList.length > 0) {
    res.render(req.baseUrl.substring(1) + '/juggling-trick', error)
  } else {
    res.redirect('check-answers')
  }
})

router.post('/reminder-submit', function (req, res) {
  // Create a variable to hold the errors
  var error = {errorList: []}

  // Make a variable and give it the value from 'how-many-balls'
  checkCompleted(req, error, 'reminder', "Select yes if you'd like a reminder to apply for a juggling licence")

  if (error.errorList.length > 0) {
    res.render(req.baseUrl.substring(1) + '/reminder', error)
  } else {
    var reminder = req.session.data['reminder']

    if (reminder == "Yes") {
      res.redirect('reminder-details')
    } else {
      res.redirect('check-answers')
    }
  }
})

router.post('/reminder-details-submit', function (req, res) {
  // Create a variable to hold the errors
  var error = {errorList: []}

  // Make a variable and give it the value from 'how-many-balls'
  checkCompleted(req, error, 'contact', "Select a contact method")

  if (req.session.data['contact'] == "email") {
    checkCompleted(req, error, 'contact-by-email', 'Enter an email address')
  } else if (req.session.data['contact'] == "phone") {
    checkCompleted(req, error, 'contact-by-phone', 'Enter a phone number')
  } else {
    checkCompleted(req, error, 'contact-by-text', 'Enter a mobile phone number')
  }

  checkDateCompleted(req, error, 'reminder-date', 'reminder date')
  checkDateFuture(req, error, 'reminder-date', 'reminder date')

  if (error.errorList.length > 0) {
    res.render(req.baseUrl.substring(1) + '/reminder-details', error)
  } else {
    res.redirect('check-answers')
  }
})

module.exports = router