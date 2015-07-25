---
title: "Validate Forms At The Right Time, Using Browser's Native API"
date: 2015-07-25 16:00:00
categories: javascript form ux
---

I spent quite a time thinking about forms' design and the experience of filling them lately.
Making it simple and as pleasant as possible ain't that easy.
It actually involves lots of design considerations, as well as some "technical" knowledge.
Yet, they play an important role in a product and often drives conversion.
By building [GentleForm](https://github.com/Zhouzi/GentleForm), I'd like to offer an open source solution to those problems.
Something that people can work on together to establish a common knowledge base.

*Please note that this is not a tutorial but rather an article on GentleForm's design and behavior. A demo is available on [CodePen](http://codepen.io/Zhouzi/full/QbBzZp/) and the [documentation](https://github.com/Zhouzi/GentleForm) on GitHub.*

## Introduction

GentleForm is a javascript library focused on "validating forms at the right time, using browser's native api".
It's mostly about form validation that makes use of browser's native technologies and the "right time" to validate inputs.
Before we start discussing about user experience details, I'd like to first make the two preceding points clear.

### Form Validation

Validating an input is the act of checking that its value looks like expected.
Basically, an email should look like one and if it does then the input is valid, otherwise it's invalid.
In such case we need to inform the user that the value is wrong and ideally why.

Emails are probably the first example that comes to mind but there's some other html attributes you can use to validate an input.
For example, you can ensure that a value is comprised between a minimum and a maximum, use a regular expression for advanced inputs and make a field required, among other things.
Which leads us to...

### Browser's Native API

Along with those attributes, form elements also have some special properties and methods.
Checking an element's validity is as easy as calling `element.checkValidity()`.
Form elements also have a "validity" object that contains and the possible and actual reasons of its validity/invalidity.
You can access it through `element.validity`.
As an example, an email's input that is properly filled will have its `element.validity.typeMismatch` set to `false`.
There are already some really interesting article on the subject so I won't dig deeper but rather advice you to have look at those resources:

* [JavaScript and the Constraint Validation API](http://www.sitepoint.com/html5-forms-javascript-constraint-validation-api/)
* [Constraint Validation: Native Client Side Validation for Web Forms](http://www.html5rocks.com/en/tutorials/forms/constraintvalidation/)

## The Right Time = When It Makes Sense

Checking an input's validity is pretty simple and with that knowledge we are able to hide/show error messages.
The next question is, when should we do that?
When should we actually warn the user about an error?
This is where things tends to get trickier.

Obviously, we don't want to display error messages on page load.
Meaning that when the form first appears, everything should look ok.
No error messages nor reddish inputs.
In fact, it makes more sense to display an error message after the user interacted with the input.
When he actually tried to fill it with the data he thought was correct.
But then, when can we consider that he's done?

When building GentleForm, I assumed that the user was done interacting with an input when:

1. He set focus on the field (by whether clicking in it, using the tab key or whatever)
2. He typed something
3. He removed the focus from the field (blur event)

At this time, the input is validated, its state is updated and the relevant error messages are shown/hided.
When those three conditions are fulfilled, the element's `interacted` state is set to `true`.
This state causes the validation to go "real time".
So if the user made a mistake when typing his email address, we want to hide the error messages as soon as he fixes it.

However, there is a case where we want to validate an input despite its state: on form submission.
The thing is, the user could miss a field and try to submit the form.
In this case, he should be well aware of what's wrong and how to fix it.
This is why a form's submit event is also a trigger to the validation of all of its children.

And that's it for the short theoretical introduction to GentleForm.
I made a lot of experiments and decisions when building it but I might have missed something so feel free to [submit an issue](https://github.com/Zhouzi/GentleForm/issues) if you have any idea on how we could improve it.
There's also more to come, like support for aria attributes and cached templates so stay tuned.