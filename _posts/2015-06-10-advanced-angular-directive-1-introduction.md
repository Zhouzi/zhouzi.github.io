---
title: "Advanced Angular Directive #1: Introduction"
date: 2015-06-10 18:00:00
categories: javascript angular
---

Angular's directives allow you to add custom behaviour to DOM elements. The problem is that while the basics are pretty simple, some advanced tricks are not really straight forward. Soon enough you might find yourself hacking it to reach your goals. This serie is about showcasing "advanced tricks"[1](#advanced-tricks) to achieve almost everything the Angular-way.

A great example of an "advanced" directive is an autocomplete. Basically it is supposed to be used as an attribute on a text input and also need a template to display suggestions when typing. The thing is, the `template` option is not available when using a directive as an attribute since it can't modify the content of the element it is applied to. And even if it was possible, what would be supposed to happen? Should the template replace the content of the element? Inserted before, after? What if the element is an auto-closing tag, meaning it can't have children? For those obvious reasons, you will need to find another way.

On the other hand, the model must be updated when a user click on an item from the dropdown of suggestions. In most cases, those suggestions are going to be objects with several properties instead of being just plain strings. And yet, a text input has to display a value and not a whole object.

Hopefully there are clean ways to handle such cases and this serie is going to guide you through the usage of `$compile`, `$parse`, `$parsers`, `$formatters` and more.

## Setup

Before we get started, let's setup the scene. In this serie we will assume that we are in a case where an user needs to fill an input with the company he works for. For us, developers, a company is an object that have a name and an id. So we will be displaying the name of the company in the input while keeping a reference to the entire object in our model. We will also need to display a list of suggestions as the user types. Clicking on a suggestion will update the model accordingly.

For now, the code should look like:

{% highlight html %}
<div ng-app="app" ng-controller="demoController">
  <input type="text" ng-model="company" autocomplete>
</div>

<script>
  angular
    .module('app', [])
    .controller('demoController', [
      '$scope',
      function ($scope) {
        $scope.company = {};

        $scope.companies = [
          { id: 'acme', name: 'Acme' },
          { id: 'widget-corp', name: 'Widget Corp' }
        ];
      }
    ])
    .directive('autocomplete', [
      function () {
        return {
          restrict: 'A',
          link: function (scope, element, attrs) {}
        };
      }
    ])
  ;
</script>
{% endhighlight %}

*A working demo is available in this [jsFiddle](http://jsfiddle.net/nq5uwkfc/).*

We just created a new module with a "demo" controller that have two properties on the $scope: `company`, which stores user's input, and `companies` which contains a list of suggestions. We also created an empty autocomplete directive.

And that's all for this introduction! In the next article we will have a closer look at the `$compile` service to display the drop down.

---

<ol>
    <li id="advanced-tricks">
        By "advanced tricks" I mean stuff that I learned late and that I couldn't find much resources about.
    </li>
</ol>