---
title: "The \"two way data binding\" framework serie."
date: 2014-12-02 14:00:00
categories: javascript framework
---

There are tons of JavaScript frameworks that works toward "[two way data binding](https://docs.angularjs.org/guide/databinding)" nowadays.
They all have their pros and cons, some being more famous than others.
But it's hard to have an opinion simply based on what you can read on the web.
The best way is probably to actually try them out and this is exactly what this serie is about.
I am going to build the same app several times but with different frameworks.
Here are the ones I'm currently planning to experiment:

* [AngularJS](https://angularjs.org/)
* [Knockout](http://knockoutjs.com/)
* [Backbone.js](http://backbonejs.org/)
* [Ember](http://emberjs.com/)

_I may add some others to the list as it comes along._

# The "App"

The app is supposed to be a browser extension to bookmark a link to [Trello](https://trello.com/).
This is a supposition since I will not cover everything needed to build such an app.
For the sake of simplicity I will emulate ajax calls through `timeout`s.
I will also use data mockups and won't handle potential ajax errors.

The user will have to a select a board and then a list so he's able to save a card.
Here are the steps:

1. Load user boards.
2. When a board is selected, load its lists **if needed**.
3. The save button is disabled until user picked a board and a list.

Additionally, the user will be informed whether the app is loading or saving.

**Note:** the card is created on the app's init.
In a real case it would contain the page's title and description.

# A word of caution

I've been building several apps with [AngularJS](https://angularjs.org/) and I feel pretty much familiar with it.
This is why the first version will be built with angular so it serves as a reference.
That been said, I'll do my best to stay as objective as possible.
Please, also note that I'm going to discover most of the other frameworks through this serie.
So let me know if you find anything that could be improved, it would be much appreciated!

---

If you want to quickly compare the most famous frameworks through the same app, you should definitely take a look at [TodoMVC](http://todomvc.com/).