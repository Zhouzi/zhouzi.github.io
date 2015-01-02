---
title: "The \"two-way data binding\" framework serie."
date: 2014-12-07 14:00:00
categories: javascript framework
---

There are tons of JavaScript frameworks that work toward "[two-way data binding](http://stackoverflow.com/questions/13504906/what-is-two-way-binding)" nowadays.

There are the unavoidable, largely used and production-ready:

* [AngularJS](https://angularjs.org/)
* [Knockout](http://knockoutjs.com/)
* [Backbone.js](http://backbonejs.org/)
* [Ember](http://emberjs.com/)

The trendy ones, attractively promising and already famous:

* [React](http://facebook.github.io/react/)
* [Polymer](https://www.polymer-project.org/)

And others that seems really interesting:

* [Knockback.js](http://kmalakoff.github.io/knockback/)
* [Ampersand.js](http://ampersandjs.com/)
* [Marionette](http://marionettejs.com/)
* [Chaplin](http://chaplinjs.org/)
* [Mithril](http://lhorie.github.io/mithril/)
* [Bacon.js](http://baconjs.github.io/)
* [RxJS](http://reactive-extensions.github.io/RxJS/)
* [ExtJS](http://www.sencha.com/products/extjs/)

They all have their pros and cons.
Some are really powerful with a complex architecture while others focus on simplicity and flexibility.
But it's hard to have an opinion simply based on the specs and what you can read about it.
The best way to determine which one fits best a project and its requirements is probably to actually try them out.
This is exactly what this serie is all about.
I am going to build a simple and basic app with different technologies.

_Note: The purpose of this serie is more about discovering and giving a try to those frameworks than evaluating their two-way data binding capabilities.
Some of them might not achieve it "natively"._

**Update:** I am maintaining a list of all javascript *frameworks* I come across [there](http://gabinaureche.com/javascript-framework-list).

# The "App"

The app is supposed to be a browser extension to bookmark a link to [Trello](https://trello.com/).
This is a supposition since I will not cover everything needed to build such an app.
For the sake of simplicity I will emulate ajax calls through `timeout`s.
I will also use data mockups and won't handle potential ajax errors.

On Trello you have boards that contains lists which contains cards.
So to create a card you have to select a list from a board.
A user might have a lots of lists and boards, this is why the app is going to load only what's needed.
Moreover, the data will be "cached" to avoid useless requests.

# A word of caution

I've been building several apps with [AngularJS](https://angularjs.org/) and for now it's my framework of choice.
This is why the first version will be built with angular so it serves as a reference.
That being said, I'll do my best to stay as objective as possible.
Please, also note that I'm going to discover most of the other frameworks through this serie.
So let me know if you find anything that could be improved, it would be much appreciated!

---

If you want to quickly compare the most famous frameworks through the same app, you should definitely take a look at [TodoMVC](http://todomvc.com/).