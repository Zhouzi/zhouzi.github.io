/*jshint globalstrict:true*/
/*global angular:false*/
'use strict';

var isDefined = angular.isDefined,
    isFunction = angular.isFunction,
    isString = angular.isString,
    isObject = angular.isObject,
    isArray = angular.isArray,
    forEach = angular.forEach,
    extend = angular.extend,
    copy = angular.copy;

function inherit(parent, extra) {
    return extend(new (extend(function() {}, { prototype: parent }))(), extra);
}

function merge(dst) {
    forEach(arguments, function(obj) {
        if (obj !== dst) {
            forEach(obj, function(value, key) {
                if (!dst.hasOwnProperty(key)) dst[key] = value;
            });
        }
    });
    return dst;
}

/**
 * Finds the common ancestor path between two states.
 *
 * @param {Object} first The first state.
 * @param {Object} second The second state.
 * @return {Array} Returns an array of state names in descending order, not including the root.
 */
function ancestors(first, second) {
    var path = [];

    for (var n in first.path) {
        if (first.path[n] !== second.path[n]) break;
        path.push(first.path[n]);
    }
    return path;
}

/**
 * IE8-safe wrapper for `Object.keys()`.
 *
 * @param {Object} object A JavaScript object.
 * @return {Array} Returns the keys of the object as an array.
 */
function objectKeys(object) {
    if (Object.keys) {
        return Object.keys(object);
    }
    var result = [];

    forEach(object, function(val, key) {
        result.push(key);
    });
    return result;
}

/**
 * IE8-safe wrapper for `Array.prototype.indexOf()`.
 *
 * @param {Array} array A JavaScript array.
 * @param {*} value A value to search the array for.
 * @return {Number} Returns the array index value of `value`, or `-1` if not present.
 */
function indexOf(array, value) {
    if (Array.prototype.indexOf) {
        return array.indexOf(value, Number(arguments[2]) || 0);
    }
    var len = array.length >>> 0, from = Number(arguments[2]) || 0;
    from = (from < 0) ? Math.ceil(from) : Math.floor(from);

    if (from < 0) from += len;

    for (; from < len; from++) {
        if (from in array && array[from] === value) return from;
    }
    return -1;
}

/**
 * Merges a set of parameters with all parameters inherited between the common parents of the
 * current state and a given destination state.
 *
 * @param {Object} currentParams The value of the current state parameters ($stateParams).
 * @param {Object} newParams The set of parameters which will be composited with inherited params.
 * @param {Object} $current Internal definition of object representing the current state.
 * @param {Object} $to Internal definition of object representing state to transition to.
 */
function inheritParams(currentParams, newParams, $current, $to) {
    var parents = ancestors($current, $to), parentParams, inherited = {}, inheritList = [];

    for (var i in parents) {
        if (!parents[i].params) continue;
        parentParams = objectKeys(parents[i].params);
        if (!parentParams.length) continue;

        for (var j in parentParams) {
            if (indexOf(inheritList, parentParams[j]) >= 0) continue;
            inheritList.push(parentParams[j]);
            inherited[parentParams[j]] = currentParams[parentParams[j]];
        }
    }
    return extend({}, inherited, newParams);
}

/**
 * Performs a non-strict comparison of the subset of two objects, defined by a list of keys.
 *
 * @param {Object} a The first object.
 * @param {Object} b The second object.
 * @param {Array} keys The list of keys within each object to compare. If the list is empty or not specified,
 *                     it defaults to the list of keys in `a`.
 * @return {Boolean} Returns `true` if the keys match, otherwise `false`.
 */
function equalForKeys(a, b, keys) {
    if (!keys) {
        keys = [];
        for (var n in a) keys.push(n); // Used instead of Object.keys() for IE8 compatibility
    }

    for (var i=0; i<keys.length; i++) {
        var k = keys[i];
        if (a[k] != b[k]) return false; // Not '===', values aren't necessarily normalized
    }
    return true;
}

/**
 * Returns the subset of an object, based on a list of keys.
 *
 * @param {Array} keys
 * @param {Object} values
 * @return {Boolean} Returns a subset of `values`.
 */
function filterByKeys(keys, values) {
    var filtered = {};

    forEach(keys, function (name) {
        filtered[name] = values[name];
    });
    return filtered;
}

// like _.indexBy
// when you know that your index values will be unique, or you want last-one-in to win
function indexBy(array, propName) {
    var result = {};
    forEach(array, function(item) {
        result[item[propName]] = item;
    });
    return result;
}

// extracted from underscore.js
// Return a copy of the object only containing the whitelisted properties.
function pick(obj) {
    var copy = {};
    var keys = Array.prototype.concat.apply(Array.prototype, Array.prototype.slice.call(arguments, 1));
    forEach(keys, function(key) {
        if (key in obj) copy[key] = obj[key];
    });
    return copy;
}

// extracted from underscore.js
// Return a copy of the object omitting the blacklisted properties.
function omit(obj) {
    var copy = {};
    var keys = Array.prototype.concat.apply(Array.prototype, Array.prototype.slice.call(arguments, 1));
    for (var key in obj) {
        if (indexOf(keys, key) == -1) copy[key] = obj[key];
    }
    return copy;
}

function pluck(collection, key) {
    var result = isArray(collection) ? [] : {};

    forEach(collection, function(val, i) {
        result[i] = isFunction(key) ? key(val) : val[key];
    });
    return result;
}

function filter(collection, callback) {
    var array = isArray(collection);
    var result = array ? [] : {};
    forEach(collection, function(val, i) {
        if (callback(val, i)) {
            result[array ? result.length : i] = val;
        }
    });
    return result;
}

function map(collection, callback) {
    var result = isArray(collection) ? [] : {};

    forEach(collection, function(val, i) {
        result[i] = callback(val, i);
    });
    return result;
}

/**
 * @ngdoc overview
 * @name ui.router.util
 *
 * @description
 * # ui.router.util sub-module
 *
 * This module is a dependency of other sub-modules. Do not include this module as a dependency
 * in your angular app (use {@link ui.router} module instead).
 *
 */
angular.module('ui.router.util', ['ng']);

/**
 * @ngdoc overview
 * @name ui.router.router
 *
 * @requires ui.router.util
 *
 * @description
 * # ui.router.router sub-module
 *
 * This module is a dependency of other sub-modules. Do not include this module as a dependency
 * in your angular app (use {@link ui.router} module instead).
 */
angular.module('ui.router.router', ['ui.router.util']);

/**
 * @ngdoc overview
 * @name ui.router.state
 *
 * @requires ui.router.router
 * @requires ui.router.util
 *
 * @description
 * # ui.router.state sub-module
 *
 * This module is a dependency of the main ui.router module. Do not include this module as a dependency
 * in your angular app (use {@link ui.router} module instead).
 *
 */
angular.module('ui.router.state', ['ui.router.router', 'ui.router.util']);

/**
 * @ngdoc overview
 * @name ui.router
 *
 * @requires ui.router.state
 *
 * @description
 * # ui.router
 *
 * ## The main module for ui.router
 * There are several sub-modules included with the ui.router module, however only this module is needed
 * as a dependency within your angular app. The other modules are for organization purposes.
 *
 * The modules are:
 * * ui.router - the main "umbrella" module
 * * ui.router.router -
 *
 * *You'll need to include **only** this module as the dependency within your angular app.*
 *
 * <pre>
 * <!doctype html>
 * <html ng-app="myApp">
 * <head>
 *   <script src="js/angular.js"></script>
 *   <!-- Include the ui-router script -->
 *   <script src="js/angular-ui-router.min.js"></script>
 *   <script>
 *     // ...and add 'ui.router' as a dependency
 *     var myApp = angular.module('myApp', ['ui.router']);
 *   </script>
 * </head>
 * <body>
 * </body>
 * </html>
 * </pre>
 */
angular.module('ui.router', ['ui.router.state']);

angular.module('ui.router.compat', ['ui.router']);

/**
 * @ngdoc object
 * @name ui.router.util.$resolve
 *
 * @requires $q
 * @requires $injector
 *
 * @description
 * Manages resolution of (acyclic) graphs of promises.
 */
$Resolve.$inject = ['$q', '$injector'];
function $Resolve(  $q,    $injector) {

    var VISIT_IN_PROGRESS = 1,
        VISIT_DONE = 2,
        NOTHING = {},
        NO_DEPENDENCIES = [],
        NO_LOCALS = NOTHING,
        NO_PARENT = extend($q.when(NOTHING), { $$promises: NOTHING, $$values: NOTHING });


    /**
     * @ngdoc function
     * @name ui.router.util.$resolve#study
     * @methodOf ui.router.util.$resolve
     *
     * @description
     * Studies a set of invocables that are likely to be used multiple times.
     * <pre>
     * $resolve.study(invocables)(locals, parent, self)
     * </pre>
     * is equivalent to
     * <pre>
     * $resolve.resolve(invocables, locals, parent, self)
     * </pre>
     * but the former is more efficient (in fact `resolve` just calls `study`
     * internally).
     *
     * @param {object} invocables Invocable objects
     * @return {function} a function to pass in locals, parent and self
     */
    this.study = function (invocables) {
        if (!isObject(invocables)) throw new Error("'invocables' must be an object");
        var invocableKeys = objectKeys(invocables || {});

        // Perform a topological sort of invocables to build an ordered plan
        var plan = [], cycle = [], visited = {};
        function visit(value, key) {
            if (visited[key] === VISIT_DONE) return;

            cycle.push(key);
            if (visited[key] === VISIT_IN_PROGRESS) {
                cycle.splice(0, indexOf(cycle, key));
                throw new Error("Cyclic dependency: " + cycle.join(" -> "));
            }
            visited[key] = VISIT_IN_PROGRESS;

            if (isString(value)) {
                plan.push(key, [ function() { return $injector.get(value); }], NO_DEPENDENCIES);
            } else {
                var params = $injector.annotate(value);
                forEach(params, function (param) {
                    if (param !== key && invocables.hasOwnProperty(param)) visit(invocables[param], param);
                });
                plan.push(key, value, params);
            }

            cycle.pop();
            visited[key] = VISIT_DONE;
        }
        forEach(invocables, visit);
        invocables = cycle = visited = null; // plan is all that's required

        function isResolve(value) {
            return isObject(value) && value.then && value.$$promises;
        }

        return function (locals, parent, self) {
            if (isResolve(locals) && self === undefined) {
                self = parent; parent = locals; locals = null;
            }
            if (!locals) locals = NO_LOCALS;
            else if (!isObject(locals)) {
                throw new Error("'locals' must be an object");
            }
            if (!parent) parent = NO_PARENT;
            else if (!isResolve(parent)) {
                throw new Error("'parent' must be a promise returned by $resolve.resolve()");
            }

            // To complete the overall resolution, we have to wait for the parent
            // promise and for the promise for each invokable in our plan.
            var resolution = $q.defer(),
                result = resolution.promise,
                promises = result.$$promises = {},
                values = extend({}, locals),
                wait = 1 + plan.length/3,
                merged = false;

            function done() {
                // Merge parent values we haven't got yet and publish our own $$values
                if (!--wait) {
                    if (!merged) merge(values, parent.$$values);
                    result.$$values = values;
                    result.$$promises = result.$$promises || true; // keep for isResolve()
                    delete result.$$inheritedValues;
                    resolution.resolve(values);
                }
            }

            function fail(reason) {
                result.$$failure = reason;
                resolution.reject(reason);
            }

            // Short-circuit if parent has already failed
            if (isDefined(parent.$$failure)) {
                fail(parent.$$failure);
                return result;
            }

            if (parent.$$inheritedValues) {
                merge(values, omit(parent.$$inheritedValues, invocableKeys));
            }

            // Merge parent values if the parent has already resolved, or merge
            // parent promises and wait if the parent resolve is still in progress.
            extend(promises, parent.$$promises);
            if (parent.$$values) {
                merged = merge(values, omit(parent.$$values, invocableKeys));
                result.$$inheritedValues = omit(parent.$$values, invocableKeys);
                done();
            } else {
                if (parent.$$inheritedValues) {
                    result.$$inheritedValues = omit(parent.$$inheritedValues, invocableKeys);
                }
                parent.then(done, fail);
            }

            // Process each invocable in the plan, but ignore any where a local of the same name exists.
            for (var i=0, ii=plan.length; i<ii; i+=3) {
                if (locals.hasOwnProperty(plan[i])) done();
                else invoke(plan[i], plan[i+1], plan[i+2]);
            }

            function invoke(key, invocable, params) {
                // Create a deferred for this invocation. Failures will propagate to the resolution as well.
                var invocation = $q.defer(), waitParams = 0;
                function onfailure(reason) {
                    invocation.reject(reason);
                    fail(reason);
                }
                // Wait for any parameter that we have a promise for (either from parent or from this
                // resolve; in that case study() will have made sure it's ordered before us in the plan).
                forEach(params, function (dep) {
                    if (promises.hasOwnProperty(dep) && !locals.hasOwnProperty(dep)) {
                        waitParams++;
                        promises[dep].then(function (result) {
                            values[dep] = result;
                            if (!(--waitParams)) proceed();
                        }, onfailure);
                    }
                });
                if (!waitParams) proceed();
                function proceed() {
                    if (isDefined(result.$$failure)) return;
                    try {
                        invocation.resolve($injector.invoke(invocable, self, values));
                        invocation.promise.then(function (result) {
                            values[key] = result;
                            done();
                        }, onfailure);
                    } catch (e) {
                        onfailure(e);
                    }
                }
                // Publish promise synchronously; invocations further down in the plan may depend on it.
                promises[key] = invocation.promise;
            }

            return result;
        };
    };

    /**
     * @ngdoc function
     * @name ui.router.util.$resolve#resolve
     * @methodOf ui.router.util.$resolve
     *
     * @description
     * Resolves a set of invocables. An invocable is a function to be invoked via
     * `$injector.invoke()`, and can have an arbitrary number of dependencies.
     * An invocable can either return a value directly,
     * or a `$q` promise. If a promise is returned it will be resolved and the
     * resulting value will be used instead. Dependencies of invocables are resolved
     * (in this order of precedence)
     *
     * - from the specified `locals`
     * - from another invocable that is part of this `$resolve` call
     * - from an invocable that is inherited from a `parent` call to `$resolve`
     *   (or recursively
     * - from any ancestor `$resolve` of that parent).
     *
     * The return value of `$resolve` is a promise for an object that contains
     * (in this order of precedence)
     *
     * - any `locals` (if specified)
     * - the resolved return values of all injectables
     * - any values inherited from a `parent` call to `$resolve` (if specified)
     *
     * The promise will resolve after the `parent` promise (if any) and all promises
     * returned by injectables have been resolved. If any invocable
     * (or `$injector.invoke`) throws an exception, or if a promise returned by an
     * invocable is rejected, the `$resolve` promise is immediately rejected with the
     * same error. A rejection of a `parent` promise (if specified) will likewise be
     * propagated immediately. Once the `$resolve` promise has been rejected, no
     * further invocables will be called.
     *
     * Cyclic dependencies between invocables are not permitted and will caues `$resolve`
     * to throw an error. As a special case, an injectable can depend on a parameter
     * with the same name as the injectable, which will be fulfilled from the `parent`
     * injectable of the same name. This allows inherited values to be decorated.
     * Note that in this case any other injectable in the same `$resolve` with the same
     * dependency would see the decorated value, not the inherited value.
     *
     * Note that missing dependencies -- unlike cyclic dependencies -- will cause an
     * (asynchronous) rejection of the `$resolve` promise rather than a (synchronous)
     * exception.
     *
     * Invocables are invoked eagerly as soon as all dependencies are available.
     * This is true even for dependencies inherited from a `parent` call to `$resolve`.
     *
     * As a special case, an invocable can be a string, in which case it is taken to
     * be a service name to be passed to `$injector.get()`. This is supported primarily
     * for backwards-compatibility with the `resolve` property of `$routeProvider`
     * routes.
     *
     * @param {object} invocables functions to invoke or
     * `$injector` services to fetch.
     * @param {object} locals  values to make available to the injectables
     * @param {object} parent  a promise returned by another call to `$resolve`.
     * @param {object} self  the `this` for the invoked methods
     * @return {object} Promise for an object that contains the resolved return value
     * of all invocables, as well as any inherited and local values.
     */
    this.resolve = function (invocables, locals, parent, self) {
        return this.study(invocables)(locals, parent, self);
    };
}

angular.module('ui.router.util').service('$resolve', $Resolve);


/**
 * @ngdoc object
 * @name ui.router.state.$stateProvider
 *
 * @requires ui.router.router.$urlRouterProvider
 * @requires ui.router.util.$urlMatcherFactoryProvider
 *
 * @description
 * The new `$stateProvider` works similar to Angular's v1 router, but it focuses purely
 * on state.
 *
 * A state corresponds to a "place" in the application in terms of the overall UI and
 * navigation. A state describes (via the controller / template / view properties) what
 * the UI looks like and does at that place.
 *
 * States often have things in common, and the primary way of factoring out these
 * commonalities in this model is via the state hierarchy, i.e. parent/child states aka
 * nested states.
 *
 * The `$stateProvider` provides interfaces to declare these states for your app.
 */
$StateProvider.$inject = ['$urlRouterProvider', '$urlMatcherFactoryProvider'];
function $StateProvider(   $urlRouterProvider,   $urlMatcherFactory) {

    var root, states = {}, $state, queue = {}, abstractKey = 'abstract';

    // Builds state properties from definition passed to registerState()
    var stateBuilder = {

        // Derive parent state from a hierarchical name only if 'parent' is not explicitly defined.
        // state.children = [];
        // if (parent) parent.children.push(state);
        parent: function(state) {
            if (isDefined(state.parent) && state.parent) return findState(state.parent);
            // regex matches any valid composite state name
            // would match "contact.list" but not "contacts"
            var compositeName = /^(.+)\.[^.]+$/.exec(state.name);
            return compositeName ? findState(compositeName[1]) : root;
        },

        // inherit 'data' from parent and override by own values (if any)
        data: function(state) {
            if (state.parent && state.parent.data) {
                state.data = state.self.data = extend({}, state.parent.data, state.data);
            }
            return state.data;
        },

        // Build a URLMatcher if necessary, either via a relative or absolute URL
        url: function(state) {
            var url = state.url, config = { params: state.params || {} };

            if (isString(url)) {
                if (url.charAt(0) == '^') return $urlMatcherFactory.compile(url.substring(1), config);
                return (state.parent.navigable || root).url.concat(url, config);
            }

            if (!url || $urlMatcherFactory.isMatcher(url)) return url;
            throw new Error("Invalid url '" + url + "' in state '" + state + "'");
        },

        // Keep track of the closest ancestor state that has a URL (i.e. is navigable)
        navigable: function(state) {
            return state.url ? state : (state.parent ? state.parent.navigable : null);
        },

        // Own parameters for this state. state.url.params is already built at this point. Create and add non-url params
        ownParams: function(state) {
            var params = state.url && state.url.params || new $$UMFP.ParamSet();
            forEach(state.params || {}, function(config, id) {
                if (!params[id]) params[id] = new $$UMFP.Param(id, null, config, "config");
            });
            return params;
        },

        // Derive parameters for this state and ensure they're a super-set of parent's parameters
        params: function(state) {
            return state.parent && state.parent.params ? extend(state.parent.params.$$new(), state.ownParams) : new $$UMFP.ParamSet();
        },

        // If there is no explicit multi-view configuration, make one up so we don't have
        // to handle both cases in the view directive later. Note that having an explicit
        // 'views' property will mean the default unnamed view properties are ignored. This
        // is also a good time to resolve view names to absolute names, so everything is a
        // straight lookup at link time.
        views: function(state) {
            var views = {};

            forEach(isDefined(state.views) ? state.views : { '': state }, function (view, name) {
                if (name.indexOf('@') < 0) name += '@' + state.parent.name;
                views[name] = view;
            });
            return views;
        },

        // Keep a full path from the root down to this state as this is needed for state activation.
        path: function(state) {
            return state.parent ? state.parent.path.concat(state) : []; // exclude root from path
        },

        // Speed up $state.contains() as it's used a lot
        includes: function(state) {
            var includes = state.parent ? extend({}, state.parent.includes) : {};
            includes[state.name] = true;
            return includes;
        },

        $delegates: {}
    };

    function isRelative(stateName) {
        return stateName.indexOf(".") === 0 || stateName.indexOf("^") === 0;
    }

    function findState(stateOrName, base) {
        if (!stateOrName) return undefined;

        var isStr = isString(stateOrName),
            name  = isStr ? stateOrName : stateOrName.name,
            path  = isRelative(name);

        if (path) {
            if (!base) throw new Error("No reference point given for path '"  + name + "'");
            base = findState(base);

            var rel = name.split("."), i = 0, pathLength = rel.length, current = base;

            for (; i < pathLength; i++) {
                if (rel[i] === "" && i === 0) {
                    current = base;
                    continue;
                }
                if (rel[i] === "^") {
                    if (!current.parent) throw new Error("Path '" + name + "' not valid for state '" + base.name + "'");
                    current = current.parent;
                    continue;
                }
                break;
            }
            rel = rel.slice(i).join(".");
            name = current.name + (current.name && rel ? "." : "") + rel;
        }
        var state = states[name];

        if (state && (isStr || (!isStr && (state === stateOrName || state.self === stateOrName)))) {
            return state;
        }
        return undefined;
    }

    function queueState(parentName, state) {
        if (!queue[parentName]) {
            queue[parentName] = [];
        }
        queue[parentName].push(state);
    }

    function flushQueuedChildren(parentName) {
        var queued = queue[parentName] || [];
        while(queued.length) {
            registerState(queued.shift());
        }
    }

    function registerState(state) {
        // Wrap a new object around the state so we can store our private details easily.
        state = inherit(state, {
            self: state,
            resolve: state.resolve || {},
            toString: function() { return this.name; }
        });

        var name = state.name;
        if (!isString(name) || name.indexOf('@') >= 0) throw new Error("State must have a valid name");
        if (states.hasOwnProperty(name)) throw new Error("State '" + name + "'' is already defined");

        // Get parent name
        var parentName = (name.indexOf('.') !== -1) ? name.substring(0, name.lastIndexOf('.'))
            : (isString(state.parent)) ? state.parent
            : (isObject(state.parent) && isString(state.parent.name)) ? state.parent.name
            : '';

        // If parent is not registered yet, add state to queue and register later
        if (parentName && !states[parentName]) {
            return queueState(parentName, state.self);
        }

        for (var key in stateBuilder) {
            if (isFunction(stateBuilder[key])) state[key] = stateBuilder[key](state, stateBuilder.$delegates[key]);
        }
        states[name] = state;

        // Register the state in the global state list and with $urlRouter if necessary.
        if (!state[abstractKey] && state.url) {
            $urlRouterProvider.when(state.url, ['$match', '$stateParams', function ($match, $stateParams) {
                if ($state.$current.navigable != state || !equalForKeys($match, $stateParams)) {
                    $state.transitionTo(state, $match, { inherit: true, location: false });
                }
            }]);
        }

        // Register any queued children
        flushQueuedChildren(name);

        return state;
    }

    // Checks text to see if it looks like a glob.
    function isGlob (text) {
        return text.indexOf('*') > -1;
    }

    // Returns true if glob matches current $state name.
    function doesStateMatchGlob (glob) {
        var globSegments = glob.split('.'),
            segments = $state.$current.name.split('.');

        //match single stars
        for (var i = 0, l = globSegments.length; i < l; i++) {
            if (globSegments[i] === '*') {
                segments[i] = '*';
            }
        }

        //match greedy starts
        if (globSegments[0] === '**') {
            segments = segments.slice(indexOf(segments, globSegments[1]));
            segments.unshift('**');
        }
        //match greedy ends
        if (globSegments[globSegments.length - 1] === '**') {
            segments.splice(indexOf(segments, globSegments[globSegments.length - 2]) + 1, Number.MAX_VALUE);
            segments.push('**');
        }

        if (globSegments.length != segments.length) {
            return false;
        }

        return segments.join('') === globSegments.join('');
    }


    // Implicit root state that is always active
    root = registerState({
        name: '',
        url: '^',
        views: null,
        'abstract': true
    });
    root.navigable = null;


    /**
     * @ngdoc function
     * @name ui.router.state.$stateProvider#decorator
     * @methodOf ui.router.state.$stateProvider
     *
     * @description
     * Allows you to extend (carefully) or override (at your own peril) the
     * `stateBuilder` object used internally by `$stateProvider`. This can be used
     * to add custom functionality to ui-router, for example inferring templateUrl
     * based on the state name.
     *
     * When passing only a name, it returns the current (original or decorated) builder
     * function that matches `name`.
     *
     * The builder functions that can be decorated are listed below. Though not all
     * necessarily have a good use case for decoration, that is up to you to decide.
     *
     * In addition, users can attach custom decorators, which will generate new
     * properties within the state's internal definition. There is currently no clear
     * use-case for this beyond accessing internal states (i.e. $state.$current),
     * however, expect this to become increasingly relevant as we introduce additional
     * meta-programming features.
     *
     * **Warning**: Decorators should not be interdependent because the order of
     * execution of the builder functions in non-deterministic. Builder functions
     * should only be dependent on the state definition object and super function.
     *
     *
     * Existing builder functions and current return values:
     *
     * - **parent** `{object}` - returns the parent state object.
     * - **data** `{object}` - returns state data, including any inherited data that is not
     *   overridden by own values (if any).
     * - **url** `{object}` - returns a {@link ui.router.util.type:UrlMatcher UrlMatcher}
     *   or `null`.
     * - **navigable** `{object}` - returns closest ancestor state that has a URL (aka is
     *   navigable).
     * - **params** `{object}` - returns an array of state params that are ensured to
     *   be a super-set of parent's params.
     * - **views** `{object}` - returns a views object where each key is an absolute view
     *   name (i.e. "viewName@stateName") and each value is the config object
     *   (template, controller) for the view. Even when you don't use the views object
     *   explicitly on a state config, one is still created for you internally.
     *   So by decorating this builder function you have access to decorating template
     *   and controller properties.
     * - **ownParams** `{object}` - returns an array of params that belong to the state,
     *   not including any params defined by ancestor states.
     * - **path** `{string}` - returns the full path from the root down to this state.
     *   Needed for state activation.
     * - **includes** `{object}` - returns an object that includes every state that
     *   would pass a `$state.includes()` test.
     *
     * @example
     * <pre>
     * // Override the internal 'views' builder with a function that takes the state
     * // definition, and a reference to the internal function being overridden:
     * $stateProvider.decorator('views', function (state, parent) {
   *   var result = {},
   *       views = parent(state);
   *
   *   angular.forEach(views, function (config, name) {
   *     var autoName = (state.name + '.' + name).replace('.', '/');
   *     config.templateUrl = config.templateUrl || '/partials/' + autoName + '.html';
   *     result[name] = config;
   *   });
   *   return result;
   * });
     *
     * $stateProvider.state('home', {
   *   views: {
   *     'contact.list': { controller: 'ListController' },
   *     'contact.item': { controller: 'ItemController' }
   *   }
   * });
     *
     * // ...
     *
     * $state.go('home');
     * // Auto-populates list and item views with /partials/home/contact/list.html,
     * // and /partials/home/contact/item.html, respectively.
     * </pre>
     *
     * @param {string} name The name of the builder function to decorate.
     * @param {object} func A function that is responsible for decorating the original
     * builder function. The function receives two parameters:
     *
     *   - `{object}` - state - The state config object.
     *   - `{object}` - super - The original builder function.
     *
     * @return {object} $stateProvider - $stateProvider instance
     */
    this.decorator = decorator;
    function decorator(name, func) {
        /*jshint validthis: true */
        if (isString(name) && !isDefined(func)) {
            return stateBuilder[name];
        }
        if (!isFunction(func) || !isString(name)) {
            return this;
        }
        if (stateBuilder[name] && !stateBuilder.$delegates[name]) {
            stateBuilder.$delegates[name] = stateBuilder[name];
        }
        stateBuilder[name] = func;
        return this;
    }

    /**
     * @ngdoc function
     * @name ui.router.state.$stateProvider#state
     * @methodOf ui.router.state.$stateProvider
     *
     * @description
     * Registers a state configuration under a given state name. The stateConfig object
     * has the following acceptable properties.
     *
     * @param {string} name A unique state name, e.g. "home", "about", "contacts".
     * To create a parent/child state use a dot, e.g. "about.sales", "home.newest".
     * @param {object} stateConfig State configuration object.
     * @param {string|function=} stateConfig.template
     * <a id='template'></a>
     *   html template as a string or a function that returns
     *   an html template as a string which should be used by the uiView directives. This property
     *   takes precedence over templateUrl.
     *
     *   If `template` is a function, it will be called with the following parameters:
     *
     *   - {array.&lt;object&gt;} - state parameters extracted from the current $location.path() by
     *     applying the current state
     *
     * <pre>template:
     *   "<h1>inline template definition</h1>" +
     *   "<div ui-view></div>"</pre>
     * <pre>template: function(params) {
   *       return "<h1>generated template</h1>"; }</pre>
     * </div>
     *
     * @param {string|function=} stateConfig.templateUrl
     * <a id='templateUrl'></a>
     *
     *   path or function that returns a path to an html
     *   template that should be used by uiView.
     *
     *   If `templateUrl` is a function, it will be called with the following parameters:
     *
     *   - {array.&lt;object&gt;} - state parameters extracted from the current $location.path() by
     *     applying the current state
     *
     * <pre>templateUrl: "home.html"</pre>
     * <pre>templateUrl: function(params) {
   *     return myTemplates[params.pageId]; }</pre>
     *
     * @param {function=} stateConfig.templateProvider
     * <a id='templateProvider'></a>
     *    Provider function that returns HTML content string.
     * <pre> templateProvider:
     *       function(MyTemplateService, params) {
   *         return MyTemplateService.getTemplate(params.pageId);
   *       }</pre>
     *
     * @param {string|function=} stateConfig.controller
     * <a id='controller'></a>
     *
     *  Controller fn that should be associated with newly
     *   related scope or the name of a registered controller if passed as a string.
     *   Optionally, the ControllerAs may be declared here.
     * <pre>controller: "MyRegisteredController"</pre>
     * <pre>controller:
     *     "MyRegisteredController as fooCtrl"}</pre>
     * <pre>controller: function($scope, MyService) {
   *     $scope.data = MyService.getData(); }</pre>
     *
     * @param {function=} stateConfig.controllerProvider
     * <a id='controllerProvider'></a>
     *
     * Injectable provider function that returns the actual controller or string.
     * <pre>controllerProvider:
     *   function(MyResolveData) {
   *     if (MyResolveData.foo)
   *       return "FooCtrl"
   *     else if (MyResolveData.bar)
   *       return "BarCtrl";
   *     else return function($scope) {
   *       $scope.baz = "Qux";
   *     }
   *   }</pre>
     *
     * @param {string=} stateConfig.controllerAs
     * <a id='controllerAs'></a>
     *
     * A controller alias name. If present the controller will be
     *   published to scope under the controllerAs name.
     * <pre>controllerAs: "myCtrl"</pre>
     *
     * @param {string|object=} stateConfig.parent
     * <a id='parent'></a>
     * Optionally specifies the parent state of this state.
     *
     * <pre>parent: 'parentState'</pre>
     * <pre>parent: parentState // JS variable</pre>
     *
     * @param {object=} stateConfig.resolve
     * <a id='resolve'></a>
     *
     * An optional map&lt;string, function&gt; of dependencies which
     *   should be injected into the controller. If any of these dependencies are promises,
     *   the router will wait for them all to be resolved before the controller is instantiated.
     *   If all the promises are resolved successfully, the $stateChangeSuccess event is fired
     *   and the values of the resolved promises are injected into any controllers that reference them.
     *   If any  of the promises are rejected the $stateChangeError event is fired.
     *
     *   The map object is:
     *
     *   - key - {string}: name of dependency to be injected into controller
     *   - factory - {string|function}: If string then it is alias for service. Otherwise if function,
     *     it is injected and return value it treated as dependency. If result is a promise, it is
     *     resolved before its value is injected into controller.
     *
     * <pre>resolve: {
   *     myResolve1:
   *       function($http, $stateParams) {
   *         return $http.get("/api/foos/"+stateParams.fooID);
   *       }
   *     }</pre>
     *
     * @param {string=} stateConfig.url
     * <a id='url'></a>
     *
     *   A url fragment with optional parameters. When a state is navigated or
     *   transitioned to, the `$stateParams` service will be populated with any
     *   parameters that were passed.
     *
     *   (See {@link ui.router.util.type:UrlMatcher UrlMatcher} `UrlMatcher`} for
     *   more details on acceptable patterns )
     *
     * examples:
     * <pre>url: "/home"
     * url: "/users/:userid"
     * url: "/books/{bookid:[a-zA-Z_-]}"
     * url: "/books/{categoryid:int}"
     * url: "/books/{publishername:string}/{categoryid:int}"
     * url: "/messages?before&after"
     * url: "/messages?{before:date}&{after:date}"
     * url: "/messages/:mailboxid?{before:date}&{after:date}"
     * </pre>
     *
     * @param {object=} stateConfig.views
     * <a id='views'></a>
     * an optional map&lt;string, object&gt; which defined multiple views, or targets views
     * manually/explicitly.
     *
     * Examples:
     *
     * Targets three named `ui-view`s in the parent state's template
     * <pre>views: {
   *     header: {
   *       controller: "headerCtrl",
   *       templateUrl: "header.html"
   *     }, body: {
   *       controller: "bodyCtrl",
   *       templateUrl: "body.html"
   *     }, footer: {
   *       controller: "footCtrl",
   *       templateUrl: "footer.html"
   *     }
   *   }</pre>
     *
     * Targets named `ui-view="header"` from grandparent state 'top''s template, and named `ui-view="body" from parent state's template.
     * <pre>views: {
   *     'header@top': {
   *       controller: "msgHeaderCtrl",
   *       templateUrl: "msgHeader.html"
   *     }, 'body': {
   *       controller: "messagesCtrl",
   *       templateUrl: "messages.html"
   *     }
     *   }</pre>
     *
     * @param {boolean=} [stateConfig.abstract=false]
     * <a id='abstract'></a>
     * An abstract state will never be directly activated,
     *   but can provide inherited properties to its common children states.
     * <pre>abstract: true</pre>
     *
     * @param {function=} stateConfig.onEnter
     * <a id='onEnter'></a>
     *
     * Callback function for when a state is entered. Good way
     *   to trigger an action or dispatch an event, such as opening a dialog.
     * If minifying your scripts, make sure to explictly annotate this function,
     * because it won't be automatically annotated by your build tools.
     *
     * <pre>onEnter: function(MyService, $stateParams) {
   *     MyService.foo($stateParams.myParam);
   * }</pre>
     *
     * @param {function=} stateConfig.onExit
     * <a id='onExit'></a>
     *
     * Callback function for when a state is exited. Good way to
     *   trigger an action or dispatch an event, such as opening a dialog.
     * If minifying your scripts, make sure to explictly annotate this function,
     * because it won't be automatically annotated by your build tools.
     *
     * <pre>onExit: function(MyService, $stateParams) {
   *     MyService.cleanup($stateParams.myParam);
   * }</pre>
     *
     * @param {boolean=} [stateConfig.reloadOnSearch=true]
     * <a id='reloadOnSearch'></a>
     *
     * If `false`, will not retrigger the same state
     *   just because a search/query parameter has changed (via $location.search() or $location.hash()).
     *   Useful for when you'd like to modify $location.search() without triggering a reload.
     * <pre>reloadOnSearch: false</pre>
     *
     * @param {object=} stateConfig.data
     * <a id='data'></a>
     *
     * Arbitrary data object, useful for custom configuration.  The parent state's `data` is
     *   prototypally inherited.  In other words, adding a data property to a state adds it to
     *   the entire subtree via prototypal inheritance.
     *
     * <pre>data: {
   *     requiredRole: 'foo'
   * } </pre>
     *
     * @param {object=} stateConfig.params
     * <a id='params'></a>
     *
     * A map which optionally configures parameters declared in the `url`, or
     *   defines additional non-url parameters.  For each parameter being
     *   configured, add a configuration object keyed to the name of the parameter.
     *
     *   Each parameter configuration object may contain the following properties:
     *
     *   - ** value ** - {object|function=}: specifies the default value for this
     *     parameter.  This implicitly sets this parameter as optional.
     *
     *     When UI-Router routes to a state and no value is
     *     specified for this parameter in the URL or transition, the
     *     default value will be used instead.  If `value` is a function,
     *     it will be injected and invoked, and the return value used.
     *
     *     *Note*: `undefined` is treated as "no default value" while `null`
     *     is treated as "the default value is `null`".
     *
     *     *Shorthand*: If you only need to configure the default value of the
     *     parameter, you may use a shorthand syntax.   In the **`params`**
     *     map, instead mapping the param name to a full parameter configuration
     *     object, simply set map it to the default parameter value, e.g.:
     *
     * <pre>// define a parameter's default value
     * params: {
   *     param1: { value: "defaultValue" }
   * }
     * // shorthand default values
     * params: {
   *     param1: "defaultValue",
   *     param2: "param2Default"
   * }</pre>
     *
     *   - ** array ** - {boolean=}: *(default: false)* If true, the param value will be
     *     treated as an array of values.  If you specified a Type, the value will be
     *     treated as an array of the specified Type.  Note: query parameter values
     *     default to a special `"auto"` mode.
     *
     *     For query parameters in `"auto"` mode, if multiple  values for a single parameter
     *     are present in the URL (e.g.: `/foo?bar=1&bar=2&bar=3`) then the values
     *     are mapped to an array (e.g.: `{ foo: [ '1', '2', '3' ] }`).  However, if
     *     only one value is present (e.g.: `/foo?bar=1`) then the value is treated as single
     *     value (e.g.: `{ foo: '1' }`).
     *
     * <pre>params: {
   *     param1: { array: true }
   * }</pre>
     *
     *   - ** squash ** - {bool|string=}: `squash` configures how a default parameter value is represented in the URL when
     *     the current parameter value is the same as the default value. If `squash` is not set, it uses the
     *     configured default squash policy.
     *     (See {@link ui.router.util.$urlMatcherFactory#methods_defaultSquashPolicy `defaultSquashPolicy()`})
     *
     *   There are three squash settings:
     *
     *     - false: The parameter's default value is not squashed.  It is encoded and included in the URL
     *     - true: The parameter's default value is omitted from the URL.  If the parameter is preceeded and followed
     *       by slashes in the state's `url` declaration, then one of those slashes are omitted.
     *       This can allow for cleaner looking URLs.
     *     - `"<arbitrary string>"`: The parameter's default value is replaced with an arbitrary placeholder of  your choice.
     *
     * <pre>params: {
   *     param1: {
   *       value: "defaultId",
   *       squash: true
   * } }
     * // squash "defaultValue" to "~"
     * params: {
   *     param1: {
   *       value: "defaultValue",
   *       squash: "~"
   * } }
     * </pre>
     *
     *
     * @example
     * <pre>
     * // Some state name examples
     *
     * // stateName can be a single top-level name (must be unique).
     * $stateProvider.state("home", {});
     *
     * // Or it can be a nested state name. This state is a child of the
     * // above "home" state.
     * $stateProvider.state("home.newest", {});
     *
     * // Nest states as deeply as needed.
     * $stateProvider.state("home.newest.abc.xyz.inception", {});
     *
     * // state() returns $stateProvider, so you can chain state declarations.
     * $stateProvider
     *   .state("home", {})
     *   .state("about", {})
     *   .state("contacts", {});
     * </pre>
     *
     */
    this.state = state;
    function state(name, definition) {
        /*jshint validthis: true */
        if (isObject(name)) definition = name;
        else definition.name = name;
        registerState(definition);
        return this;
    }

    /**
     * @ngdoc object
     * @name ui.router.state.$state
     *
     * @requires $rootScope
     * @requires $q
     * @requires ui.router.state.$view
     * @requires $injector
     * @requires ui.router.util.$resolve
     * @requires ui.router.state.$stateParams
     * @requires ui.router.router.$urlRouter
     *
     * @property {object} params A param object, e.g. {sectionId: section.id)}, that
     * you'd like to test against the current active state.
     * @property {object} current A reference to the state's config object. However
     * you passed it in. Useful for accessing custom data.
     * @property {object} transition Currently pending transition. A promise that'll
     * resolve or reject.
     *
     * @description
     * `$state` service is responsible for representing states as well as transitioning
     * between them. It also provides interfaces to ask for current state or even states
     * you're coming from.
     */
    this.$get = $get;
    $get.$inject = ['$rootScope', '$q', '$view', '$injector', '$resolve', '$stateParams', '$urlRouter', '$location', '$urlMatcherFactory'];
    function $get(   $rootScope,   $q,   $view,   $injector,   $resolve,   $stateParams,   $urlRouter,   $location,   $urlMatcherFactory) {

        var TransitionSuperseded = $q.reject(new Error('transition superseded'));
        var TransitionPrevented = $q.reject(new Error('transition prevented'));
        var TransitionAborted = $q.reject(new Error('transition aborted'));
        var TransitionFailed = $q.reject(new Error('transition failed'));

        // Handles the case where a state which is the target of a transition is not found, and the user
        // can optionally retry or defer the transition
        function handleRedirect(redirect, state, params, options) {
            /**
             * @ngdoc event
             * @name ui.router.state.$state#$stateNotFound
             * @eventOf ui.router.state.$state
             * @eventType broadcast on root scope
             * @description
             * Fired when a requested state **cannot be found** using the provided state name during transition.
             * The event is broadcast allowing any handlers a single chance to deal with the error (usually by
             * lazy-loading the unfound state). A special `unfoundState` object is passed to the listener handler,
             * you can see its three properties in the example. You can use `event.preventDefault()` to abort the
             * transition and the promise returned from `go` will be rejected with a `'transition aborted'` value.
             *
             * @param {Object} event Event object.
             * @param {Object} unfoundState Unfound State information. Contains: `to, toParams, options` properties.
             * @param {State} fromState Current state object.
             * @param {Object} fromParams Current state params.
             *
             * @example
             *
             * <pre>
             * // somewhere, assume lazy.state has not been defined
             * $state.go("lazy.state", {a:1, b:2}, {inherit:false});
             *
             * // somewhere else
             * $scope.$on('$stateNotFound',
             * function(event, unfoundState, fromState, fromParams){
       *     console.log(unfoundState.to); // "lazy.state"
       *     console.log(unfoundState.toParams); // {a:1, b:2}
       *     console.log(unfoundState.options); // {inherit:false} + default options
       * })
             * </pre>
             */
            var evt = $rootScope.$broadcast('$stateNotFound', redirect, state, params);

            if (evt.defaultPrevented) {
                $urlRouter.update();
                return TransitionAborted;
            }

            if (!evt.retry) {
                return null;
            }

            // Allow the handler to return a promise to defer state lookup retry
            if (options.$retry) {
                $urlRouter.update();
                return TransitionFailed;
            }
            var retryTransition = $state.transition = $q.when(evt.retry);

            retryTransition.then(function() {
                if (retryTransition !== $state.transition) return TransitionSuperseded;
                redirect.options.$retry = true;
                return $state.transitionTo(redirect.to, redirect.toParams, redirect.options);
            }, function() {
                return TransitionAborted;
            });
            $urlRouter.update();

            return retryTransition;
        }

        root.locals = { resolve: null, globals: { $stateParams: {} } };

        $state = {
            params: {},
            current: root.self,
            $current: root,
            transition: null
        };

        /**
         * @ngdoc function
         * @name ui.router.state.$state#reload
         * @methodOf ui.router.state.$state
         *
         * @description
         * A method that force reloads the current state. All resolves are re-resolved,
         * controllers reinstantiated, and events re-fired.
         *
         * @example
         * <pre>
         * var app angular.module('app', ['ui.router']);
         *
         * app.controller('ctrl', function ($scope, $state) {
     *   $scope.reload = function(){
     *     $state.reload();
     *   }
     * });
         * </pre>
         *
         * `reload()` is just an alias for:
         * <pre>
         * $state.transitionTo($state.current, $stateParams, {
     *   reload: true, inherit: false, notify: true
     * });
         * </pre>
         *
         * @param {string=|object=} state - A state name or a state object, which is the root of the resolves to be re-resolved.
         * @example
         * <pre>
         * //assuming app application consists of 3 states: 'contacts', 'contacts.detail', 'contacts.detail.item'
         * //and current state is 'contacts.detail.item'
         * var app angular.module('app', ['ui.router']);
         *
         * app.controller('ctrl', function ($scope, $state) {
     *   $scope.reload = function(){
     *     //will reload 'contact.detail' and 'contact.detail.item' states
     *     $state.reload('contact.detail');
     *   }
     * });
         * </pre>
         *
         * `reload()` is just an alias for:
         * <pre>
         * $state.transitionTo($state.current, $stateParams, {
     *   reload: true, inherit: false, notify: true
     * });
         * </pre>

         * @returns {promise} A promise representing the state of the new transition. See
         * {@link ui.router.state.$state#methods_go $state.go}.
         */
        $state.reload = function reload(state) {
            return $state.transitionTo($state.current, $stateParams, { reload: state || true, inherit: false, notify: true});
        };

        /**
         * @ngdoc function
         * @name ui.router.state.$state#go
         * @methodOf ui.router.state.$state
         *
         * @description
         * Convenience method for transitioning to a new state. `$state.go` calls
         * `$state.transitionTo` internally but automatically sets options to
         * `{ location: true, inherit: true, relative: $state.$current, notify: true }`.
         * This allows you to easily use an absolute or relative to path and specify
         * only the parameters you'd like to update (while letting unspecified parameters
         * inherit from the currently active ancestor states).
         *
         * @example
         * <pre>
         * var app = angular.module('app', ['ui.router']);
         *
         * app.controller('ctrl', function ($scope, $state) {
     *   $scope.changeState = function () {
     *     $state.go('contact.detail');
     *   };
     * });
         * </pre>
         * <img src='../ngdoc_assets/StateGoExamples.png'/>
         *
         * @param {string} to Absolute state name or relative state path. Some examples:
         *
         * - `$state.go('contact.detail')` - will go to the `contact.detail` state
         * - `$state.go('^')` - will go to a parent state
         * - `$state.go('^.sibling')` - will go to a sibling state
         * - `$state.go('.child.grandchild')` - will go to grandchild state
         *
         * @param {object=} params A map of the parameters that will be sent to the state,
         * will populate $stateParams. Any parameters that are not specified will be inherited from currently
         * defined parameters. This allows, for example, going to a sibling state that shares parameters
         * specified in a parent state. Parameter inheritance only works between common ancestor states, I.e.
         * transitioning to a sibling will get you the parameters for all parents, transitioning to a child
         * will get you all current parameters, etc.
         * @param {object=} options Options object. The options are:
         *
         * - **`location`** - {boolean=true|string=} - If `true` will update the url in the location bar, if `false`
         *    will not. If string, must be `"replace"`, which will update url and also replace last history record.
         * - **`inherit`** - {boolean=true}, If `true` will inherit url parameters from current url.
         * - **`relative`** - {object=$state.$current}, When transitioning with relative path (e.g '^'),
         *    defines which state to be relative from.
         * - **`notify`** - {boolean=true}, If `true` will broadcast $stateChangeStart and $stateChangeSuccess events.
         * - **`reload`** (v0.2.5) - {boolean=false}, If `true` will force transition even if the state or params
         *    have not changed, aka a reload of the same state. It differs from reloadOnSearch because you'd
         *    use this when you want to force a reload when *everything* is the same, including search params.
         *
         * @returns {promise} A promise representing the state of the new transition.
         *
         * Possible success values:
         *
         * - $state.current
         *
         * <br/>Possible rejection values:
         *
         * - 'transition superseded' - when a newer transition has been started after this one
         * - 'transition prevented' - when `event.preventDefault()` has been called in a `$stateChangeStart` listener
         * - 'transition aborted' - when `event.preventDefault()` has been called in a `$stateNotFound` listener or
         *   when a `$stateNotFound` `event.retry` promise errors.
         * - 'transition failed' - when a state has been unsuccessfully found after 2 tries.
         * - *resolve error* - when an error has occurred with a `resolve`
         *
         */
        $state.go = function go(to, params, options) {
            return $state.transitionTo(to, params, extend({ inherit: true, relative: $state.$current }, options));
        };

        /**
         * @ngdoc function
         * @name ui.router.state.$state#transitionTo
         * @methodOf ui.router.state.$state
         *
         * @description
         * Low-level method for transitioning to a new state. {@link ui.router.state.$state#methods_go $state.go}
         * uses `transitionTo` internally. `$state.go` is recommended in most situations.
         *
         * @example
         * <pre>
         * var app = angular.module('app', ['ui.router']);
         *
         * app.controller('ctrl', function ($scope, $state) {
     *   $scope.changeState = function () {
     *     $state.transitionTo('contact.detail');
     *   };
     * });
         * </pre>
         *
         * @param {string} to State name.
         * @param {object=} toParams A map of the parameters that will be sent to the state,
         * will populate $stateParams.
         * @param {object=} options Options object. The options are:
         *
         * - **`location`** - {boolean=true|string=} - If `true` will update the url in the location bar, if `false`
         *    will not. If string, must be `"replace"`, which will update url and also replace last history record.
         * - **`inherit`** - {boolean=false}, If `true` will inherit url parameters from current url.
         * - **`relative`** - {object=}, When transitioning with relative path (e.g '^'),
         *    defines which state to be relative from.
         * - **`notify`** - {boolean=true}, If `true` will broadcast $stateChangeStart and $stateChangeSuccess events.
         * - **`reload`** (v0.2.5) - {boolean=false|string=|object=}, If `true` will force transition even if the state or params
         *    have not changed, aka a reload of the same state. It differs from reloadOnSearch because you'd
         *    use this when you want to force a reload when *everything* is the same, including search params.
         *    if String, then will reload the state with the name given in reload, and any children.
         *    if Object, then a stateObj is expected, will reload the state found in stateObj, and any chhildren.
         *
         * @returns {promise} A promise representing the state of the new transition. See
         * {@link ui.router.state.$state#methods_go $state.go}.
         */
        $state.transitionTo = function transitionTo(to, toParams, options) {
            toParams = toParams || {};
            options = extend({
                location: true, inherit: false, relative: null, notify: true, reload: false, $retry: false
            }, options || {});

            var from = $state.$current, fromParams = $state.params, fromPath = from.path;
            var evt, toState = findState(to, options.relative);

            if (!isDefined(toState)) {
                var redirect = { to: to, toParams: toParams, options: options };
                var redirectResult = handleRedirect(redirect, from.self, fromParams, options);

                if (redirectResult) {
                    return redirectResult;
                }

                // Always retry once if the $stateNotFound was not prevented
                // (handles either redirect changed or state lazy-definition)
                to = redirect.to;
                toParams = redirect.toParams;
                options = redirect.options;
                toState = findState(to, options.relative);

                if (!isDefined(toState)) {
                    if (!options.relative) throw new Error("No such state '" + to + "'");
                    throw new Error("Could not resolve '" + to + "' from state '" + options.relative + "'");
                }
            }
            if (toState[abstractKey]) throw new Error("Cannot transition to abstract state '" + to + "'");
            if (options.inherit) toParams = inheritParams($stateParams, toParams || {}, $state.$current, toState);
            if (!toState.params.$$validates(toParams)) return TransitionFailed;

            toParams = toState.params.$$values(toParams);
            to = toState;

            var toPath = to.path;

            // Starting from the root of the path, keep all levels that haven't changed
            var keep = 0, state = toPath[keep], locals = root.locals, toLocals = [];
            var skipTriggerReloadCheck = false;

            if (!options.reload) {
                while (state && state === fromPath[keep] && state.ownParams.$$equals(toParams, fromParams)) {
                    locals = toLocals[keep] = state.locals;
                    keep++;
                    state = toPath[keep];
                }
            } else if (isString(options.reload) || isObject(options.reload)) {
                if (isObject(options.reload) && !options.reload.name) {
                    throw new Error('Invalid reload state object');
                }

                var reloadState = options.reload === true ? fromPath[0] : findState(options.reload);
                if (options.reload && !reloadState) {
                    throw new Error("No such reload state '" + (isString(options.reload) ? options.reload : options.reload.name) + "'");
                }

                skipTriggerReloadCheck = true;

                while (state && state === fromPath[keep] && state !== reloadState) {
                    locals = toLocals[keep] = state.locals;
                    keep++;
                    state = toPath[keep];
                }
            }

            // If we're going to the same state and all locals are kept, we've got nothing to do.
            // But clear 'transition', as we still want to cancel any other pending transitions.
            // TODO: We may not want to bump 'transition' if we're called from a location change
            // that we've initiated ourselves, because we might accidentally abort a legitimate
            // transition initiated from code?
            if (!skipTriggerReloadCheck && shouldTriggerReload(to, from, locals, options)) {
                if (to.self.reloadOnSearch !== false) $urlRouter.update();
                $state.transition = null;
                return $q.when($state.current);
            }

            // Filter parameters before we pass them to event handlers etc.
            toParams = filterByKeys(to.params.$$keys(), toParams || {});

            // Broadcast start event and cancel the transition if requested
            if (options.notify) {
                /**
                 * @ngdoc event
                 * @name ui.router.state.$state#$stateChangeStart
                 * @eventOf ui.router.state.$state
                 * @eventType broadcast on root scope
                 * @description
                 * Fired when the state transition **begins**. You can use `event.preventDefault()`
                 * to prevent the transition from happening and then the transition promise will be
                 * rejected with a `'transition prevented'` value.
                 *
                 * @param {Object} event Event object.
                 * @param {State} toState The state being transitioned to.
                 * @param {Object} toParams The params supplied to the `toState`.
                 * @param {State} fromState The current state, pre-transition.
                 * @param {Object} fromParams The params supplied to the `fromState`.
                 *
                 * @example
                 *
                 * <pre>
                 * $rootScope.$on('$stateChangeStart',
                 * function(event, toState, toParams, fromState, fromParams){
         *     event.preventDefault();
         *     // transitionTo() promise will be rejected with
         *     // a 'transition prevented' error
         * })
                 * </pre>
                 */
                if ($rootScope.$broadcast('$stateChangeStart', to.self, toParams, from.self, fromParams).defaultPrevented) {
                    $rootScope.$broadcast('$stateChangeCancel', to.self, toParams, from.self, fromParams);
                    $urlRouter.update();
                    return TransitionPrevented;
                }
            }

            // Resolve locals for the remaining states, but don't update any global state just
            // yet -- if anything fails to resolve the current state needs to remain untouched.
            // We also set up an inheritance chain for the locals here. This allows the view directive
            // to quickly look up the correct definition for each view in the current state. Even
            // though we create the locals object itself outside resolveState(), it is initially
            // empty and gets filled asynchronously. We need to keep track of the promise for the
            // (fully resolved) current locals, and pass this down the chain.
            var resolved = $q.when(locals);

            for (var l = keep; l < toPath.length; l++, state = toPath[l]) {
                locals = toLocals[l] = inherit(locals);
                resolved = resolveState(state, toParams, state === to, resolved, locals, options);
            }

            // Once everything is resolved, we are ready to perform the actual transition
            // and return a promise for the new state. We also keep track of what the
            // current promise is, so that we can detect overlapping transitions and
            // keep only the outcome of the last transition.
            var transition = $state.transition = resolved.then(function () {
                var l, entering, exiting;

                if ($state.transition !== transition) return TransitionSuperseded;

                // Exit 'from' states not kept
                for (l = fromPath.length - 1; l >= keep; l--) {
                    exiting = fromPath[l];
                    if (exiting.self.onExit) {
                        $injector.invoke(exiting.self.onExit, exiting.self, exiting.locals.globals);
                    }
                    exiting.locals = null;
                }

                // Enter 'to' states not kept
                for (l = keep; l < toPath.length; l++) {
                    entering = toPath[l];
                    entering.locals = toLocals[l];
                    if (entering.self.onEnter) {
                        $injector.invoke(entering.self.onEnter, entering.self, entering.locals.globals);
                    }
                }

                // Run it again, to catch any transitions in callbacks
                if ($state.transition !== transition) return TransitionSuperseded;

                // Update globals in $state
                $state.$current = to;
                $state.current = to.self;
                $state.params = toParams;
                copy($state.params, $stateParams);
                $state.transition = null;

                if (options.location && to.navigable) {
                    $urlRouter.push(to.navigable.url, to.navigable.locals.globals.$stateParams, {
                        $$avoidResync: true, replace: options.location === 'replace'
                    });
                }

                if (options.notify) {
                    /**
                     * @ngdoc event
                     * @name ui.router.state.$state#$stateChangeSuccess
                     * @eventOf ui.router.state.$state
                     * @eventType broadcast on root scope
                     * @description
                     * Fired once the state transition is **complete**.
                     *
                     * @param {Object} event Event object.
                     * @param {State} toState The state being transitioned to.
                     * @param {Object} toParams The params supplied to the `toState`.
                     * @param {State} fromState The current state, pre-transition.
                     * @param {Object} fromParams The params supplied to the `fromState`.
                     */
                    $rootScope.$broadcast('$stateChangeSuccess', to.self, toParams, from.self, fromParams);
                }
                $urlRouter.update(true);

                return $state.current;
            }, function (error) {
                if ($state.transition !== transition) return TransitionSuperseded;

                $state.transition = null;
                /**
                 * @ngdoc event
                 * @name ui.router.state.$state#$stateChangeError
                 * @eventOf ui.router.state.$state
                 * @eventType broadcast on root scope
                 * @description
                 * Fired when an **error occurs** during transition. It's important to note that if you
                 * have any errors in your resolve functions (javascript errors, non-existent services, etc)
                 * they will not throw traditionally. You must listen for this $stateChangeError event to
                 * catch **ALL** errors.
                 *
                 * @param {Object} event Event object.
                 * @param {State} toState The state being transitioned to.
                 * @param {Object} toParams The params supplied to the `toState`.
                 * @param {State} fromState The current state, pre-transition.
                 * @param {Object} fromParams The params supplied to the `fromState`.
                 * @param {Error} error The resolve error object.
                 */
                evt = $rootScope.$broadcast('$stateChangeError', to.self, toParams, from.self, fromParams, error);

                if (!evt.defaultPrevented) {
                    $urlRouter.update();
                }

                return $q.reject(error);
            });

            return transition;
        };

        /**
         * @ngdoc function
         * @name ui.router.state.$state#is
         * @methodOf ui.router.state.$state
         *
         * @description
         * Similar to {@link ui.router.state.$state#methods_includes $state.includes},
         * but only checks for the full state name. If params is supplied then it will be
         * tested for strict equality against the current active params object, so all params
         * must match with none missing and no extras.
         *
         * @example
         * <pre>
         * $state.$current.name = 'contacts.details.item';
         *
         * // absolute name
         * $state.is('contact.details.item'); // returns true
         * $state.is(contactDetailItemStateObject); // returns true
         *
         * // relative name (. and ^), typically from a template
         * // E.g. from the 'contacts.details' template
         * <div ng-class="{highlighted: $state.is('.item')}">Item</div>
         * </pre>
         *
         * @param {string|object} stateOrName The state name (absolute or relative) or state object you'd like to check.
         * @param {object=} params A param object, e.g. `{sectionId: section.id}`, that you'd like
         * to test against the current active state.
         * @param {object=} options An options object.  The options are:
         *
         * - **`relative`** - {string|object} -  If `stateOrName` is a relative state name and `options.relative` is set, .is will
         * test relative to `options.relative` state (or name).
         *
         * @returns {boolean} Returns true if it is the state.
         */
        $state.is = function is(stateOrName, params, options) {
            options = extend({ relative: $state.$current }, options || {});
            var state = findState(stateOrName, options.relative);

            if (!isDefined(state)) { return undefined; }
            if ($state.$current !== state) { return false; }
            return params ? equalForKeys(state.params.$$values(params), $stateParams) : true;
        };

        /**
         * @ngdoc function
         * @name ui.router.state.$state#includes
         * @methodOf ui.router.state.$state
         *
         * @description
         * A method to determine if the current active state is equal to or is the child of the
         * state stateName. If any params are passed then they will be tested for a match as well.
         * Not all the parameters need to be passed, just the ones you'd like to test for equality.
         *
         * @example
         * Partial and relative names
         * <pre>
         * $state.$current.name = 'contacts.details.item';
         *
         * // Using partial names
         * $state.includes("contacts"); // returns true
         * $state.includes("contacts.details"); // returns true
         * $state.includes("contacts.details.item"); // returns true
         * $state.includes("contacts.list"); // returns false
         * $state.includes("about"); // returns false
         *
         * // Using relative names (. and ^), typically from a template
         * // E.g. from the 'contacts.details' template
         * <div ng-class="{highlighted: $state.includes('.item')}">Item</div>
         * </pre>
         *
         * Basic globbing patterns
         * <pre>
         * $state.$current.name = 'contacts.details.item.url';
         *
         * $state.includes("*.details.*.*"); // returns true
         * $state.includes("*.details.**"); // returns true
         * $state.includes("**.item.**"); // returns true
         * $state.includes("*.details.item.url"); // returns true
         * $state.includes("*.details.*.url"); // returns true
         * $state.includes("*.details.*"); // returns false
         * $state.includes("item.**"); // returns false
         * </pre>
         *
         * @param {string} stateOrName A partial name, relative name, or glob pattern
         * to be searched for within the current state name.
         * @param {object=} params A param object, e.g. `{sectionId: section.id}`,
         * that you'd like to test against the current active state.
         * @param {object=} options An options object.  The options are:
         *
         * - **`relative`** - {string|object=} -  If `stateOrName` is a relative state reference and `options.relative` is set,
         * .includes will test relative to `options.relative` state (or name).
         *
         * @returns {boolean} Returns true if it does include the state
         */
        $state.includes = function includes(stateOrName, params, options) {
            options = extend({ relative: $state.$current }, options || {});
            if (isString(stateOrName) && isGlob(stateOrName)) {
                if (!doesStateMatchGlob(stateOrName)) {
                    return false;
                }
                stateOrName = $state.$current.name;
            }

            var state = findState(stateOrName, options.relative);
            if (!isDefined(state)) { return undefined; }
            if (!isDefined($state.$current.includes[state.name])) { return false; }
            return params ? equalForKeys(state.params.$$values(params), $stateParams, objectKeys(params)) : true;
        };


        /**
         * @ngdoc function
         * @name ui.router.state.$state#href
         * @methodOf ui.router.state.$state
         *
         * @description
         * A url generation method that returns the compiled url for the given state populated with the given params.
         *
         * @example
         * <pre>
         * expect($state.href("about.person", { person: "bob" })).toEqual("/about/bob");
         * </pre>
         *
         * @param {string|object} stateOrName The state name or state object you'd like to generate a url from.
         * @param {object=} params An object of parameter values to fill the state's required parameters.
         * @param {object=} options Options object. The options are:
         *
         * - **`lossy`** - {boolean=true} -  If true, and if there is no url associated with the state provided in the
         *    first parameter, then the constructed href url will be built from the first navigable ancestor (aka
         *    ancestor with a valid url).
         * - **`inherit`** - {boolean=true}, If `true` will inherit url parameters from current url.
         * - **`relative`** - {object=$state.$current}, When transitioning with relative path (e.g '^'),
         *    defines which state to be relative from.
         * - **`absolute`** - {boolean=false},  If true will generate an absolute url, e.g. "http://www.example.com/fullurl".
         *
         * @returns {string} compiled state url
         */
        $state.href = function href(stateOrName, params, options) {
            options = extend({
                lossy:    true,
                inherit:  true,
                absolute: false,
                relative: $state.$current
            }, options || {});

            var state = findState(stateOrName, options.relative);

            if (!isDefined(state)) return null;
            if (options.inherit) params = inheritParams($stateParams, params || {}, $state.$current, state);

            var nav = (state && options.lossy) ? state.navigable : state;

            if (!nav || nav.url === undefined || nav.url === null) {
                return null;
            }
            return $urlRouter.href(nav.url, filterByKeys(state.params.$$keys(), params || {}), {
                absolute: options.absolute
            });
        };

        /**
         * @ngdoc function
         * @name ui.router.state.$state#get
         * @methodOf ui.router.state.$state
         *
         * @description
         * Returns the state configuration object for any specific state or all states.
         *
         * @param {string|object=} stateOrName (absolute or relative) If provided, will only get the config for
         * the requested state. If not provided, returns an array of ALL state configs.
         * @param {string|object=} context When stateOrName is a relative state reference, the state will be retrieved relative to context.
         * @returns {Object|Array} State configuration object or array of all objects.
         */
        $state.get = function (stateOrName, context) {
            if (arguments.length === 0) return map(objectKeys(states), function(name) { return states[name].self; });
            var state = findState(stateOrName, context || $state.$current);
            return (state && state.self) ? state.self : null;
        };

        function resolveState(state, params, paramsAreFiltered, inherited, dst, options) {
            // Make a restricted $stateParams with only the parameters that apply to this state if
            // necessary. In addition to being available to the controller and onEnter/onExit callbacks,
            // we also need $stateParams to be available for any $injector calls we make during the
            // dependency resolution process.
            var $stateParams = (paramsAreFiltered) ? params : filterByKeys(state.params.$$keys(), params);
            var locals = { $stateParams: $stateParams };

            // Resolve 'global' dependencies for the state, i.e. those not specific to a view.
            // We're also including $stateParams in this; that way the parameters are restricted
            // to the set that should be visible to the state, and are independent of when we update
            // the global $state and $stateParams values.
            dst.resolve = $resolve.resolve(state.resolve, locals, dst.resolve, state);
            var promises = [dst.resolve.then(function (globals) {
                dst.globals = globals;
            })];
            if (inherited) promises.push(inherited);

            // Resolve template and dependencies for all views.
            forEach(state.views, function (view, name) {
                var injectables = (view.resolve && view.resolve !== state.resolve ? view.resolve : {});
                injectables.$template = [ function () {
                    return $view.load(name, { view: view, locals: locals, params: $stateParams, notify: options.notify }) || '';
                }];

                promises.push($resolve.resolve(injectables, locals, dst.resolve, state).then(function (result) {
                    // References to the controller (only instantiated at link time)
                    if (isFunction(view.controllerProvider) || isArray(view.controllerProvider)) {
                        var injectLocals = angular.extend({}, injectables, locals);
                        result.$$controller = $injector.invoke(view.controllerProvider, null, injectLocals);
                    } else {
                        result.$$controller = view.controller;
                    }
                    // Provide access to the state itself for internal use
                    result.$$state = state;
                    result.$$controllerAs = view.controllerAs;
                    dst[name] = result;
                }));
            });

            // Wait for all the promises and then return the activation object
            return $q.all(promises).then(function (values) {
                return dst;
            });
        }

        return $state;
    }

    function shouldTriggerReload(to, from, locals, options) {
        if (to === from && ((locals === from.locals && !options.reload) || (to.self.reloadOnSearch === false))) {
            return true;
        }
    }
}

angular.module('ui.router.state')
    .value('$stateParams', {})
    .provider('$state', $StateProvider);

function parseStateRef(ref, current) {
    var preparsed = ref.match(/^\s*({[^}]*})\s*$/), parsed;
    if (preparsed) ref = current + '(' + preparsed[1] + ')';
    parsed = ref.replace(/\n/g, " ").match(/^([^(]+?)\s*(\((.*)\))?$/);
    if (!parsed || parsed.length !== 4) throw new Error("Invalid state ref '" + ref + "'");
    return { state: parsed[1], paramExpr: parsed[3] || null };
}

function stateContext(el) {
    var stateData = el.parent().inheritedData('$uiView');

    if (stateData && stateData.state && stateData.state.name) {
        return stateData.state;
    }
}

/**
 * @ngdoc directive
 * @name ui.router.state.directive:ui-sref
 *
 * @requires ui.router.state.$state
 * @requires $timeout
 *
 * @restrict A
 *
 * @description
 * A directive that binds a link (`<a>` tag) to a state. If the state has an associated
 * URL, the directive will automatically generate & update the `href` attribute via
 * the {@link ui.router.state.$state#methods_href $state.href()} method. Clicking
 * the link will trigger a state transition with optional parameters.
 *
 * Also middle-clicking, right-clicking, and ctrl-clicking on the link will be
 * handled natively by the browser.
 *
 * You can also use relative state paths within ui-sref, just like the relative
 * paths passed to `$state.go()`. You just need to be aware that the path is relative
 * to the state that the link lives in, in other words the state that loaded the
 * template containing the link.
 *
 * You can specify options to pass to {@link ui.router.state.$state#go $state.go()}
 * using the `ui-sref-opts` attribute. Options are restricted to `location`, `inherit`,
 * and `reload`.
 *
 * @example
 * Here's an example of how you'd use ui-sref and how it would compile. If you have the
 * following template:
 * <pre>
 * <a ui-sref="home">Home</a> | <a ui-sref="about">About</a> | <a ui-sref="{page: 2}">Next page</a>
 *
 * <ul>
 *     <li ng-repeat="contact in contacts">
 *         <a ui-sref="contacts.detail({ id: contact.id })">{{ contact.name }}</a>
 *     </li>
 * </ul>
 * </pre>
 *
 * Then the compiled html would be (assuming Html5Mode is off and current state is contacts):
 * <pre>
 * <a href="#/home" ui-sref="home">Home</a> | <a href="#/about" ui-sref="about">About</a> | <a href="#/contacts?page=2" ui-sref="{page: 2}">Next page</a>
 *
 * <ul>
 *     <li ng-repeat="contact in contacts">
 *         <a href="#/contacts/1" ui-sref="contacts.detail({ id: contact.id })">Joe</a>
 *     </li>
 *     <li ng-repeat="contact in contacts">
 *         <a href="#/contacts/2" ui-sref="contacts.detail({ id: contact.id })">Alice</a>
 *     </li>
 *     <li ng-repeat="contact in contacts">
 *         <a href="#/contacts/3" ui-sref="contacts.detail({ id: contact.id })">Bob</a>
 *     </li>
 * </ul>
 *
 * <a ui-sref="home" ui-sref-opts="{reload: true}">Home</a>
 * </pre>
 *
 * @param {string} ui-sref 'stateName' can be any valid absolute or relative state
 * @param {Object} ui-sref-opts options to pass to {@link ui.router.state.$state#go $state.go()}
 */
$StateRefDirective.$inject = ['$state', '$timeout'];
function $StateRefDirective($state, $timeout) {
    var allowedOptions = ['location', 'inherit', 'reload', 'absolute'];

    return {
        restrict: 'A',
        require: ['?^uiSrefActive', '?^uiSrefActiveEq'],
        link: function(scope, element, attrs, uiSrefActive) {
            var ref = parseStateRef(attrs.uiSref, $state.current.name);
            var params = null, url = null, base = stateContext(element) || $state.$current;
            // SVGAElement does not use the href attribute, but rather the 'xlinkHref' attribute.
            var hrefKind = toString.call(element.prop('href')) === '[object SVGAnimatedString]' ?
                'xlink:href' : 'href';
            var newHref = null, isAnchor = element.prop("tagName").toUpperCase() === "A";
            var isForm = element[0].nodeName === "FORM";
            var attr = isForm ? "action" : hrefKind, nav = true;

            var options = { relative: base, inherit: true };
            var optionsOverride = scope.$eval(attrs.uiSrefOpts) || {};

            angular.forEach(allowedOptions, function(option) {
                if (option in optionsOverride) {
                    options[option] = optionsOverride[option];
                }
            });

            var update = function(newVal) {
                if (newVal) params = angular.copy(newVal);
                if (!nav) return;

                newHref = $state.href(ref.state, params, options);

                var activeDirective = uiSrefActive[1] || uiSrefActive[0];
                if (activeDirective) {
                    activeDirective.$$setStateInfo(ref.state, params);
                }
                if (newHref === null) {
                    nav = false;
                    return false;
                }
                attrs.$set(attr, newHref);
            };

            if (ref.paramExpr) {
                scope.$watch(ref.paramExpr, function(newVal, oldVal) {
                    if (newVal !== params) update(newVal);
                }, true);
                params = angular.copy(scope.$eval(ref.paramExpr));
            }
            update();

            if (isForm) return;

            element.bind("click", function(e) {
                var button = e.which || e.button;
                if ( !(button > 1 || e.ctrlKey || e.metaKey || e.shiftKey || element.attr('target')) ) {
                    // HACK: This is to allow ng-clicks to be processed before the transition is initiated:
                    var transition = $timeout(function() {
                        $state.go(ref.state, params, options);
                    });
                    e.preventDefault();

                    // if the state has no URL, ignore one preventDefault from the <a> directive.
                    var ignorePreventDefaultCount = isAnchor && !newHref ? 1: 0;
                    e.preventDefault = function() {
                        if (ignorePreventDefaultCount-- <= 0)
                            $timeout.cancel(transition);
                    };
                }
            });
        }
    };
}

/**
 * @ngdoc directive
 * @name ui.router.state.directive:ui-sref-active
 *
 * @requires ui.router.state.$state
 * @requires ui.router.state.$stateParams
 * @requires $interpolate
 *
 * @restrict A
 *
 * @description
 * A directive working alongside ui-sref to add classes to an element when the
 * related ui-sref directive's state is active, and removing them when it is inactive.
 * The primary use-case is to simplify the special appearance of navigation menus
 * relying on `ui-sref`, by having the "active" state's menu button appear different,
 * distinguishing it from the inactive menu items.
 *
 * ui-sref-active can live on the same element as ui-sref or on a parent element. The first
 * ui-sref-active found at the same level or above the ui-sref will be used.
 *
 * Will activate when the ui-sref's target state or any child state is active. If you
 * need to activate only when the ui-sref target state is active and *not* any of
 * it's children, then you will use
 * {@link ui.router.state.directive:ui-sref-active-eq ui-sref-active-eq}
 *
 * @example
 * Given the following template:
 * <pre>
 * <ul>
 *   <li ui-sref-active="active" class="item">
 *     <a href ui-sref="app.user({user: 'bilbobaggins'})">@bilbobaggins</a>
 *   </li>
 * </ul>
 * </pre>
 *
 *
 * When the app state is "app.user" (or any children states), and contains the state parameter "user" with value "bilbobaggins",
 * the resulting HTML will appear as (note the 'active' class):
 * <pre>
 * <ul>
 *   <li ui-sref-active="active" class="item active">
 *     <a ui-sref="app.user({user: 'bilbobaggins'})" href="/users/bilbobaggins">@bilbobaggins</a>
 *   </li>
 * </ul>
 * </pre>
 *
 * The class name is interpolated **once** during the directives link time (any further changes to the
 * interpolated value are ignored).
 *
 * Multiple classes may be specified in a space-separated format:
 * <pre>
 * <ul>
 *   <li ui-sref-active='class1 class2 class3'>
 *     <a ui-sref="app.user">link</a>
 *   </li>
 * </ul>
 * </pre>
 */

/**
 * @ngdoc directive
 * @name ui.router.state.directive:ui-sref-active-eq
 *
 * @requires ui.router.state.$state
 * @requires ui.router.state.$stateParams
 * @requires $interpolate
 *
 * @restrict A
 *
 * @description
 * The same as {@link ui.router.state.directive:ui-sref-active ui-sref-active} but will only activate
 * when the exact target state used in the `ui-sref` is active; no child states.
 *
 */
$StateRefActiveDirective.$inject = ['$state', '$stateParams', '$interpolate'];
function $StateRefActiveDirective($state, $stateParams, $interpolate) {
    return  {
        restrict: "A",
        controller: ['$scope', '$element', '$attrs', function ($scope, $element, $attrs) {
            var state, params, activeClass;

            // There probably isn't much point in $observing this
            // uiSrefActive and uiSrefActiveEq share the same directive object with some
            // slight difference in logic routing
            activeClass = $interpolate($attrs.uiSrefActiveEq || $attrs.uiSrefActive || '', false)($scope);

            // Allow uiSref to communicate with uiSrefActive[Equals]
            this.$$setStateInfo = function (newState, newParams) {
                state = $state.get(newState, stateContext($element));
                params = newParams;
                update();
            };

            $scope.$on('$stateChangeSuccess', update);

            // Update route state
            function update() {
                if (isMatch()) {
                    $element.addClass(activeClass);
                } else {
                    $element.removeClass(activeClass);
                }
            }

            function isMatch() {
                if (typeof $attrs.uiSrefActiveEq !== 'undefined') {
                    return state && $state.is(state.name, params);
                } else {
                    return state && $state.includes(state.name, params);
                }
            }
        }]
    };
}

angular.module('ui.router.state')
    .directive('uiSref', $StateRefDirective)
    .directive('uiSrefActive', $StateRefActiveDirective)
    .directive('uiSrefActiveEq', $StateRefActiveDirective);

/**
 * @ngdoc filter
 * @name ui.router.state.filter:isState
 *
 * @requires ui.router.state.$state
 *
 * @description
 * Translates to {@link ui.router.state.$state#methods_is $state.is("stateName")}.
 */
$IsStateFilter.$inject = ['$state'];
function $IsStateFilter($state) {
    var isFilter = function (state) {
        return $state.is(state);
    };
    isFilter.$stateful = true;
    return isFilter;
}

/**
 * @ngdoc filter
 * @name ui.router.state.filter:includedByState
 *
 * @requires ui.router.state.$state
 *
 * @description
 * Translates to {@link ui.router.state.$state#methods_includes $state.includes('fullOrPartialStateName')}.
 */
$IncludedByStateFilter.$inject = ['$state'];
function $IncludedByStateFilter($state) {
    var includesFilter = function (state) {
        return $state.includes(state);
    };
    includesFilter.$stateful = true;
    return  includesFilter;
}

angular.module('ui.router.state')
    .filter('isState', $IsStateFilter)
    .filter('includedByState', $IncludedByStateFilter);

/**
 * @ngdoc object
 * @name ui.router.util.$templateFactory
 *
 * @requires $http
 * @requires $templateCache
 * @requires $injector
 *
 * @description
 * Service. Manages loading of templates.
 */
$TemplateFactory.$inject = ['$http', '$templateCache', '$injector'];
function $TemplateFactory(  $http,   $templateCache,   $injector) {

    /**
     * @ngdoc function
     * @name ui.router.util.$templateFactory#fromConfig
     * @methodOf ui.router.util.$templateFactory
     *
     * @description
     * Creates a template from a configuration object.
     *
     * @param {object} config Configuration object for which to load a template.
     * The following properties are search in the specified order, and the first one
     * that is defined is used to create the template:
     *
     * @param {string|object} config.template html string template or function to
     * load via {@link ui.router.util.$templateFactory#fromString fromString}.
     * @param {string|object} config.templateUrl url to load or a function returning
     * the url to load via {@link ui.router.util.$templateFactory#fromUrl fromUrl}.
     * @param {Function} config.templateProvider function to invoke via
     * {@link ui.router.util.$templateFactory#fromProvider fromProvider}.
     * @param {object} params  Parameters to pass to the template function.
     * @param {object} locals Locals to pass to `invoke` if the template is loaded
     * via a `templateProvider`. Defaults to `{ params: params }`.
     *
     * @return {string|object}  The template html as a string, or a promise for
     * that string,or `null` if no template is configured.
     */
    this.fromConfig = function (config, params, locals) {
        return (
            isDefined(config.template) ? this.fromString(config.template, params) :
                isDefined(config.templateUrl) ? this.fromUrl(config.templateUrl, params) :
                    isDefined(config.templateProvider) ? this.fromProvider(config.templateProvider, params, locals) :
                        null
        );
    };

    /**
     * @ngdoc function
     * @name ui.router.util.$templateFactory#fromString
     * @methodOf ui.router.util.$templateFactory
     *
     * @description
     * Creates a template from a string or a function returning a string.
     *
     * @param {string|object} template html template as a string or function that
     * returns an html template as a string.
     * @param {object} params Parameters to pass to the template function.
     *
     * @return {string|object} The template html as a string, or a promise for that
     * string.
     */
    this.fromString = function (template, params) {
        return isFunction(template) ? template(params) : template;
    };

    /**
     * @ngdoc function
     * @name ui.router.util.$templateFactory#fromUrl
     * @methodOf ui.router.util.$templateFactory
     *
     * @description
     * Loads a template from the a URL via `$http` and `$templateCache`.
     *
     * @param {string|Function} url url of the template to load, or a function
     * that returns a url.
     * @param {Object} params Parameters to pass to the url function.
     * @return {string|Promise.<string>} The template html as a string, or a promise
     * for that string.
     */
    this.fromUrl = function (url, params) {
        if (isFunction(url)) url = url(params);
        if (url == null) return null;
        else return $http
            .get(url, { cache: $templateCache, headers: { Accept: 'text/html' }})
            .then(function(response) { return response.data; });
    };

    /**
     * @ngdoc function
     * @name ui.router.util.$templateFactory#fromProvider
     * @methodOf ui.router.util.$templateFactory
     *
     * @description
     * Creates a template by invoking an injectable provider function.
     *
     * @param {Function} provider Function to invoke via `$injector.invoke`
     * @param {Object} params Parameters for the template.
     * @param {Object} locals Locals to pass to `invoke`. Defaults to
     * `{ params: params }`.
     * @return {string|Promise.<string>} The template html as a string, or a promise
     * for that string.
     */
    this.fromProvider = function (provider, params, locals) {
        return $injector.invoke(provider, null, locals || { params: params });
    };
}

angular.module('ui.router.util').service('$templateFactory', $TemplateFactory);

var $$UMFP; // reference to $UrlMatcherFactoryProvider

/**
 * @ngdoc object
 * @name ui.router.util.type:UrlMatcher
 *
 * @description
 * Matches URLs against patterns and extracts named parameters from the path or the search
 * part of the URL. A URL pattern consists of a path pattern, optionally followed by '?' and a list
 * of search parameters. Multiple search parameter names are separated by '&'. Search parameters
 * do not influence whether or not a URL is matched, but their values are passed through into
 * the matched parameters returned by {@link ui.router.util.type:UrlMatcher#methods_exec exec}.
 *
 * Path parameter placeholders can be specified using simple colon/catch-all syntax or curly brace
 * syntax, which optionally allows a regular expression for the parameter to be specified:
 *
 * * `':'` name - colon placeholder
 * * `'*'` name - catch-all placeholder
 * * `'{' name '}'` - curly placeholder
 * * `'{' name ':' regexp|type '}'` - curly placeholder with regexp or type name. Should the
 *   regexp itself contain curly braces, they must be in matched pairs or escaped with a backslash.
 *
 * Parameter names may contain only word characters (latin letters, digits, and underscore) and
 * must be unique within the pattern (across both path and search parameters). For colon
 * placeholders or curly placeholders without an explicit regexp, a path parameter matches any
 * number of characters other than '/'. For catch-all placeholders the path parameter matches
 * any number of characters.
 *
 * Examples:
 *
 * * `'/hello/'` - Matches only if the path is exactly '/hello/'. There is no special treatment for
 *   trailing slashes, and patterns have to match the entire path, not just a prefix.
 * * `'/user/:id'` - Matches '/user/bob' or '/user/1234!!!' or even '/user/' but not '/user' or
 *   '/user/bob/details'. The second path segment will be captured as the parameter 'id'.
 * * `'/user/{id}'` - Same as the previous example, but using curly brace syntax.
 * * `'/user/{id:[^/]*}'` - Same as the previous example.
 * * `'/user/{id:[0-9a-fA-F]{1,8}}'` - Similar to the previous example, but only matches if the id
 *   parameter consists of 1 to 8 hex digits.
 * * `'/files/{path:.*}'` - Matches any URL starting with '/files/' and captures the rest of the
 *   path into the parameter 'path'.
 * * `'/files/*path'` - ditto.
 * * `'/calendar/{start:date}'` - Matches "/calendar/2014-11-12" (because the pattern defined
 *   in the built-in  `date` Type matches `2014-11-12`) and provides a Date object in $stateParams.start
 *
 * @param {string} pattern  The pattern to compile into a matcher.
 * @param {Object} config  A configuration object hash:
 * @param {Object=} parentMatcher Used to concatenate the pattern/config onto
 *   an existing UrlMatcher
 *
 * * `caseInsensitive` - `true` if URL matching should be case insensitive, otherwise `false`, the default value (for backward compatibility) is `false`.
 * * `strict` - `false` if matching against a URL with a trailing slash should be treated as equivalent to a URL without a trailing slash, the default value is `true`.
 *
 * @property {string} prefix  A static prefix of this pattern. The matcher guarantees that any
 *   URL matching this matcher (i.e. any string for which {@link ui.router.util.type:UrlMatcher#methods_exec exec()} returns
 *   non-null) will start with this prefix.
 *
 * @property {string} source  The pattern that was passed into the constructor
 *
 * @property {string} sourcePath  The path portion of the source property
 *
 * @property {string} sourceSearch  The search portion of the source property
 *
 * @property {string} regex  The constructed regex that will be used to match against the url when
 *   it is time to determine which url will match.
 *
 * @returns {Object}  New `UrlMatcher` object
 */
function UrlMatcher(pattern, config, parentMatcher) {
    config = extend({ params: {} }, isObject(config) ? config : {});

    // Find all placeholders and create a compiled pattern, using either classic or curly syntax:
    //   '*' name
    //   ':' name
    //   '{' name '}'
    //   '{' name ':' regexp '}'
    // The regular expression is somewhat complicated due to the need to allow curly braces
    // inside the regular expression. The placeholder regexp breaks down as follows:
    //    ([:*])([\w\[\]]+)              - classic placeholder ($1 / $2) (search version has - for snake-case)
    //    \{([\w\[\]]+)(?:\:( ... ))?\}  - curly brace placeholder ($3) with optional regexp/type ... ($4) (search version has - for snake-case
    //    (?: ... | ... | ... )+         - the regexp consists of any number of atoms, an atom being either
    //    [^{}\\]+                       - anything other than curly braces or backslash
    //    \\.                            - a backslash escape
    //    \{(?:[^{}\\]+|\\.)*\}          - a matched set of curly braces containing other atoms
    var placeholder       = /([:*])([\w\[\]]+)|\{([\w\[\]]+)(?:\:((?:[^{}\\]+|\\.|\{(?:[^{}\\]+|\\.)*\})+))?\}/g,
        searchPlaceholder = /([:]?)([\w\[\]-]+)|\{([\w\[\]-]+)(?:\:((?:[^{}\\]+|\\.|\{(?:[^{}\\]+|\\.)*\})+))?\}/g,
        compiled = '^', last = 0, m,
        segments = this.segments = [],
        parentParams = parentMatcher ? parentMatcher.params : {},
        params = this.params = parentMatcher ? parentMatcher.params.$$new() : new $$UMFP.ParamSet(),
        paramNames = [];

    function addParameter(id, type, config, location) {
        paramNames.push(id);
        if (parentParams[id]) return parentParams[id];
        if (!/^\w+(-+\w+)*(?:\[\])?$/.test(id)) throw new Error("Invalid parameter name '" + id + "' in pattern '" + pattern + "'");
        if (params[id]) throw new Error("Duplicate parameter name '" + id + "' in pattern '" + pattern + "'");
        params[id] = new $$UMFP.Param(id, type, config, location);
        return params[id];
    }

    function quoteRegExp(string, pattern, squash, optional) {
        var surroundPattern = ['',''], result = string.replace(/[\\\[\]\^$*+?.()|{}]/g, "\\$&");
        if (!pattern) return result;
        switch(squash) {
            case false: surroundPattern = ['(', ')' + (optional ? "?" : "")]; break;
            case true:  surroundPattern = ['?(', ')?']; break;
            default:    surroundPattern = ['(' + squash + "|", ')?']; break;
        }
        return result + surroundPattern[0] + pattern + surroundPattern[1];
    }

    this.source = pattern;

    // Split into static segments separated by path parameter placeholders.
    // The number of segments is always 1 more than the number of parameters.
    function matchDetails(m, isSearch) {
        var id, regexp, segment, type, cfg, arrayMode;
        id          = m[2] || m[3]; // IE[78] returns '' for unmatched groups instead of null
        cfg         = config.params[id];
        segment     = pattern.substring(last, m.index);
        regexp      = isSearch ? m[4] : m[4] || (m[1] == '*' ? '.*' : null);
        type        = $$UMFP.type(regexp || "string") || inherit($$UMFP.type("string"), { pattern: new RegExp(regexp, config.caseInsensitive ? 'i' : undefined) });
        return {
            id: id, regexp: regexp, segment: segment, type: type, cfg: cfg
        };
    }

    var p, param, segment;
    while ((m = placeholder.exec(pattern))) {
        p = matchDetails(m, false);
        if (p.segment.indexOf('?') >= 0) break; // we're into the search part

        param = addParameter(p.id, p.type, p.cfg, "path");
        compiled += quoteRegExp(p.segment, param.type.pattern.source, param.squash, param.isOptional);
        segments.push(p.segment);
        last = placeholder.lastIndex;
    }
    segment = pattern.substring(last);

    // Find any search parameter names and remove them from the last segment
    var i = segment.indexOf('?');

    if (i >= 0) {
        var search = this.sourceSearch = segment.substring(i);
        segment = segment.substring(0, i);
        this.sourcePath = pattern.substring(0, last + i);

        if (search.length > 0) {
            last = 0;
            while ((m = searchPlaceholder.exec(search))) {
                p = matchDetails(m, true);
                param = addParameter(p.id, p.type, p.cfg, "search");
                last = placeholder.lastIndex;
                // check if ?&
            }
        }
    } else {
        this.sourcePath = pattern;
        this.sourceSearch = '';
    }

    compiled += quoteRegExp(segment) + (config.strict === false ? '\/?' : '') + '$';
    segments.push(segment);

    this.regexp = new RegExp(compiled, config.caseInsensitive ? 'i' : undefined);
    this.prefix = segments[0];
    this.$$paramNames = paramNames;
}

/**
 * @ngdoc function
 * @name ui.router.util.type:UrlMatcher#concat
 * @methodOf ui.router.util.type:UrlMatcher
 *
 * @description
 * Returns a new matcher for a pattern constructed by appending the path part and adding the
 * search parameters of the specified pattern to this pattern. The current pattern is not
 * modified. This can be understood as creating a pattern for URLs that are relative to (or
 * suffixes of) the current pattern.
 *
 * @example
 * The following two matchers are equivalent:
 * <pre>
 * new UrlMatcher('/user/{id}?q').concat('/details?date');
 * new UrlMatcher('/user/{id}/details?q&date');
 * </pre>
 *
 * @param {string} pattern  The pattern to append.
 * @param {Object} config  An object hash of the configuration for the matcher.
 * @returns {UrlMatcher}  A matcher for the concatenated pattern.
 */
UrlMatcher.prototype.concat = function (pattern, config) {
    // Because order of search parameters is irrelevant, we can add our own search
    // parameters to the end of the new pattern. Parse the new pattern by itself
    // and then join the bits together, but it's much easier to do this on a string level.
    var defaultConfig = {
        caseInsensitive: $$UMFP.caseInsensitive(),
        strict: $$UMFP.strictMode(),
        squash: $$UMFP.defaultSquashPolicy()
    };
    return new UrlMatcher(this.sourcePath + pattern + this.sourceSearch, extend(defaultConfig, config), this);
};

UrlMatcher.prototype.toString = function () {
    return this.source;
};

/**
 * @ngdoc function
 * @name ui.router.util.type:UrlMatcher#exec
 * @methodOf ui.router.util.type:UrlMatcher
 *
 * @description
 * Tests the specified path against this matcher, and returns an object containing the captured
 * parameter values, or null if the path does not match. The returned object contains the values
 * of any search parameters that are mentioned in the pattern, but their value may be null if
 * they are not present in `searchParams`. This means that search parameters are always treated
 * as optional.
 *
 * @example
 * <pre>
 * new UrlMatcher('/user/{id}?q&r').exec('/user/bob', {
 *   x: '1', q: 'hello'
 * });
 * // returns { id: 'bob', q: 'hello', r: null }
 * </pre>
 *
 * @param {string} path  The URL path to match, e.g. `$location.path()`.
 * @param {Object} searchParams  URL search parameters, e.g. `$location.search()`.
 * @returns {Object}  The captured parameter values.
 */
UrlMatcher.prototype.exec = function (path, searchParams) {
    var m = this.regexp.exec(path);
    if (!m) return null;
    searchParams = searchParams || {};

    var paramNames = this.parameters(), nTotal = paramNames.length,
        nPath = this.segments.length - 1,
        values = {}, i, j, cfg, paramName;

    if (nPath !== m.length - 1) throw new Error("Unbalanced capture group in route '" + this.source + "'");

    function decodePathArray(string) {
        function reverseString(str) { return str.split("").reverse().join(""); }
        function unquoteDashes(str) { return str.replace(/\\-/g, "-"); }

        var split = reverseString(string).split(/-(?!\\)/);
        var allReversed = map(split, reverseString);
        return map(allReversed, unquoteDashes).reverse();
    }

    for (i = 0; i < nPath; i++) {
        paramName = paramNames[i];
        var param = this.params[paramName];
        var paramVal = m[i+1];
        // if the param value matches a pre-replace pair, replace the value before decoding.
        for (j = 0; j < param.replace; j++) {
            if (param.replace[j].from === paramVal) paramVal = param.replace[j].to;
        }
        if (paramVal && param.array === true) paramVal = decodePathArray(paramVal);
        values[paramName] = param.value(paramVal);
    }
    for (/**/; i < nTotal; i++) {
        paramName = paramNames[i];
        values[paramName] = this.params[paramName].value(searchParams[paramName]);
    }

    return values;
};

/**
 * @ngdoc function
 * @name ui.router.util.type:UrlMatcher#parameters
 * @methodOf ui.router.util.type:UrlMatcher
 *
 * @description
 * Returns the names of all path and search parameters of this pattern in an unspecified order.
 *
 * @returns {Array.<string>}  An array of parameter names. Must be treated as read-only. If the
 *    pattern has no parameters, an empty array is returned.
 */
UrlMatcher.prototype.parameters = function (param) {
    if (!isDefined(param)) return this.$$paramNames;
    return this.params[param] || null;
};

/**
 * @ngdoc function
 * @name ui.router.util.type:UrlMatcher#validate
 * @methodOf ui.router.util.type:UrlMatcher
 *
 * @description
 * Checks an object hash of parameters to validate their correctness according to the parameter
 * types of this `UrlMatcher`.
 *
 * @param {Object} params The object hash of parameters to validate.
 * @returns {boolean} Returns `true` if `params` validates, otherwise `false`.
 */
UrlMatcher.prototype.validates = function (params) {
    return this.params.$$validates(params);
};

/**
 * @ngdoc function
 * @name ui.router.util.type:UrlMatcher#format
 * @methodOf ui.router.util.type:UrlMatcher
 *
 * @description
 * Creates a URL that matches this pattern by substituting the specified values
 * for the path and search parameters. Null values for path parameters are
 * treated as empty strings.
 *
 * @example
 * <pre>
 * new UrlMatcher('/user/{id}?q').format({ id:'bob', q:'yes' });
 * // returns '/user/bob?q=yes'
 * </pre>
 *
 * @param {Object} values  the values to substitute for the parameters in this pattern.
 * @returns {string}  the formatted URL (path and optionally search part).
 */
UrlMatcher.prototype.format = function (values) {
    values = values || {};
    var segments = this.segments, params = this.parameters(), paramset = this.params;
    if (!this.validates(values)) return null;

    var i, search = false, nPath = segments.length - 1, nTotal = params.length, result = segments[0];

    function encodeDashes(str) { // Replace dashes with encoded "\-"
        return encodeURIComponent(str).replace(/-/g, function(c) { return '%5C%' + c.charCodeAt(0).toString(16).toUpperCase(); });
    }

    for (i = 0; i < nTotal; i++) {
        var isPathParam = i < nPath;
        var name = params[i], param = paramset[name], value = param.value(values[name]);
        var isDefaultValue = param.isOptional && param.type.equals(param.value(), value);
        var squash = isDefaultValue ? param.squash : false;
        var encoded = param.type.encode(value);

        if (isPathParam) {
            var nextSegment = segments[i + 1];
            if (squash === false) {
                if (encoded != null) {
                    if (isArray(encoded)) {
                        result += map(encoded, encodeDashes).join("-");
                    } else {
                        result += encodeURIComponent(encoded);
                    }
                }
                result += nextSegment;
            } else if (squash === true) {
                var capture = result.match(/\/$/) ? /\/?(.*)/ : /(.*)/;
                result += nextSegment.match(capture)[1];
            } else if (isString(squash)) {
                result += squash + nextSegment;
            }
        } else {
            if (encoded == null || (isDefaultValue && squash !== false)) continue;
            if (!isArray(encoded)) encoded = [ encoded ];
            encoded = map(encoded, encodeURIComponent).join('&' + name + '=');
            result += (search ? '&' : '?') + (name + '=' + encoded);
            search = true;
        }
    }

    return result;
};

/**
 * @ngdoc object
 * @name ui.router.util.type:Type
 *
 * @description
 * Implements an interface to define custom parameter types that can be decoded from and encoded to
 * string parameters matched in a URL. Used by {@link ui.router.util.type:UrlMatcher `UrlMatcher`}
 * objects when matching or formatting URLs, or comparing or validating parameter values.
 *
 * See {@link ui.router.util.$urlMatcherFactory#methods_type `$urlMatcherFactory#type()`} for more
 * information on registering custom types.
 *
 * @param {Object} config  A configuration object which contains the custom type definition.  The object's
 *        properties will override the default methods and/or pattern in `Type`'s public interface.
 * @example
 * <pre>
 * {
 *   decode: function(val) { return parseInt(val, 10); },
 *   encode: function(val) { return val && val.toString(); },
 *   equals: function(a, b) { return this.is(a) && a === b; },
 *   is: function(val) { return angular.isNumber(val) isFinite(val) && val % 1 === 0; },
 *   pattern: /\d+/
 * }
 * </pre>
 *
 * @property {RegExp} pattern The regular expression pattern used to match values of this type when
 *           coming from a substring of a URL.
 *
 * @returns {Object}  Returns a new `Type` object.
 */
function Type(config) {
    extend(this, config);
}

/**
 * @ngdoc function
 * @name ui.router.util.type:Type#is
 * @methodOf ui.router.util.type:Type
 *
 * @description
 * Detects whether a value is of a particular type. Accepts a native (decoded) value
 * and determines whether it matches the current `Type` object.
 *
 * @param {*} val  The value to check.
 * @param {string} key  Optional. If the type check is happening in the context of a specific
 *        {@link ui.router.util.type:UrlMatcher `UrlMatcher`} object, this is the name of the
 *        parameter in which `val` is stored. Can be used for meta-programming of `Type` objects.
 * @returns {Boolean}  Returns `true` if the value matches the type, otherwise `false`.
 */
Type.prototype.is = function(val, key) {
    return true;
};

/**
 * @ngdoc function
 * @name ui.router.util.type:Type#encode
 * @methodOf ui.router.util.type:Type
 *
 * @description
 * Encodes a custom/native type value to a string that can be embedded in a URL. Note that the
 * return value does *not* need to be URL-safe (i.e. passed through `encodeURIComponent()`), it
 * only needs to be a representation of `val` that has been coerced to a string.
 *
 * @param {*} val  The value to encode.
 * @param {string} key  The name of the parameter in which `val` is stored. Can be used for
 *        meta-programming of `Type` objects.
 * @returns {string}  Returns a string representation of `val` that can be encoded in a URL.
 */
Type.prototype.encode = function(val, key) {
    return val;
};

/**
 * @ngdoc function
 * @name ui.router.util.type:Type#decode
 * @methodOf ui.router.util.type:Type
 *
 * @description
 * Converts a parameter value (from URL string or transition param) to a custom/native value.
 *
 * @param {string} val  The URL parameter value to decode.
 * @param {string} key  The name of the parameter in which `val` is stored. Can be used for
 *        meta-programming of `Type` objects.
 * @returns {*}  Returns a custom representation of the URL parameter value.
 */
Type.prototype.decode = function(val, key) {
    return val;
};

/**
 * @ngdoc function
 * @name ui.router.util.type:Type#equals
 * @methodOf ui.router.util.type:Type
 *
 * @description
 * Determines whether two decoded values are equivalent.
 *
 * @param {*} a  A value to compare against.
 * @param {*} b  A value to compare against.
 * @returns {Boolean}  Returns `true` if the values are equivalent/equal, otherwise `false`.
 */
Type.prototype.equals = function(a, b) {
    return a == b;
};

Type.prototype.$subPattern = function() {
    var sub = this.pattern.toString();
    return sub.substr(1, sub.length - 2);
};

Type.prototype.pattern = /.*/;

Type.prototype.toString = function() { return "{Type:" + this.name + "}"; };

/** Given an encoded string, or a decoded object, returns a decoded object */
Type.prototype.$normalize = function(val) {
    return this.is(val) ? val : this.decode(val);
};

/*
 * Wraps an existing custom Type as an array of Type, depending on 'mode'.
 * e.g.:
 * - urlmatcher pattern "/path?{queryParam[]:int}"
 * - url: "/path?queryParam=1&queryParam=2
 * - $stateParams.queryParam will be [1, 2]
 * if `mode` is "auto", then
 * - url: "/path?queryParam=1 will create $stateParams.queryParam: 1
 * - url: "/path?queryParam=1&queryParam=2 will create $stateParams.queryParam: [1, 2]
 */
Type.prototype.$asArray = function(mode, isSearch) {
    if (!mode) return this;
    if (mode === "auto" && !isSearch) throw new Error("'auto' array mode is for query parameters only");

    function ArrayType(type, mode) {
        function bindTo(type, callbackName) {
            return function() {
                return type[callbackName].apply(type, arguments);
            };
        }

        // Wrap non-array value as array
        function arrayWrap(val) { return isArray(val) ? val : (isDefined(val) ? [ val ] : []); }
        // Unwrap array value for "auto" mode. Return undefined for empty array.
        function arrayUnwrap(val) {
            switch(val.length) {
                case 0: return undefined;
                case 1: return mode === "auto" ? val[0] : val;
                default: return val;
            }
        }
        function falsey(val) { return !val; }

        // Wraps type (.is/.encode/.decode) functions to operate on each value of an array
        function arrayHandler(callback, allTruthyMode) {
            return function handleArray(val) {
                val = arrayWrap(val);
                var result = map(val, callback);
                if (allTruthyMode === true)
                    return filter(result, falsey).length === 0;
                return arrayUnwrap(result);
            };
        }

        // Wraps type (.equals) functions to operate on each value of an array
        function arrayEqualsHandler(callback) {
            return function handleArray(val1, val2) {
                var left = arrayWrap(val1), right = arrayWrap(val2);
                if (left.length !== right.length) return false;
                for (var i = 0; i < left.length; i++) {
                    if (!callback(left[i], right[i])) return false;
                }
                return true;
            };
        }

        this.encode = arrayHandler(bindTo(type, 'encode'));
        this.decode = arrayHandler(bindTo(type, 'decode'));
        this.is     = arrayHandler(bindTo(type, 'is'), true);
        this.equals = arrayEqualsHandler(bindTo(type, 'equals'));
        this.pattern = type.pattern;
        this.$normalize = arrayHandler(bindTo(type, '$normalize'));
        this.name = type.name;
        this.$arrayMode = mode;
    }

    return new ArrayType(this, mode);
};



/**
 * @ngdoc object
 * @name ui.router.util.$urlMatcherFactory
 *
 * @description
 * Factory for {@link ui.router.util.type:UrlMatcher `UrlMatcher`} instances. The factory
 * is also available to providers under the name `$urlMatcherFactoryProvider`.
 */
function $UrlMatcherFactory() {
    $$UMFP = this;

    var isCaseInsensitive = false, isStrictMode = true, defaultSquashPolicy = false;

    function valToString(val) { return val != null ? val.toString().replace(/\//g, "%2F") : val; }
    function valFromString(val) { return val != null ? val.toString().replace(/%2F/g, "/") : val; }
    //  TODO: in 1.0, make string .is() return false if value is undefined by default.
    //  function regexpMatches(val) { /*jshint validthis:true */ return isDefined(val) && this.pattern.test(val); }
    function regexpMatches(val) { /*jshint validthis:true */ return this.pattern.test(val); }

    var $types = {}, enqueue = true, typeQueue = [], injector, defaultTypes = {
        string: {
            encode: valToString,
            decode: valFromString,
            is: function(val) { return typeof val === "string"; },
            pattern: /[^/]*/
        },
        int: {
            encode: valToString,
            decode: function(val) { return parseInt(val, 10); },
            is: function(val) { return isDefined(val) && this.decode(val.toString()) === val; },
            pattern: /\d+/
        },
        bool: {
            encode: function(val) { return val ? 1 : 0; },
            decode: function(val) { return parseInt(val, 10) !== 0; },
            is: function(val) { return val === true || val === false; },
            pattern: /0|1/
        },
        date: {
            encode: function (val) {
                if (!this.is(val))
                    return undefined;
                return [ val.getFullYear(),
                         ('0' + (val.getMonth() + 1)).slice(-2),
                         ('0' + val.getDate()).slice(-2)
                ].join("-");
            },
            decode: function (val) {
                if (this.is(val)) return val;
                var match = this.capture.exec(val);
                return match ? new Date(match[1], match[2] - 1, match[3]) : undefined;
            },
            is: function(val) { return val instanceof Date && !isNaN(val.valueOf()); },
            equals: function (a, b) { return this.is(a) && this.is(b) && a.toISOString() === b.toISOString(); },
            pattern: /[0-9]{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[1-2][0-9]|3[0-1])/,
            capture: /([0-9]{4})-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])/
        },
        json: {
            encode: angular.toJson,
            decode: angular.fromJson,
            is: angular.isObject,
            equals: angular.equals,
            pattern: /[^/]*/
        },
        any: { // does not encode/decode
            encode: angular.identity,
            decode: angular.identity,
            is: angular.identity,
            equals: angular.equals,
            pattern: /.*/
        }
    };

    function getDefaultConfig() {
        return {
            strict: isStrictMode,
            caseInsensitive: isCaseInsensitive
        };
    }

    function isInjectable(value) {
        return (isFunction(value) || (isArray(value) && isFunction(value[value.length - 1])));
    }

    /**
     * [Internal] Get the default value of a parameter, which may be an injectable function.
     */
    $UrlMatcherFactory.$$getDefaultValue = function(config) {
        if (!isInjectable(config.value)) return config.value;
        if (!injector) throw new Error("Injectable functions cannot be called at configuration time");
        return injector.invoke(config.value);
    };

    /**
     * @ngdoc function
     * @name ui.router.util.$urlMatcherFactory#caseInsensitive
     * @methodOf ui.router.util.$urlMatcherFactory
     *
     * @description
     * Defines whether URL matching should be case sensitive (the default behavior), or not.
     *
     * @param {boolean} value `false` to match URL in a case sensitive manner; otherwise `true`;
     * @returns {boolean} the current value of caseInsensitive
     */
    this.caseInsensitive = function(value) {
        if (isDefined(value))
            isCaseInsensitive = value;
        return isCaseInsensitive;
    };

    /**
     * @ngdoc function
     * @name ui.router.util.$urlMatcherFactory#strictMode
     * @methodOf ui.router.util.$urlMatcherFactory
     *
     * @description
     * Defines whether URLs should match trailing slashes, or not (the default behavior).
     *
     * @param {boolean=} value `false` to match trailing slashes in URLs, otherwise `true`.
     * @returns {boolean} the current value of strictMode
     */
    this.strictMode = function(value) {
        if (isDefined(value))
            isStrictMode = value;
        return isStrictMode;
    };

    /**
     * @ngdoc function
     * @name ui.router.util.$urlMatcherFactory#defaultSquashPolicy
     * @methodOf ui.router.util.$urlMatcherFactory
     *
     * @description
     * Sets the default behavior when generating or matching URLs with default parameter values.
     *
     * @param {string} value A string that defines the default parameter URL squashing behavior.
     *    `nosquash`: When generating an href with a default parameter value, do not squash the parameter value from the URL
     *    `slash`: When generating an href with a default parameter value, squash (remove) the parameter value, and, if the
     *             parameter is surrounded by slashes, squash (remove) one slash from the URL
     *    any other string, e.g. "~": When generating an href with a default parameter value, squash (remove)
     *             the parameter value from the URL and replace it with this string.
     */
    this.defaultSquashPolicy = function(value) {
        if (!isDefined(value)) return defaultSquashPolicy;
        if (value !== true && value !== false && !isString(value))
            throw new Error("Invalid squash policy: " + value + ". Valid policies: false, true, arbitrary-string");
        defaultSquashPolicy = value;
        return value;
    };

    /**
     * @ngdoc function
     * @name ui.router.util.$urlMatcherFactory#compile
     * @methodOf ui.router.util.$urlMatcherFactory
     *
     * @description
     * Creates a {@link ui.router.util.type:UrlMatcher `UrlMatcher`} for the specified pattern.
     *
     * @param {string} pattern  The URL pattern.
     * @param {Object} config  The config object hash.
     * @returns {UrlMatcher}  The UrlMatcher.
     */
    this.compile = function (pattern, config) {
        return new UrlMatcher(pattern, extend(getDefaultConfig(), config));
    };

    /**
     * @ngdoc function
     * @name ui.router.util.$urlMatcherFactory#isMatcher
     * @methodOf ui.router.util.$urlMatcherFactory
     *
     * @description
     * Returns true if the specified object is a `UrlMatcher`, or false otherwise.
     *
     * @param {Object} object  The object to perform the type check against.
     * @returns {Boolean}  Returns `true` if the object matches the `UrlMatcher` interface, by
     *          implementing all the same methods.
     */
    this.isMatcher = function (o) {
        if (!isObject(o)) return false;
        var result = true;

        forEach(UrlMatcher.prototype, function(val, name) {
            if (isFunction(val)) {
                result = result && (isDefined(o[name]) && isFunction(o[name]));
            }
        });
        return result;
    };

    /**
     * @ngdoc function
     * @name ui.router.util.$urlMatcherFactory#type
     * @methodOf ui.router.util.$urlMatcherFactory
     *
     * @description
     * Registers a custom {@link ui.router.util.type:Type `Type`} object that can be used to
     * generate URLs with typed parameters.
     *
     * @param {string} name  The type name.
     * @param {Object|Function} definition   The type definition. See
     *        {@link ui.router.util.type:Type `Type`} for information on the values accepted.
     * @param {Object|Function} definitionFn (optional) A function that is injected before the app
     *        runtime starts.  The result of this function is merged into the existing `definition`.
     *        See {@link ui.router.util.type:Type `Type`} for information on the values accepted.
     *
     * @returns {Object}  Returns `$urlMatcherFactoryProvider`.
     *
     * @example
     * This is a simple example of a custom type that encodes and decodes items from an
     * array, using the array index as the URL-encoded value:
     *
     * <pre>
     * var list = ['John', 'Paul', 'George', 'Ringo'];
     *
     * $urlMatcherFactoryProvider.type('listItem', {
   *   encode: function(item) {
   *     // Represent the list item in the URL using its corresponding index
   *     return list.indexOf(item);
   *   },
   *   decode: function(item) {
   *     // Look up the list item by index
   *     return list[parseInt(item, 10)];
   *   },
   *   is: function(item) {
   *     // Ensure the item is valid by checking to see that it appears
   *     // in the list
   *     return list.indexOf(item) > -1;
   *   }
   * });
     *
     * $stateProvider.state('list', {
   *   url: "/list/{item:listItem}",
   *   controller: function($scope, $stateParams) {
   *     console.log($stateParams.item);
   *   }
   * });
     *
     * // ...
     *
     * // Changes URL to '/list/3', logs "Ringo" to the console
     * $state.go('list', { item: "Ringo" });
     * </pre>
     *
     * This is a more complex example of a type that relies on dependency injection to
     * interact with services, and uses the parameter name from the URL to infer how to
     * handle encoding and decoding parameter values:
     *
     * <pre>
     * // Defines a custom type that gets a value from a service,
     * // where each service gets different types of values from
     * // a backend API:
     * $urlMatcherFactoryProvider.type('dbObject', {}, function(Users, Posts) {
   *
   *   // Matches up services to URL parameter names
   *   var services = {
   *     user: Users,
   *     post: Posts
   *   };
   *
   *   return {
   *     encode: function(object) {
   *       // Represent the object in the URL using its unique ID
   *       return object.id;
   *     },
   *     decode: function(value, key) {
   *       // Look up the object by ID, using the parameter
   *       // name (key) to call the correct service
   *       return services[key].findById(value);
   *     },
   *     is: function(object, key) {
   *       // Check that object is a valid dbObject
   *       return angular.isObject(object) && object.id && services[key];
   *     }
   *     equals: function(a, b) {
   *       // Check the equality of decoded objects by comparing
   *       // their unique IDs
   *       return a.id === b.id;
   *     }
   *   };
   * });
     *
     * // In a config() block, you can then attach URLs with
     * // type-annotated parameters:
     * $stateProvider.state('users', {
   *   url: "/users",
   *   // ...
   * }).state('users.item', {
   *   url: "/{user:dbObject}",
   *   controller: function($scope, $stateParams) {
   *     // $stateParams.user will now be an object returned from
   *     // the Users service
   *   },
   *   // ...
   * });
     * </pre>
     */
    this.type = function (name, definition, definitionFn) {
        if (!isDefined(definition)) return $types[name];
        if ($types.hasOwnProperty(name)) throw new Error("A type named '" + name + "' has already been defined.");

        $types[name] = new Type(extend({ name: name }, definition));
        if (definitionFn) {
            typeQueue.push({ name: name, def: definitionFn });
            if (!enqueue) flushTypeQueue();
        }
        return this;
    };

    // `flushTypeQueue()` waits until `$urlMatcherFactory` is injected before invoking the queued `definitionFn`s
    function flushTypeQueue() {
        while(typeQueue.length) {
            var type = typeQueue.shift();
            if (type.pattern) throw new Error("You cannot override a type's .pattern at runtime.");
            angular.extend($types[type.name], injector.invoke(type.def));
        }
    }

    // Register default types. Store them in the prototype of $types.
    forEach(defaultTypes, function(type, name) { $types[name] = new Type(extend({name: name}, type)); });
    $types = inherit($types, {});

    /* No need to document $get, since it returns this */
    this.$get = ['$injector', function ($injector) {
        injector = $injector;
        enqueue = false;
        flushTypeQueue();

        forEach(defaultTypes, function(type, name) {
            if (!$types[name]) $types[name] = new Type(type);
        });
        return this;
    }];

    this.Param = function Param(id, type, config, location) {
        var self = this;
        config = unwrapShorthand(config);
        type = getType(config, type, location);
        var arrayMode = getArrayMode();
        type = arrayMode ? type.$asArray(arrayMode, location === "search") : type;
        if (type.name === "string" && !arrayMode && location === "path" && config.value === undefined)
            config.value = ""; // for 0.2.x; in 0.3.0+ do not automatically default to ""
        var isOptional = config.value !== undefined;
        var squash = getSquashPolicy(config, isOptional);
        var replace = getReplace(config, arrayMode, isOptional, squash);

        function unwrapShorthand(config) {
            var keys = isObject(config) ? objectKeys(config) : [];
            var isShorthand = indexOf(keys, "value") === -1 && indexOf(keys, "type") === -1 &&
                indexOf(keys, "squash") === -1 && indexOf(keys, "array") === -1;
            if (isShorthand) config = { value: config };
            config.$$fn = isInjectable(config.value) ? config.value : function () { return config.value; };
            return config;
        }

        function getType(config, urlType, location) {
            if (config.type && urlType) throw new Error("Param '"+id+"' has two type configurations.");
            if (urlType) return urlType;
            if (!config.type) return (location === "config" ? $types.any : $types.string);
            return config.type instanceof Type ? config.type : new Type(config.type);
        }

        // array config: param name (param[]) overrides default settings.  explicit config overrides param name.
        function getArrayMode() {
            var arrayDefaults = { array: (location === "search" ? "auto" : false) };
            var arrayParamNomenclature = id.match(/\[\]$/) ? { array: true } : {};
            return extend(arrayDefaults, arrayParamNomenclature, config).array;
        }

        /**
         * returns false, true, or the squash value to indicate the "default parameter url squash policy".
         */
        function getSquashPolicy(config, isOptional) {
            var squash = config.squash;
            if (!isOptional || squash === false) return false;
            if (!isDefined(squash) || squash == null) return defaultSquashPolicy;
            if (squash === true || isString(squash)) return squash;
            throw new Error("Invalid squash policy: '" + squash + "'. Valid policies: false, true, or arbitrary string");
        }

        function getReplace(config, arrayMode, isOptional, squash) {
            var replace, configuredKeys, defaultPolicy = [
                { from: "",   to: (isOptional || arrayMode ? undefined : "") },
                { from: null, to: (isOptional || arrayMode ? undefined : "") }
            ];
            replace = isArray(config.replace) ? config.replace : [];
            if (isString(squash))
                replace.push({ from: squash, to: undefined });
            configuredKeys = map(replace, function(item) { return item.from; } );
            return filter(defaultPolicy, function(item) { return indexOf(configuredKeys, item.from) === -1; }).concat(replace);
        }

        /**
         * [Internal] Get the default value of a parameter, which may be an injectable function.
         */
        function $$getDefaultValue() {
            if (!injector) throw new Error("Injectable functions cannot be called at configuration time");
            var defaultValue = injector.invoke(config.$$fn);
            if (defaultValue !== null && defaultValue !== undefined && !self.type.is(defaultValue))
                throw new Error("Default value (" + defaultValue + ") for parameter '" + self.id + "' is not an instance of Type (" + self.type.name + ")");
            return defaultValue;
        }

        /**
         * [Internal] Gets the decoded representation of a value if the value is defined, otherwise, returns the
         * default value, which may be the result of an injectable function.
         */
        function $value(value) {
            function hasReplaceVal(val) { return function(obj) { return obj.from === val; }; }
            function $replace(value) {
                var replacement = map(filter(self.replace, hasReplaceVal(value)), function(obj) { return obj.to; });
                return replacement.length ? replacement[0] : value;
            }
            value = $replace(value);
            return !isDefined(value) ? $$getDefaultValue() : self.type.$normalize(value);
        }

        function toString() { return "{Param:" + id + " " + type + " squash: '" + squash + "' optional: " + isOptional + "}"; }

        extend(this, {
            id: id,
            type: type,
            location: location,
            array: arrayMode,
            squash: squash,
            replace: replace,
            isOptional: isOptional,
            value: $value,
            dynamic: undefined,
            config: config,
            toString: toString
        });
    };

    function ParamSet(params) {
        extend(this, params || {});
    }

    ParamSet.prototype = {
        $$new: function() {
            return inherit(this, extend(new ParamSet(), { $$parent: this}));
        },
        $$keys: function () {
            var keys = [], chain = [], parent = this,
                ignore = objectKeys(ParamSet.prototype);
            while (parent) { chain.push(parent); parent = parent.$$parent; }
            chain.reverse();
            forEach(chain, function(paramset) {
                forEach(objectKeys(paramset), function(key) {
                    if (indexOf(keys, key) === -1 && indexOf(ignore, key) === -1) keys.push(key);
                });
            });
            return keys;
        },
        $$values: function(paramValues) {
            var values = {}, self = this;
            forEach(self.$$keys(), function(key) {
                values[key] = self[key].value(paramValues && paramValues[key]);
            });
            return values;
        },
        $$equals: function(paramValues1, paramValues2) {
            var equal = true, self = this;
            forEach(self.$$keys(), function(key) {
                var left = paramValues1 && paramValues1[key], right = paramValues2 && paramValues2[key];
                if (!self[key].type.equals(left, right)) equal = false;
            });
            return equal;
        },
        $$validates: function $$validate(paramValues) {
            var keys = this.$$keys(), i, param, rawVal, normalized, encoded;
            for (i = 0; i < keys.length; i++) {
                param = this[keys[i]];
                rawVal = paramValues[keys[i]];
                if ((rawVal === undefined || rawVal === null) && param.isOptional)
                    break; // There was no parameter value, but the param is optional
                normalized = param.type.$normalize(rawVal);
                if (!param.type.is(normalized))
                    return false; // The value was not of the correct Type, and could not be decoded to the correct Type
                encoded = param.type.encode(normalized);
                if (angular.isString(encoded) && !param.type.pattern.exec(encoded))
                    return false; // The value was of the correct type, but when encoded, did not match the Type's regexp
            }
            return true;
        },
        $$parent: undefined
    };

    this.ParamSet = ParamSet;
}

// Register as a provider so it's available to other providers
angular.module('ui.router.util').provider('$urlMatcherFactory', $UrlMatcherFactory);
angular.module('ui.router.util').run(['$urlMatcherFactory', function($urlMatcherFactory) { }]);

/**
 * @ngdoc object
 * @name ui.router.router.$urlRouterProvider
 *
 * @requires ui.router.util.$urlMatcherFactoryProvider
 * @requires $locationProvider
 *
 * @description
 * `$urlRouterProvider` has the responsibility of watching `$location`.
 * When `$location` changes it runs through a list of rules one by one until a
 * match is found. `$urlRouterProvider` is used behind the scenes anytime you specify
 * a url in a state configuration. All urls are compiled into a UrlMatcher object.
 *
 * There are several methods on `$urlRouterProvider` that make it useful to use directly
 * in your module config.
 */
$UrlRouterProvider.$inject = ['$locationProvider', '$urlMatcherFactoryProvider'];
function $UrlRouterProvider(   $locationProvider,   $urlMatcherFactory) {
    var rules = [], otherwise = null, interceptDeferred = false, listener;

    // Returns a string that is a prefix of all strings matching the RegExp
    function regExpPrefix(re) {
        var prefix = /^\^((?:\\[^a-zA-Z0-9]|[^\\\[\]\^$*+?.()|{}]+)*)/.exec(re.source);
        return (prefix != null) ? prefix[1].replace(/\\(.)/g, "$1") : '';
    }

    // Interpolates matched values into a String.replace()-style pattern
    function interpolate(pattern, match) {
        return pattern.replace(/\$(\$|\d{1,2})/, function (m, what) {
            return match[what === '$' ? 0 : Number(what)];
        });
    }

    /**
     * @ngdoc function
     * @name ui.router.router.$urlRouterProvider#rule
     * @methodOf ui.router.router.$urlRouterProvider
     *
     * @description
     * Defines rules that are used by `$urlRouterProvider` to find matches for
     * specific URLs.
     *
     * @example
     * <pre>
     * var app = angular.module('app', ['ui.router.router']);
     *
     * app.config(function ($urlRouterProvider) {
   *   // Here's an example of how you might allow case insensitive urls
   *   $urlRouterProvider.rule(function ($injector, $location) {
   *     var path = $location.path(),
   *         normalized = path.toLowerCase();
   *
   *     if (path !== normalized) {
   *       return normalized;
   *     }
   *   });
   * });
     * </pre>
     *
     * @param {object} rule Handler function that takes `$injector` and `$location`
     * services as arguments. You can use them to return a valid path as a string.
     *
     * @return {object} `$urlRouterProvider` - `$urlRouterProvider` instance
     */
    this.rule = function (rule) {
        if (!isFunction(rule)) throw new Error("'rule' must be a function");
        rules.push(rule);
        return this;
    };

    /**
     * @ngdoc object
     * @name ui.router.router.$urlRouterProvider#otherwise
     * @methodOf ui.router.router.$urlRouterProvider
     *
     * @description
     * Defines a path that is used when an invalid route is requested.
     *
     * @example
     * <pre>
     * var app = angular.module('app', ['ui.router.router']);
     *
     * app.config(function ($urlRouterProvider) {
   *   // if the path doesn't match any of the urls you configured
   *   // otherwise will take care of routing the user to the
   *   // specified url
   *   $urlRouterProvider.otherwise('/index');
   *
   *   // Example of using function rule as param
   *   $urlRouterProvider.otherwise(function ($injector, $location) {
   *     return '/a/valid/url';
   *   });
   * });
     * </pre>
     *
     * @param {string|object} rule The url path you want to redirect to or a function
     * rule that returns the url path. The function version is passed two params:
     * `$injector` and `$location` services, and must return a url string.
     *
     * @return {object} `$urlRouterProvider` - `$urlRouterProvider` instance
     */
    this.otherwise = function (rule) {
        if (isString(rule)) {
            var redirect = rule;
            rule = function () { return redirect; };
        }
        else if (!isFunction(rule)) throw new Error("'rule' must be a function");
        otherwise = rule;
        return this;
    };


    function handleIfMatch($injector, handler, match) {
        if (!match) return false;
        var result = $injector.invoke(handler, handler, { $match: match });
        return isDefined(result) ? result : true;
    }

    /**
     * @ngdoc function
     * @name ui.router.router.$urlRouterProvider#when
     * @methodOf ui.router.router.$urlRouterProvider
     *
     * @description
     * Registers a handler for a given url matching. if handle is a string, it is
     * treated as a redirect, and is interpolated according to the syntax of match
     * (i.e. like `String.replace()` for `RegExp`, or like a `UrlMatcher` pattern otherwise).
     *
     * If the handler is a function, it is injectable. It gets invoked if `$location`
     * matches. You have the option of inject the match object as `$match`.
     *
     * The handler can return
     *
     * - **falsy** to indicate that the rule didn't match after all, then `$urlRouter`
     *   will continue trying to find another one that matches.
     * - **string** which is treated as a redirect and passed to `$location.url()`
     * - **void** or any **truthy** value tells `$urlRouter` that the url was handled.
     *
     * @example
     * <pre>
     * var app = angular.module('app', ['ui.router.router']);
     *
     * app.config(function ($urlRouterProvider) {
   *   $urlRouterProvider.when($state.url, function ($match, $stateParams) {
   *     if ($state.$current.navigable !== state ||
   *         !equalForKeys($match, $stateParams) {
   *      $state.transitionTo(state, $match, false);
   *     }
   *   });
   * });
     * </pre>
     *
     * @param {string|object} what The incoming path that you want to redirect.
     * @param {string|object} handler The path you want to redirect your user to.
     */
    this.when = function (what, handler) {
        var redirect, handlerIsString = isString(handler);
        if (isString(what)) what = $urlMatcherFactory.compile(what);

        if (!handlerIsString && !isFunction(handler) && !isArray(handler))
            throw new Error("invalid 'handler' in when()");

        var strategies = {
            matcher: function (what, handler) {
                if (handlerIsString) {
                    redirect = $urlMatcherFactory.compile(handler);
                    handler = ['$match', function ($match) { return redirect.format($match); }];
                }
                return extend(function ($injector, $location) {
                    return handleIfMatch($injector, handler, what.exec($location.path(), $location.search()));
                }, {
                    prefix: isString(what.prefix) ? what.prefix : ''
                });
            },
            regex: function (what, handler) {
                if (what.global || what.sticky) throw new Error("when() RegExp must not be global or sticky");

                if (handlerIsString) {
                    redirect = handler;
                    handler = ['$match', function ($match) { return interpolate(redirect, $match); }];
                }
                return extend(function ($injector, $location) {
                    return handleIfMatch($injector, handler, what.exec($location.path()));
                }, {
                    prefix: regExpPrefix(what)
                });
            }
        };

        var check = { matcher: $urlMatcherFactory.isMatcher(what), regex: what instanceof RegExp };

        for (var n in check) {
            if (check[n]) return this.rule(strategies[n](what, handler));
        }

        throw new Error("invalid 'what' in when()");
    };

    /**
     * @ngdoc function
     * @name ui.router.router.$urlRouterProvider#deferIntercept
     * @methodOf ui.router.router.$urlRouterProvider
     *
     * @description
     * Disables (or enables) deferring location change interception.
     *
     * If you wish to customize the behavior of syncing the URL (for example, if you wish to
     * defer a transition but maintain the current URL), call this method at configuration time.
     * Then, at run time, call `$urlRouter.listen()` after you have configured your own
     * `$locationChangeSuccess` event handler.
     *
     * @example
     * <pre>
     * var app = angular.module('app', ['ui.router.router']);
     *
     * app.config(function ($urlRouterProvider) {
   *
   *   // Prevent $urlRouter from automatically intercepting URL changes;
   *   // this allows you to configure custom behavior in between
   *   // location changes and route synchronization:
   *   $urlRouterProvider.deferIntercept();
   *
   * }).run(function ($rootScope, $urlRouter, UserService) {
   *
   *   $rootScope.$on('$locationChangeSuccess', function(e) {
   *     // UserService is an example service for managing user state
   *     if (UserService.isLoggedIn()) return;
   *
   *     // Prevent $urlRouter's default handler from firing
   *     e.preventDefault();
   *
   *     UserService.handleLogin().then(function() {
   *       // Once the user has logged in, sync the current URL
   *       // to the router:
   *       $urlRouter.sync();
   *     });
   *   });
   *
   *   // Configures $urlRouter's listener *after* your custom listener
   *   $urlRouter.listen();
   * });
     * </pre>
     *
     * @param {boolean} defer Indicates whether to defer location change interception. Passing
     no parameter is equivalent to `true`.
     */
    this.deferIntercept = function (defer) {
        if (defer === undefined) defer = true;
        interceptDeferred = defer;
    };

    /**
     * @ngdoc object
     * @name ui.router.router.$urlRouter
     *
     * @requires $location
     * @requires $rootScope
     * @requires $injector
     * @requires $browser
     *
     * @description
     *
     */
    this.$get = $get;
    $get.$inject = ['$location', '$rootScope', '$injector', '$browser'];
    function $get(   $location,   $rootScope,   $injector,   $browser) {

        var baseHref = $browser.baseHref(), location = $location.url(), lastPushedUrl;

        function appendBasePath(url, isHtml5, absolute) {
            if (baseHref === '/') return url;
            if (isHtml5) return baseHref.slice(0, -1) + url;
            if (absolute) return baseHref.slice(1) + url;
            return url;
        }

        // TODO: Optimize groups of rules with non-empty prefix into some sort of decision tree
        function update(evt) {
            if (evt && evt.defaultPrevented) return;
            var ignoreUpdate = lastPushedUrl && $location.url() === lastPushedUrl;
            lastPushedUrl = undefined;
            if (ignoreUpdate) return true;

            function check(rule) {
                var handled = rule($injector, $location);

                if (!handled) return false;
                if (isString(handled)) $location.replace().url(handled);
                return true;
            }
            var n = rules.length, i;

            for (i = 0; i < n; i++) {
                if (check(rules[i])) return;
            }
            // always check otherwise last to allow dynamic updates to the set of rules
            if (otherwise) check(otherwise);
        }

        function listen() {
            listener = listener || $rootScope.$on('$locationChangeSuccess', update);
            return listener;
        }

        if (!interceptDeferred) listen();

        return {
            /**
             * @ngdoc function
             * @name ui.router.router.$urlRouter#sync
             * @methodOf ui.router.router.$urlRouter
             *
             * @description
             * Triggers an update; the same update that happens when the address bar url changes, aka `$locationChangeSuccess`.
             * This method is useful when you need to use `preventDefault()` on the `$locationChangeSuccess` event,
             * perform some custom logic (route protection, auth, config, redirection, etc) and then finally proceed
             * with the transition by calling `$urlRouter.sync()`.
             *
             * @example
             * <pre>
             * angular.module('app', ['ui.router'])
             *   .run(function($rootScope, $urlRouter) {
       *     $rootScope.$on('$locationChangeSuccess', function(evt) {
       *       // Halt state change from even starting
       *       evt.preventDefault();
       *       // Perform custom logic
       *       var meetsRequirement = ...
       *       // Continue with the update and state transition if logic allows
       *       if (meetsRequirement) $urlRouter.sync();
       *     });
       * });
             * </pre>
             */
            sync: function() {
                update();
            },

            listen: function() {
                return listen();
            },

            update: function(read) {
                if (read) {
                    location = $location.url();
                    return;
                }
                if ($location.url() === location) return;

                $location.url(location);
                $location.replace();
            },

            push: function(urlMatcher, params, options) {
                $location.url(urlMatcher.format(params || {}));
                lastPushedUrl = options && options.$$avoidResync ? $location.url() : undefined;
                if (options && options.replace) $location.replace();
            },

            /**
             * @ngdoc function
             * @name ui.router.router.$urlRouter#href
             * @methodOf ui.router.router.$urlRouter
             *
             * @description
             * A URL generation method that returns the compiled URL for a given
             * {@link ui.router.util.type:UrlMatcher `UrlMatcher`}, populated with the provided parameters.
             *
             * @example
             * <pre>
             * $bob = $urlRouter.href(new UrlMatcher("/about/:person"), {
       *   person: "bob"
       * });
             * // $bob == "/about/bob";
             * </pre>
             *
             * @param {UrlMatcher} urlMatcher The `UrlMatcher` object which is used as the template of the URL to generate.
             * @param {object=} params An object of parameter values to fill the matcher's required parameters.
             * @param {object=} options Options object. The options are:
             *
             * - **`absolute`** - {boolean=false},  If true will generate an absolute url, e.g. "http://www.example.com/fullurl".
             *
             * @returns {string} Returns the fully compiled URL, or `null` if `params` fail validation against `urlMatcher`
             */
            href: function(urlMatcher, params, options) {
                if (!urlMatcher.validates(params)) return null;

                var isHtml5 = $locationProvider.html5Mode();
                if (angular.isObject(isHtml5)) {
                    isHtml5 = isHtml5.enabled;
                }

                var url = urlMatcher.format(params);
                options = options || {};

                if (!isHtml5 && url !== null) {
                    url = "#" + $locationProvider.hashPrefix() + url;
                }
                url = appendBasePath(url, isHtml5, options.absolute);

                if (!options.absolute || !url) {
                    return url;
                }

                var slash = (!isHtml5 && url ? '/' : ''), port = $location.port();
                port = (port === 80 || port === 443 ? '' : ':' + port);

                return [$location.protocol(), '://', $location.host(), port, slash, url].join('');
            }
        };
    }
}

angular.module('ui.router.router').provider('$urlRouter', $UrlRouterProvider);


$ViewProvider.$inject = [];
function $ViewProvider() {

    this.$get = $get;
    /**
     * @ngdoc object
     * @name ui.router.state.$view
     *
     * @requires ui.router.util.$templateFactory
     * @requires $rootScope
     *
     * @description
     *
     */
    $get.$inject = ['$rootScope', '$templateFactory'];
    function $get(   $rootScope,   $templateFactory) {
        return {
            // $view.load('full.viewName', { template: ..., controller: ..., resolve: ..., async: false, params: ... })
            /**
             * @ngdoc function
             * @name ui.router.state.$view#load
             * @methodOf ui.router.state.$view
             *
             * @description
             *
             * @param {string} name name
             * @param {object} options option object.
             */
            load: function load(name, options) {
                var result, defaults = {
                    template: null, controller: null, view: null, locals: null, notify: true, async: true, params: {}
                };
                options = extend(defaults, options);

                if (options.view) {
                    result = $templateFactory.fromConfig(options.view, options.params, options.locals);
                }
                if (result && options.notify) {
                    /**
                     * @ngdoc event
                     * @name ui.router.state.$state#$viewContentLoading
                     * @eventOf ui.router.state.$view
                     * @eventType broadcast on root scope
                     * @description
                     *
                     * Fired once the view **begins loading**, *before* the DOM is rendered.
                     *
                     * @param {Object} event Event object.
                     * @param {Object} viewConfig The view config properties (template, controller, etc).
                     *
                     * @example
                     *
                     * <pre>
                     * $scope.$on('$viewContentLoading',
                     * function(event, viewConfig){
         *     // Access to all the view config properties.
         *     // and one special property 'targetView'
         *     // viewConfig.targetView
         * });
                     * </pre>
                     */
                    $rootScope.$broadcast('$viewContentLoading', options);
                }
                return result;
            }
        };
    }
}

angular.module('ui.router.state').provider('$view', $ViewProvider);

/**
 * @ngdoc directive
 * @name ui.router.state.directive:ui-view
 *
 * @requires ui.router.state.$state
 * @requires $compile
 * @requires $controller
 * @requires $injector
 * @requires ui.router.state.$uiViewScroll
 * @requires $document
 *
 * @restrict ECA
 *
 * @description
 * The ui-view directive tells $state where to place your templates.
 *
 * @param {string=} name A view name. The name should be unique amongst the other views in the
 * same state. You can have views of the same name that live in different states.
 *
 * @param {string=} autoscroll It allows you to set the scroll behavior of the browser window
 * when a view is populated. By default, $anchorScroll is overridden by ui-router's custom scroll
 * service, {@link ui.router.state.$uiViewScroll}. This custom service let's you
 * scroll ui-view elements into view when they are populated during a state activation.
 *
 * *Note: To revert back to old [`$anchorScroll`](http://docs.angularjs.org/api/ng.$anchorScroll)
 * functionality, call `$uiViewScrollProvider.useAnchorScroll()`.*
 *
 * @param {string=} onload Expression to evaluate whenever the view updates.
 *
 * @example
 * A view can be unnamed or named.
 * <pre>
 * <!-- Unnamed -->
 * <div ui-view></div>
 *
 * <!-- Named -->
 * <div ui-view="viewName"></div>
 * </pre>
 *
 * You can only have one unnamed view within any template (or root html). If you are only using a
 * single view and it is unnamed then you can populate it like so:
 * <pre>
 * <div ui-view></div>
 * $stateProvider.state("home", {
 *   template: "<h1>HELLO!</h1>"
 * })
 * </pre>
 *
 * The above is a convenient shortcut equivalent to specifying your view explicitly with the {@link ui.router.state.$stateProvider#views `views`}
 * config property, by name, in this case an empty name:
 * <pre>
 * $stateProvider.state("home", {
 *   views: {
 *     "": {
 *       template: "<h1>HELLO!</h1>"
 *     }
 *   }
 * })
 * </pre>
 *
 * But typically you'll only use the views property if you name your view or have more than one view
 * in the same template. There's not really a compelling reason to name a view if its the only one,
 * but you could if you wanted, like so:
 * <pre>
 * <div ui-view="main"></div>
 * </pre>
 * <pre>
 * $stateProvider.state("home", {
 *   views: {
 *     "main": {
 *       template: "<h1>HELLO!</h1>"
 *     }
 *   }
 * })
 * </pre>
 *
 * Really though, you'll use views to set up multiple views:
 * <pre>
 * <div ui-view></div>
 * <div ui-view="chart"></div>
 * <div ui-view="data"></div>
 * </pre>
 *
 * <pre>
 * $stateProvider.state("home", {
 *   views: {
 *     "": {
 *       template: "<h1>HELLO!</h1>"
 *     },
 *     "chart": {
 *       template: "<chart_thing/>"
 *     },
 *     "data": {
 *       template: "<data_thing/>"
 *     }
 *   }
 * })
 * </pre>
 *
 * Examples for `autoscroll`:
 *
 * <pre>
 * <!-- If autoscroll present with no expression,
 *      then scroll ui-view into view -->
 * <ui-view autoscroll/>
 *
 * <!-- If autoscroll present with valid expression,
 *      then scroll ui-view into view if expression evaluates to true -->
 * <ui-view autoscroll='true'/>
 * <ui-view autoscroll='false'/>
 * <ui-view autoscroll='scopeVariable'/>
 * </pre>
 */
$ViewDirective.$inject = ['$state', '$injector', '$uiViewScroll', '$interpolate'];
function $ViewDirective(   $state,   $injector,   $uiViewScroll,   $interpolate) {

    function getService() {
        return ($injector.has) ? function(service) {
            return $injector.has(service) ? $injector.get(service) : null;
        } : function(service) {
            try {
                return $injector.get(service);
            } catch (e) {
                return null;
            }
        };
    }

    var service = getService(),
        $animator = service('$animator'),
        $animate = service('$animate');

    // Returns a set of DOM manipulation functions based on which Angular version
    // it should use
    function getRenderer(attrs, scope) {
        var statics = function() {
            return {
                enter: function (element, target, cb) { target.after(element); cb(); },
                leave: function (element, cb) { element.remove(); cb(); }
            };
        };

        if ($animate) {
            return {
                enter: function(element, target, cb) {
                    var promise = $animate.enter(element, null, target, cb);
                    if (promise && promise.then) promise.then(cb);
                },
                leave: function(element, cb) {
                    var promise = $animate.leave(element, cb);
                    if (promise && promise.then) promise.then(cb);
                }
            };
        }

        if ($animator) {
            var animate = $animator && $animator(scope, attrs);

            return {
                enter: function(element, target, cb) {animate.enter(element, null, target); cb(); },
                leave: function(element, cb) { animate.leave(element); cb(); }
            };
        }

        return statics();
    }

    var directive = {
        restrict: 'ECA',
        terminal: true,
        priority: 400,
        transclude: 'element',
        compile: function (tElement, tAttrs, $transclude) {
            return function (scope, $element, attrs) {
                var previousEl, currentEl, currentScope, latestLocals,
                    onloadExp     = attrs.onload || '',
                    autoScrollExp = attrs.autoscroll,
                    renderer      = getRenderer(attrs, scope);

                scope.$on('$stateChangeSuccess', function() {
                    updateView(false);
                });
                scope.$on('$viewContentLoading', function() {
                    updateView(false);
                });

                updateView(true);

                function cleanupLastView() {
                    if (previousEl) {
                        previousEl.remove();
                        previousEl = null;
                    }

                    if (currentScope) {
                        currentScope.$destroy();
                        currentScope = null;
                    }

                    if (currentEl) {
                        renderer.leave(currentEl, function() {
                            previousEl = null;
                        });

                        previousEl = currentEl;
                        currentEl = null;
                    }
                }

                function updateView(firstTime) {
                    var newScope,
                        name            = getUiViewName(scope, attrs, $element, $interpolate),
                        previousLocals  = name && $state.$current && $state.$current.locals[name];

                    if (!firstTime && previousLocals === latestLocals) return; // nothing to do
                    newScope = scope.$new();
                    latestLocals = $state.$current.locals[name];

                    var clone = $transclude(newScope, function(clone) {
                        renderer.enter(clone, $element, function onUiViewEnter() {
                            if(currentScope) {
                                currentScope.$emit('$viewContentAnimationEnded');
                            }

                            if (angular.isDefined(autoScrollExp) && !autoScrollExp || scope.$eval(autoScrollExp)) {
                                $uiViewScroll(clone);
                            }
                        });
                        cleanupLastView();
                    });

                    currentEl = clone;
                    currentScope = newScope;
                    /**
                     * @ngdoc event
                     * @name ui.router.state.directive:ui-view#$viewContentLoaded
                     * @eventOf ui.router.state.directive:ui-view
                     * @eventType emits on ui-view directive scope
                     * @description           *
                     * Fired once the view is **loaded**, *after* the DOM is rendered.
                     *
                     * @param {Object} event Event object.
                     */
                    currentScope.$emit('$viewContentLoaded');
                    currentScope.$eval(onloadExp);
                }
            };
        }
    };

    return directive;
}

$ViewDirectiveFill.$inject = ['$compile', '$controller', '$state', '$interpolate'];
function $ViewDirectiveFill (  $compile,   $controller,   $state,   $interpolate) {
    return {
        restrict: 'ECA',
        priority: -400,
        compile: function (tElement) {
            var initial = tElement.html();
            return function (scope, $element, attrs) {
                var current = $state.$current,
                    name = getUiViewName(scope, attrs, $element, $interpolate),
                    locals  = current && current.locals[name];

                if (! locals) {
                    return;
                }

                $element.data('$uiView', { name: name, state: locals.$$state });
                $element.html(locals.$template ? locals.$template : initial);

                var link = $compile($element.contents());

                if (locals.$$controller) {
                    locals.$scope = scope;
                    locals.$element = $element;
                    var controller = $controller(locals.$$controller, locals);
                    if (locals.$$controllerAs) {
                        scope[locals.$$controllerAs] = controller;
                    }
                    $element.data('$ngControllerController', controller);
                    $element.children().data('$ngControllerController', controller);
                }

                link(scope);
            };
        }
    };
}

/**
 * Shared ui-view code for both directives:
 * Given scope, element, and its attributes, return the view's name
 */
function getUiViewName(scope, attrs, element, $interpolate) {
    var name = $interpolate(attrs.uiView || attrs.name || '')(scope);
    var inherited = element.inheritedData('$uiView');
    return name.indexOf('@') >= 0 ?  name :  (name + '@' + (inherited ? inherited.state.name : ''));
}

angular.module('ui.router.state').directive('uiView', $ViewDirective);
angular.module('ui.router.state').directive('uiView', $ViewDirectiveFill);

/**
 * @ngdoc object
 * @name ui.router.state.$uiViewScrollProvider
 *
 * @description
 * Provider that returns the {@link ui.router.state.$uiViewScroll} service function.
 */
function $ViewScrollProvider() {

    var useAnchorScroll = false;

    /**
     * @ngdoc function
     * @name ui.router.state.$uiViewScrollProvider#useAnchorScroll
     * @methodOf ui.router.state.$uiViewScrollProvider
     *
     * @description
     * Reverts back to using the core [`$anchorScroll`](http://docs.angularjs.org/api/ng.$anchorScroll) service for
     * scrolling based on the url anchor.
     */
    this.useAnchorScroll = function () {
        useAnchorScroll = true;
    };

    /**
     * @ngdoc object
     * @name ui.router.state.$uiViewScroll
     *
     * @requires $anchorScroll
     * @requires $timeout
     *
     * @description
     * When called with a jqLite element, it scrolls the element into view (after a
     * `$timeout` so the DOM has time to refresh).
     *
     * If you prefer to rely on `$anchorScroll` to scroll the view to the anchor,
     * this can be enabled by calling {@link ui.router.state.$uiViewScrollProvider#methods_useAnchorScroll `$uiViewScrollProvider.useAnchorScroll()`}.
     */
    this.$get = ['$anchorScroll', '$timeout', function ($anchorScroll, $timeout) {
        if (useAnchorScroll) {
            return $anchorScroll;
        }

        return function ($element) {
            return $timeout(function () {
                $element[0].scrollIntoView();
            }, 0, false);
        };
    }];
}

angular.module('ui.router.state').provider('$uiViewScroll', $ViewScrollProvider);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbW1vbi5qcyIsInJlc29sdmUuanMiLCJzdGF0ZS5qcyIsInN0YXRlRGlyZWN0aXZlcy5qcyIsInN0YXRlRmlsdGVycy5qcyIsInRlbXBsYXRlRmFjdG9yeS5qcyIsInVybE1hdGNoZXJGYWN0b3J5LmpzIiwidXJsUm91dGVyLmpzIiwidmlldy5qcyIsInZpZXdEaXJlY3RpdmUuanMiLCJ2aWV3U2Nyb2xsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwU0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1UEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbjVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDL1FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1aENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMvU0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJhbmd1bGFyLXVpLXJvdXRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qanNoaW50IGdsb2JhbHN0cmljdDp0cnVlKi9cclxuLypnbG9iYWwgYW5ndWxhcjpmYWxzZSovXHJcbid1c2Ugc3RyaWN0JztcclxuXHJcbnZhciBpc0RlZmluZWQgPSBhbmd1bGFyLmlzRGVmaW5lZCxcclxuICAgIGlzRnVuY3Rpb24gPSBhbmd1bGFyLmlzRnVuY3Rpb24sXHJcbiAgICBpc1N0cmluZyA9IGFuZ3VsYXIuaXNTdHJpbmcsXHJcbiAgICBpc09iamVjdCA9IGFuZ3VsYXIuaXNPYmplY3QsXHJcbiAgICBpc0FycmF5ID0gYW5ndWxhci5pc0FycmF5LFxyXG4gICAgZm9yRWFjaCA9IGFuZ3VsYXIuZm9yRWFjaCxcclxuICAgIGV4dGVuZCA9IGFuZ3VsYXIuZXh0ZW5kLFxyXG4gICAgY29weSA9IGFuZ3VsYXIuY29weTtcclxuXHJcbmZ1bmN0aW9uIGluaGVyaXQocGFyZW50LCBleHRyYSkge1xyXG4gIHJldHVybiBleHRlbmQobmV3IChleHRlbmQoZnVuY3Rpb24oKSB7fSwgeyBwcm90b3R5cGU6IHBhcmVudCB9KSkoKSwgZXh0cmEpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBtZXJnZShkc3QpIHtcclxuICBmb3JFYWNoKGFyZ3VtZW50cywgZnVuY3Rpb24ob2JqKSB7XHJcbiAgICBpZiAob2JqICE9PSBkc3QpIHtcclxuICAgICAgZm9yRWFjaChvYmosIGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcclxuICAgICAgICBpZiAoIWRzdC5oYXNPd25Qcm9wZXJ0eShrZXkpKSBkc3Rba2V5XSA9IHZhbHVlO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9KTtcclxuICByZXR1cm4gZHN0O1xyXG59XHJcblxyXG4vKipcclxuICogRmluZHMgdGhlIGNvbW1vbiBhbmNlc3RvciBwYXRoIGJldHdlZW4gdHdvIHN0YXRlcy5cclxuICpcclxuICogQHBhcmFtIHtPYmplY3R9IGZpcnN0IFRoZSBmaXJzdCBzdGF0ZS5cclxuICogQHBhcmFtIHtPYmplY3R9IHNlY29uZCBUaGUgc2Vjb25kIHN0YXRlLlxyXG4gKiBAcmV0dXJuIHtBcnJheX0gUmV0dXJucyBhbiBhcnJheSBvZiBzdGF0ZSBuYW1lcyBpbiBkZXNjZW5kaW5nIG9yZGVyLCBub3QgaW5jbHVkaW5nIHRoZSByb290LlxyXG4gKi9cclxuZnVuY3Rpb24gYW5jZXN0b3JzKGZpcnN0LCBzZWNvbmQpIHtcclxuICB2YXIgcGF0aCA9IFtdO1xyXG5cclxuICBmb3IgKHZhciBuIGluIGZpcnN0LnBhdGgpIHtcclxuICAgIGlmIChmaXJzdC5wYXRoW25dICE9PSBzZWNvbmQucGF0aFtuXSkgYnJlYWs7XHJcbiAgICBwYXRoLnB1c2goZmlyc3QucGF0aFtuXSk7XHJcbiAgfVxyXG4gIHJldHVybiBwYXRoO1xyXG59XHJcblxyXG4vKipcclxuICogSUU4LXNhZmUgd3JhcHBlciBmb3IgYE9iamVjdC5rZXlzKClgLlxyXG4gKlxyXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IEEgSmF2YVNjcmlwdCBvYmplY3QuXHJcbiAqIEByZXR1cm4ge0FycmF5fSBSZXR1cm5zIHRoZSBrZXlzIG9mIHRoZSBvYmplY3QgYXMgYW4gYXJyYXkuXHJcbiAqL1xyXG5mdW5jdGlvbiBvYmplY3RLZXlzKG9iamVjdCkge1xyXG4gIGlmIChPYmplY3Qua2V5cykge1xyXG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKG9iamVjdCk7XHJcbiAgfVxyXG4gIHZhciByZXN1bHQgPSBbXTtcclxuXHJcbiAgZm9yRWFjaChvYmplY3QsIGZ1bmN0aW9uKHZhbCwga2V5KSB7XHJcbiAgICByZXN1bHQucHVzaChrZXkpO1xyXG4gIH0pO1xyXG4gIHJldHVybiByZXN1bHQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBJRTgtc2FmZSB3cmFwcGVyIGZvciBgQXJyYXkucHJvdG90eXBlLmluZGV4T2YoKWAuXHJcbiAqXHJcbiAqIEBwYXJhbSB7QXJyYXl9IGFycmF5IEEgSmF2YVNjcmlwdCBhcnJheS5cclxuICogQHBhcmFtIHsqfSB2YWx1ZSBBIHZhbHVlIHRvIHNlYXJjaCB0aGUgYXJyYXkgZm9yLlxyXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IFJldHVybnMgdGhlIGFycmF5IGluZGV4IHZhbHVlIG9mIGB2YWx1ZWAsIG9yIGAtMWAgaWYgbm90IHByZXNlbnQuXHJcbiAqL1xyXG5mdW5jdGlvbiBpbmRleE9mKGFycmF5LCB2YWx1ZSkge1xyXG4gIGlmIChBcnJheS5wcm90b3R5cGUuaW5kZXhPZikge1xyXG4gICAgcmV0dXJuIGFycmF5LmluZGV4T2YodmFsdWUsIE51bWJlcihhcmd1bWVudHNbMl0pIHx8IDApO1xyXG4gIH1cclxuICB2YXIgbGVuID0gYXJyYXkubGVuZ3RoID4+PiAwLCBmcm9tID0gTnVtYmVyKGFyZ3VtZW50c1syXSkgfHwgMDtcclxuICBmcm9tID0gKGZyb20gPCAwKSA/IE1hdGguY2VpbChmcm9tKSA6IE1hdGguZmxvb3IoZnJvbSk7XHJcblxyXG4gIGlmIChmcm9tIDwgMCkgZnJvbSArPSBsZW47XHJcblxyXG4gIGZvciAoOyBmcm9tIDwgbGVuOyBmcm9tKyspIHtcclxuICAgIGlmIChmcm9tIGluIGFycmF5ICYmIGFycmF5W2Zyb21dID09PSB2YWx1ZSkgcmV0dXJuIGZyb207XHJcbiAgfVxyXG4gIHJldHVybiAtMTtcclxufVxyXG5cclxuLyoqXHJcbiAqIE1lcmdlcyBhIHNldCBvZiBwYXJhbWV0ZXJzIHdpdGggYWxsIHBhcmFtZXRlcnMgaW5oZXJpdGVkIGJldHdlZW4gdGhlIGNvbW1vbiBwYXJlbnRzIG9mIHRoZVxyXG4gKiBjdXJyZW50IHN0YXRlIGFuZCBhIGdpdmVuIGRlc3RpbmF0aW9uIHN0YXRlLlxyXG4gKlxyXG4gKiBAcGFyYW0ge09iamVjdH0gY3VycmVudFBhcmFtcyBUaGUgdmFsdWUgb2YgdGhlIGN1cnJlbnQgc3RhdGUgcGFyYW1ldGVycyAoJHN0YXRlUGFyYW1zKS5cclxuICogQHBhcmFtIHtPYmplY3R9IG5ld1BhcmFtcyBUaGUgc2V0IG9mIHBhcmFtZXRlcnMgd2hpY2ggd2lsbCBiZSBjb21wb3NpdGVkIHdpdGggaW5oZXJpdGVkIHBhcmFtcy5cclxuICogQHBhcmFtIHtPYmplY3R9ICRjdXJyZW50IEludGVybmFsIGRlZmluaXRpb24gb2Ygb2JqZWN0IHJlcHJlc2VudGluZyB0aGUgY3VycmVudCBzdGF0ZS5cclxuICogQHBhcmFtIHtPYmplY3R9ICR0byBJbnRlcm5hbCBkZWZpbml0aW9uIG9mIG9iamVjdCByZXByZXNlbnRpbmcgc3RhdGUgdG8gdHJhbnNpdGlvbiB0by5cclxuICovXHJcbmZ1bmN0aW9uIGluaGVyaXRQYXJhbXMoY3VycmVudFBhcmFtcywgbmV3UGFyYW1zLCAkY3VycmVudCwgJHRvKSB7XHJcbiAgdmFyIHBhcmVudHMgPSBhbmNlc3RvcnMoJGN1cnJlbnQsICR0byksIHBhcmVudFBhcmFtcywgaW5oZXJpdGVkID0ge30sIGluaGVyaXRMaXN0ID0gW107XHJcblxyXG4gIGZvciAodmFyIGkgaW4gcGFyZW50cykge1xyXG4gICAgaWYgKCFwYXJlbnRzW2ldLnBhcmFtcykgY29udGludWU7XHJcbiAgICBwYXJlbnRQYXJhbXMgPSBvYmplY3RLZXlzKHBhcmVudHNbaV0ucGFyYW1zKTtcclxuICAgIGlmICghcGFyZW50UGFyYW1zLmxlbmd0aCkgY29udGludWU7XHJcblxyXG4gICAgZm9yICh2YXIgaiBpbiBwYXJlbnRQYXJhbXMpIHtcclxuICAgICAgaWYgKGluZGV4T2YoaW5oZXJpdExpc3QsIHBhcmVudFBhcmFtc1tqXSkgPj0gMCkgY29udGludWU7XHJcbiAgICAgIGluaGVyaXRMaXN0LnB1c2gocGFyZW50UGFyYW1zW2pdKTtcclxuICAgICAgaW5oZXJpdGVkW3BhcmVudFBhcmFtc1tqXV0gPSBjdXJyZW50UGFyYW1zW3BhcmVudFBhcmFtc1tqXV07XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiBleHRlbmQoe30sIGluaGVyaXRlZCwgbmV3UGFyYW1zKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFBlcmZvcm1zIGEgbm9uLXN0cmljdCBjb21wYXJpc29uIG9mIHRoZSBzdWJzZXQgb2YgdHdvIG9iamVjdHMsIGRlZmluZWQgYnkgYSBsaXN0IG9mIGtleXMuXHJcbiAqXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBhIFRoZSBmaXJzdCBvYmplY3QuXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBiIFRoZSBzZWNvbmQgb2JqZWN0LlxyXG4gKiBAcGFyYW0ge0FycmF5fSBrZXlzIFRoZSBsaXN0IG9mIGtleXMgd2l0aGluIGVhY2ggb2JqZWN0IHRvIGNvbXBhcmUuIElmIHRoZSBsaXN0IGlzIGVtcHR5IG9yIG5vdCBzcGVjaWZpZWQsXHJcbiAqICAgICAgICAgICAgICAgICAgICAgaXQgZGVmYXVsdHMgdG8gdGhlIGxpc3Qgb2Yga2V5cyBpbiBgYWAuXHJcbiAqIEByZXR1cm4ge0Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIHRoZSBrZXlzIG1hdGNoLCBvdGhlcndpc2UgYGZhbHNlYC5cclxuICovXHJcbmZ1bmN0aW9uIGVxdWFsRm9yS2V5cyhhLCBiLCBrZXlzKSB7XHJcbiAgaWYgKCFrZXlzKSB7XHJcbiAgICBrZXlzID0gW107XHJcbiAgICBmb3IgKHZhciBuIGluIGEpIGtleXMucHVzaChuKTsgLy8gVXNlZCBpbnN0ZWFkIG9mIE9iamVjdC5rZXlzKCkgZm9yIElFOCBjb21wYXRpYmlsaXR5XHJcbiAgfVxyXG5cclxuICBmb3IgKHZhciBpPTA7IGk8a2V5cy5sZW5ndGg7IGkrKykge1xyXG4gICAgdmFyIGsgPSBrZXlzW2ldO1xyXG4gICAgaWYgKGFba10gIT0gYltrXSkgcmV0dXJuIGZhbHNlOyAvLyBOb3QgJz09PScsIHZhbHVlcyBhcmVuJ3QgbmVjZXNzYXJpbHkgbm9ybWFsaXplZFxyXG4gIH1cclxuICByZXR1cm4gdHJ1ZTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJldHVybnMgdGhlIHN1YnNldCBvZiBhbiBvYmplY3QsIGJhc2VkIG9uIGEgbGlzdCBvZiBrZXlzLlxyXG4gKlxyXG4gKiBAcGFyYW0ge0FycmF5fSBrZXlzXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSB2YWx1ZXNcclxuICogQHJldHVybiB7Qm9vbGVhbn0gUmV0dXJucyBhIHN1YnNldCBvZiBgdmFsdWVzYC5cclxuICovXHJcbmZ1bmN0aW9uIGZpbHRlckJ5S2V5cyhrZXlzLCB2YWx1ZXMpIHtcclxuICB2YXIgZmlsdGVyZWQgPSB7fTtcclxuXHJcbiAgZm9yRWFjaChrZXlzLCBmdW5jdGlvbiAobmFtZSkge1xyXG4gICAgZmlsdGVyZWRbbmFtZV0gPSB2YWx1ZXNbbmFtZV07XHJcbiAgfSk7XHJcbiAgcmV0dXJuIGZpbHRlcmVkO1xyXG59XHJcblxyXG4vLyBsaWtlIF8uaW5kZXhCeVxyXG4vLyB3aGVuIHlvdSBrbm93IHRoYXQgeW91ciBpbmRleCB2YWx1ZXMgd2lsbCBiZSB1bmlxdWUsIG9yIHlvdSB3YW50IGxhc3Qtb25lLWluIHRvIHdpblxyXG5mdW5jdGlvbiBpbmRleEJ5KGFycmF5LCBwcm9wTmFtZSkge1xyXG4gIHZhciByZXN1bHQgPSB7fTtcclxuICBmb3JFYWNoKGFycmF5LCBmdW5jdGlvbihpdGVtKSB7XHJcbiAgICByZXN1bHRbaXRlbVtwcm9wTmFtZV1dID0gaXRlbTtcclxuICB9KTtcclxuICByZXR1cm4gcmVzdWx0O1xyXG59XHJcblxyXG4vLyBleHRyYWN0ZWQgZnJvbSB1bmRlcnNjb3JlLmpzXHJcbi8vIFJldHVybiBhIGNvcHkgb2YgdGhlIG9iamVjdCBvbmx5IGNvbnRhaW5pbmcgdGhlIHdoaXRlbGlzdGVkIHByb3BlcnRpZXMuXHJcbmZ1bmN0aW9uIHBpY2sob2JqKSB7XHJcbiAgdmFyIGNvcHkgPSB7fTtcclxuICB2YXIga2V5cyA9IEFycmF5LnByb3RvdHlwZS5jb25jYXQuYXBwbHkoQXJyYXkucHJvdG90eXBlLCBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKTtcclxuICBmb3JFYWNoKGtleXMsIGZ1bmN0aW9uKGtleSkge1xyXG4gICAgaWYgKGtleSBpbiBvYmopIGNvcHlba2V5XSA9IG9ialtrZXldO1xyXG4gIH0pO1xyXG4gIHJldHVybiBjb3B5O1xyXG59XHJcblxyXG4vLyBleHRyYWN0ZWQgZnJvbSB1bmRlcnNjb3JlLmpzXHJcbi8vIFJldHVybiBhIGNvcHkgb2YgdGhlIG9iamVjdCBvbWl0dGluZyB0aGUgYmxhY2tsaXN0ZWQgcHJvcGVydGllcy5cclxuZnVuY3Rpb24gb21pdChvYmopIHtcclxuICB2YXIgY29weSA9IHt9O1xyXG4gIHZhciBrZXlzID0gQXJyYXkucHJvdG90eXBlLmNvbmNhdC5hcHBseShBcnJheS5wcm90b3R5cGUsIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSkpO1xyXG4gIGZvciAodmFyIGtleSBpbiBvYmopIHtcclxuICAgIGlmIChpbmRleE9mKGtleXMsIGtleSkgPT0gLTEpIGNvcHlba2V5XSA9IG9ialtrZXldO1xyXG4gIH1cclxuICByZXR1cm4gY29weTtcclxufVxyXG5cclxuZnVuY3Rpb24gcGx1Y2soY29sbGVjdGlvbiwga2V5KSB7XHJcbiAgdmFyIHJlc3VsdCA9IGlzQXJyYXkoY29sbGVjdGlvbikgPyBbXSA6IHt9O1xyXG5cclxuICBmb3JFYWNoKGNvbGxlY3Rpb24sIGZ1bmN0aW9uKHZhbCwgaSkge1xyXG4gICAgcmVzdWx0W2ldID0gaXNGdW5jdGlvbihrZXkpID8ga2V5KHZhbCkgOiB2YWxba2V5XTtcclxuICB9KTtcclxuICByZXR1cm4gcmVzdWx0O1xyXG59XHJcblxyXG5mdW5jdGlvbiBmaWx0ZXIoY29sbGVjdGlvbiwgY2FsbGJhY2spIHtcclxuICB2YXIgYXJyYXkgPSBpc0FycmF5KGNvbGxlY3Rpb24pO1xyXG4gIHZhciByZXN1bHQgPSBhcnJheSA/IFtdIDoge307XHJcbiAgZm9yRWFjaChjb2xsZWN0aW9uLCBmdW5jdGlvbih2YWwsIGkpIHtcclxuICAgIGlmIChjYWxsYmFjayh2YWwsIGkpKSB7XHJcbiAgICAgIHJlc3VsdFthcnJheSA/IHJlc3VsdC5sZW5ndGggOiBpXSA9IHZhbDtcclxuICAgIH1cclxuICB9KTtcclxuICByZXR1cm4gcmVzdWx0O1xyXG59XHJcblxyXG5mdW5jdGlvbiBtYXAoY29sbGVjdGlvbiwgY2FsbGJhY2spIHtcclxuICB2YXIgcmVzdWx0ID0gaXNBcnJheShjb2xsZWN0aW9uKSA/IFtdIDoge307XHJcblxyXG4gIGZvckVhY2goY29sbGVjdGlvbiwgZnVuY3Rpb24odmFsLCBpKSB7XHJcbiAgICByZXN1bHRbaV0gPSBjYWxsYmFjayh2YWwsIGkpO1xyXG4gIH0pO1xyXG4gIHJldHVybiByZXN1bHQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBAbmdkb2Mgb3ZlcnZpZXdcclxuICogQG5hbWUgdWkucm91dGVyLnV0aWxcclxuICpcclxuICogQGRlc2NyaXB0aW9uXHJcbiAqICMgdWkucm91dGVyLnV0aWwgc3ViLW1vZHVsZVxyXG4gKlxyXG4gKiBUaGlzIG1vZHVsZSBpcyBhIGRlcGVuZGVuY3kgb2Ygb3RoZXIgc3ViLW1vZHVsZXMuIERvIG5vdCBpbmNsdWRlIHRoaXMgbW9kdWxlIGFzIGEgZGVwZW5kZW5jeVxyXG4gKiBpbiB5b3VyIGFuZ3VsYXIgYXBwICh1c2Uge0BsaW5rIHVpLnJvdXRlcn0gbW9kdWxlIGluc3RlYWQpLlxyXG4gKlxyXG4gKi9cclxuYW5ndWxhci5tb2R1bGUoJ3VpLnJvdXRlci51dGlsJywgWyduZyddKTtcclxuXHJcbi8qKlxyXG4gKiBAbmdkb2Mgb3ZlcnZpZXdcclxuICogQG5hbWUgdWkucm91dGVyLnJvdXRlclxyXG4gKiBcclxuICogQHJlcXVpcmVzIHVpLnJvdXRlci51dGlsXHJcbiAqXHJcbiAqIEBkZXNjcmlwdGlvblxyXG4gKiAjIHVpLnJvdXRlci5yb3V0ZXIgc3ViLW1vZHVsZVxyXG4gKlxyXG4gKiBUaGlzIG1vZHVsZSBpcyBhIGRlcGVuZGVuY3kgb2Ygb3RoZXIgc3ViLW1vZHVsZXMuIERvIG5vdCBpbmNsdWRlIHRoaXMgbW9kdWxlIGFzIGEgZGVwZW5kZW5jeVxyXG4gKiBpbiB5b3VyIGFuZ3VsYXIgYXBwICh1c2Uge0BsaW5rIHVpLnJvdXRlcn0gbW9kdWxlIGluc3RlYWQpLlxyXG4gKi9cclxuYW5ndWxhci5tb2R1bGUoJ3VpLnJvdXRlci5yb3V0ZXInLCBbJ3VpLnJvdXRlci51dGlsJ10pO1xyXG5cclxuLyoqXHJcbiAqIEBuZ2RvYyBvdmVydmlld1xyXG4gKiBAbmFtZSB1aS5yb3V0ZXIuc3RhdGVcclxuICogXHJcbiAqIEByZXF1aXJlcyB1aS5yb3V0ZXIucm91dGVyXHJcbiAqIEByZXF1aXJlcyB1aS5yb3V0ZXIudXRpbFxyXG4gKlxyXG4gKiBAZGVzY3JpcHRpb25cclxuICogIyB1aS5yb3V0ZXIuc3RhdGUgc3ViLW1vZHVsZVxyXG4gKlxyXG4gKiBUaGlzIG1vZHVsZSBpcyBhIGRlcGVuZGVuY3kgb2YgdGhlIG1haW4gdWkucm91dGVyIG1vZHVsZS4gRG8gbm90IGluY2x1ZGUgdGhpcyBtb2R1bGUgYXMgYSBkZXBlbmRlbmN5XHJcbiAqIGluIHlvdXIgYW5ndWxhciBhcHAgKHVzZSB7QGxpbmsgdWkucm91dGVyfSBtb2R1bGUgaW5zdGVhZCkuXHJcbiAqIFxyXG4gKi9cclxuYW5ndWxhci5tb2R1bGUoJ3VpLnJvdXRlci5zdGF0ZScsIFsndWkucm91dGVyLnJvdXRlcicsICd1aS5yb3V0ZXIudXRpbCddKTtcclxuXHJcbi8qKlxyXG4gKiBAbmdkb2Mgb3ZlcnZpZXdcclxuICogQG5hbWUgdWkucm91dGVyXHJcbiAqXHJcbiAqIEByZXF1aXJlcyB1aS5yb3V0ZXIuc3RhdGVcclxuICpcclxuICogQGRlc2NyaXB0aW9uXHJcbiAqICMgdWkucm91dGVyXHJcbiAqIFxyXG4gKiAjIyBUaGUgbWFpbiBtb2R1bGUgZm9yIHVpLnJvdXRlciBcclxuICogVGhlcmUgYXJlIHNldmVyYWwgc3ViLW1vZHVsZXMgaW5jbHVkZWQgd2l0aCB0aGUgdWkucm91dGVyIG1vZHVsZSwgaG93ZXZlciBvbmx5IHRoaXMgbW9kdWxlIGlzIG5lZWRlZFxyXG4gKiBhcyBhIGRlcGVuZGVuY3kgd2l0aGluIHlvdXIgYW5ndWxhciBhcHAuIFRoZSBvdGhlciBtb2R1bGVzIGFyZSBmb3Igb3JnYW5pemF0aW9uIHB1cnBvc2VzLiBcclxuICpcclxuICogVGhlIG1vZHVsZXMgYXJlOlxyXG4gKiAqIHVpLnJvdXRlciAtIHRoZSBtYWluIFwidW1icmVsbGFcIiBtb2R1bGVcclxuICogKiB1aS5yb3V0ZXIucm91dGVyIC0gXHJcbiAqIFxyXG4gKiAqWW91J2xsIG5lZWQgdG8gaW5jbHVkZSAqKm9ubHkqKiB0aGlzIG1vZHVsZSBhcyB0aGUgZGVwZW5kZW5jeSB3aXRoaW4geW91ciBhbmd1bGFyIGFwcC4qXHJcbiAqIFxyXG4gKiA8cHJlPlxyXG4gKiA8IWRvY3R5cGUgaHRtbD5cclxuICogPGh0bWwgbmctYXBwPVwibXlBcHBcIj5cclxuICogPGhlYWQ+XHJcbiAqICAgPHNjcmlwdCBzcmM9XCJqcy9hbmd1bGFyLmpzXCI+PC9zY3JpcHQ+XHJcbiAqICAgPCEtLSBJbmNsdWRlIHRoZSB1aS1yb3V0ZXIgc2NyaXB0IC0tPlxyXG4gKiAgIDxzY3JpcHQgc3JjPVwianMvYW5ndWxhci11aS1yb3V0ZXIubWluLmpzXCI+PC9zY3JpcHQ+XHJcbiAqICAgPHNjcmlwdD5cclxuICogICAgIC8vIC4uLmFuZCBhZGQgJ3VpLnJvdXRlcicgYXMgYSBkZXBlbmRlbmN5XHJcbiAqICAgICB2YXIgbXlBcHAgPSBhbmd1bGFyLm1vZHVsZSgnbXlBcHAnLCBbJ3VpLnJvdXRlciddKTtcclxuICogICA8L3NjcmlwdD5cclxuICogPC9oZWFkPlxyXG4gKiA8Ym9keT5cclxuICogPC9ib2R5PlxyXG4gKiA8L2h0bWw+XHJcbiAqIDwvcHJlPlxyXG4gKi9cclxuYW5ndWxhci5tb2R1bGUoJ3VpLnJvdXRlcicsIFsndWkucm91dGVyLnN0YXRlJ10pO1xyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3VpLnJvdXRlci5jb21wYXQnLCBbJ3VpLnJvdXRlciddKTtcclxuIiwiLyoqXHJcbiAqIEBuZ2RvYyBvYmplY3RcclxuICogQG5hbWUgdWkucm91dGVyLnV0aWwuJHJlc29sdmVcclxuICpcclxuICogQHJlcXVpcmVzICRxXHJcbiAqIEByZXF1aXJlcyAkaW5qZWN0b3JcclxuICpcclxuICogQGRlc2NyaXB0aW9uXHJcbiAqIE1hbmFnZXMgcmVzb2x1dGlvbiBvZiAoYWN5Y2xpYykgZ3JhcGhzIG9mIHByb21pc2VzLlxyXG4gKi9cclxuJFJlc29sdmUuJGluamVjdCA9IFsnJHEnLCAnJGluamVjdG9yJ107XHJcbmZ1bmN0aW9uICRSZXNvbHZlKCAgJHEsICAgICRpbmplY3Rvcikge1xyXG4gIFxyXG4gIHZhciBWSVNJVF9JTl9QUk9HUkVTUyA9IDEsXHJcbiAgICAgIFZJU0lUX0RPTkUgPSAyLFxyXG4gICAgICBOT1RISU5HID0ge30sXHJcbiAgICAgIE5PX0RFUEVOREVOQ0lFUyA9IFtdLFxyXG4gICAgICBOT19MT0NBTFMgPSBOT1RISU5HLFxyXG4gICAgICBOT19QQVJFTlQgPSBleHRlbmQoJHEud2hlbihOT1RISU5HKSwgeyAkJHByb21pc2VzOiBOT1RISU5HLCAkJHZhbHVlczogTk9USElORyB9KTtcclxuICBcclxuXHJcbiAgLyoqXHJcbiAgICogQG5nZG9jIGZ1bmN0aW9uXHJcbiAgICogQG5hbWUgdWkucm91dGVyLnV0aWwuJHJlc29sdmUjc3R1ZHlcclxuICAgKiBAbWV0aG9kT2YgdWkucm91dGVyLnV0aWwuJHJlc29sdmVcclxuICAgKlxyXG4gICAqIEBkZXNjcmlwdGlvblxyXG4gICAqIFN0dWRpZXMgYSBzZXQgb2YgaW52b2NhYmxlcyB0aGF0IGFyZSBsaWtlbHkgdG8gYmUgdXNlZCBtdWx0aXBsZSB0aW1lcy5cclxuICAgKiA8cHJlPlxyXG4gICAqICRyZXNvbHZlLnN0dWR5KGludm9jYWJsZXMpKGxvY2FscywgcGFyZW50LCBzZWxmKVxyXG4gICAqIDwvcHJlPlxyXG4gICAqIGlzIGVxdWl2YWxlbnQgdG9cclxuICAgKiA8cHJlPlxyXG4gICAqICRyZXNvbHZlLnJlc29sdmUoaW52b2NhYmxlcywgbG9jYWxzLCBwYXJlbnQsIHNlbGYpXHJcbiAgICogPC9wcmU+XHJcbiAgICogYnV0IHRoZSBmb3JtZXIgaXMgbW9yZSBlZmZpY2llbnQgKGluIGZhY3QgYHJlc29sdmVgIGp1c3QgY2FsbHMgYHN0dWR5YCBcclxuICAgKiBpbnRlcm5hbGx5KS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBpbnZvY2FibGVzIEludm9jYWJsZSBvYmplY3RzXHJcbiAgICogQHJldHVybiB7ZnVuY3Rpb259IGEgZnVuY3Rpb24gdG8gcGFzcyBpbiBsb2NhbHMsIHBhcmVudCBhbmQgc2VsZlxyXG4gICAqL1xyXG4gIHRoaXMuc3R1ZHkgPSBmdW5jdGlvbiAoaW52b2NhYmxlcykge1xyXG4gICAgaWYgKCFpc09iamVjdChpbnZvY2FibGVzKSkgdGhyb3cgbmV3IEVycm9yKFwiJ2ludm9jYWJsZXMnIG11c3QgYmUgYW4gb2JqZWN0XCIpO1xyXG4gICAgdmFyIGludm9jYWJsZUtleXMgPSBvYmplY3RLZXlzKGludm9jYWJsZXMgfHwge30pO1xyXG4gICAgXHJcbiAgICAvLyBQZXJmb3JtIGEgdG9wb2xvZ2ljYWwgc29ydCBvZiBpbnZvY2FibGVzIHRvIGJ1aWxkIGFuIG9yZGVyZWQgcGxhblxyXG4gICAgdmFyIHBsYW4gPSBbXSwgY3ljbGUgPSBbXSwgdmlzaXRlZCA9IHt9O1xyXG4gICAgZnVuY3Rpb24gdmlzaXQodmFsdWUsIGtleSkge1xyXG4gICAgICBpZiAodmlzaXRlZFtrZXldID09PSBWSVNJVF9ET05FKSByZXR1cm47XHJcbiAgICAgIFxyXG4gICAgICBjeWNsZS5wdXNoKGtleSk7XHJcbiAgICAgIGlmICh2aXNpdGVkW2tleV0gPT09IFZJU0lUX0lOX1BST0dSRVNTKSB7XHJcbiAgICAgICAgY3ljbGUuc3BsaWNlKDAsIGluZGV4T2YoY3ljbGUsIGtleSkpO1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkN5Y2xpYyBkZXBlbmRlbmN5OiBcIiArIGN5Y2xlLmpvaW4oXCIgLT4gXCIpKTtcclxuICAgICAgfVxyXG4gICAgICB2aXNpdGVkW2tleV0gPSBWSVNJVF9JTl9QUk9HUkVTUztcclxuICAgICAgXHJcbiAgICAgIGlmIChpc1N0cmluZyh2YWx1ZSkpIHtcclxuICAgICAgICBwbGFuLnB1c2goa2V5LCBbIGZ1bmN0aW9uKCkgeyByZXR1cm4gJGluamVjdG9yLmdldCh2YWx1ZSk7IH1dLCBOT19ERVBFTkRFTkNJRVMpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHZhciBwYXJhbXMgPSAkaW5qZWN0b3IuYW5ub3RhdGUodmFsdWUpO1xyXG4gICAgICAgIGZvckVhY2gocGFyYW1zLCBmdW5jdGlvbiAocGFyYW0pIHtcclxuICAgICAgICAgIGlmIChwYXJhbSAhPT0ga2V5ICYmIGludm9jYWJsZXMuaGFzT3duUHJvcGVydHkocGFyYW0pKSB2aXNpdChpbnZvY2FibGVzW3BhcmFtXSwgcGFyYW0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHBsYW4ucHVzaChrZXksIHZhbHVlLCBwYXJhbXMpO1xyXG4gICAgICB9XHJcbiAgICAgIFxyXG4gICAgICBjeWNsZS5wb3AoKTtcclxuICAgICAgdmlzaXRlZFtrZXldID0gVklTSVRfRE9ORTtcclxuICAgIH1cclxuICAgIGZvckVhY2goaW52b2NhYmxlcywgdmlzaXQpO1xyXG4gICAgaW52b2NhYmxlcyA9IGN5Y2xlID0gdmlzaXRlZCA9IG51bGw7IC8vIHBsYW4gaXMgYWxsIHRoYXQncyByZXF1aXJlZFxyXG4gICAgXHJcbiAgICBmdW5jdGlvbiBpc1Jlc29sdmUodmFsdWUpIHtcclxuICAgICAgcmV0dXJuIGlzT2JqZWN0KHZhbHVlKSAmJiB2YWx1ZS50aGVuICYmIHZhbHVlLiQkcHJvbWlzZXM7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHJldHVybiBmdW5jdGlvbiAobG9jYWxzLCBwYXJlbnQsIHNlbGYpIHtcclxuICAgICAgaWYgKGlzUmVzb2x2ZShsb2NhbHMpICYmIHNlbGYgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIHNlbGYgPSBwYXJlbnQ7IHBhcmVudCA9IGxvY2FsczsgbG9jYWxzID0gbnVsbDtcclxuICAgICAgfVxyXG4gICAgICBpZiAoIWxvY2FscykgbG9jYWxzID0gTk9fTE9DQUxTO1xyXG4gICAgICBlbHNlIGlmICghaXNPYmplY3QobG9jYWxzKSkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIidsb2NhbHMnIG11c3QgYmUgYW4gb2JqZWN0XCIpO1xyXG4gICAgICB9ICAgICAgIFxyXG4gICAgICBpZiAoIXBhcmVudCkgcGFyZW50ID0gTk9fUEFSRU5UO1xyXG4gICAgICBlbHNlIGlmICghaXNSZXNvbHZlKHBhcmVudCkpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCIncGFyZW50JyBtdXN0IGJlIGEgcHJvbWlzZSByZXR1cm5lZCBieSAkcmVzb2x2ZS5yZXNvbHZlKClcIik7XHJcbiAgICAgIH1cclxuICAgICAgXHJcbiAgICAgIC8vIFRvIGNvbXBsZXRlIHRoZSBvdmVyYWxsIHJlc29sdXRpb24sIHdlIGhhdmUgdG8gd2FpdCBmb3IgdGhlIHBhcmVudFxyXG4gICAgICAvLyBwcm9taXNlIGFuZCBmb3IgdGhlIHByb21pc2UgZm9yIGVhY2ggaW52b2thYmxlIGluIG91ciBwbGFuLlxyXG4gICAgICB2YXIgcmVzb2x1dGlvbiA9ICRxLmRlZmVyKCksXHJcbiAgICAgICAgICByZXN1bHQgPSByZXNvbHV0aW9uLnByb21pc2UsXHJcbiAgICAgICAgICBwcm9taXNlcyA9IHJlc3VsdC4kJHByb21pc2VzID0ge30sXHJcbiAgICAgICAgICB2YWx1ZXMgPSBleHRlbmQoe30sIGxvY2FscyksXHJcbiAgICAgICAgICB3YWl0ID0gMSArIHBsYW4ubGVuZ3RoLzMsXHJcbiAgICAgICAgICBtZXJnZWQgPSBmYWxzZTtcclxuICAgICAgICAgIFxyXG4gICAgICBmdW5jdGlvbiBkb25lKCkge1xyXG4gICAgICAgIC8vIE1lcmdlIHBhcmVudCB2YWx1ZXMgd2UgaGF2ZW4ndCBnb3QgeWV0IGFuZCBwdWJsaXNoIG91ciBvd24gJCR2YWx1ZXNcclxuICAgICAgICBpZiAoIS0td2FpdCkge1xyXG4gICAgICAgICAgaWYgKCFtZXJnZWQpIG1lcmdlKHZhbHVlcywgcGFyZW50LiQkdmFsdWVzKTsgXHJcbiAgICAgICAgICByZXN1bHQuJCR2YWx1ZXMgPSB2YWx1ZXM7XHJcbiAgICAgICAgICByZXN1bHQuJCRwcm9taXNlcyA9IHJlc3VsdC4kJHByb21pc2VzIHx8IHRydWU7IC8vIGtlZXAgZm9yIGlzUmVzb2x2ZSgpXHJcbiAgICAgICAgICBkZWxldGUgcmVzdWx0LiQkaW5oZXJpdGVkVmFsdWVzO1xyXG4gICAgICAgICAgcmVzb2x1dGlvbi5yZXNvbHZlKHZhbHVlcyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIFxyXG4gICAgICBmdW5jdGlvbiBmYWlsKHJlYXNvbikge1xyXG4gICAgICAgIHJlc3VsdC4kJGZhaWx1cmUgPSByZWFzb247XHJcbiAgICAgICAgcmVzb2x1dGlvbi5yZWplY3QocmVhc29uKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gU2hvcnQtY2lyY3VpdCBpZiBwYXJlbnQgaGFzIGFscmVhZHkgZmFpbGVkXHJcbiAgICAgIGlmIChpc0RlZmluZWQocGFyZW50LiQkZmFpbHVyZSkpIHtcclxuICAgICAgICBmYWlsKHBhcmVudC4kJGZhaWx1cmUpO1xyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgIH1cclxuICAgICAgXHJcbiAgICAgIGlmIChwYXJlbnQuJCRpbmhlcml0ZWRWYWx1ZXMpIHtcclxuICAgICAgICBtZXJnZSh2YWx1ZXMsIG9taXQocGFyZW50LiQkaW5oZXJpdGVkVmFsdWVzLCBpbnZvY2FibGVLZXlzKSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIE1lcmdlIHBhcmVudCB2YWx1ZXMgaWYgdGhlIHBhcmVudCBoYXMgYWxyZWFkeSByZXNvbHZlZCwgb3IgbWVyZ2VcclxuICAgICAgLy8gcGFyZW50IHByb21pc2VzIGFuZCB3YWl0IGlmIHRoZSBwYXJlbnQgcmVzb2x2ZSBpcyBzdGlsbCBpbiBwcm9ncmVzcy5cclxuICAgICAgZXh0ZW5kKHByb21pc2VzLCBwYXJlbnQuJCRwcm9taXNlcyk7XHJcbiAgICAgIGlmIChwYXJlbnQuJCR2YWx1ZXMpIHtcclxuICAgICAgICBtZXJnZWQgPSBtZXJnZSh2YWx1ZXMsIG9taXQocGFyZW50LiQkdmFsdWVzLCBpbnZvY2FibGVLZXlzKSk7XHJcbiAgICAgICAgcmVzdWx0LiQkaW5oZXJpdGVkVmFsdWVzID0gb21pdChwYXJlbnQuJCR2YWx1ZXMsIGludm9jYWJsZUtleXMpO1xyXG4gICAgICAgIGRvbmUoKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBpZiAocGFyZW50LiQkaW5oZXJpdGVkVmFsdWVzKSB7XHJcbiAgICAgICAgICByZXN1bHQuJCRpbmhlcml0ZWRWYWx1ZXMgPSBvbWl0KHBhcmVudC4kJGluaGVyaXRlZFZhbHVlcywgaW52b2NhYmxlS2V5cyk7XHJcbiAgICAgICAgfSAgICAgICAgXHJcbiAgICAgICAgcGFyZW50LnRoZW4oZG9uZSwgZmFpbCk7XHJcbiAgICAgIH1cclxuICAgICAgXHJcbiAgICAgIC8vIFByb2Nlc3MgZWFjaCBpbnZvY2FibGUgaW4gdGhlIHBsYW4sIGJ1dCBpZ25vcmUgYW55IHdoZXJlIGEgbG9jYWwgb2YgdGhlIHNhbWUgbmFtZSBleGlzdHMuXHJcbiAgICAgIGZvciAodmFyIGk9MCwgaWk9cGxhbi5sZW5ndGg7IGk8aWk7IGkrPTMpIHtcclxuICAgICAgICBpZiAobG9jYWxzLmhhc093blByb3BlcnR5KHBsYW5baV0pKSBkb25lKCk7XHJcbiAgICAgICAgZWxzZSBpbnZva2UocGxhbltpXSwgcGxhbltpKzFdLCBwbGFuW2krMl0pO1xyXG4gICAgICB9XHJcbiAgICAgIFxyXG4gICAgICBmdW5jdGlvbiBpbnZva2Uoa2V5LCBpbnZvY2FibGUsIHBhcmFtcykge1xyXG4gICAgICAgIC8vIENyZWF0ZSBhIGRlZmVycmVkIGZvciB0aGlzIGludm9jYXRpb24uIEZhaWx1cmVzIHdpbGwgcHJvcGFnYXRlIHRvIHRoZSByZXNvbHV0aW9uIGFzIHdlbGwuXHJcbiAgICAgICAgdmFyIGludm9jYXRpb24gPSAkcS5kZWZlcigpLCB3YWl0UGFyYW1zID0gMDtcclxuICAgICAgICBmdW5jdGlvbiBvbmZhaWx1cmUocmVhc29uKSB7XHJcbiAgICAgICAgICBpbnZvY2F0aW9uLnJlamVjdChyZWFzb24pO1xyXG4gICAgICAgICAgZmFpbChyZWFzb24pO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBXYWl0IGZvciBhbnkgcGFyYW1ldGVyIHRoYXQgd2UgaGF2ZSBhIHByb21pc2UgZm9yIChlaXRoZXIgZnJvbSBwYXJlbnQgb3IgZnJvbSB0aGlzXHJcbiAgICAgICAgLy8gcmVzb2x2ZTsgaW4gdGhhdCBjYXNlIHN0dWR5KCkgd2lsbCBoYXZlIG1hZGUgc3VyZSBpdCdzIG9yZGVyZWQgYmVmb3JlIHVzIGluIHRoZSBwbGFuKS5cclxuICAgICAgICBmb3JFYWNoKHBhcmFtcywgZnVuY3Rpb24gKGRlcCkge1xyXG4gICAgICAgICAgaWYgKHByb21pc2VzLmhhc093blByb3BlcnR5KGRlcCkgJiYgIWxvY2Fscy5oYXNPd25Qcm9wZXJ0eShkZXApKSB7XHJcbiAgICAgICAgICAgIHdhaXRQYXJhbXMrKztcclxuICAgICAgICAgICAgcHJvbWlzZXNbZGVwXS50aGVuKGZ1bmN0aW9uIChyZXN1bHQpIHtcclxuICAgICAgICAgICAgICB2YWx1ZXNbZGVwXSA9IHJlc3VsdDtcclxuICAgICAgICAgICAgICBpZiAoISgtLXdhaXRQYXJhbXMpKSBwcm9jZWVkKCk7XHJcbiAgICAgICAgICAgIH0sIG9uZmFpbHVyZSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgaWYgKCF3YWl0UGFyYW1zKSBwcm9jZWVkKCk7XHJcbiAgICAgICAgZnVuY3Rpb24gcHJvY2VlZCgpIHtcclxuICAgICAgICAgIGlmIChpc0RlZmluZWQocmVzdWx0LiQkZmFpbHVyZSkpIHJldHVybjtcclxuICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGludm9jYXRpb24ucmVzb2x2ZSgkaW5qZWN0b3IuaW52b2tlKGludm9jYWJsZSwgc2VsZiwgdmFsdWVzKSk7XHJcbiAgICAgICAgICAgIGludm9jYXRpb24ucHJvbWlzZS50aGVuKGZ1bmN0aW9uIChyZXN1bHQpIHtcclxuICAgICAgICAgICAgICB2YWx1ZXNba2V5XSA9IHJlc3VsdDtcclxuICAgICAgICAgICAgICBkb25lKCk7XHJcbiAgICAgICAgICAgIH0sIG9uZmFpbHVyZSk7XHJcbiAgICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIG9uZmFpbHVyZShlKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLy8gUHVibGlzaCBwcm9taXNlIHN5bmNocm9ub3VzbHk7IGludm9jYXRpb25zIGZ1cnRoZXIgZG93biBpbiB0aGUgcGxhbiBtYXkgZGVwZW5kIG9uIGl0LlxyXG4gICAgICAgIHByb21pc2VzW2tleV0gPSBpbnZvY2F0aW9uLnByb21pc2U7XHJcbiAgICAgIH1cclxuICAgICAgXHJcbiAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICB9O1xyXG4gIH07XHJcbiAgXHJcbiAgLyoqXHJcbiAgICogQG5nZG9jIGZ1bmN0aW9uXHJcbiAgICogQG5hbWUgdWkucm91dGVyLnV0aWwuJHJlc29sdmUjcmVzb2x2ZVxyXG4gICAqIEBtZXRob2RPZiB1aS5yb3V0ZXIudXRpbC4kcmVzb2x2ZVxyXG4gICAqXHJcbiAgICogQGRlc2NyaXB0aW9uXHJcbiAgICogUmVzb2x2ZXMgYSBzZXQgb2YgaW52b2NhYmxlcy4gQW4gaW52b2NhYmxlIGlzIGEgZnVuY3Rpb24gdG8gYmUgaW52b2tlZCB2aWEgXHJcbiAgICogYCRpbmplY3Rvci5pbnZva2UoKWAsIGFuZCBjYW4gaGF2ZSBhbiBhcmJpdHJhcnkgbnVtYmVyIG9mIGRlcGVuZGVuY2llcy4gXHJcbiAgICogQW4gaW52b2NhYmxlIGNhbiBlaXRoZXIgcmV0dXJuIGEgdmFsdWUgZGlyZWN0bHksXHJcbiAgICogb3IgYSBgJHFgIHByb21pc2UuIElmIGEgcHJvbWlzZSBpcyByZXR1cm5lZCBpdCB3aWxsIGJlIHJlc29sdmVkIGFuZCB0aGUgXHJcbiAgICogcmVzdWx0aW5nIHZhbHVlIHdpbGwgYmUgdXNlZCBpbnN0ZWFkLiBEZXBlbmRlbmNpZXMgb2YgaW52b2NhYmxlcyBhcmUgcmVzb2x2ZWQgXHJcbiAgICogKGluIHRoaXMgb3JkZXIgb2YgcHJlY2VkZW5jZSlcclxuICAgKlxyXG4gICAqIC0gZnJvbSB0aGUgc3BlY2lmaWVkIGBsb2NhbHNgXHJcbiAgICogLSBmcm9tIGFub3RoZXIgaW52b2NhYmxlIHRoYXQgaXMgcGFydCBvZiB0aGlzIGAkcmVzb2x2ZWAgY2FsbFxyXG4gICAqIC0gZnJvbSBhbiBpbnZvY2FibGUgdGhhdCBpcyBpbmhlcml0ZWQgZnJvbSBhIGBwYXJlbnRgIGNhbGwgdG8gYCRyZXNvbHZlYCBcclxuICAgKiAgIChvciByZWN1cnNpdmVseVxyXG4gICAqIC0gZnJvbSBhbnkgYW5jZXN0b3IgYCRyZXNvbHZlYCBvZiB0aGF0IHBhcmVudCkuXHJcbiAgICpcclxuICAgKiBUaGUgcmV0dXJuIHZhbHVlIG9mIGAkcmVzb2x2ZWAgaXMgYSBwcm9taXNlIGZvciBhbiBvYmplY3QgdGhhdCBjb250YWlucyBcclxuICAgKiAoaW4gdGhpcyBvcmRlciBvZiBwcmVjZWRlbmNlKVxyXG4gICAqXHJcbiAgICogLSBhbnkgYGxvY2Fsc2AgKGlmIHNwZWNpZmllZClcclxuICAgKiAtIHRoZSByZXNvbHZlZCByZXR1cm4gdmFsdWVzIG9mIGFsbCBpbmplY3RhYmxlc1xyXG4gICAqIC0gYW55IHZhbHVlcyBpbmhlcml0ZWQgZnJvbSBhIGBwYXJlbnRgIGNhbGwgdG8gYCRyZXNvbHZlYCAoaWYgc3BlY2lmaWVkKVxyXG4gICAqXHJcbiAgICogVGhlIHByb21pc2Ugd2lsbCByZXNvbHZlIGFmdGVyIHRoZSBgcGFyZW50YCBwcm9taXNlIChpZiBhbnkpIGFuZCBhbGwgcHJvbWlzZXMgXHJcbiAgICogcmV0dXJuZWQgYnkgaW5qZWN0YWJsZXMgaGF2ZSBiZWVuIHJlc29sdmVkLiBJZiBhbnkgaW52b2NhYmxlIFxyXG4gICAqIChvciBgJGluamVjdG9yLmludm9rZWApIHRocm93cyBhbiBleGNlcHRpb24sIG9yIGlmIGEgcHJvbWlzZSByZXR1cm5lZCBieSBhbiBcclxuICAgKiBpbnZvY2FibGUgaXMgcmVqZWN0ZWQsIHRoZSBgJHJlc29sdmVgIHByb21pc2UgaXMgaW1tZWRpYXRlbHkgcmVqZWN0ZWQgd2l0aCB0aGUgXHJcbiAgICogc2FtZSBlcnJvci4gQSByZWplY3Rpb24gb2YgYSBgcGFyZW50YCBwcm9taXNlIChpZiBzcGVjaWZpZWQpIHdpbGwgbGlrZXdpc2UgYmUgXHJcbiAgICogcHJvcGFnYXRlZCBpbW1lZGlhdGVseS4gT25jZSB0aGUgYCRyZXNvbHZlYCBwcm9taXNlIGhhcyBiZWVuIHJlamVjdGVkLCBubyBcclxuICAgKiBmdXJ0aGVyIGludm9jYWJsZXMgd2lsbCBiZSBjYWxsZWQuXHJcbiAgICogXHJcbiAgICogQ3ljbGljIGRlcGVuZGVuY2llcyBiZXR3ZWVuIGludm9jYWJsZXMgYXJlIG5vdCBwZXJtaXR0ZWQgYW5kIHdpbGwgY2F1ZXMgYCRyZXNvbHZlYFxyXG4gICAqIHRvIHRocm93IGFuIGVycm9yLiBBcyBhIHNwZWNpYWwgY2FzZSwgYW4gaW5qZWN0YWJsZSBjYW4gZGVwZW5kIG9uIGEgcGFyYW1ldGVyIFxyXG4gICAqIHdpdGggdGhlIHNhbWUgbmFtZSBhcyB0aGUgaW5qZWN0YWJsZSwgd2hpY2ggd2lsbCBiZSBmdWxmaWxsZWQgZnJvbSB0aGUgYHBhcmVudGAgXHJcbiAgICogaW5qZWN0YWJsZSBvZiB0aGUgc2FtZSBuYW1lLiBUaGlzIGFsbG93cyBpbmhlcml0ZWQgdmFsdWVzIHRvIGJlIGRlY29yYXRlZC4gXHJcbiAgICogTm90ZSB0aGF0IGluIHRoaXMgY2FzZSBhbnkgb3RoZXIgaW5qZWN0YWJsZSBpbiB0aGUgc2FtZSBgJHJlc29sdmVgIHdpdGggdGhlIHNhbWVcclxuICAgKiBkZXBlbmRlbmN5IHdvdWxkIHNlZSB0aGUgZGVjb3JhdGVkIHZhbHVlLCBub3QgdGhlIGluaGVyaXRlZCB2YWx1ZS5cclxuICAgKlxyXG4gICAqIE5vdGUgdGhhdCBtaXNzaW5nIGRlcGVuZGVuY2llcyAtLSB1bmxpa2UgY3ljbGljIGRlcGVuZGVuY2llcyAtLSB3aWxsIGNhdXNlIGFuIFxyXG4gICAqIChhc3luY2hyb25vdXMpIHJlamVjdGlvbiBvZiB0aGUgYCRyZXNvbHZlYCBwcm9taXNlIHJhdGhlciB0aGFuIGEgKHN5bmNocm9ub3VzKSBcclxuICAgKiBleGNlcHRpb24uXHJcbiAgICpcclxuICAgKiBJbnZvY2FibGVzIGFyZSBpbnZva2VkIGVhZ2VybHkgYXMgc29vbiBhcyBhbGwgZGVwZW5kZW5jaWVzIGFyZSBhdmFpbGFibGUuIFxyXG4gICAqIFRoaXMgaXMgdHJ1ZSBldmVuIGZvciBkZXBlbmRlbmNpZXMgaW5oZXJpdGVkIGZyb20gYSBgcGFyZW50YCBjYWxsIHRvIGAkcmVzb2x2ZWAuXHJcbiAgICpcclxuICAgKiBBcyBhIHNwZWNpYWwgY2FzZSwgYW4gaW52b2NhYmxlIGNhbiBiZSBhIHN0cmluZywgaW4gd2hpY2ggY2FzZSBpdCBpcyB0YWtlbiB0byBcclxuICAgKiBiZSBhIHNlcnZpY2UgbmFtZSB0byBiZSBwYXNzZWQgdG8gYCRpbmplY3Rvci5nZXQoKWAuIFRoaXMgaXMgc3VwcG9ydGVkIHByaW1hcmlseSBcclxuICAgKiBmb3IgYmFja3dhcmRzLWNvbXBhdGliaWxpdHkgd2l0aCB0aGUgYHJlc29sdmVgIHByb3BlcnR5IG9mIGAkcm91dGVQcm92aWRlcmAgXHJcbiAgICogcm91dGVzLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtvYmplY3R9IGludm9jYWJsZXMgZnVuY3Rpb25zIHRvIGludm9rZSBvciBcclxuICAgKiBgJGluamVjdG9yYCBzZXJ2aWNlcyB0byBmZXRjaC5cclxuICAgKiBAcGFyYW0ge29iamVjdH0gbG9jYWxzICB2YWx1ZXMgdG8gbWFrZSBhdmFpbGFibGUgdG8gdGhlIGluamVjdGFibGVzXHJcbiAgICogQHBhcmFtIHtvYmplY3R9IHBhcmVudCAgYSBwcm9taXNlIHJldHVybmVkIGJ5IGFub3RoZXIgY2FsbCB0byBgJHJlc29sdmVgLlxyXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBzZWxmICB0aGUgYHRoaXNgIGZvciB0aGUgaW52b2tlZCBtZXRob2RzXHJcbiAgICogQHJldHVybiB7b2JqZWN0fSBQcm9taXNlIGZvciBhbiBvYmplY3QgdGhhdCBjb250YWlucyB0aGUgcmVzb2x2ZWQgcmV0dXJuIHZhbHVlXHJcbiAgICogb2YgYWxsIGludm9jYWJsZXMsIGFzIHdlbGwgYXMgYW55IGluaGVyaXRlZCBhbmQgbG9jYWwgdmFsdWVzLlxyXG4gICAqL1xyXG4gIHRoaXMucmVzb2x2ZSA9IGZ1bmN0aW9uIChpbnZvY2FibGVzLCBsb2NhbHMsIHBhcmVudCwgc2VsZikge1xyXG4gICAgcmV0dXJuIHRoaXMuc3R1ZHkoaW52b2NhYmxlcykobG9jYWxzLCBwYXJlbnQsIHNlbGYpO1xyXG4gIH07XHJcbn1cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd1aS5yb3V0ZXIudXRpbCcpLnNlcnZpY2UoJyRyZXNvbHZlJywgJFJlc29sdmUpO1xyXG5cclxuIiwiLyoqXHJcbiAqIEBuZ2RvYyBvYmplY3RcclxuICogQG5hbWUgdWkucm91dGVyLnN0YXRlLiRzdGF0ZVByb3ZpZGVyXHJcbiAqXHJcbiAqIEByZXF1aXJlcyB1aS5yb3V0ZXIucm91dGVyLiR1cmxSb3V0ZXJQcm92aWRlclxyXG4gKiBAcmVxdWlyZXMgdWkucm91dGVyLnV0aWwuJHVybE1hdGNoZXJGYWN0b3J5UHJvdmlkZXJcclxuICpcclxuICogQGRlc2NyaXB0aW9uXHJcbiAqIFRoZSBuZXcgYCRzdGF0ZVByb3ZpZGVyYCB3b3JrcyBzaW1pbGFyIHRvIEFuZ3VsYXIncyB2MSByb3V0ZXIsIGJ1dCBpdCBmb2N1c2VzIHB1cmVseVxyXG4gKiBvbiBzdGF0ZS5cclxuICpcclxuICogQSBzdGF0ZSBjb3JyZXNwb25kcyB0byBhIFwicGxhY2VcIiBpbiB0aGUgYXBwbGljYXRpb24gaW4gdGVybXMgb2YgdGhlIG92ZXJhbGwgVUkgYW5kXHJcbiAqIG5hdmlnYXRpb24uIEEgc3RhdGUgZGVzY3JpYmVzICh2aWEgdGhlIGNvbnRyb2xsZXIgLyB0ZW1wbGF0ZSAvIHZpZXcgcHJvcGVydGllcykgd2hhdFxyXG4gKiB0aGUgVUkgbG9va3MgbGlrZSBhbmQgZG9lcyBhdCB0aGF0IHBsYWNlLlxyXG4gKlxyXG4gKiBTdGF0ZXMgb2Z0ZW4gaGF2ZSB0aGluZ3MgaW4gY29tbW9uLCBhbmQgdGhlIHByaW1hcnkgd2F5IG9mIGZhY3RvcmluZyBvdXQgdGhlc2VcclxuICogY29tbW9uYWxpdGllcyBpbiB0aGlzIG1vZGVsIGlzIHZpYSB0aGUgc3RhdGUgaGllcmFyY2h5LCBpLmUuIHBhcmVudC9jaGlsZCBzdGF0ZXMgYWthXHJcbiAqIG5lc3RlZCBzdGF0ZXMuXHJcbiAqXHJcbiAqIFRoZSBgJHN0YXRlUHJvdmlkZXJgIHByb3ZpZGVzIGludGVyZmFjZXMgdG8gZGVjbGFyZSB0aGVzZSBzdGF0ZXMgZm9yIHlvdXIgYXBwLlxyXG4gKi9cclxuJFN0YXRlUHJvdmlkZXIuJGluamVjdCA9IFsnJHVybFJvdXRlclByb3ZpZGVyJywgJyR1cmxNYXRjaGVyRmFjdG9yeVByb3ZpZGVyJ107XHJcbmZ1bmN0aW9uICRTdGF0ZVByb3ZpZGVyKCAgICR1cmxSb3V0ZXJQcm92aWRlciwgICAkdXJsTWF0Y2hlckZhY3RvcnkpIHtcclxuXHJcbiAgdmFyIHJvb3QsIHN0YXRlcyA9IHt9LCAkc3RhdGUsIHF1ZXVlID0ge30sIGFic3RyYWN0S2V5ID0gJ2Fic3RyYWN0JztcclxuXHJcbiAgLy8gQnVpbGRzIHN0YXRlIHByb3BlcnRpZXMgZnJvbSBkZWZpbml0aW9uIHBhc3NlZCB0byByZWdpc3RlclN0YXRlKClcclxuICB2YXIgc3RhdGVCdWlsZGVyID0ge1xyXG5cclxuICAgIC8vIERlcml2ZSBwYXJlbnQgc3RhdGUgZnJvbSBhIGhpZXJhcmNoaWNhbCBuYW1lIG9ubHkgaWYgJ3BhcmVudCcgaXMgbm90IGV4cGxpY2l0bHkgZGVmaW5lZC5cclxuICAgIC8vIHN0YXRlLmNoaWxkcmVuID0gW107XHJcbiAgICAvLyBpZiAocGFyZW50KSBwYXJlbnQuY2hpbGRyZW4ucHVzaChzdGF0ZSk7XHJcbiAgICBwYXJlbnQ6IGZ1bmN0aW9uKHN0YXRlKSB7XHJcbiAgICAgIGlmIChpc0RlZmluZWQoc3RhdGUucGFyZW50KSAmJiBzdGF0ZS5wYXJlbnQpIHJldHVybiBmaW5kU3RhdGUoc3RhdGUucGFyZW50KTtcclxuICAgICAgLy8gcmVnZXggbWF0Y2hlcyBhbnkgdmFsaWQgY29tcG9zaXRlIHN0YXRlIG5hbWVcclxuICAgICAgLy8gd291bGQgbWF0Y2ggXCJjb250YWN0Lmxpc3RcIiBidXQgbm90IFwiY29udGFjdHNcIlxyXG4gICAgICB2YXIgY29tcG9zaXRlTmFtZSA9IC9eKC4rKVxcLlteLl0rJC8uZXhlYyhzdGF0ZS5uYW1lKTtcclxuICAgICAgcmV0dXJuIGNvbXBvc2l0ZU5hbWUgPyBmaW5kU3RhdGUoY29tcG9zaXRlTmFtZVsxXSkgOiByb290O1xyXG4gICAgfSxcclxuXHJcbiAgICAvLyBpbmhlcml0ICdkYXRhJyBmcm9tIHBhcmVudCBhbmQgb3ZlcnJpZGUgYnkgb3duIHZhbHVlcyAoaWYgYW55KVxyXG4gICAgZGF0YTogZnVuY3Rpb24oc3RhdGUpIHtcclxuICAgICAgaWYgKHN0YXRlLnBhcmVudCAmJiBzdGF0ZS5wYXJlbnQuZGF0YSkge1xyXG4gICAgICAgIHN0YXRlLmRhdGEgPSBzdGF0ZS5zZWxmLmRhdGEgPSBleHRlbmQoe30sIHN0YXRlLnBhcmVudC5kYXRhLCBzdGF0ZS5kYXRhKTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gc3RhdGUuZGF0YTtcclxuICAgIH0sXHJcblxyXG4gICAgLy8gQnVpbGQgYSBVUkxNYXRjaGVyIGlmIG5lY2Vzc2FyeSwgZWl0aGVyIHZpYSBhIHJlbGF0aXZlIG9yIGFic29sdXRlIFVSTFxyXG4gICAgdXJsOiBmdW5jdGlvbihzdGF0ZSkge1xyXG4gICAgICB2YXIgdXJsID0gc3RhdGUudXJsLCBjb25maWcgPSB7IHBhcmFtczogc3RhdGUucGFyYW1zIHx8IHt9IH07XHJcblxyXG4gICAgICBpZiAoaXNTdHJpbmcodXJsKSkge1xyXG4gICAgICAgIGlmICh1cmwuY2hhckF0KDApID09ICdeJykgcmV0dXJuICR1cmxNYXRjaGVyRmFjdG9yeS5jb21waWxlKHVybC5zdWJzdHJpbmcoMSksIGNvbmZpZyk7XHJcbiAgICAgICAgcmV0dXJuIChzdGF0ZS5wYXJlbnQubmF2aWdhYmxlIHx8IHJvb3QpLnVybC5jb25jYXQodXJsLCBjb25maWcpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoIXVybCB8fCAkdXJsTWF0Y2hlckZhY3RvcnkuaXNNYXRjaGVyKHVybCkpIHJldHVybiB1cmw7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgdXJsICdcIiArIHVybCArIFwiJyBpbiBzdGF0ZSAnXCIgKyBzdGF0ZSArIFwiJ1wiKTtcclxuICAgIH0sXHJcblxyXG4gICAgLy8gS2VlcCB0cmFjayBvZiB0aGUgY2xvc2VzdCBhbmNlc3RvciBzdGF0ZSB0aGF0IGhhcyBhIFVSTCAoaS5lLiBpcyBuYXZpZ2FibGUpXHJcbiAgICBuYXZpZ2FibGU6IGZ1bmN0aW9uKHN0YXRlKSB7XHJcbiAgICAgIHJldHVybiBzdGF0ZS51cmwgPyBzdGF0ZSA6IChzdGF0ZS5wYXJlbnQgPyBzdGF0ZS5wYXJlbnQubmF2aWdhYmxlIDogbnVsbCk7XHJcbiAgICB9LFxyXG5cclxuICAgIC8vIE93biBwYXJhbWV0ZXJzIGZvciB0aGlzIHN0YXRlLiBzdGF0ZS51cmwucGFyYW1zIGlzIGFscmVhZHkgYnVpbHQgYXQgdGhpcyBwb2ludC4gQ3JlYXRlIGFuZCBhZGQgbm9uLXVybCBwYXJhbXNcclxuICAgIG93blBhcmFtczogZnVuY3Rpb24oc3RhdGUpIHtcclxuICAgICAgdmFyIHBhcmFtcyA9IHN0YXRlLnVybCAmJiBzdGF0ZS51cmwucGFyYW1zIHx8IG5ldyAkJFVNRlAuUGFyYW1TZXQoKTtcclxuICAgICAgZm9yRWFjaChzdGF0ZS5wYXJhbXMgfHwge30sIGZ1bmN0aW9uKGNvbmZpZywgaWQpIHtcclxuICAgICAgICBpZiAoIXBhcmFtc1tpZF0pIHBhcmFtc1tpZF0gPSBuZXcgJCRVTUZQLlBhcmFtKGlkLCBudWxsLCBjb25maWcsIFwiY29uZmlnXCIpO1xyXG4gICAgICB9KTtcclxuICAgICAgcmV0dXJuIHBhcmFtcztcclxuICAgIH0sXHJcblxyXG4gICAgLy8gRGVyaXZlIHBhcmFtZXRlcnMgZm9yIHRoaXMgc3RhdGUgYW5kIGVuc3VyZSB0aGV5J3JlIGEgc3VwZXItc2V0IG9mIHBhcmVudCdzIHBhcmFtZXRlcnNcclxuICAgIHBhcmFtczogZnVuY3Rpb24oc3RhdGUpIHtcclxuICAgICAgcmV0dXJuIHN0YXRlLnBhcmVudCAmJiBzdGF0ZS5wYXJlbnQucGFyYW1zID8gZXh0ZW5kKHN0YXRlLnBhcmVudC5wYXJhbXMuJCRuZXcoKSwgc3RhdGUub3duUGFyYW1zKSA6IG5ldyAkJFVNRlAuUGFyYW1TZXQoKTtcclxuICAgIH0sXHJcblxyXG4gICAgLy8gSWYgdGhlcmUgaXMgbm8gZXhwbGljaXQgbXVsdGktdmlldyBjb25maWd1cmF0aW9uLCBtYWtlIG9uZSB1cCBzbyB3ZSBkb24ndCBoYXZlXHJcbiAgICAvLyB0byBoYW5kbGUgYm90aCBjYXNlcyBpbiB0aGUgdmlldyBkaXJlY3RpdmUgbGF0ZXIuIE5vdGUgdGhhdCBoYXZpbmcgYW4gZXhwbGljaXRcclxuICAgIC8vICd2aWV3cycgcHJvcGVydHkgd2lsbCBtZWFuIHRoZSBkZWZhdWx0IHVubmFtZWQgdmlldyBwcm9wZXJ0aWVzIGFyZSBpZ25vcmVkLiBUaGlzXHJcbiAgICAvLyBpcyBhbHNvIGEgZ29vZCB0aW1lIHRvIHJlc29sdmUgdmlldyBuYW1lcyB0byBhYnNvbHV0ZSBuYW1lcywgc28gZXZlcnl0aGluZyBpcyBhXHJcbiAgICAvLyBzdHJhaWdodCBsb29rdXAgYXQgbGluayB0aW1lLlxyXG4gICAgdmlld3M6IGZ1bmN0aW9uKHN0YXRlKSB7XHJcbiAgICAgIHZhciB2aWV3cyA9IHt9O1xyXG5cclxuICAgICAgZm9yRWFjaChpc0RlZmluZWQoc3RhdGUudmlld3MpID8gc3RhdGUudmlld3MgOiB7ICcnOiBzdGF0ZSB9LCBmdW5jdGlvbiAodmlldywgbmFtZSkge1xyXG4gICAgICAgIGlmIChuYW1lLmluZGV4T2YoJ0AnKSA8IDApIG5hbWUgKz0gJ0AnICsgc3RhdGUucGFyZW50Lm5hbWU7XHJcbiAgICAgICAgdmlld3NbbmFtZV0gPSB2aWV3O1xyXG4gICAgICB9KTtcclxuICAgICAgcmV0dXJuIHZpZXdzO1xyXG4gICAgfSxcclxuXHJcbiAgICAvLyBLZWVwIGEgZnVsbCBwYXRoIGZyb20gdGhlIHJvb3QgZG93biB0byB0aGlzIHN0YXRlIGFzIHRoaXMgaXMgbmVlZGVkIGZvciBzdGF0ZSBhY3RpdmF0aW9uLlxyXG4gICAgcGF0aDogZnVuY3Rpb24oc3RhdGUpIHtcclxuICAgICAgcmV0dXJuIHN0YXRlLnBhcmVudCA/IHN0YXRlLnBhcmVudC5wYXRoLmNvbmNhdChzdGF0ZSkgOiBbXTsgLy8gZXhjbHVkZSByb290IGZyb20gcGF0aFxyXG4gICAgfSxcclxuXHJcbiAgICAvLyBTcGVlZCB1cCAkc3RhdGUuY29udGFpbnMoKSBhcyBpdCdzIHVzZWQgYSBsb3RcclxuICAgIGluY2x1ZGVzOiBmdW5jdGlvbihzdGF0ZSkge1xyXG4gICAgICB2YXIgaW5jbHVkZXMgPSBzdGF0ZS5wYXJlbnQgPyBleHRlbmQoe30sIHN0YXRlLnBhcmVudC5pbmNsdWRlcykgOiB7fTtcclxuICAgICAgaW5jbHVkZXNbc3RhdGUubmFtZV0gPSB0cnVlO1xyXG4gICAgICByZXR1cm4gaW5jbHVkZXM7XHJcbiAgICB9LFxyXG5cclxuICAgICRkZWxlZ2F0ZXM6IHt9XHJcbiAgfTtcclxuXHJcbiAgZnVuY3Rpb24gaXNSZWxhdGl2ZShzdGF0ZU5hbWUpIHtcclxuICAgIHJldHVybiBzdGF0ZU5hbWUuaW5kZXhPZihcIi5cIikgPT09IDAgfHwgc3RhdGVOYW1lLmluZGV4T2YoXCJeXCIpID09PSAwO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZmluZFN0YXRlKHN0YXRlT3JOYW1lLCBiYXNlKSB7XHJcbiAgICBpZiAoIXN0YXRlT3JOYW1lKSByZXR1cm4gdW5kZWZpbmVkO1xyXG5cclxuICAgIHZhciBpc1N0ciA9IGlzU3RyaW5nKHN0YXRlT3JOYW1lKSxcclxuICAgICAgICBuYW1lICA9IGlzU3RyID8gc3RhdGVPck5hbWUgOiBzdGF0ZU9yTmFtZS5uYW1lLFxyXG4gICAgICAgIHBhdGggID0gaXNSZWxhdGl2ZShuYW1lKTtcclxuXHJcbiAgICBpZiAocGF0aCkge1xyXG4gICAgICBpZiAoIWJhc2UpIHRocm93IG5ldyBFcnJvcihcIk5vIHJlZmVyZW5jZSBwb2ludCBnaXZlbiBmb3IgcGF0aCAnXCIgICsgbmFtZSArIFwiJ1wiKTtcclxuICAgICAgYmFzZSA9IGZpbmRTdGF0ZShiYXNlKTtcclxuICAgICAgXHJcbiAgICAgIHZhciByZWwgPSBuYW1lLnNwbGl0KFwiLlwiKSwgaSA9IDAsIHBhdGhMZW5ndGggPSByZWwubGVuZ3RoLCBjdXJyZW50ID0gYmFzZTtcclxuXHJcbiAgICAgIGZvciAoOyBpIDwgcGF0aExlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgaWYgKHJlbFtpXSA9PT0gXCJcIiAmJiBpID09PSAwKSB7XHJcbiAgICAgICAgICBjdXJyZW50ID0gYmFzZTtcclxuICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAocmVsW2ldID09PSBcIl5cIikge1xyXG4gICAgICAgICAgaWYgKCFjdXJyZW50LnBhcmVudCkgdGhyb3cgbmV3IEVycm9yKFwiUGF0aCAnXCIgKyBuYW1lICsgXCInIG5vdCB2YWxpZCBmb3Igc3RhdGUgJ1wiICsgYmFzZS5uYW1lICsgXCInXCIpO1xyXG4gICAgICAgICAgY3VycmVudCA9IGN1cnJlbnQucGFyZW50O1xyXG4gICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcbiAgICAgIHJlbCA9IHJlbC5zbGljZShpKS5qb2luKFwiLlwiKTtcclxuICAgICAgbmFtZSA9IGN1cnJlbnQubmFtZSArIChjdXJyZW50Lm5hbWUgJiYgcmVsID8gXCIuXCIgOiBcIlwiKSArIHJlbDtcclxuICAgIH1cclxuICAgIHZhciBzdGF0ZSA9IHN0YXRlc1tuYW1lXTtcclxuXHJcbiAgICBpZiAoc3RhdGUgJiYgKGlzU3RyIHx8ICghaXNTdHIgJiYgKHN0YXRlID09PSBzdGF0ZU9yTmFtZSB8fCBzdGF0ZS5zZWxmID09PSBzdGF0ZU9yTmFtZSkpKSkge1xyXG4gICAgICByZXR1cm4gc3RhdGU7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gcXVldWVTdGF0ZShwYXJlbnROYW1lLCBzdGF0ZSkge1xyXG4gICAgaWYgKCFxdWV1ZVtwYXJlbnROYW1lXSkge1xyXG4gICAgICBxdWV1ZVtwYXJlbnROYW1lXSA9IFtdO1xyXG4gICAgfVxyXG4gICAgcXVldWVbcGFyZW50TmFtZV0ucHVzaChzdGF0ZSk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBmbHVzaFF1ZXVlZENoaWxkcmVuKHBhcmVudE5hbWUpIHtcclxuICAgIHZhciBxdWV1ZWQgPSBxdWV1ZVtwYXJlbnROYW1lXSB8fCBbXTtcclxuICAgIHdoaWxlKHF1ZXVlZC5sZW5ndGgpIHtcclxuICAgICAgcmVnaXN0ZXJTdGF0ZShxdWV1ZWQuc2hpZnQoKSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiByZWdpc3RlclN0YXRlKHN0YXRlKSB7XHJcbiAgICAvLyBXcmFwIGEgbmV3IG9iamVjdCBhcm91bmQgdGhlIHN0YXRlIHNvIHdlIGNhbiBzdG9yZSBvdXIgcHJpdmF0ZSBkZXRhaWxzIGVhc2lseS5cclxuICAgIHN0YXRlID0gaW5oZXJpdChzdGF0ZSwge1xyXG4gICAgICBzZWxmOiBzdGF0ZSxcclxuICAgICAgcmVzb2x2ZTogc3RhdGUucmVzb2x2ZSB8fCB7fSxcclxuICAgICAgdG9TdHJpbmc6IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpcy5uYW1lOyB9XHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgbmFtZSA9IHN0YXRlLm5hbWU7XHJcbiAgICBpZiAoIWlzU3RyaW5nKG5hbWUpIHx8IG5hbWUuaW5kZXhPZignQCcpID49IDApIHRocm93IG5ldyBFcnJvcihcIlN0YXRlIG11c3QgaGF2ZSBhIHZhbGlkIG5hbWVcIik7XHJcbiAgICBpZiAoc3RhdGVzLmhhc093blByb3BlcnR5KG5hbWUpKSB0aHJvdyBuZXcgRXJyb3IoXCJTdGF0ZSAnXCIgKyBuYW1lICsgXCInJyBpcyBhbHJlYWR5IGRlZmluZWRcIik7XHJcblxyXG4gICAgLy8gR2V0IHBhcmVudCBuYW1lXHJcbiAgICB2YXIgcGFyZW50TmFtZSA9IChuYW1lLmluZGV4T2YoJy4nKSAhPT0gLTEpID8gbmFtZS5zdWJzdHJpbmcoMCwgbmFtZS5sYXN0SW5kZXhPZignLicpKVxyXG4gICAgICAgIDogKGlzU3RyaW5nKHN0YXRlLnBhcmVudCkpID8gc3RhdGUucGFyZW50XHJcbiAgICAgICAgOiAoaXNPYmplY3Qoc3RhdGUucGFyZW50KSAmJiBpc1N0cmluZyhzdGF0ZS5wYXJlbnQubmFtZSkpID8gc3RhdGUucGFyZW50Lm5hbWVcclxuICAgICAgICA6ICcnO1xyXG5cclxuICAgIC8vIElmIHBhcmVudCBpcyBub3QgcmVnaXN0ZXJlZCB5ZXQsIGFkZCBzdGF0ZSB0byBxdWV1ZSBhbmQgcmVnaXN0ZXIgbGF0ZXJcclxuICAgIGlmIChwYXJlbnROYW1lICYmICFzdGF0ZXNbcGFyZW50TmFtZV0pIHtcclxuICAgICAgcmV0dXJuIHF1ZXVlU3RhdGUocGFyZW50TmFtZSwgc3RhdGUuc2VsZik7XHJcbiAgICB9XHJcblxyXG4gICAgZm9yICh2YXIga2V5IGluIHN0YXRlQnVpbGRlcikge1xyXG4gICAgICBpZiAoaXNGdW5jdGlvbihzdGF0ZUJ1aWxkZXJba2V5XSkpIHN0YXRlW2tleV0gPSBzdGF0ZUJ1aWxkZXJba2V5XShzdGF0ZSwgc3RhdGVCdWlsZGVyLiRkZWxlZ2F0ZXNba2V5XSk7XHJcbiAgICB9XHJcbiAgICBzdGF0ZXNbbmFtZV0gPSBzdGF0ZTtcclxuXHJcbiAgICAvLyBSZWdpc3RlciB0aGUgc3RhdGUgaW4gdGhlIGdsb2JhbCBzdGF0ZSBsaXN0IGFuZCB3aXRoICR1cmxSb3V0ZXIgaWYgbmVjZXNzYXJ5LlxyXG4gICAgaWYgKCFzdGF0ZVthYnN0cmFjdEtleV0gJiYgc3RhdGUudXJsKSB7XHJcbiAgICAgICR1cmxSb3V0ZXJQcm92aWRlci53aGVuKHN0YXRlLnVybCwgWyckbWF0Y2gnLCAnJHN0YXRlUGFyYW1zJywgZnVuY3Rpb24gKCRtYXRjaCwgJHN0YXRlUGFyYW1zKSB7XHJcbiAgICAgICAgaWYgKCRzdGF0ZS4kY3VycmVudC5uYXZpZ2FibGUgIT0gc3RhdGUgfHwgIWVxdWFsRm9yS2V5cygkbWF0Y2gsICRzdGF0ZVBhcmFtcykpIHtcclxuICAgICAgICAgICRzdGF0ZS50cmFuc2l0aW9uVG8oc3RhdGUsICRtYXRjaCwgeyBpbmhlcml0OiB0cnVlLCBsb2NhdGlvbjogZmFsc2UgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gUmVnaXN0ZXIgYW55IHF1ZXVlZCBjaGlsZHJlblxyXG4gICAgZmx1c2hRdWV1ZWRDaGlsZHJlbihuYW1lKTtcclxuXHJcbiAgICByZXR1cm4gc3RhdGU7XHJcbiAgfVxyXG5cclxuICAvLyBDaGVja3MgdGV4dCB0byBzZWUgaWYgaXQgbG9va3MgbGlrZSBhIGdsb2IuXHJcbiAgZnVuY3Rpb24gaXNHbG9iICh0ZXh0KSB7XHJcbiAgICByZXR1cm4gdGV4dC5pbmRleE9mKCcqJykgPiAtMTtcclxuICB9XHJcblxyXG4gIC8vIFJldHVybnMgdHJ1ZSBpZiBnbG9iIG1hdGNoZXMgY3VycmVudCAkc3RhdGUgbmFtZS5cclxuICBmdW5jdGlvbiBkb2VzU3RhdGVNYXRjaEdsb2IgKGdsb2IpIHtcclxuICAgIHZhciBnbG9iU2VnbWVudHMgPSBnbG9iLnNwbGl0KCcuJyksXHJcbiAgICAgICAgc2VnbWVudHMgPSAkc3RhdGUuJGN1cnJlbnQubmFtZS5zcGxpdCgnLicpO1xyXG5cclxuICAgIC8vbWF0Y2ggc2luZ2xlIHN0YXJzXHJcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IGdsb2JTZWdtZW50cy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcclxuICAgICAgaWYgKGdsb2JTZWdtZW50c1tpXSA9PT0gJyonKSB7XHJcbiAgICAgICAgc2VnbWVudHNbaV0gPSAnKic7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvL21hdGNoIGdyZWVkeSBzdGFydHNcclxuICAgIGlmIChnbG9iU2VnbWVudHNbMF0gPT09ICcqKicpIHtcclxuICAgICAgIHNlZ21lbnRzID0gc2VnbWVudHMuc2xpY2UoaW5kZXhPZihzZWdtZW50cywgZ2xvYlNlZ21lbnRzWzFdKSk7XHJcbiAgICAgICBzZWdtZW50cy51bnNoaWZ0KCcqKicpO1xyXG4gICAgfVxyXG4gICAgLy9tYXRjaCBncmVlZHkgZW5kc1xyXG4gICAgaWYgKGdsb2JTZWdtZW50c1tnbG9iU2VnbWVudHMubGVuZ3RoIC0gMV0gPT09ICcqKicpIHtcclxuICAgICAgIHNlZ21lbnRzLnNwbGljZShpbmRleE9mKHNlZ21lbnRzLCBnbG9iU2VnbWVudHNbZ2xvYlNlZ21lbnRzLmxlbmd0aCAtIDJdKSArIDEsIE51bWJlci5NQVhfVkFMVUUpO1xyXG4gICAgICAgc2VnbWVudHMucHVzaCgnKionKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoZ2xvYlNlZ21lbnRzLmxlbmd0aCAhPSBzZWdtZW50cy5sZW5ndGgpIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBzZWdtZW50cy5qb2luKCcnKSA9PT0gZ2xvYlNlZ21lbnRzLmpvaW4oJycpO1xyXG4gIH1cclxuXHJcblxyXG4gIC8vIEltcGxpY2l0IHJvb3Qgc3RhdGUgdGhhdCBpcyBhbHdheXMgYWN0aXZlXHJcbiAgcm9vdCA9IHJlZ2lzdGVyU3RhdGUoe1xyXG4gICAgbmFtZTogJycsXHJcbiAgICB1cmw6ICdeJyxcclxuICAgIHZpZXdzOiBudWxsLFxyXG4gICAgJ2Fic3RyYWN0JzogdHJ1ZVxyXG4gIH0pO1xyXG4gIHJvb3QubmF2aWdhYmxlID0gbnVsbDtcclxuXHJcblxyXG4gIC8qKlxyXG4gICAqIEBuZ2RvYyBmdW5jdGlvblxyXG4gICAqIEBuYW1lIHVpLnJvdXRlci5zdGF0ZS4kc3RhdGVQcm92aWRlciNkZWNvcmF0b3JcclxuICAgKiBAbWV0aG9kT2YgdWkucm91dGVyLnN0YXRlLiRzdGF0ZVByb3ZpZGVyXHJcbiAgICpcclxuICAgKiBAZGVzY3JpcHRpb25cclxuICAgKiBBbGxvd3MgeW91IHRvIGV4dGVuZCAoY2FyZWZ1bGx5KSBvciBvdmVycmlkZSAoYXQgeW91ciBvd24gcGVyaWwpIHRoZSBcclxuICAgKiBgc3RhdGVCdWlsZGVyYCBvYmplY3QgdXNlZCBpbnRlcm5hbGx5IGJ5IGAkc3RhdGVQcm92aWRlcmAuIFRoaXMgY2FuIGJlIHVzZWQgXHJcbiAgICogdG8gYWRkIGN1c3RvbSBmdW5jdGlvbmFsaXR5IHRvIHVpLXJvdXRlciwgZm9yIGV4YW1wbGUgaW5mZXJyaW5nIHRlbXBsYXRlVXJsIFxyXG4gICAqIGJhc2VkIG9uIHRoZSBzdGF0ZSBuYW1lLlxyXG4gICAqXHJcbiAgICogV2hlbiBwYXNzaW5nIG9ubHkgYSBuYW1lLCBpdCByZXR1cm5zIHRoZSBjdXJyZW50IChvcmlnaW5hbCBvciBkZWNvcmF0ZWQpIGJ1aWxkZXJcclxuICAgKiBmdW5jdGlvbiB0aGF0IG1hdGNoZXMgYG5hbWVgLlxyXG4gICAqXHJcbiAgICogVGhlIGJ1aWxkZXIgZnVuY3Rpb25zIHRoYXQgY2FuIGJlIGRlY29yYXRlZCBhcmUgbGlzdGVkIGJlbG93LiBUaG91Z2ggbm90IGFsbFxyXG4gICAqIG5lY2Vzc2FyaWx5IGhhdmUgYSBnb29kIHVzZSBjYXNlIGZvciBkZWNvcmF0aW9uLCB0aGF0IGlzIHVwIHRvIHlvdSB0byBkZWNpZGUuXHJcbiAgICpcclxuICAgKiBJbiBhZGRpdGlvbiwgdXNlcnMgY2FuIGF0dGFjaCBjdXN0b20gZGVjb3JhdG9ycywgd2hpY2ggd2lsbCBnZW5lcmF0ZSBuZXcgXHJcbiAgICogcHJvcGVydGllcyB3aXRoaW4gdGhlIHN0YXRlJ3MgaW50ZXJuYWwgZGVmaW5pdGlvbi4gVGhlcmUgaXMgY3VycmVudGx5IG5vIGNsZWFyIFxyXG4gICAqIHVzZS1jYXNlIGZvciB0aGlzIGJleW9uZCBhY2Nlc3NpbmcgaW50ZXJuYWwgc3RhdGVzIChpLmUuICRzdGF0ZS4kY3VycmVudCksIFxyXG4gICAqIGhvd2V2ZXIsIGV4cGVjdCB0aGlzIHRvIGJlY29tZSBpbmNyZWFzaW5nbHkgcmVsZXZhbnQgYXMgd2UgaW50cm9kdWNlIGFkZGl0aW9uYWwgXHJcbiAgICogbWV0YS1wcm9ncmFtbWluZyBmZWF0dXJlcy5cclxuICAgKlxyXG4gICAqICoqV2FybmluZyoqOiBEZWNvcmF0b3JzIHNob3VsZCBub3QgYmUgaW50ZXJkZXBlbmRlbnQgYmVjYXVzZSB0aGUgb3JkZXIgb2YgXHJcbiAgICogZXhlY3V0aW9uIG9mIHRoZSBidWlsZGVyIGZ1bmN0aW9ucyBpbiBub24tZGV0ZXJtaW5pc3RpYy4gQnVpbGRlciBmdW5jdGlvbnMgXHJcbiAgICogc2hvdWxkIG9ubHkgYmUgZGVwZW5kZW50IG9uIHRoZSBzdGF0ZSBkZWZpbml0aW9uIG9iamVjdCBhbmQgc3VwZXIgZnVuY3Rpb24uXHJcbiAgICpcclxuICAgKlxyXG4gICAqIEV4aXN0aW5nIGJ1aWxkZXIgZnVuY3Rpb25zIGFuZCBjdXJyZW50IHJldHVybiB2YWx1ZXM6XHJcbiAgICpcclxuICAgKiAtICoqcGFyZW50KiogYHtvYmplY3R9YCAtIHJldHVybnMgdGhlIHBhcmVudCBzdGF0ZSBvYmplY3QuXHJcbiAgICogLSAqKmRhdGEqKiBge29iamVjdH1gIC0gcmV0dXJucyBzdGF0ZSBkYXRhLCBpbmNsdWRpbmcgYW55IGluaGVyaXRlZCBkYXRhIHRoYXQgaXMgbm90XHJcbiAgICogICBvdmVycmlkZGVuIGJ5IG93biB2YWx1ZXMgKGlmIGFueSkuXHJcbiAgICogLSAqKnVybCoqIGB7b2JqZWN0fWAgLSByZXR1cm5zIGEge0BsaW5rIHVpLnJvdXRlci51dGlsLnR5cGU6VXJsTWF0Y2hlciBVcmxNYXRjaGVyfVxyXG4gICAqICAgb3IgYG51bGxgLlxyXG4gICAqIC0gKipuYXZpZ2FibGUqKiBge29iamVjdH1gIC0gcmV0dXJucyBjbG9zZXN0IGFuY2VzdG9yIHN0YXRlIHRoYXQgaGFzIGEgVVJMIChha2EgaXMgXHJcbiAgICogICBuYXZpZ2FibGUpLlxyXG4gICAqIC0gKipwYXJhbXMqKiBge29iamVjdH1gIC0gcmV0dXJucyBhbiBhcnJheSBvZiBzdGF0ZSBwYXJhbXMgdGhhdCBhcmUgZW5zdXJlZCB0byBcclxuICAgKiAgIGJlIGEgc3VwZXItc2V0IG9mIHBhcmVudCdzIHBhcmFtcy5cclxuICAgKiAtICoqdmlld3MqKiBge29iamVjdH1gIC0gcmV0dXJucyBhIHZpZXdzIG9iamVjdCB3aGVyZSBlYWNoIGtleSBpcyBhbiBhYnNvbHV0ZSB2aWV3IFxyXG4gICAqICAgbmFtZSAoaS5lLiBcInZpZXdOYW1lQHN0YXRlTmFtZVwiKSBhbmQgZWFjaCB2YWx1ZSBpcyB0aGUgY29uZmlnIG9iamVjdCBcclxuICAgKiAgICh0ZW1wbGF0ZSwgY29udHJvbGxlcikgZm9yIHRoZSB2aWV3LiBFdmVuIHdoZW4geW91IGRvbid0IHVzZSB0aGUgdmlld3Mgb2JqZWN0IFxyXG4gICAqICAgZXhwbGljaXRseSBvbiBhIHN0YXRlIGNvbmZpZywgb25lIGlzIHN0aWxsIGNyZWF0ZWQgZm9yIHlvdSBpbnRlcm5hbGx5LlxyXG4gICAqICAgU28gYnkgZGVjb3JhdGluZyB0aGlzIGJ1aWxkZXIgZnVuY3Rpb24geW91IGhhdmUgYWNjZXNzIHRvIGRlY29yYXRpbmcgdGVtcGxhdGUgXHJcbiAgICogICBhbmQgY29udHJvbGxlciBwcm9wZXJ0aWVzLlxyXG4gICAqIC0gKipvd25QYXJhbXMqKiBge29iamVjdH1gIC0gcmV0dXJucyBhbiBhcnJheSBvZiBwYXJhbXMgdGhhdCBiZWxvbmcgdG8gdGhlIHN0YXRlLCBcclxuICAgKiAgIG5vdCBpbmNsdWRpbmcgYW55IHBhcmFtcyBkZWZpbmVkIGJ5IGFuY2VzdG9yIHN0YXRlcy5cclxuICAgKiAtICoqcGF0aCoqIGB7c3RyaW5nfWAgLSByZXR1cm5zIHRoZSBmdWxsIHBhdGggZnJvbSB0aGUgcm9vdCBkb3duIHRvIHRoaXMgc3RhdGUuIFxyXG4gICAqICAgTmVlZGVkIGZvciBzdGF0ZSBhY3RpdmF0aW9uLlxyXG4gICAqIC0gKippbmNsdWRlcyoqIGB7b2JqZWN0fWAgLSByZXR1cm5zIGFuIG9iamVjdCB0aGF0IGluY2x1ZGVzIGV2ZXJ5IHN0YXRlIHRoYXQgXHJcbiAgICogICB3b3VsZCBwYXNzIGEgYCRzdGF0ZS5pbmNsdWRlcygpYCB0ZXN0LlxyXG4gICAqXHJcbiAgICogQGV4YW1wbGVcclxuICAgKiA8cHJlPlxyXG4gICAqIC8vIE92ZXJyaWRlIHRoZSBpbnRlcm5hbCAndmlld3MnIGJ1aWxkZXIgd2l0aCBhIGZ1bmN0aW9uIHRoYXQgdGFrZXMgdGhlIHN0YXRlXHJcbiAgICogLy8gZGVmaW5pdGlvbiwgYW5kIGEgcmVmZXJlbmNlIHRvIHRoZSBpbnRlcm5hbCBmdW5jdGlvbiBiZWluZyBvdmVycmlkZGVuOlxyXG4gICAqICRzdGF0ZVByb3ZpZGVyLmRlY29yYXRvcigndmlld3MnLCBmdW5jdGlvbiAoc3RhdGUsIHBhcmVudCkge1xyXG4gICAqICAgdmFyIHJlc3VsdCA9IHt9LFxyXG4gICAqICAgICAgIHZpZXdzID0gcGFyZW50KHN0YXRlKTtcclxuICAgKlxyXG4gICAqICAgYW5ndWxhci5mb3JFYWNoKHZpZXdzLCBmdW5jdGlvbiAoY29uZmlnLCBuYW1lKSB7XHJcbiAgICogICAgIHZhciBhdXRvTmFtZSA9IChzdGF0ZS5uYW1lICsgJy4nICsgbmFtZSkucmVwbGFjZSgnLicsICcvJyk7XHJcbiAgICogICAgIGNvbmZpZy50ZW1wbGF0ZVVybCA9IGNvbmZpZy50ZW1wbGF0ZVVybCB8fCAnL3BhcnRpYWxzLycgKyBhdXRvTmFtZSArICcuaHRtbCc7XHJcbiAgICogICAgIHJlc3VsdFtuYW1lXSA9IGNvbmZpZztcclxuICAgKiAgIH0pO1xyXG4gICAqICAgcmV0dXJuIHJlc3VsdDtcclxuICAgKiB9KTtcclxuICAgKlxyXG4gICAqICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdob21lJywge1xyXG4gICAqICAgdmlld3M6IHtcclxuICAgKiAgICAgJ2NvbnRhY3QubGlzdCc6IHsgY29udHJvbGxlcjogJ0xpc3RDb250cm9sbGVyJyB9LFxyXG4gICAqICAgICAnY29udGFjdC5pdGVtJzogeyBjb250cm9sbGVyOiAnSXRlbUNvbnRyb2xsZXInIH1cclxuICAgKiAgIH1cclxuICAgKiB9KTtcclxuICAgKlxyXG4gICAqIC8vIC4uLlxyXG4gICAqXHJcbiAgICogJHN0YXRlLmdvKCdob21lJyk7XHJcbiAgICogLy8gQXV0by1wb3B1bGF0ZXMgbGlzdCBhbmQgaXRlbSB2aWV3cyB3aXRoIC9wYXJ0aWFscy9ob21lL2NvbnRhY3QvbGlzdC5odG1sLFxyXG4gICAqIC8vIGFuZCAvcGFydGlhbHMvaG9tZS9jb250YWN0L2l0ZW0uaHRtbCwgcmVzcGVjdGl2ZWx5LlxyXG4gICAqIDwvcHJlPlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgVGhlIG5hbWUgb2YgdGhlIGJ1aWxkZXIgZnVuY3Rpb24gdG8gZGVjb3JhdGUuIFxyXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBmdW5jIEEgZnVuY3Rpb24gdGhhdCBpcyByZXNwb25zaWJsZSBmb3IgZGVjb3JhdGluZyB0aGUgb3JpZ2luYWwgXHJcbiAgICogYnVpbGRlciBmdW5jdGlvbi4gVGhlIGZ1bmN0aW9uIHJlY2VpdmVzIHR3byBwYXJhbWV0ZXJzOlxyXG4gICAqXHJcbiAgICogICAtIGB7b2JqZWN0fWAgLSBzdGF0ZSAtIFRoZSBzdGF0ZSBjb25maWcgb2JqZWN0LlxyXG4gICAqICAgLSBge29iamVjdH1gIC0gc3VwZXIgLSBUaGUgb3JpZ2luYWwgYnVpbGRlciBmdW5jdGlvbi5cclxuICAgKlxyXG4gICAqIEByZXR1cm4ge29iamVjdH0gJHN0YXRlUHJvdmlkZXIgLSAkc3RhdGVQcm92aWRlciBpbnN0YW5jZVxyXG4gICAqL1xyXG4gIHRoaXMuZGVjb3JhdG9yID0gZGVjb3JhdG9yO1xyXG4gIGZ1bmN0aW9uIGRlY29yYXRvcihuYW1lLCBmdW5jKSB7XHJcbiAgICAvKmpzaGludCB2YWxpZHRoaXM6IHRydWUgKi9cclxuICAgIGlmIChpc1N0cmluZyhuYW1lKSAmJiAhaXNEZWZpbmVkKGZ1bmMpKSB7XHJcbiAgICAgIHJldHVybiBzdGF0ZUJ1aWxkZXJbbmFtZV07XHJcbiAgICB9XHJcbiAgICBpZiAoIWlzRnVuY3Rpb24oZnVuYykgfHwgIWlzU3RyaW5nKG5hbWUpKSB7XHJcbiAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG4gICAgaWYgKHN0YXRlQnVpbGRlcltuYW1lXSAmJiAhc3RhdGVCdWlsZGVyLiRkZWxlZ2F0ZXNbbmFtZV0pIHtcclxuICAgICAgc3RhdGVCdWlsZGVyLiRkZWxlZ2F0ZXNbbmFtZV0gPSBzdGF0ZUJ1aWxkZXJbbmFtZV07XHJcbiAgICB9XHJcbiAgICBzdGF0ZUJ1aWxkZXJbbmFtZV0gPSBmdW5jO1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAbmdkb2MgZnVuY3Rpb25cclxuICAgKiBAbmFtZSB1aS5yb3V0ZXIuc3RhdGUuJHN0YXRlUHJvdmlkZXIjc3RhdGVcclxuICAgKiBAbWV0aG9kT2YgdWkucm91dGVyLnN0YXRlLiRzdGF0ZVByb3ZpZGVyXHJcbiAgICpcclxuICAgKiBAZGVzY3JpcHRpb25cclxuICAgKiBSZWdpc3RlcnMgYSBzdGF0ZSBjb25maWd1cmF0aW9uIHVuZGVyIGEgZ2l2ZW4gc3RhdGUgbmFtZS4gVGhlIHN0YXRlQ29uZmlnIG9iamVjdFxyXG4gICAqIGhhcyB0aGUgZm9sbG93aW5nIGFjY2VwdGFibGUgcHJvcGVydGllcy5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIEEgdW5pcXVlIHN0YXRlIG5hbWUsIGUuZy4gXCJob21lXCIsIFwiYWJvdXRcIiwgXCJjb250YWN0c1wiLlxyXG4gICAqIFRvIGNyZWF0ZSBhIHBhcmVudC9jaGlsZCBzdGF0ZSB1c2UgYSBkb3QsIGUuZy4gXCJhYm91dC5zYWxlc1wiLCBcImhvbWUubmV3ZXN0XCIuXHJcbiAgICogQHBhcmFtIHtvYmplY3R9IHN0YXRlQ29uZmlnIFN0YXRlIGNvbmZpZ3VyYXRpb24gb2JqZWN0LlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfGZ1bmN0aW9uPX0gc3RhdGVDb25maWcudGVtcGxhdGVcclxuICAgKiA8YSBpZD0ndGVtcGxhdGUnPjwvYT5cclxuICAgKiAgIGh0bWwgdGVtcGxhdGUgYXMgYSBzdHJpbmcgb3IgYSBmdW5jdGlvbiB0aGF0IHJldHVybnNcclxuICAgKiAgIGFuIGh0bWwgdGVtcGxhdGUgYXMgYSBzdHJpbmcgd2hpY2ggc2hvdWxkIGJlIHVzZWQgYnkgdGhlIHVpVmlldyBkaXJlY3RpdmVzLiBUaGlzIHByb3BlcnR5IFxyXG4gICAqICAgdGFrZXMgcHJlY2VkZW5jZSBvdmVyIHRlbXBsYXRlVXJsLlxyXG4gICAqICAgXHJcbiAgICogICBJZiBgdGVtcGxhdGVgIGlzIGEgZnVuY3Rpb24sIGl0IHdpbGwgYmUgY2FsbGVkIHdpdGggdGhlIGZvbGxvd2luZyBwYXJhbWV0ZXJzOlxyXG4gICAqXHJcbiAgICogICAtIHthcnJheS4mbHQ7b2JqZWN0Jmd0O30gLSBzdGF0ZSBwYXJhbWV0ZXJzIGV4dHJhY3RlZCBmcm9tIHRoZSBjdXJyZW50ICRsb2NhdGlvbi5wYXRoKCkgYnlcclxuICAgKiAgICAgYXBwbHlpbmcgdGhlIGN1cnJlbnQgc3RhdGVcclxuICAgKlxyXG4gICAqIDxwcmU+dGVtcGxhdGU6XHJcbiAgICogICBcIjxoMT5pbmxpbmUgdGVtcGxhdGUgZGVmaW5pdGlvbjwvaDE+XCIgK1xyXG4gICAqICAgXCI8ZGl2IHVpLXZpZXc+PC9kaXY+XCI8L3ByZT5cclxuICAgKiA8cHJlPnRlbXBsYXRlOiBmdW5jdGlvbihwYXJhbXMpIHtcclxuICAgKiAgICAgICByZXR1cm4gXCI8aDE+Z2VuZXJhdGVkIHRlbXBsYXRlPC9oMT5cIjsgfTwvcHJlPlxyXG4gICAqIDwvZGl2PlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtzdHJpbmd8ZnVuY3Rpb249fSBzdGF0ZUNvbmZpZy50ZW1wbGF0ZVVybFxyXG4gICAqIDxhIGlkPSd0ZW1wbGF0ZVVybCc+PC9hPlxyXG4gICAqXHJcbiAgICogICBwYXRoIG9yIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhIHBhdGggdG8gYW4gaHRtbFxyXG4gICAqICAgdGVtcGxhdGUgdGhhdCBzaG91bGQgYmUgdXNlZCBieSB1aVZpZXcuXHJcbiAgICogICBcclxuICAgKiAgIElmIGB0ZW1wbGF0ZVVybGAgaXMgYSBmdW5jdGlvbiwgaXQgd2lsbCBiZSBjYWxsZWQgd2l0aCB0aGUgZm9sbG93aW5nIHBhcmFtZXRlcnM6XHJcbiAgICpcclxuICAgKiAgIC0ge2FycmF5LiZsdDtvYmplY3QmZ3Q7fSAtIHN0YXRlIHBhcmFtZXRlcnMgZXh0cmFjdGVkIGZyb20gdGhlIGN1cnJlbnQgJGxvY2F0aW9uLnBhdGgoKSBieSBcclxuICAgKiAgICAgYXBwbHlpbmcgdGhlIGN1cnJlbnQgc3RhdGVcclxuICAgKlxyXG4gICAqIDxwcmU+dGVtcGxhdGVVcmw6IFwiaG9tZS5odG1sXCI8L3ByZT5cclxuICAgKiA8cHJlPnRlbXBsYXRlVXJsOiBmdW5jdGlvbihwYXJhbXMpIHtcclxuICAgKiAgICAgcmV0dXJuIG15VGVtcGxhdGVzW3BhcmFtcy5wYWdlSWRdOyB9PC9wcmU+XHJcbiAgICpcclxuICAgKiBAcGFyYW0ge2Z1bmN0aW9uPX0gc3RhdGVDb25maWcudGVtcGxhdGVQcm92aWRlclxyXG4gICAqIDxhIGlkPSd0ZW1wbGF0ZVByb3ZpZGVyJz48L2E+XHJcbiAgICogICAgUHJvdmlkZXIgZnVuY3Rpb24gdGhhdCByZXR1cm5zIEhUTUwgY29udGVudCBzdHJpbmcuXHJcbiAgICogPHByZT4gdGVtcGxhdGVQcm92aWRlcjpcclxuICAgKiAgICAgICBmdW5jdGlvbihNeVRlbXBsYXRlU2VydmljZSwgcGFyYW1zKSB7XHJcbiAgICogICAgICAgICByZXR1cm4gTXlUZW1wbGF0ZVNlcnZpY2UuZ2V0VGVtcGxhdGUocGFyYW1zLnBhZ2VJZCk7XHJcbiAgICogICAgICAgfTwvcHJlPlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtzdHJpbmd8ZnVuY3Rpb249fSBzdGF0ZUNvbmZpZy5jb250cm9sbGVyXHJcbiAgICogPGEgaWQ9J2NvbnRyb2xsZXInPjwvYT5cclxuICAgKlxyXG4gICAqICBDb250cm9sbGVyIGZuIHRoYXQgc2hvdWxkIGJlIGFzc29jaWF0ZWQgd2l0aCBuZXdseVxyXG4gICAqICAgcmVsYXRlZCBzY29wZSBvciB0aGUgbmFtZSBvZiBhIHJlZ2lzdGVyZWQgY29udHJvbGxlciBpZiBwYXNzZWQgYXMgYSBzdHJpbmcuXHJcbiAgICogICBPcHRpb25hbGx5LCB0aGUgQ29udHJvbGxlckFzIG1heSBiZSBkZWNsYXJlZCBoZXJlLlxyXG4gICAqIDxwcmU+Y29udHJvbGxlcjogXCJNeVJlZ2lzdGVyZWRDb250cm9sbGVyXCI8L3ByZT5cclxuICAgKiA8cHJlPmNvbnRyb2xsZXI6XHJcbiAgICogICAgIFwiTXlSZWdpc3RlcmVkQ29udHJvbGxlciBhcyBmb29DdHJsXCJ9PC9wcmU+XHJcbiAgICogPHByZT5jb250cm9sbGVyOiBmdW5jdGlvbigkc2NvcGUsIE15U2VydmljZSkge1xyXG4gICAqICAgICAkc2NvcGUuZGF0YSA9IE15U2VydmljZS5nZXREYXRhKCk7IH08L3ByZT5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb249fSBzdGF0ZUNvbmZpZy5jb250cm9sbGVyUHJvdmlkZXJcclxuICAgKiA8YSBpZD0nY29udHJvbGxlclByb3ZpZGVyJz48L2E+XHJcbiAgICpcclxuICAgKiBJbmplY3RhYmxlIHByb3ZpZGVyIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0aGUgYWN0dWFsIGNvbnRyb2xsZXIgb3Igc3RyaW5nLlxyXG4gICAqIDxwcmU+Y29udHJvbGxlclByb3ZpZGVyOlxyXG4gICAqICAgZnVuY3Rpb24oTXlSZXNvbHZlRGF0YSkge1xyXG4gICAqICAgICBpZiAoTXlSZXNvbHZlRGF0YS5mb28pXHJcbiAgICogICAgICAgcmV0dXJuIFwiRm9vQ3RybFwiXHJcbiAgICogICAgIGVsc2UgaWYgKE15UmVzb2x2ZURhdGEuYmFyKVxyXG4gICAqICAgICAgIHJldHVybiBcIkJhckN0cmxcIjtcclxuICAgKiAgICAgZWxzZSByZXR1cm4gZnVuY3Rpb24oJHNjb3BlKSB7XHJcbiAgICogICAgICAgJHNjb3BlLmJheiA9IFwiUXV4XCI7XHJcbiAgICogICAgIH1cclxuICAgKiAgIH08L3ByZT5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nPX0gc3RhdGVDb25maWcuY29udHJvbGxlckFzXHJcbiAgICogPGEgaWQ9J2NvbnRyb2xsZXJBcyc+PC9hPlxyXG4gICAqIFxyXG4gICAqIEEgY29udHJvbGxlciBhbGlhcyBuYW1lLiBJZiBwcmVzZW50IHRoZSBjb250cm9sbGVyIHdpbGwgYmVcclxuICAgKiAgIHB1Ymxpc2hlZCB0byBzY29wZSB1bmRlciB0aGUgY29udHJvbGxlckFzIG5hbWUuXHJcbiAgICogPHByZT5jb250cm9sbGVyQXM6IFwibXlDdHJsXCI8L3ByZT5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfG9iamVjdD19IHN0YXRlQ29uZmlnLnBhcmVudFxyXG4gICAqIDxhIGlkPSdwYXJlbnQnPjwvYT5cclxuICAgKiBPcHRpb25hbGx5IHNwZWNpZmllcyB0aGUgcGFyZW50IHN0YXRlIG9mIHRoaXMgc3RhdGUuXHJcbiAgICpcclxuICAgKiA8cHJlPnBhcmVudDogJ3BhcmVudFN0YXRlJzwvcHJlPlxyXG4gICAqIDxwcmU+cGFyZW50OiBwYXJlbnRTdGF0ZSAvLyBKUyB2YXJpYWJsZTwvcHJlPlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtvYmplY3Q9fSBzdGF0ZUNvbmZpZy5yZXNvbHZlXHJcbiAgICogPGEgaWQ9J3Jlc29sdmUnPjwvYT5cclxuICAgKlxyXG4gICAqIEFuIG9wdGlvbmFsIG1hcCZsdDtzdHJpbmcsIGZ1bmN0aW9uJmd0OyBvZiBkZXBlbmRlbmNpZXMgd2hpY2hcclxuICAgKiAgIHNob3VsZCBiZSBpbmplY3RlZCBpbnRvIHRoZSBjb250cm9sbGVyLiBJZiBhbnkgb2YgdGhlc2UgZGVwZW5kZW5jaWVzIGFyZSBwcm9taXNlcywgXHJcbiAgICogICB0aGUgcm91dGVyIHdpbGwgd2FpdCBmb3IgdGhlbSBhbGwgdG8gYmUgcmVzb2x2ZWQgYmVmb3JlIHRoZSBjb250cm9sbGVyIGlzIGluc3RhbnRpYXRlZC5cclxuICAgKiAgIElmIGFsbCB0aGUgcHJvbWlzZXMgYXJlIHJlc29sdmVkIHN1Y2Nlc3NmdWxseSwgdGhlICRzdGF0ZUNoYW5nZVN1Y2Nlc3MgZXZlbnQgaXMgZmlyZWRcclxuICAgKiAgIGFuZCB0aGUgdmFsdWVzIG9mIHRoZSByZXNvbHZlZCBwcm9taXNlcyBhcmUgaW5qZWN0ZWQgaW50byBhbnkgY29udHJvbGxlcnMgdGhhdCByZWZlcmVuY2UgdGhlbS5cclxuICAgKiAgIElmIGFueSAgb2YgdGhlIHByb21pc2VzIGFyZSByZWplY3RlZCB0aGUgJHN0YXRlQ2hhbmdlRXJyb3IgZXZlbnQgaXMgZmlyZWQuXHJcbiAgICpcclxuICAgKiAgIFRoZSBtYXAgb2JqZWN0IGlzOlxyXG4gICAqICAgXHJcbiAgICogICAtIGtleSAtIHtzdHJpbmd9OiBuYW1lIG9mIGRlcGVuZGVuY3kgdG8gYmUgaW5qZWN0ZWQgaW50byBjb250cm9sbGVyXHJcbiAgICogICAtIGZhY3RvcnkgLSB7c3RyaW5nfGZ1bmN0aW9ufTogSWYgc3RyaW5nIHRoZW4gaXQgaXMgYWxpYXMgZm9yIHNlcnZpY2UuIE90aGVyd2lzZSBpZiBmdW5jdGlvbiwgXHJcbiAgICogICAgIGl0IGlzIGluamVjdGVkIGFuZCByZXR1cm4gdmFsdWUgaXQgdHJlYXRlZCBhcyBkZXBlbmRlbmN5LiBJZiByZXN1bHQgaXMgYSBwcm9taXNlLCBpdCBpcyBcclxuICAgKiAgICAgcmVzb2x2ZWQgYmVmb3JlIGl0cyB2YWx1ZSBpcyBpbmplY3RlZCBpbnRvIGNvbnRyb2xsZXIuXHJcbiAgICpcclxuICAgKiA8cHJlPnJlc29sdmU6IHtcclxuICAgKiAgICAgbXlSZXNvbHZlMTpcclxuICAgKiAgICAgICBmdW5jdGlvbigkaHR0cCwgJHN0YXRlUGFyYW1zKSB7XHJcbiAgICogICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KFwiL2FwaS9mb29zL1wiK3N0YXRlUGFyYW1zLmZvb0lEKTtcclxuICAgKiAgICAgICB9XHJcbiAgICogICAgIH08L3ByZT5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nPX0gc3RhdGVDb25maWcudXJsXHJcbiAgICogPGEgaWQ9J3VybCc+PC9hPlxyXG4gICAqXHJcbiAgICogICBBIHVybCBmcmFnbWVudCB3aXRoIG9wdGlvbmFsIHBhcmFtZXRlcnMuIFdoZW4gYSBzdGF0ZSBpcyBuYXZpZ2F0ZWQgb3JcclxuICAgKiAgIHRyYW5zaXRpb25lZCB0bywgdGhlIGAkc3RhdGVQYXJhbXNgIHNlcnZpY2Ugd2lsbCBiZSBwb3B1bGF0ZWQgd2l0aCBhbnkgXHJcbiAgICogICBwYXJhbWV0ZXJzIHRoYXQgd2VyZSBwYXNzZWQuXHJcbiAgICpcclxuICAgKiAgIChTZWUge0BsaW5rIHVpLnJvdXRlci51dGlsLnR5cGU6VXJsTWF0Y2hlciBVcmxNYXRjaGVyfSBgVXJsTWF0Y2hlcmB9IGZvclxyXG4gICAqICAgbW9yZSBkZXRhaWxzIG9uIGFjY2VwdGFibGUgcGF0dGVybnMgKVxyXG4gICAqXHJcbiAgICogZXhhbXBsZXM6XHJcbiAgICogPHByZT51cmw6IFwiL2hvbWVcIlxyXG4gICAqIHVybDogXCIvdXNlcnMvOnVzZXJpZFwiXHJcbiAgICogdXJsOiBcIi9ib29rcy97Ym9va2lkOlthLXpBLVpfLV19XCJcclxuICAgKiB1cmw6IFwiL2Jvb2tzL3tjYXRlZ29yeWlkOmludH1cIlxyXG4gICAqIHVybDogXCIvYm9va3Mve3B1Ymxpc2hlcm5hbWU6c3RyaW5nfS97Y2F0ZWdvcnlpZDppbnR9XCJcclxuICAgKiB1cmw6IFwiL21lc3NhZ2VzP2JlZm9yZSZhZnRlclwiXHJcbiAgICogdXJsOiBcIi9tZXNzYWdlcz97YmVmb3JlOmRhdGV9JnthZnRlcjpkYXRlfVwiXHJcbiAgICogdXJsOiBcIi9tZXNzYWdlcy86bWFpbGJveGlkP3tiZWZvcmU6ZGF0ZX0me2FmdGVyOmRhdGV9XCJcclxuICAgKiA8L3ByZT5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7b2JqZWN0PX0gc3RhdGVDb25maWcudmlld3NcclxuICAgKiA8YSBpZD0ndmlld3MnPjwvYT5cclxuICAgKiBhbiBvcHRpb25hbCBtYXAmbHQ7c3RyaW5nLCBvYmplY3QmZ3Q7IHdoaWNoIGRlZmluZWQgbXVsdGlwbGUgdmlld3MsIG9yIHRhcmdldHMgdmlld3NcclxuICAgKiBtYW51YWxseS9leHBsaWNpdGx5LlxyXG4gICAqXHJcbiAgICogRXhhbXBsZXM6XHJcbiAgICpcclxuICAgKiBUYXJnZXRzIHRocmVlIG5hbWVkIGB1aS12aWV3YHMgaW4gdGhlIHBhcmVudCBzdGF0ZSdzIHRlbXBsYXRlXHJcbiAgICogPHByZT52aWV3czoge1xyXG4gICAqICAgICBoZWFkZXI6IHtcclxuICAgKiAgICAgICBjb250cm9sbGVyOiBcImhlYWRlckN0cmxcIixcclxuICAgKiAgICAgICB0ZW1wbGF0ZVVybDogXCJoZWFkZXIuaHRtbFwiXHJcbiAgICogICAgIH0sIGJvZHk6IHtcclxuICAgKiAgICAgICBjb250cm9sbGVyOiBcImJvZHlDdHJsXCIsXHJcbiAgICogICAgICAgdGVtcGxhdGVVcmw6IFwiYm9keS5odG1sXCJcclxuICAgKiAgICAgfSwgZm9vdGVyOiB7XHJcbiAgICogICAgICAgY29udHJvbGxlcjogXCJmb290Q3RybFwiLFxyXG4gICAqICAgICAgIHRlbXBsYXRlVXJsOiBcImZvb3Rlci5odG1sXCJcclxuICAgKiAgICAgfVxyXG4gICAqICAgfTwvcHJlPlxyXG4gICAqXHJcbiAgICogVGFyZ2V0cyBuYW1lZCBgdWktdmlldz1cImhlYWRlclwiYCBmcm9tIGdyYW5kcGFyZW50IHN0YXRlICd0b3AnJ3MgdGVtcGxhdGUsIGFuZCBuYW1lZCBgdWktdmlldz1cImJvZHlcIiBmcm9tIHBhcmVudCBzdGF0ZSdzIHRlbXBsYXRlLlxyXG4gICAqIDxwcmU+dmlld3M6IHtcclxuICAgKiAgICAgJ2hlYWRlckB0b3AnOiB7XHJcbiAgICogICAgICAgY29udHJvbGxlcjogXCJtc2dIZWFkZXJDdHJsXCIsXHJcbiAgICogICAgICAgdGVtcGxhdGVVcmw6IFwibXNnSGVhZGVyLmh0bWxcIlxyXG4gICAqICAgICB9LCAnYm9keSc6IHtcclxuICAgKiAgICAgICBjb250cm9sbGVyOiBcIm1lc3NhZ2VzQ3RybFwiLFxyXG4gICAqICAgICAgIHRlbXBsYXRlVXJsOiBcIm1lc3NhZ2VzLmh0bWxcIlxyXG4gICAqICAgICB9XHJcbiAgICogICB9PC9wcmU+XHJcbiAgICpcclxuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSBbc3RhdGVDb25maWcuYWJzdHJhY3Q9ZmFsc2VdXHJcbiAgICogPGEgaWQ9J2Fic3RyYWN0Jz48L2E+XHJcbiAgICogQW4gYWJzdHJhY3Qgc3RhdGUgd2lsbCBuZXZlciBiZSBkaXJlY3RseSBhY3RpdmF0ZWQsXHJcbiAgICogICBidXQgY2FuIHByb3ZpZGUgaW5oZXJpdGVkIHByb3BlcnRpZXMgdG8gaXRzIGNvbW1vbiBjaGlsZHJlbiBzdGF0ZXMuXHJcbiAgICogPHByZT5hYnN0cmFjdDogdHJ1ZTwvcHJlPlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtmdW5jdGlvbj19IHN0YXRlQ29uZmlnLm9uRW50ZXJcclxuICAgKiA8YSBpZD0nb25FbnRlcic+PC9hPlxyXG4gICAqXHJcbiAgICogQ2FsbGJhY2sgZnVuY3Rpb24gZm9yIHdoZW4gYSBzdGF0ZSBpcyBlbnRlcmVkLiBHb29kIHdheVxyXG4gICAqICAgdG8gdHJpZ2dlciBhbiBhY3Rpb24gb3IgZGlzcGF0Y2ggYW4gZXZlbnQsIHN1Y2ggYXMgb3BlbmluZyBhIGRpYWxvZy5cclxuICAgKiBJZiBtaW5pZnlpbmcgeW91ciBzY3JpcHRzLCBtYWtlIHN1cmUgdG8gZXhwbGljdGx5IGFubm90YXRlIHRoaXMgZnVuY3Rpb24sXHJcbiAgICogYmVjYXVzZSBpdCB3b24ndCBiZSBhdXRvbWF0aWNhbGx5IGFubm90YXRlZCBieSB5b3VyIGJ1aWxkIHRvb2xzLlxyXG4gICAqXHJcbiAgICogPHByZT5vbkVudGVyOiBmdW5jdGlvbihNeVNlcnZpY2UsICRzdGF0ZVBhcmFtcykge1xyXG4gICAqICAgICBNeVNlcnZpY2UuZm9vKCRzdGF0ZVBhcmFtcy5teVBhcmFtKTtcclxuICAgKiB9PC9wcmU+XHJcbiAgICpcclxuICAgKiBAcGFyYW0ge2Z1bmN0aW9uPX0gc3RhdGVDb25maWcub25FeGl0XHJcbiAgICogPGEgaWQ9J29uRXhpdCc+PC9hPlxyXG4gICAqXHJcbiAgICogQ2FsbGJhY2sgZnVuY3Rpb24gZm9yIHdoZW4gYSBzdGF0ZSBpcyBleGl0ZWQuIEdvb2Qgd2F5IHRvXHJcbiAgICogICB0cmlnZ2VyIGFuIGFjdGlvbiBvciBkaXNwYXRjaCBhbiBldmVudCwgc3VjaCBhcyBvcGVuaW5nIGEgZGlhbG9nLlxyXG4gICAqIElmIG1pbmlmeWluZyB5b3VyIHNjcmlwdHMsIG1ha2Ugc3VyZSB0byBleHBsaWN0bHkgYW5ub3RhdGUgdGhpcyBmdW5jdGlvbixcclxuICAgKiBiZWNhdXNlIGl0IHdvbid0IGJlIGF1dG9tYXRpY2FsbHkgYW5ub3RhdGVkIGJ5IHlvdXIgYnVpbGQgdG9vbHMuXHJcbiAgICpcclxuICAgKiA8cHJlPm9uRXhpdDogZnVuY3Rpb24oTXlTZXJ2aWNlLCAkc3RhdGVQYXJhbXMpIHtcclxuICAgKiAgICAgTXlTZXJ2aWNlLmNsZWFudXAoJHN0YXRlUGFyYW1zLm15UGFyYW0pO1xyXG4gICAqIH08L3ByZT5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IFtzdGF0ZUNvbmZpZy5yZWxvYWRPblNlYXJjaD10cnVlXVxyXG4gICAqIDxhIGlkPSdyZWxvYWRPblNlYXJjaCc+PC9hPlxyXG4gICAqXHJcbiAgICogSWYgYGZhbHNlYCwgd2lsbCBub3QgcmV0cmlnZ2VyIHRoZSBzYW1lIHN0YXRlXHJcbiAgICogICBqdXN0IGJlY2F1c2UgYSBzZWFyY2gvcXVlcnkgcGFyYW1ldGVyIGhhcyBjaGFuZ2VkICh2aWEgJGxvY2F0aW9uLnNlYXJjaCgpIG9yICRsb2NhdGlvbi5oYXNoKCkpLiBcclxuICAgKiAgIFVzZWZ1bCBmb3Igd2hlbiB5b3UnZCBsaWtlIHRvIG1vZGlmeSAkbG9jYXRpb24uc2VhcmNoKCkgd2l0aG91dCB0cmlnZ2VyaW5nIGEgcmVsb2FkLlxyXG4gICAqIDxwcmU+cmVsb2FkT25TZWFyY2g6IGZhbHNlPC9wcmU+XHJcbiAgICpcclxuICAgKiBAcGFyYW0ge29iamVjdD19IHN0YXRlQ29uZmlnLmRhdGFcclxuICAgKiA8YSBpZD0nZGF0YSc+PC9hPlxyXG4gICAqXHJcbiAgICogQXJiaXRyYXJ5IGRhdGEgb2JqZWN0LCB1c2VmdWwgZm9yIGN1c3RvbSBjb25maWd1cmF0aW9uLiAgVGhlIHBhcmVudCBzdGF0ZSdzIGBkYXRhYCBpc1xyXG4gICAqICAgcHJvdG90eXBhbGx5IGluaGVyaXRlZC4gIEluIG90aGVyIHdvcmRzLCBhZGRpbmcgYSBkYXRhIHByb3BlcnR5IHRvIGEgc3RhdGUgYWRkcyBpdCB0b1xyXG4gICAqICAgdGhlIGVudGlyZSBzdWJ0cmVlIHZpYSBwcm90b3R5cGFsIGluaGVyaXRhbmNlLlxyXG4gICAqXHJcbiAgICogPHByZT5kYXRhOiB7XHJcbiAgICogICAgIHJlcXVpcmVkUm9sZTogJ2ZvbydcclxuICAgKiB9IDwvcHJlPlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtvYmplY3Q9fSBzdGF0ZUNvbmZpZy5wYXJhbXNcclxuICAgKiA8YSBpZD0ncGFyYW1zJz48L2E+XHJcbiAgICpcclxuICAgKiBBIG1hcCB3aGljaCBvcHRpb25hbGx5IGNvbmZpZ3VyZXMgcGFyYW1ldGVycyBkZWNsYXJlZCBpbiB0aGUgYHVybGAsIG9yXHJcbiAgICogICBkZWZpbmVzIGFkZGl0aW9uYWwgbm9uLXVybCBwYXJhbWV0ZXJzLiAgRm9yIGVhY2ggcGFyYW1ldGVyIGJlaW5nXHJcbiAgICogICBjb25maWd1cmVkLCBhZGQgYSBjb25maWd1cmF0aW9uIG9iamVjdCBrZXllZCB0byB0aGUgbmFtZSBvZiB0aGUgcGFyYW1ldGVyLlxyXG4gICAqXHJcbiAgICogICBFYWNoIHBhcmFtZXRlciBjb25maWd1cmF0aW9uIG9iamVjdCBtYXkgY29udGFpbiB0aGUgZm9sbG93aW5nIHByb3BlcnRpZXM6XHJcbiAgICpcclxuICAgKiAgIC0gKiogdmFsdWUgKiogLSB7b2JqZWN0fGZ1bmN0aW9uPX06IHNwZWNpZmllcyB0aGUgZGVmYXVsdCB2YWx1ZSBmb3IgdGhpc1xyXG4gICAqICAgICBwYXJhbWV0ZXIuICBUaGlzIGltcGxpY2l0bHkgc2V0cyB0aGlzIHBhcmFtZXRlciBhcyBvcHRpb25hbC5cclxuICAgKlxyXG4gICAqICAgICBXaGVuIFVJLVJvdXRlciByb3V0ZXMgdG8gYSBzdGF0ZSBhbmQgbm8gdmFsdWUgaXNcclxuICAgKiAgICAgc3BlY2lmaWVkIGZvciB0aGlzIHBhcmFtZXRlciBpbiB0aGUgVVJMIG9yIHRyYW5zaXRpb24sIHRoZVxyXG4gICAqICAgICBkZWZhdWx0IHZhbHVlIHdpbGwgYmUgdXNlZCBpbnN0ZWFkLiAgSWYgYHZhbHVlYCBpcyBhIGZ1bmN0aW9uLFxyXG4gICAqICAgICBpdCB3aWxsIGJlIGluamVjdGVkIGFuZCBpbnZva2VkLCBhbmQgdGhlIHJldHVybiB2YWx1ZSB1c2VkLlxyXG4gICAqXHJcbiAgICogICAgICpOb3RlKjogYHVuZGVmaW5lZGAgaXMgdHJlYXRlZCBhcyBcIm5vIGRlZmF1bHQgdmFsdWVcIiB3aGlsZSBgbnVsbGBcclxuICAgKiAgICAgaXMgdHJlYXRlZCBhcyBcInRoZSBkZWZhdWx0IHZhbHVlIGlzIGBudWxsYFwiLlxyXG4gICAqXHJcbiAgICogICAgICpTaG9ydGhhbmQqOiBJZiB5b3Ugb25seSBuZWVkIHRvIGNvbmZpZ3VyZSB0aGUgZGVmYXVsdCB2YWx1ZSBvZiB0aGVcclxuICAgKiAgICAgcGFyYW1ldGVyLCB5b3UgbWF5IHVzZSBhIHNob3J0aGFuZCBzeW50YXguICAgSW4gdGhlICoqYHBhcmFtc2AqKlxyXG4gICAqICAgICBtYXAsIGluc3RlYWQgbWFwcGluZyB0aGUgcGFyYW0gbmFtZSB0byBhIGZ1bGwgcGFyYW1ldGVyIGNvbmZpZ3VyYXRpb25cclxuICAgKiAgICAgb2JqZWN0LCBzaW1wbHkgc2V0IG1hcCBpdCB0byB0aGUgZGVmYXVsdCBwYXJhbWV0ZXIgdmFsdWUsIGUuZy46XHJcbiAgICpcclxuICAgKiA8cHJlPi8vIGRlZmluZSBhIHBhcmFtZXRlcidzIGRlZmF1bHQgdmFsdWVcclxuICAgKiBwYXJhbXM6IHtcclxuICAgKiAgICAgcGFyYW0xOiB7IHZhbHVlOiBcImRlZmF1bHRWYWx1ZVwiIH1cclxuICAgKiB9XHJcbiAgICogLy8gc2hvcnRoYW5kIGRlZmF1bHQgdmFsdWVzXHJcbiAgICogcGFyYW1zOiB7XHJcbiAgICogICAgIHBhcmFtMTogXCJkZWZhdWx0VmFsdWVcIixcclxuICAgKiAgICAgcGFyYW0yOiBcInBhcmFtMkRlZmF1bHRcIlxyXG4gICAqIH08L3ByZT5cclxuICAgKlxyXG4gICAqICAgLSAqKiBhcnJheSAqKiAtIHtib29sZWFuPX06ICooZGVmYXVsdDogZmFsc2UpKiBJZiB0cnVlLCB0aGUgcGFyYW0gdmFsdWUgd2lsbCBiZVxyXG4gICAqICAgICB0cmVhdGVkIGFzIGFuIGFycmF5IG9mIHZhbHVlcy4gIElmIHlvdSBzcGVjaWZpZWQgYSBUeXBlLCB0aGUgdmFsdWUgd2lsbCBiZVxyXG4gICAqICAgICB0cmVhdGVkIGFzIGFuIGFycmF5IG9mIHRoZSBzcGVjaWZpZWQgVHlwZS4gIE5vdGU6IHF1ZXJ5IHBhcmFtZXRlciB2YWx1ZXNcclxuICAgKiAgICAgZGVmYXVsdCB0byBhIHNwZWNpYWwgYFwiYXV0b1wiYCBtb2RlLlxyXG4gICAqXHJcbiAgICogICAgIEZvciBxdWVyeSBwYXJhbWV0ZXJzIGluIGBcImF1dG9cImAgbW9kZSwgaWYgbXVsdGlwbGUgIHZhbHVlcyBmb3IgYSBzaW5nbGUgcGFyYW1ldGVyXHJcbiAgICogICAgIGFyZSBwcmVzZW50IGluIHRoZSBVUkwgKGUuZy46IGAvZm9vP2Jhcj0xJmJhcj0yJmJhcj0zYCkgdGhlbiB0aGUgdmFsdWVzXHJcbiAgICogICAgIGFyZSBtYXBwZWQgdG8gYW4gYXJyYXkgKGUuZy46IGB7IGZvbzogWyAnMScsICcyJywgJzMnIF0gfWApLiAgSG93ZXZlciwgaWZcclxuICAgKiAgICAgb25seSBvbmUgdmFsdWUgaXMgcHJlc2VudCAoZS5nLjogYC9mb28/YmFyPTFgKSB0aGVuIHRoZSB2YWx1ZSBpcyB0cmVhdGVkIGFzIHNpbmdsZVxyXG4gICAqICAgICB2YWx1ZSAoZS5nLjogYHsgZm9vOiAnMScgfWApLlxyXG4gICAqXHJcbiAgICogPHByZT5wYXJhbXM6IHtcclxuICAgKiAgICAgcGFyYW0xOiB7IGFycmF5OiB0cnVlIH1cclxuICAgKiB9PC9wcmU+XHJcbiAgICpcclxuICAgKiAgIC0gKiogc3F1YXNoICoqIC0ge2Jvb2x8c3RyaW5nPX06IGBzcXVhc2hgIGNvbmZpZ3VyZXMgaG93IGEgZGVmYXVsdCBwYXJhbWV0ZXIgdmFsdWUgaXMgcmVwcmVzZW50ZWQgaW4gdGhlIFVSTCB3aGVuXHJcbiAgICogICAgIHRoZSBjdXJyZW50IHBhcmFtZXRlciB2YWx1ZSBpcyB0aGUgc2FtZSBhcyB0aGUgZGVmYXVsdCB2YWx1ZS4gSWYgYHNxdWFzaGAgaXMgbm90IHNldCwgaXQgdXNlcyB0aGVcclxuICAgKiAgICAgY29uZmlndXJlZCBkZWZhdWx0IHNxdWFzaCBwb2xpY3kuXHJcbiAgICogICAgIChTZWUge0BsaW5rIHVpLnJvdXRlci51dGlsLiR1cmxNYXRjaGVyRmFjdG9yeSNtZXRob2RzX2RlZmF1bHRTcXVhc2hQb2xpY3kgYGRlZmF1bHRTcXVhc2hQb2xpY3koKWB9KVxyXG4gICAqXHJcbiAgICogICBUaGVyZSBhcmUgdGhyZWUgc3F1YXNoIHNldHRpbmdzOlxyXG4gICAqXHJcbiAgICogICAgIC0gZmFsc2U6IFRoZSBwYXJhbWV0ZXIncyBkZWZhdWx0IHZhbHVlIGlzIG5vdCBzcXVhc2hlZC4gIEl0IGlzIGVuY29kZWQgYW5kIGluY2x1ZGVkIGluIHRoZSBVUkxcclxuICAgKiAgICAgLSB0cnVlOiBUaGUgcGFyYW1ldGVyJ3MgZGVmYXVsdCB2YWx1ZSBpcyBvbWl0dGVkIGZyb20gdGhlIFVSTC4gIElmIHRoZSBwYXJhbWV0ZXIgaXMgcHJlY2VlZGVkIGFuZCBmb2xsb3dlZFxyXG4gICAqICAgICAgIGJ5IHNsYXNoZXMgaW4gdGhlIHN0YXRlJ3MgYHVybGAgZGVjbGFyYXRpb24sIHRoZW4gb25lIG9mIHRob3NlIHNsYXNoZXMgYXJlIG9taXR0ZWQuXHJcbiAgICogICAgICAgVGhpcyBjYW4gYWxsb3cgZm9yIGNsZWFuZXIgbG9va2luZyBVUkxzLlxyXG4gICAqICAgICAtIGBcIjxhcmJpdHJhcnkgc3RyaW5nPlwiYDogVGhlIHBhcmFtZXRlcidzIGRlZmF1bHQgdmFsdWUgaXMgcmVwbGFjZWQgd2l0aCBhbiBhcmJpdHJhcnkgcGxhY2Vob2xkZXIgb2YgIHlvdXIgY2hvaWNlLlxyXG4gICAqXHJcbiAgICogPHByZT5wYXJhbXM6IHtcclxuICAgKiAgICAgcGFyYW0xOiB7XHJcbiAgICogICAgICAgdmFsdWU6IFwiZGVmYXVsdElkXCIsXHJcbiAgICogICAgICAgc3F1YXNoOiB0cnVlXHJcbiAgICogfSB9XHJcbiAgICogLy8gc3F1YXNoIFwiZGVmYXVsdFZhbHVlXCIgdG8gXCJ+XCJcclxuICAgKiBwYXJhbXM6IHtcclxuICAgKiAgICAgcGFyYW0xOiB7XHJcbiAgICogICAgICAgdmFsdWU6IFwiZGVmYXVsdFZhbHVlXCIsXHJcbiAgICogICAgICAgc3F1YXNoOiBcIn5cIlxyXG4gICAqIH0gfVxyXG4gICAqIDwvcHJlPlxyXG4gICAqXHJcbiAgICpcclxuICAgKiBAZXhhbXBsZVxyXG4gICAqIDxwcmU+XHJcbiAgICogLy8gU29tZSBzdGF0ZSBuYW1lIGV4YW1wbGVzXHJcbiAgICpcclxuICAgKiAvLyBzdGF0ZU5hbWUgY2FuIGJlIGEgc2luZ2xlIHRvcC1sZXZlbCBuYW1lIChtdXN0IGJlIHVuaXF1ZSkuXHJcbiAgICogJHN0YXRlUHJvdmlkZXIuc3RhdGUoXCJob21lXCIsIHt9KTtcclxuICAgKlxyXG4gICAqIC8vIE9yIGl0IGNhbiBiZSBhIG5lc3RlZCBzdGF0ZSBuYW1lLiBUaGlzIHN0YXRlIGlzIGEgY2hpbGQgb2YgdGhlXHJcbiAgICogLy8gYWJvdmUgXCJob21lXCIgc3RhdGUuXHJcbiAgICogJHN0YXRlUHJvdmlkZXIuc3RhdGUoXCJob21lLm5ld2VzdFwiLCB7fSk7XHJcbiAgICpcclxuICAgKiAvLyBOZXN0IHN0YXRlcyBhcyBkZWVwbHkgYXMgbmVlZGVkLlxyXG4gICAqICRzdGF0ZVByb3ZpZGVyLnN0YXRlKFwiaG9tZS5uZXdlc3QuYWJjLnh5ei5pbmNlcHRpb25cIiwge30pO1xyXG4gICAqXHJcbiAgICogLy8gc3RhdGUoKSByZXR1cm5zICRzdGF0ZVByb3ZpZGVyLCBzbyB5b3UgY2FuIGNoYWluIHN0YXRlIGRlY2xhcmF0aW9ucy5cclxuICAgKiAkc3RhdGVQcm92aWRlclxyXG4gICAqICAgLnN0YXRlKFwiaG9tZVwiLCB7fSlcclxuICAgKiAgIC5zdGF0ZShcImFib3V0XCIsIHt9KVxyXG4gICAqICAgLnN0YXRlKFwiY29udGFjdHNcIiwge30pO1xyXG4gICAqIDwvcHJlPlxyXG4gICAqXHJcbiAgICovXHJcbiAgdGhpcy5zdGF0ZSA9IHN0YXRlO1xyXG4gIGZ1bmN0aW9uIHN0YXRlKG5hbWUsIGRlZmluaXRpb24pIHtcclxuICAgIC8qanNoaW50IHZhbGlkdGhpczogdHJ1ZSAqL1xyXG4gICAgaWYgKGlzT2JqZWN0KG5hbWUpKSBkZWZpbml0aW9uID0gbmFtZTtcclxuICAgIGVsc2UgZGVmaW5pdGlvbi5uYW1lID0gbmFtZTtcclxuICAgIHJlZ2lzdGVyU3RhdGUoZGVmaW5pdGlvbik7XHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEBuZ2RvYyBvYmplY3RcclxuICAgKiBAbmFtZSB1aS5yb3V0ZXIuc3RhdGUuJHN0YXRlXHJcbiAgICpcclxuICAgKiBAcmVxdWlyZXMgJHJvb3RTY29wZVxyXG4gICAqIEByZXF1aXJlcyAkcVxyXG4gICAqIEByZXF1aXJlcyB1aS5yb3V0ZXIuc3RhdGUuJHZpZXdcclxuICAgKiBAcmVxdWlyZXMgJGluamVjdG9yXHJcbiAgICogQHJlcXVpcmVzIHVpLnJvdXRlci51dGlsLiRyZXNvbHZlXHJcbiAgICogQHJlcXVpcmVzIHVpLnJvdXRlci5zdGF0ZS4kc3RhdGVQYXJhbXNcclxuICAgKiBAcmVxdWlyZXMgdWkucm91dGVyLnJvdXRlci4kdXJsUm91dGVyXHJcbiAgICpcclxuICAgKiBAcHJvcGVydHkge29iamVjdH0gcGFyYW1zIEEgcGFyYW0gb2JqZWN0LCBlLmcuIHtzZWN0aW9uSWQ6IHNlY3Rpb24uaWQpfSwgdGhhdCBcclxuICAgKiB5b3UnZCBsaWtlIHRvIHRlc3QgYWdhaW5zdCB0aGUgY3VycmVudCBhY3RpdmUgc3RhdGUuXHJcbiAgICogQHByb3BlcnR5IHtvYmplY3R9IGN1cnJlbnQgQSByZWZlcmVuY2UgdG8gdGhlIHN0YXRlJ3MgY29uZmlnIG9iamVjdC4gSG93ZXZlciBcclxuICAgKiB5b3UgcGFzc2VkIGl0IGluLiBVc2VmdWwgZm9yIGFjY2Vzc2luZyBjdXN0b20gZGF0YS5cclxuICAgKiBAcHJvcGVydHkge29iamVjdH0gdHJhbnNpdGlvbiBDdXJyZW50bHkgcGVuZGluZyB0cmFuc2l0aW9uLiBBIHByb21pc2UgdGhhdCdsbCBcclxuICAgKiByZXNvbHZlIG9yIHJlamVjdC5cclxuICAgKlxyXG4gICAqIEBkZXNjcmlwdGlvblxyXG4gICAqIGAkc3RhdGVgIHNlcnZpY2UgaXMgcmVzcG9uc2libGUgZm9yIHJlcHJlc2VudGluZyBzdGF0ZXMgYXMgd2VsbCBhcyB0cmFuc2l0aW9uaW5nXHJcbiAgICogYmV0d2VlbiB0aGVtLiBJdCBhbHNvIHByb3ZpZGVzIGludGVyZmFjZXMgdG8gYXNrIGZvciBjdXJyZW50IHN0YXRlIG9yIGV2ZW4gc3RhdGVzXHJcbiAgICogeW91J3JlIGNvbWluZyBmcm9tLlxyXG4gICAqL1xyXG4gIHRoaXMuJGdldCA9ICRnZXQ7XHJcbiAgJGdldC4kaW5qZWN0ID0gWyckcm9vdFNjb3BlJywgJyRxJywgJyR2aWV3JywgJyRpbmplY3RvcicsICckcmVzb2x2ZScsICckc3RhdGVQYXJhbXMnLCAnJHVybFJvdXRlcicsICckbG9jYXRpb24nLCAnJHVybE1hdGNoZXJGYWN0b3J5J107XHJcbiAgZnVuY3Rpb24gJGdldCggICAkcm9vdFNjb3BlLCAgICRxLCAgICR2aWV3LCAgICRpbmplY3RvciwgICAkcmVzb2x2ZSwgICAkc3RhdGVQYXJhbXMsICAgJHVybFJvdXRlciwgICAkbG9jYXRpb24sICAgJHVybE1hdGNoZXJGYWN0b3J5KSB7XHJcblxyXG4gICAgdmFyIFRyYW5zaXRpb25TdXBlcnNlZGVkID0gJHEucmVqZWN0KG5ldyBFcnJvcigndHJhbnNpdGlvbiBzdXBlcnNlZGVkJykpO1xyXG4gICAgdmFyIFRyYW5zaXRpb25QcmV2ZW50ZWQgPSAkcS5yZWplY3QobmV3IEVycm9yKCd0cmFuc2l0aW9uIHByZXZlbnRlZCcpKTtcclxuICAgIHZhciBUcmFuc2l0aW9uQWJvcnRlZCA9ICRxLnJlamVjdChuZXcgRXJyb3IoJ3RyYW5zaXRpb24gYWJvcnRlZCcpKTtcclxuICAgIHZhciBUcmFuc2l0aW9uRmFpbGVkID0gJHEucmVqZWN0KG5ldyBFcnJvcigndHJhbnNpdGlvbiBmYWlsZWQnKSk7XHJcblxyXG4gICAgLy8gSGFuZGxlcyB0aGUgY2FzZSB3aGVyZSBhIHN0YXRlIHdoaWNoIGlzIHRoZSB0YXJnZXQgb2YgYSB0cmFuc2l0aW9uIGlzIG5vdCBmb3VuZCwgYW5kIHRoZSB1c2VyXHJcbiAgICAvLyBjYW4gb3B0aW9uYWxseSByZXRyeSBvciBkZWZlciB0aGUgdHJhbnNpdGlvblxyXG4gICAgZnVuY3Rpb24gaGFuZGxlUmVkaXJlY3QocmVkaXJlY3QsIHN0YXRlLCBwYXJhbXMsIG9wdGlvbnMpIHtcclxuICAgICAgLyoqXHJcbiAgICAgICAqIEBuZ2RvYyBldmVudFxyXG4gICAgICAgKiBAbmFtZSB1aS5yb3V0ZXIuc3RhdGUuJHN0YXRlIyRzdGF0ZU5vdEZvdW5kXHJcbiAgICAgICAqIEBldmVudE9mIHVpLnJvdXRlci5zdGF0ZS4kc3RhdGVcclxuICAgICAgICogQGV2ZW50VHlwZSBicm9hZGNhc3Qgb24gcm9vdCBzY29wZVxyXG4gICAgICAgKiBAZGVzY3JpcHRpb25cclxuICAgICAgICogRmlyZWQgd2hlbiBhIHJlcXVlc3RlZCBzdGF0ZSAqKmNhbm5vdCBiZSBmb3VuZCoqIHVzaW5nIHRoZSBwcm92aWRlZCBzdGF0ZSBuYW1lIGR1cmluZyB0cmFuc2l0aW9uLlxyXG4gICAgICAgKiBUaGUgZXZlbnQgaXMgYnJvYWRjYXN0IGFsbG93aW5nIGFueSBoYW5kbGVycyBhIHNpbmdsZSBjaGFuY2UgdG8gZGVhbCB3aXRoIHRoZSBlcnJvciAodXN1YWxseSBieVxyXG4gICAgICAgKiBsYXp5LWxvYWRpbmcgdGhlIHVuZm91bmQgc3RhdGUpLiBBIHNwZWNpYWwgYHVuZm91bmRTdGF0ZWAgb2JqZWN0IGlzIHBhc3NlZCB0byB0aGUgbGlzdGVuZXIgaGFuZGxlcixcclxuICAgICAgICogeW91IGNhbiBzZWUgaXRzIHRocmVlIHByb3BlcnRpZXMgaW4gdGhlIGV4YW1wbGUuIFlvdSBjYW4gdXNlIGBldmVudC5wcmV2ZW50RGVmYXVsdCgpYCB0byBhYm9ydCB0aGVcclxuICAgICAgICogdHJhbnNpdGlvbiBhbmQgdGhlIHByb21pc2UgcmV0dXJuZWQgZnJvbSBgZ29gIHdpbGwgYmUgcmVqZWN0ZWQgd2l0aCBhIGAndHJhbnNpdGlvbiBhYm9ydGVkJ2AgdmFsdWUuXHJcbiAgICAgICAqXHJcbiAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBldmVudCBFdmVudCBvYmplY3QuXHJcbiAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSB1bmZvdW5kU3RhdGUgVW5mb3VuZCBTdGF0ZSBpbmZvcm1hdGlvbi4gQ29udGFpbnM6IGB0bywgdG9QYXJhbXMsIG9wdGlvbnNgIHByb3BlcnRpZXMuXHJcbiAgICAgICAqIEBwYXJhbSB7U3RhdGV9IGZyb21TdGF0ZSBDdXJyZW50IHN0YXRlIG9iamVjdC5cclxuICAgICAgICogQHBhcmFtIHtPYmplY3R9IGZyb21QYXJhbXMgQ3VycmVudCBzdGF0ZSBwYXJhbXMuXHJcbiAgICAgICAqXHJcbiAgICAgICAqIEBleGFtcGxlXHJcbiAgICAgICAqXHJcbiAgICAgICAqIDxwcmU+XHJcbiAgICAgICAqIC8vIHNvbWV3aGVyZSwgYXNzdW1lIGxhenkuc3RhdGUgaGFzIG5vdCBiZWVuIGRlZmluZWRcclxuICAgICAgICogJHN0YXRlLmdvKFwibGF6eS5zdGF0ZVwiLCB7YToxLCBiOjJ9LCB7aW5oZXJpdDpmYWxzZX0pO1xyXG4gICAgICAgKlxyXG4gICAgICAgKiAvLyBzb21ld2hlcmUgZWxzZVxyXG4gICAgICAgKiAkc2NvcGUuJG9uKCckc3RhdGVOb3RGb3VuZCcsXHJcbiAgICAgICAqIGZ1bmN0aW9uKGV2ZW50LCB1bmZvdW5kU3RhdGUsIGZyb21TdGF0ZSwgZnJvbVBhcmFtcyl7XHJcbiAgICAgICAqICAgICBjb25zb2xlLmxvZyh1bmZvdW5kU3RhdGUudG8pOyAvLyBcImxhenkuc3RhdGVcIlxyXG4gICAgICAgKiAgICAgY29uc29sZS5sb2codW5mb3VuZFN0YXRlLnRvUGFyYW1zKTsgLy8ge2E6MSwgYjoyfVxyXG4gICAgICAgKiAgICAgY29uc29sZS5sb2codW5mb3VuZFN0YXRlLm9wdGlvbnMpOyAvLyB7aW5oZXJpdDpmYWxzZX0gKyBkZWZhdWx0IG9wdGlvbnNcclxuICAgICAgICogfSlcclxuICAgICAgICogPC9wcmU+XHJcbiAgICAgICAqL1xyXG4gICAgICB2YXIgZXZ0ID0gJHJvb3RTY29wZS4kYnJvYWRjYXN0KCckc3RhdGVOb3RGb3VuZCcsIHJlZGlyZWN0LCBzdGF0ZSwgcGFyYW1zKTtcclxuXHJcbiAgICAgIGlmIChldnQuZGVmYXVsdFByZXZlbnRlZCkge1xyXG4gICAgICAgICR1cmxSb3V0ZXIudXBkYXRlKCk7XHJcbiAgICAgICAgcmV0dXJuIFRyYW5zaXRpb25BYm9ydGVkO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoIWV2dC5yZXRyeSkge1xyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBBbGxvdyB0aGUgaGFuZGxlciB0byByZXR1cm4gYSBwcm9taXNlIHRvIGRlZmVyIHN0YXRlIGxvb2t1cCByZXRyeVxyXG4gICAgICBpZiAob3B0aW9ucy4kcmV0cnkpIHtcclxuICAgICAgICAkdXJsUm91dGVyLnVwZGF0ZSgpO1xyXG4gICAgICAgIHJldHVybiBUcmFuc2l0aW9uRmFpbGVkO1xyXG4gICAgICB9XHJcbiAgICAgIHZhciByZXRyeVRyYW5zaXRpb24gPSAkc3RhdGUudHJhbnNpdGlvbiA9ICRxLndoZW4oZXZ0LnJldHJ5KTtcclxuXHJcbiAgICAgIHJldHJ5VHJhbnNpdGlvbi50aGVuKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmIChyZXRyeVRyYW5zaXRpb24gIT09ICRzdGF0ZS50cmFuc2l0aW9uKSByZXR1cm4gVHJhbnNpdGlvblN1cGVyc2VkZWQ7XHJcbiAgICAgICAgcmVkaXJlY3Qub3B0aW9ucy4kcmV0cnkgPSB0cnVlO1xyXG4gICAgICAgIHJldHVybiAkc3RhdGUudHJhbnNpdGlvblRvKHJlZGlyZWN0LnRvLCByZWRpcmVjdC50b1BhcmFtcywgcmVkaXJlY3Qub3B0aW9ucyk7XHJcbiAgICAgIH0sIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiBUcmFuc2l0aW9uQWJvcnRlZDtcclxuICAgICAgfSk7XHJcbiAgICAgICR1cmxSb3V0ZXIudXBkYXRlKCk7XHJcblxyXG4gICAgICByZXR1cm4gcmV0cnlUcmFuc2l0aW9uO1xyXG4gICAgfVxyXG5cclxuICAgIHJvb3QubG9jYWxzID0geyByZXNvbHZlOiBudWxsLCBnbG9iYWxzOiB7ICRzdGF0ZVBhcmFtczoge30gfSB9O1xyXG5cclxuICAgICRzdGF0ZSA9IHtcclxuICAgICAgcGFyYW1zOiB7fSxcclxuICAgICAgY3VycmVudDogcm9vdC5zZWxmLFxyXG4gICAgICAkY3VycmVudDogcm9vdCxcclxuICAgICAgdHJhbnNpdGlvbjogbnVsbFxyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEBuZ2RvYyBmdW5jdGlvblxyXG4gICAgICogQG5hbWUgdWkucm91dGVyLnN0YXRlLiRzdGF0ZSNyZWxvYWRcclxuICAgICAqIEBtZXRob2RPZiB1aS5yb3V0ZXIuc3RhdGUuJHN0YXRlXHJcbiAgICAgKlxyXG4gICAgICogQGRlc2NyaXB0aW9uXHJcbiAgICAgKiBBIG1ldGhvZCB0aGF0IGZvcmNlIHJlbG9hZHMgdGhlIGN1cnJlbnQgc3RhdGUuIEFsbCByZXNvbHZlcyBhcmUgcmUtcmVzb2x2ZWQsXHJcbiAgICAgKiBjb250cm9sbGVycyByZWluc3RhbnRpYXRlZCwgYW5kIGV2ZW50cyByZS1maXJlZC5cclxuICAgICAqXHJcbiAgICAgKiBAZXhhbXBsZVxyXG4gICAgICogPHByZT5cclxuICAgICAqIHZhciBhcHAgYW5ndWxhci5tb2R1bGUoJ2FwcCcsIFsndWkucm91dGVyJ10pO1xyXG4gICAgICpcclxuICAgICAqIGFwcC5jb250cm9sbGVyKCdjdHJsJywgZnVuY3Rpb24gKCRzY29wZSwgJHN0YXRlKSB7XHJcbiAgICAgKiAgICRzY29wZS5yZWxvYWQgPSBmdW5jdGlvbigpe1xyXG4gICAgICogICAgICRzdGF0ZS5yZWxvYWQoKTtcclxuICAgICAqICAgfVxyXG4gICAgICogfSk7XHJcbiAgICAgKiA8L3ByZT5cclxuICAgICAqXHJcbiAgICAgKiBgcmVsb2FkKClgIGlzIGp1c3QgYW4gYWxpYXMgZm9yOlxyXG4gICAgICogPHByZT5cclxuICAgICAqICRzdGF0ZS50cmFuc2l0aW9uVG8oJHN0YXRlLmN1cnJlbnQsICRzdGF0ZVBhcmFtcywgeyBcclxuICAgICAqICAgcmVsb2FkOiB0cnVlLCBpbmhlcml0OiBmYWxzZSwgbm90aWZ5OiB0cnVlXHJcbiAgICAgKiB9KTtcclxuICAgICAqIDwvcHJlPlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nPXxvYmplY3Q9fSBzdGF0ZSAtIEEgc3RhdGUgbmFtZSBvciBhIHN0YXRlIG9iamVjdCwgd2hpY2ggaXMgdGhlIHJvb3Qgb2YgdGhlIHJlc29sdmVzIHRvIGJlIHJlLXJlc29sdmVkLlxyXG4gICAgICogQGV4YW1wbGVcclxuICAgICAqIDxwcmU+XHJcbiAgICAgKiAvL2Fzc3VtaW5nIGFwcCBhcHBsaWNhdGlvbiBjb25zaXN0cyBvZiAzIHN0YXRlczogJ2NvbnRhY3RzJywgJ2NvbnRhY3RzLmRldGFpbCcsICdjb250YWN0cy5kZXRhaWwuaXRlbScgXHJcbiAgICAgKiAvL2FuZCBjdXJyZW50IHN0YXRlIGlzICdjb250YWN0cy5kZXRhaWwuaXRlbSdcclxuICAgICAqIHZhciBhcHAgYW5ndWxhci5tb2R1bGUoJ2FwcCcsIFsndWkucm91dGVyJ10pO1xyXG4gICAgICpcclxuICAgICAqIGFwcC5jb250cm9sbGVyKCdjdHJsJywgZnVuY3Rpb24gKCRzY29wZSwgJHN0YXRlKSB7XHJcbiAgICAgKiAgICRzY29wZS5yZWxvYWQgPSBmdW5jdGlvbigpe1xyXG4gICAgICogICAgIC8vd2lsbCByZWxvYWQgJ2NvbnRhY3QuZGV0YWlsJyBhbmQgJ2NvbnRhY3QuZGV0YWlsLml0ZW0nIHN0YXRlc1xyXG4gICAgICogICAgICRzdGF0ZS5yZWxvYWQoJ2NvbnRhY3QuZGV0YWlsJyk7XHJcbiAgICAgKiAgIH1cclxuICAgICAqIH0pO1xyXG4gICAgICogPC9wcmU+XHJcbiAgICAgKlxyXG4gICAgICogYHJlbG9hZCgpYCBpcyBqdXN0IGFuIGFsaWFzIGZvcjpcclxuICAgICAqIDxwcmU+XHJcbiAgICAgKiAkc3RhdGUudHJhbnNpdGlvblRvKCRzdGF0ZS5jdXJyZW50LCAkc3RhdGVQYXJhbXMsIHsgXHJcbiAgICAgKiAgIHJlbG9hZDogdHJ1ZSwgaW5oZXJpdDogZmFsc2UsIG5vdGlmeTogdHJ1ZVxyXG4gICAgICogfSk7XHJcbiAgICAgKiA8L3ByZT5cclxuXHJcbiAgICAgKiBAcmV0dXJucyB7cHJvbWlzZX0gQSBwcm9taXNlIHJlcHJlc2VudGluZyB0aGUgc3RhdGUgb2YgdGhlIG5ldyB0cmFuc2l0aW9uLiBTZWVcclxuICAgICAqIHtAbGluayB1aS5yb3V0ZXIuc3RhdGUuJHN0YXRlI21ldGhvZHNfZ28gJHN0YXRlLmdvfS5cclxuICAgICAqL1xyXG4gICAgJHN0YXRlLnJlbG9hZCA9IGZ1bmN0aW9uIHJlbG9hZChzdGF0ZSkge1xyXG4gICAgICByZXR1cm4gJHN0YXRlLnRyYW5zaXRpb25Ubygkc3RhdGUuY3VycmVudCwgJHN0YXRlUGFyYW1zLCB7IHJlbG9hZDogc3RhdGUgfHwgdHJ1ZSwgaW5oZXJpdDogZmFsc2UsIG5vdGlmeTogdHJ1ZX0pO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEBuZ2RvYyBmdW5jdGlvblxyXG4gICAgICogQG5hbWUgdWkucm91dGVyLnN0YXRlLiRzdGF0ZSNnb1xyXG4gICAgICogQG1ldGhvZE9mIHVpLnJvdXRlci5zdGF0ZS4kc3RhdGVcclxuICAgICAqXHJcbiAgICAgKiBAZGVzY3JpcHRpb25cclxuICAgICAqIENvbnZlbmllbmNlIG1ldGhvZCBmb3IgdHJhbnNpdGlvbmluZyB0byBhIG5ldyBzdGF0ZS4gYCRzdGF0ZS5nb2AgY2FsbHMgXHJcbiAgICAgKiBgJHN0YXRlLnRyYW5zaXRpb25Ub2AgaW50ZXJuYWxseSBidXQgYXV0b21hdGljYWxseSBzZXRzIG9wdGlvbnMgdG8gXHJcbiAgICAgKiBgeyBsb2NhdGlvbjogdHJ1ZSwgaW5oZXJpdDogdHJ1ZSwgcmVsYXRpdmU6ICRzdGF0ZS4kY3VycmVudCwgbm90aWZ5OiB0cnVlIH1gLiBcclxuICAgICAqIFRoaXMgYWxsb3dzIHlvdSB0byBlYXNpbHkgdXNlIGFuIGFic29sdXRlIG9yIHJlbGF0aXZlIHRvIHBhdGggYW5kIHNwZWNpZnkgXHJcbiAgICAgKiBvbmx5IHRoZSBwYXJhbWV0ZXJzIHlvdSdkIGxpa2UgdG8gdXBkYXRlICh3aGlsZSBsZXR0aW5nIHVuc3BlY2lmaWVkIHBhcmFtZXRlcnMgXHJcbiAgICAgKiBpbmhlcml0IGZyb20gdGhlIGN1cnJlbnRseSBhY3RpdmUgYW5jZXN0b3Igc3RhdGVzKS5cclxuICAgICAqXHJcbiAgICAgKiBAZXhhbXBsZVxyXG4gICAgICogPHByZT5cclxuICAgICAqIHZhciBhcHAgPSBhbmd1bGFyLm1vZHVsZSgnYXBwJywgWyd1aS5yb3V0ZXInXSk7XHJcbiAgICAgKlxyXG4gICAgICogYXBwLmNvbnRyb2xsZXIoJ2N0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCAkc3RhdGUpIHtcclxuICAgICAqICAgJHNjb3BlLmNoYW5nZVN0YXRlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICogICAgICRzdGF0ZS5nbygnY29udGFjdC5kZXRhaWwnKTtcclxuICAgICAqICAgfTtcclxuICAgICAqIH0pO1xyXG4gICAgICogPC9wcmU+XHJcbiAgICAgKiA8aW1nIHNyYz0nLi4vbmdkb2NfYXNzZXRzL1N0YXRlR29FeGFtcGxlcy5wbmcnLz5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdG8gQWJzb2x1dGUgc3RhdGUgbmFtZSBvciByZWxhdGl2ZSBzdGF0ZSBwYXRoLiBTb21lIGV4YW1wbGVzOlxyXG4gICAgICpcclxuICAgICAqIC0gYCRzdGF0ZS5nbygnY29udGFjdC5kZXRhaWwnKWAgLSB3aWxsIGdvIHRvIHRoZSBgY29udGFjdC5kZXRhaWxgIHN0YXRlXHJcbiAgICAgKiAtIGAkc3RhdGUuZ28oJ14nKWAgLSB3aWxsIGdvIHRvIGEgcGFyZW50IHN0YXRlXHJcbiAgICAgKiAtIGAkc3RhdGUuZ28oJ14uc2libGluZycpYCAtIHdpbGwgZ28gdG8gYSBzaWJsaW5nIHN0YXRlXHJcbiAgICAgKiAtIGAkc3RhdGUuZ28oJy5jaGlsZC5ncmFuZGNoaWxkJylgIC0gd2lsbCBnbyB0byBncmFuZGNoaWxkIHN0YXRlXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtvYmplY3Q9fSBwYXJhbXMgQSBtYXAgb2YgdGhlIHBhcmFtZXRlcnMgdGhhdCB3aWxsIGJlIHNlbnQgdG8gdGhlIHN0YXRlLCBcclxuICAgICAqIHdpbGwgcG9wdWxhdGUgJHN0YXRlUGFyYW1zLiBBbnkgcGFyYW1ldGVycyB0aGF0IGFyZSBub3Qgc3BlY2lmaWVkIHdpbGwgYmUgaW5oZXJpdGVkIGZyb20gY3VycmVudGx5IFxyXG4gICAgICogZGVmaW5lZCBwYXJhbWV0ZXJzLiBUaGlzIGFsbG93cywgZm9yIGV4YW1wbGUsIGdvaW5nIHRvIGEgc2libGluZyBzdGF0ZSB0aGF0IHNoYXJlcyBwYXJhbWV0ZXJzXHJcbiAgICAgKiBzcGVjaWZpZWQgaW4gYSBwYXJlbnQgc3RhdGUuIFBhcmFtZXRlciBpbmhlcml0YW5jZSBvbmx5IHdvcmtzIGJldHdlZW4gY29tbW9uIGFuY2VzdG9yIHN0YXRlcywgSS5lLlxyXG4gICAgICogdHJhbnNpdGlvbmluZyB0byBhIHNpYmxpbmcgd2lsbCBnZXQgeW91IHRoZSBwYXJhbWV0ZXJzIGZvciBhbGwgcGFyZW50cywgdHJhbnNpdGlvbmluZyB0byBhIGNoaWxkXHJcbiAgICAgKiB3aWxsIGdldCB5b3UgYWxsIGN1cnJlbnQgcGFyYW1ldGVycywgZXRjLlxyXG4gICAgICogQHBhcmFtIHtvYmplY3Q9fSBvcHRpb25zIE9wdGlvbnMgb2JqZWN0LiBUaGUgb3B0aW9ucyBhcmU6XHJcbiAgICAgKlxyXG4gICAgICogLSAqKmBsb2NhdGlvbmAqKiAtIHtib29sZWFuPXRydWV8c3RyaW5nPX0gLSBJZiBgdHJ1ZWAgd2lsbCB1cGRhdGUgdGhlIHVybCBpbiB0aGUgbG9jYXRpb24gYmFyLCBpZiBgZmFsc2VgXHJcbiAgICAgKiAgICB3aWxsIG5vdC4gSWYgc3RyaW5nLCBtdXN0IGJlIGBcInJlcGxhY2VcImAsIHdoaWNoIHdpbGwgdXBkYXRlIHVybCBhbmQgYWxzbyByZXBsYWNlIGxhc3QgaGlzdG9yeSByZWNvcmQuXHJcbiAgICAgKiAtICoqYGluaGVyaXRgKiogLSB7Ym9vbGVhbj10cnVlfSwgSWYgYHRydWVgIHdpbGwgaW5oZXJpdCB1cmwgcGFyYW1ldGVycyBmcm9tIGN1cnJlbnQgdXJsLlxyXG4gICAgICogLSAqKmByZWxhdGl2ZWAqKiAtIHtvYmplY3Q9JHN0YXRlLiRjdXJyZW50fSwgV2hlbiB0cmFuc2l0aW9uaW5nIHdpdGggcmVsYXRpdmUgcGF0aCAoZS5nICdeJyksIFxyXG4gICAgICogICAgZGVmaW5lcyB3aGljaCBzdGF0ZSB0byBiZSByZWxhdGl2ZSBmcm9tLlxyXG4gICAgICogLSAqKmBub3RpZnlgKiogLSB7Ym9vbGVhbj10cnVlfSwgSWYgYHRydWVgIHdpbGwgYnJvYWRjYXN0ICRzdGF0ZUNoYW5nZVN0YXJ0IGFuZCAkc3RhdGVDaGFuZ2VTdWNjZXNzIGV2ZW50cy5cclxuICAgICAqIC0gKipgcmVsb2FkYCoqICh2MC4yLjUpIC0ge2Jvb2xlYW49ZmFsc2V9LCBJZiBgdHJ1ZWAgd2lsbCBmb3JjZSB0cmFuc2l0aW9uIGV2ZW4gaWYgdGhlIHN0YXRlIG9yIHBhcmFtcyBcclxuICAgICAqICAgIGhhdmUgbm90IGNoYW5nZWQsIGFrYSBhIHJlbG9hZCBvZiB0aGUgc2FtZSBzdGF0ZS4gSXQgZGlmZmVycyBmcm9tIHJlbG9hZE9uU2VhcmNoIGJlY2F1c2UgeW91J2RcclxuICAgICAqICAgIHVzZSB0aGlzIHdoZW4geW91IHdhbnQgdG8gZm9yY2UgYSByZWxvYWQgd2hlbiAqZXZlcnl0aGluZyogaXMgdGhlIHNhbWUsIGluY2x1ZGluZyBzZWFyY2ggcGFyYW1zLlxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtwcm9taXNlfSBBIHByb21pc2UgcmVwcmVzZW50aW5nIHRoZSBzdGF0ZSBvZiB0aGUgbmV3IHRyYW5zaXRpb24uXHJcbiAgICAgKlxyXG4gICAgICogUG9zc2libGUgc3VjY2VzcyB2YWx1ZXM6XHJcbiAgICAgKlxyXG4gICAgICogLSAkc3RhdGUuY3VycmVudFxyXG4gICAgICpcclxuICAgICAqIDxici8+UG9zc2libGUgcmVqZWN0aW9uIHZhbHVlczpcclxuICAgICAqXHJcbiAgICAgKiAtICd0cmFuc2l0aW9uIHN1cGVyc2VkZWQnIC0gd2hlbiBhIG5ld2VyIHRyYW5zaXRpb24gaGFzIGJlZW4gc3RhcnRlZCBhZnRlciB0aGlzIG9uZVxyXG4gICAgICogLSAndHJhbnNpdGlvbiBwcmV2ZW50ZWQnIC0gd2hlbiBgZXZlbnQucHJldmVudERlZmF1bHQoKWAgaGFzIGJlZW4gY2FsbGVkIGluIGEgYCRzdGF0ZUNoYW5nZVN0YXJ0YCBsaXN0ZW5lclxyXG4gICAgICogLSAndHJhbnNpdGlvbiBhYm9ydGVkJyAtIHdoZW4gYGV2ZW50LnByZXZlbnREZWZhdWx0KClgIGhhcyBiZWVuIGNhbGxlZCBpbiBhIGAkc3RhdGVOb3RGb3VuZGAgbGlzdGVuZXIgb3JcclxuICAgICAqICAgd2hlbiBhIGAkc3RhdGVOb3RGb3VuZGAgYGV2ZW50LnJldHJ5YCBwcm9taXNlIGVycm9ycy5cclxuICAgICAqIC0gJ3RyYW5zaXRpb24gZmFpbGVkJyAtIHdoZW4gYSBzdGF0ZSBoYXMgYmVlbiB1bnN1Y2Nlc3NmdWxseSBmb3VuZCBhZnRlciAyIHRyaWVzLlxyXG4gICAgICogLSAqcmVzb2x2ZSBlcnJvciogLSB3aGVuIGFuIGVycm9yIGhhcyBvY2N1cnJlZCB3aXRoIGEgYHJlc29sdmVgXHJcbiAgICAgKlxyXG4gICAgICovXHJcbiAgICAkc3RhdGUuZ28gPSBmdW5jdGlvbiBnbyh0bywgcGFyYW1zLCBvcHRpb25zKSB7XHJcbiAgICAgIHJldHVybiAkc3RhdGUudHJhbnNpdGlvblRvKHRvLCBwYXJhbXMsIGV4dGVuZCh7IGluaGVyaXQ6IHRydWUsIHJlbGF0aXZlOiAkc3RhdGUuJGN1cnJlbnQgfSwgb3B0aW9ucykpO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEBuZ2RvYyBmdW5jdGlvblxyXG4gICAgICogQG5hbWUgdWkucm91dGVyLnN0YXRlLiRzdGF0ZSN0cmFuc2l0aW9uVG9cclxuICAgICAqIEBtZXRob2RPZiB1aS5yb3V0ZXIuc3RhdGUuJHN0YXRlXHJcbiAgICAgKlxyXG4gICAgICogQGRlc2NyaXB0aW9uXHJcbiAgICAgKiBMb3ctbGV2ZWwgbWV0aG9kIGZvciB0cmFuc2l0aW9uaW5nIHRvIGEgbmV3IHN0YXRlLiB7QGxpbmsgdWkucm91dGVyLnN0YXRlLiRzdGF0ZSNtZXRob2RzX2dvICRzdGF0ZS5nb31cclxuICAgICAqIHVzZXMgYHRyYW5zaXRpb25Ub2AgaW50ZXJuYWxseS4gYCRzdGF0ZS5nb2AgaXMgcmVjb21tZW5kZWQgaW4gbW9zdCBzaXR1YXRpb25zLlxyXG4gICAgICpcclxuICAgICAqIEBleGFtcGxlXHJcbiAgICAgKiA8cHJlPlxyXG4gICAgICogdmFyIGFwcCA9IGFuZ3VsYXIubW9kdWxlKCdhcHAnLCBbJ3VpLnJvdXRlciddKTtcclxuICAgICAqXHJcbiAgICAgKiBhcHAuY29udHJvbGxlcignY3RybCcsIGZ1bmN0aW9uICgkc2NvcGUsICRzdGF0ZSkge1xyXG4gICAgICogICAkc2NvcGUuY2hhbmdlU3RhdGUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgKiAgICAgJHN0YXRlLnRyYW5zaXRpb25UbygnY29udGFjdC5kZXRhaWwnKTtcclxuICAgICAqICAgfTtcclxuICAgICAqIH0pO1xyXG4gICAgICogPC9wcmU+XHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHRvIFN0YXRlIG5hbWUuXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdD19IHRvUGFyYW1zIEEgbWFwIG9mIHRoZSBwYXJhbWV0ZXJzIHRoYXQgd2lsbCBiZSBzZW50IHRvIHRoZSBzdGF0ZSxcclxuICAgICAqIHdpbGwgcG9wdWxhdGUgJHN0YXRlUGFyYW1zLlxyXG4gICAgICogQHBhcmFtIHtvYmplY3Q9fSBvcHRpb25zIE9wdGlvbnMgb2JqZWN0LiBUaGUgb3B0aW9ucyBhcmU6XHJcbiAgICAgKlxyXG4gICAgICogLSAqKmBsb2NhdGlvbmAqKiAtIHtib29sZWFuPXRydWV8c3RyaW5nPX0gLSBJZiBgdHJ1ZWAgd2lsbCB1cGRhdGUgdGhlIHVybCBpbiB0aGUgbG9jYXRpb24gYmFyLCBpZiBgZmFsc2VgXHJcbiAgICAgKiAgICB3aWxsIG5vdC4gSWYgc3RyaW5nLCBtdXN0IGJlIGBcInJlcGxhY2VcImAsIHdoaWNoIHdpbGwgdXBkYXRlIHVybCBhbmQgYWxzbyByZXBsYWNlIGxhc3QgaGlzdG9yeSByZWNvcmQuXHJcbiAgICAgKiAtICoqYGluaGVyaXRgKiogLSB7Ym9vbGVhbj1mYWxzZX0sIElmIGB0cnVlYCB3aWxsIGluaGVyaXQgdXJsIHBhcmFtZXRlcnMgZnJvbSBjdXJyZW50IHVybC5cclxuICAgICAqIC0gKipgcmVsYXRpdmVgKiogLSB7b2JqZWN0PX0sIFdoZW4gdHJhbnNpdGlvbmluZyB3aXRoIHJlbGF0aXZlIHBhdGggKGUuZyAnXicpLCBcclxuICAgICAqICAgIGRlZmluZXMgd2hpY2ggc3RhdGUgdG8gYmUgcmVsYXRpdmUgZnJvbS5cclxuICAgICAqIC0gKipgbm90aWZ5YCoqIC0ge2Jvb2xlYW49dHJ1ZX0sIElmIGB0cnVlYCB3aWxsIGJyb2FkY2FzdCAkc3RhdGVDaGFuZ2VTdGFydCBhbmQgJHN0YXRlQ2hhbmdlU3VjY2VzcyBldmVudHMuXHJcbiAgICAgKiAtICoqYHJlbG9hZGAqKiAodjAuMi41KSAtIHtib29sZWFuPWZhbHNlfHN0cmluZz18b2JqZWN0PX0sIElmIGB0cnVlYCB3aWxsIGZvcmNlIHRyYW5zaXRpb24gZXZlbiBpZiB0aGUgc3RhdGUgb3IgcGFyYW1zIFxyXG4gICAgICogICAgaGF2ZSBub3QgY2hhbmdlZCwgYWthIGEgcmVsb2FkIG9mIHRoZSBzYW1lIHN0YXRlLiBJdCBkaWZmZXJzIGZyb20gcmVsb2FkT25TZWFyY2ggYmVjYXVzZSB5b3UnZFxyXG4gICAgICogICAgdXNlIHRoaXMgd2hlbiB5b3Ugd2FudCB0byBmb3JjZSBhIHJlbG9hZCB3aGVuICpldmVyeXRoaW5nKiBpcyB0aGUgc2FtZSwgaW5jbHVkaW5nIHNlYXJjaCBwYXJhbXMuXHJcbiAgICAgKiAgICBpZiBTdHJpbmcsIHRoZW4gd2lsbCByZWxvYWQgdGhlIHN0YXRlIHdpdGggdGhlIG5hbWUgZ2l2ZW4gaW4gcmVsb2FkLCBhbmQgYW55IGNoaWxkcmVuLlxyXG4gICAgICogICAgaWYgT2JqZWN0LCB0aGVuIGEgc3RhdGVPYmogaXMgZXhwZWN0ZWQsIHdpbGwgcmVsb2FkIHRoZSBzdGF0ZSBmb3VuZCBpbiBzdGF0ZU9iaiwgYW5kIGFueSBjaGhpbGRyZW4uXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge3Byb21pc2V9IEEgcHJvbWlzZSByZXByZXNlbnRpbmcgdGhlIHN0YXRlIG9mIHRoZSBuZXcgdHJhbnNpdGlvbi4gU2VlXHJcbiAgICAgKiB7QGxpbmsgdWkucm91dGVyLnN0YXRlLiRzdGF0ZSNtZXRob2RzX2dvICRzdGF0ZS5nb30uXHJcbiAgICAgKi9cclxuICAgICRzdGF0ZS50cmFuc2l0aW9uVG8gPSBmdW5jdGlvbiB0cmFuc2l0aW9uVG8odG8sIHRvUGFyYW1zLCBvcHRpb25zKSB7XHJcbiAgICAgIHRvUGFyYW1zID0gdG9QYXJhbXMgfHwge307XHJcbiAgICAgIG9wdGlvbnMgPSBleHRlbmQoe1xyXG4gICAgICAgIGxvY2F0aW9uOiB0cnVlLCBpbmhlcml0OiBmYWxzZSwgcmVsYXRpdmU6IG51bGwsIG5vdGlmeTogdHJ1ZSwgcmVsb2FkOiBmYWxzZSwgJHJldHJ5OiBmYWxzZVxyXG4gICAgICB9LCBvcHRpb25zIHx8IHt9KTtcclxuXHJcbiAgICAgIHZhciBmcm9tID0gJHN0YXRlLiRjdXJyZW50LCBmcm9tUGFyYW1zID0gJHN0YXRlLnBhcmFtcywgZnJvbVBhdGggPSBmcm9tLnBhdGg7XHJcbiAgICAgIHZhciBldnQsIHRvU3RhdGUgPSBmaW5kU3RhdGUodG8sIG9wdGlvbnMucmVsYXRpdmUpO1xyXG5cclxuICAgICAgaWYgKCFpc0RlZmluZWQodG9TdGF0ZSkpIHtcclxuICAgICAgICB2YXIgcmVkaXJlY3QgPSB7IHRvOiB0bywgdG9QYXJhbXM6IHRvUGFyYW1zLCBvcHRpb25zOiBvcHRpb25zIH07XHJcbiAgICAgICAgdmFyIHJlZGlyZWN0UmVzdWx0ID0gaGFuZGxlUmVkaXJlY3QocmVkaXJlY3QsIGZyb20uc2VsZiwgZnJvbVBhcmFtcywgb3B0aW9ucyk7XHJcblxyXG4gICAgICAgIGlmIChyZWRpcmVjdFJlc3VsdCkge1xyXG4gICAgICAgICAgcmV0dXJuIHJlZGlyZWN0UmVzdWx0O1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQWx3YXlzIHJldHJ5IG9uY2UgaWYgdGhlICRzdGF0ZU5vdEZvdW5kIHdhcyBub3QgcHJldmVudGVkXHJcbiAgICAgICAgLy8gKGhhbmRsZXMgZWl0aGVyIHJlZGlyZWN0IGNoYW5nZWQgb3Igc3RhdGUgbGF6eS1kZWZpbml0aW9uKVxyXG4gICAgICAgIHRvID0gcmVkaXJlY3QudG87XHJcbiAgICAgICAgdG9QYXJhbXMgPSByZWRpcmVjdC50b1BhcmFtcztcclxuICAgICAgICBvcHRpb25zID0gcmVkaXJlY3Qub3B0aW9ucztcclxuICAgICAgICB0b1N0YXRlID0gZmluZFN0YXRlKHRvLCBvcHRpb25zLnJlbGF0aXZlKTtcclxuXHJcbiAgICAgICAgaWYgKCFpc0RlZmluZWQodG9TdGF0ZSkpIHtcclxuICAgICAgICAgIGlmICghb3B0aW9ucy5yZWxhdGl2ZSkgdGhyb3cgbmV3IEVycm9yKFwiTm8gc3VjaCBzdGF0ZSAnXCIgKyB0byArIFwiJ1wiKTtcclxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNvdWxkIG5vdCByZXNvbHZlICdcIiArIHRvICsgXCInIGZyb20gc3RhdGUgJ1wiICsgb3B0aW9ucy5yZWxhdGl2ZSArIFwiJ1wiKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgaWYgKHRvU3RhdGVbYWJzdHJhY3RLZXldKSB0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgdHJhbnNpdGlvbiB0byBhYnN0cmFjdCBzdGF0ZSAnXCIgKyB0byArIFwiJ1wiKTtcclxuICAgICAgaWYgKG9wdGlvbnMuaW5oZXJpdCkgdG9QYXJhbXMgPSBpbmhlcml0UGFyYW1zKCRzdGF0ZVBhcmFtcywgdG9QYXJhbXMgfHwge30sICRzdGF0ZS4kY3VycmVudCwgdG9TdGF0ZSk7XHJcbiAgICAgIGlmICghdG9TdGF0ZS5wYXJhbXMuJCR2YWxpZGF0ZXModG9QYXJhbXMpKSByZXR1cm4gVHJhbnNpdGlvbkZhaWxlZDtcclxuXHJcbiAgICAgIHRvUGFyYW1zID0gdG9TdGF0ZS5wYXJhbXMuJCR2YWx1ZXModG9QYXJhbXMpO1xyXG4gICAgICB0byA9IHRvU3RhdGU7XHJcblxyXG4gICAgICB2YXIgdG9QYXRoID0gdG8ucGF0aDtcclxuXHJcbiAgICAgIC8vIFN0YXJ0aW5nIGZyb20gdGhlIHJvb3Qgb2YgdGhlIHBhdGgsIGtlZXAgYWxsIGxldmVscyB0aGF0IGhhdmVuJ3QgY2hhbmdlZFxyXG4gICAgICB2YXIga2VlcCA9IDAsIHN0YXRlID0gdG9QYXRoW2tlZXBdLCBsb2NhbHMgPSByb290LmxvY2FscywgdG9Mb2NhbHMgPSBbXTtcclxuICAgICAgdmFyIHNraXBUcmlnZ2VyUmVsb2FkQ2hlY2sgPSBmYWxzZTtcclxuXHJcbiAgICAgIGlmICghb3B0aW9ucy5yZWxvYWQpIHtcclxuICAgICAgICB3aGlsZSAoc3RhdGUgJiYgc3RhdGUgPT09IGZyb21QYXRoW2tlZXBdICYmIHN0YXRlLm93blBhcmFtcy4kJGVxdWFscyh0b1BhcmFtcywgZnJvbVBhcmFtcykpIHtcclxuICAgICAgICAgIGxvY2FscyA9IHRvTG9jYWxzW2tlZXBdID0gc3RhdGUubG9jYWxzO1xyXG4gICAgICAgICAga2VlcCsrO1xyXG4gICAgICAgICAgc3RhdGUgPSB0b1BhdGhba2VlcF07XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2UgaWYgKGlzU3RyaW5nKG9wdGlvbnMucmVsb2FkKSB8fCBpc09iamVjdChvcHRpb25zLnJlbG9hZCkpIHtcclxuICAgICAgICBpZiAoaXNPYmplY3Qob3B0aW9ucy5yZWxvYWQpICYmICFvcHRpb25zLnJlbG9hZC5uYW1lKSB7XHJcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgcmVsb2FkIHN0YXRlIG9iamVjdCcpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBcclxuICAgICAgICB2YXIgcmVsb2FkU3RhdGUgPSBvcHRpb25zLnJlbG9hZCA9PT0gdHJ1ZSA/IGZyb21QYXRoWzBdIDogZmluZFN0YXRlKG9wdGlvbnMucmVsb2FkKTtcclxuICAgICAgICBpZiAob3B0aW9ucy5yZWxvYWQgJiYgIXJlbG9hZFN0YXRlKSB7XHJcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJObyBzdWNoIHJlbG9hZCBzdGF0ZSAnXCIgKyAoaXNTdHJpbmcob3B0aW9ucy5yZWxvYWQpID8gb3B0aW9ucy5yZWxvYWQgOiBvcHRpb25zLnJlbG9hZC5uYW1lKSArIFwiJ1wiKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHNraXBUcmlnZ2VyUmVsb2FkQ2hlY2sgPSB0cnVlO1xyXG4gXHJcbiAgICAgICAgd2hpbGUgKHN0YXRlICYmIHN0YXRlID09PSBmcm9tUGF0aFtrZWVwXSAmJiBzdGF0ZSAhPT0gcmVsb2FkU3RhdGUpIHtcclxuICAgICAgICAgIGxvY2FscyA9IHRvTG9jYWxzW2tlZXBdID0gc3RhdGUubG9jYWxzO1xyXG4gICAgICAgICAga2VlcCsrO1xyXG4gICAgICAgICAgc3RhdGUgPSB0b1BhdGhba2VlcF07XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBJZiB3ZSdyZSBnb2luZyB0byB0aGUgc2FtZSBzdGF0ZSBhbmQgYWxsIGxvY2FscyBhcmUga2VwdCwgd2UndmUgZ290IG5vdGhpbmcgdG8gZG8uXHJcbiAgICAgIC8vIEJ1dCBjbGVhciAndHJhbnNpdGlvbicsIGFzIHdlIHN0aWxsIHdhbnQgdG8gY2FuY2VsIGFueSBvdGhlciBwZW5kaW5nIHRyYW5zaXRpb25zLlxyXG4gICAgICAvLyBUT0RPOiBXZSBtYXkgbm90IHdhbnQgdG8gYnVtcCAndHJhbnNpdGlvbicgaWYgd2UncmUgY2FsbGVkIGZyb20gYSBsb2NhdGlvbiBjaGFuZ2VcclxuICAgICAgLy8gdGhhdCB3ZSd2ZSBpbml0aWF0ZWQgb3Vyc2VsdmVzLCBiZWNhdXNlIHdlIG1pZ2h0IGFjY2lkZW50YWxseSBhYm9ydCBhIGxlZ2l0aW1hdGVcclxuICAgICAgLy8gdHJhbnNpdGlvbiBpbml0aWF0ZWQgZnJvbSBjb2RlP1xyXG4gICAgICBpZiAoIXNraXBUcmlnZ2VyUmVsb2FkQ2hlY2sgJiYgc2hvdWxkVHJpZ2dlclJlbG9hZCh0bywgZnJvbSwgbG9jYWxzLCBvcHRpb25zKSkge1xyXG4gICAgICAgIGlmICh0by5zZWxmLnJlbG9hZE9uU2VhcmNoICE9PSBmYWxzZSkgJHVybFJvdXRlci51cGRhdGUoKTtcclxuICAgICAgICAkc3RhdGUudHJhbnNpdGlvbiA9IG51bGw7XHJcbiAgICAgICAgcmV0dXJuICRxLndoZW4oJHN0YXRlLmN1cnJlbnQpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBGaWx0ZXIgcGFyYW1ldGVycyBiZWZvcmUgd2UgcGFzcyB0aGVtIHRvIGV2ZW50IGhhbmRsZXJzIGV0Yy5cclxuICAgICAgdG9QYXJhbXMgPSBmaWx0ZXJCeUtleXModG8ucGFyYW1zLiQka2V5cygpLCB0b1BhcmFtcyB8fCB7fSk7XHJcblxyXG4gICAgICAvLyBCcm9hZGNhc3Qgc3RhcnQgZXZlbnQgYW5kIGNhbmNlbCB0aGUgdHJhbnNpdGlvbiBpZiByZXF1ZXN0ZWRcclxuICAgICAgaWYgKG9wdGlvbnMubm90aWZ5KSB7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQG5nZG9jIGV2ZW50XHJcbiAgICAgICAgICogQG5hbWUgdWkucm91dGVyLnN0YXRlLiRzdGF0ZSMkc3RhdGVDaGFuZ2VTdGFydFxyXG4gICAgICAgICAqIEBldmVudE9mIHVpLnJvdXRlci5zdGF0ZS4kc3RhdGVcclxuICAgICAgICAgKiBAZXZlbnRUeXBlIGJyb2FkY2FzdCBvbiByb290IHNjb3BlXHJcbiAgICAgICAgICogQGRlc2NyaXB0aW9uXHJcbiAgICAgICAgICogRmlyZWQgd2hlbiB0aGUgc3RhdGUgdHJhbnNpdGlvbiAqKmJlZ2lucyoqLiBZb3UgY2FuIHVzZSBgZXZlbnQucHJldmVudERlZmF1bHQoKWBcclxuICAgICAgICAgKiB0byBwcmV2ZW50IHRoZSB0cmFuc2l0aW9uIGZyb20gaGFwcGVuaW5nIGFuZCB0aGVuIHRoZSB0cmFuc2l0aW9uIHByb21pc2Ugd2lsbCBiZVxyXG4gICAgICAgICAqIHJlamVjdGVkIHdpdGggYSBgJ3RyYW5zaXRpb24gcHJldmVudGVkJ2AgdmFsdWUuXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gZXZlbnQgRXZlbnQgb2JqZWN0LlxyXG4gICAgICAgICAqIEBwYXJhbSB7U3RhdGV9IHRvU3RhdGUgVGhlIHN0YXRlIGJlaW5nIHRyYW5zaXRpb25lZCB0by5cclxuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gdG9QYXJhbXMgVGhlIHBhcmFtcyBzdXBwbGllZCB0byB0aGUgYHRvU3RhdGVgLlxyXG4gICAgICAgICAqIEBwYXJhbSB7U3RhdGV9IGZyb21TdGF0ZSBUaGUgY3VycmVudCBzdGF0ZSwgcHJlLXRyYW5zaXRpb24uXHJcbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IGZyb21QYXJhbXMgVGhlIHBhcmFtcyBzdXBwbGllZCB0byB0aGUgYGZyb21TdGF0ZWAuXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBAZXhhbXBsZVxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogPHByZT5cclxuICAgICAgICAgKiAkcm9vdFNjb3BlLiRvbignJHN0YXRlQ2hhbmdlU3RhcnQnLFxyXG4gICAgICAgICAqIGZ1bmN0aW9uKGV2ZW50LCB0b1N0YXRlLCB0b1BhcmFtcywgZnJvbVN0YXRlLCBmcm9tUGFyYW1zKXtcclxuICAgICAgICAgKiAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgKiAgICAgLy8gdHJhbnNpdGlvblRvKCkgcHJvbWlzZSB3aWxsIGJlIHJlamVjdGVkIHdpdGhcclxuICAgICAgICAgKiAgICAgLy8gYSAndHJhbnNpdGlvbiBwcmV2ZW50ZWQnIGVycm9yXHJcbiAgICAgICAgICogfSlcclxuICAgICAgICAgKiA8L3ByZT5cclxuICAgICAgICAgKi9cclxuICAgICAgICBpZiAoJHJvb3RTY29wZS4kYnJvYWRjYXN0KCckc3RhdGVDaGFuZ2VTdGFydCcsIHRvLnNlbGYsIHRvUGFyYW1zLCBmcm9tLnNlbGYsIGZyb21QYXJhbXMpLmRlZmF1bHRQcmV2ZW50ZWQpIHtcclxuICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnJHN0YXRlQ2hhbmdlQ2FuY2VsJywgdG8uc2VsZiwgdG9QYXJhbXMsIGZyb20uc2VsZiwgZnJvbVBhcmFtcyk7XHJcbiAgICAgICAgICAkdXJsUm91dGVyLnVwZGF0ZSgpO1xyXG4gICAgICAgICAgcmV0dXJuIFRyYW5zaXRpb25QcmV2ZW50ZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBSZXNvbHZlIGxvY2FscyBmb3IgdGhlIHJlbWFpbmluZyBzdGF0ZXMsIGJ1dCBkb24ndCB1cGRhdGUgYW55IGdsb2JhbCBzdGF0ZSBqdXN0XHJcbiAgICAgIC8vIHlldCAtLSBpZiBhbnl0aGluZyBmYWlscyB0byByZXNvbHZlIHRoZSBjdXJyZW50IHN0YXRlIG5lZWRzIHRvIHJlbWFpbiB1bnRvdWNoZWQuXHJcbiAgICAgIC8vIFdlIGFsc28gc2V0IHVwIGFuIGluaGVyaXRhbmNlIGNoYWluIGZvciB0aGUgbG9jYWxzIGhlcmUuIFRoaXMgYWxsb3dzIHRoZSB2aWV3IGRpcmVjdGl2ZVxyXG4gICAgICAvLyB0byBxdWlja2x5IGxvb2sgdXAgdGhlIGNvcnJlY3QgZGVmaW5pdGlvbiBmb3IgZWFjaCB2aWV3IGluIHRoZSBjdXJyZW50IHN0YXRlLiBFdmVuXHJcbiAgICAgIC8vIHRob3VnaCB3ZSBjcmVhdGUgdGhlIGxvY2FscyBvYmplY3QgaXRzZWxmIG91dHNpZGUgcmVzb2x2ZVN0YXRlKCksIGl0IGlzIGluaXRpYWxseVxyXG4gICAgICAvLyBlbXB0eSBhbmQgZ2V0cyBmaWxsZWQgYXN5bmNocm9ub3VzbHkuIFdlIG5lZWQgdG8ga2VlcCB0cmFjayBvZiB0aGUgcHJvbWlzZSBmb3IgdGhlXHJcbiAgICAgIC8vIChmdWxseSByZXNvbHZlZCkgY3VycmVudCBsb2NhbHMsIGFuZCBwYXNzIHRoaXMgZG93biB0aGUgY2hhaW4uXHJcbiAgICAgIHZhciByZXNvbHZlZCA9ICRxLndoZW4obG9jYWxzKTtcclxuXHJcbiAgICAgIGZvciAodmFyIGwgPSBrZWVwOyBsIDwgdG9QYXRoLmxlbmd0aDsgbCsrLCBzdGF0ZSA9IHRvUGF0aFtsXSkge1xyXG4gICAgICAgIGxvY2FscyA9IHRvTG9jYWxzW2xdID0gaW5oZXJpdChsb2NhbHMpO1xyXG4gICAgICAgIHJlc29sdmVkID0gcmVzb2x2ZVN0YXRlKHN0YXRlLCB0b1BhcmFtcywgc3RhdGUgPT09IHRvLCByZXNvbHZlZCwgbG9jYWxzLCBvcHRpb25zKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gT25jZSBldmVyeXRoaW5nIGlzIHJlc29sdmVkLCB3ZSBhcmUgcmVhZHkgdG8gcGVyZm9ybSB0aGUgYWN0dWFsIHRyYW5zaXRpb25cclxuICAgICAgLy8gYW5kIHJldHVybiBhIHByb21pc2UgZm9yIHRoZSBuZXcgc3RhdGUuIFdlIGFsc28ga2VlcCB0cmFjayBvZiB3aGF0IHRoZVxyXG4gICAgICAvLyBjdXJyZW50IHByb21pc2UgaXMsIHNvIHRoYXQgd2UgY2FuIGRldGVjdCBvdmVybGFwcGluZyB0cmFuc2l0aW9ucyBhbmRcclxuICAgICAgLy8ga2VlcCBvbmx5IHRoZSBvdXRjb21lIG9mIHRoZSBsYXN0IHRyYW5zaXRpb24uXHJcbiAgICAgIHZhciB0cmFuc2l0aW9uID0gJHN0YXRlLnRyYW5zaXRpb24gPSByZXNvbHZlZC50aGVuKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgbCwgZW50ZXJpbmcsIGV4aXRpbmc7XHJcblxyXG4gICAgICAgIGlmICgkc3RhdGUudHJhbnNpdGlvbiAhPT0gdHJhbnNpdGlvbikgcmV0dXJuIFRyYW5zaXRpb25TdXBlcnNlZGVkO1xyXG5cclxuICAgICAgICAvLyBFeGl0ICdmcm9tJyBzdGF0ZXMgbm90IGtlcHRcclxuICAgICAgICBmb3IgKGwgPSBmcm9tUGF0aC5sZW5ndGggLSAxOyBsID49IGtlZXA7IGwtLSkge1xyXG4gICAgICAgICAgZXhpdGluZyA9IGZyb21QYXRoW2xdO1xyXG4gICAgICAgICAgaWYgKGV4aXRpbmcuc2VsZi5vbkV4aXQpIHtcclxuICAgICAgICAgICAgJGluamVjdG9yLmludm9rZShleGl0aW5nLnNlbGYub25FeGl0LCBleGl0aW5nLnNlbGYsIGV4aXRpbmcubG9jYWxzLmdsb2JhbHMpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZXhpdGluZy5sb2NhbHMgPSBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gRW50ZXIgJ3RvJyBzdGF0ZXMgbm90IGtlcHRcclxuICAgICAgICBmb3IgKGwgPSBrZWVwOyBsIDwgdG9QYXRoLmxlbmd0aDsgbCsrKSB7XHJcbiAgICAgICAgICBlbnRlcmluZyA9IHRvUGF0aFtsXTtcclxuICAgICAgICAgIGVudGVyaW5nLmxvY2FscyA9IHRvTG9jYWxzW2xdO1xyXG4gICAgICAgICAgaWYgKGVudGVyaW5nLnNlbGYub25FbnRlcikge1xyXG4gICAgICAgICAgICAkaW5qZWN0b3IuaW52b2tlKGVudGVyaW5nLnNlbGYub25FbnRlciwgZW50ZXJpbmcuc2VsZiwgZW50ZXJpbmcubG9jYWxzLmdsb2JhbHMpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gUnVuIGl0IGFnYWluLCB0byBjYXRjaCBhbnkgdHJhbnNpdGlvbnMgaW4gY2FsbGJhY2tzXHJcbiAgICAgICAgaWYgKCRzdGF0ZS50cmFuc2l0aW9uICE9PSB0cmFuc2l0aW9uKSByZXR1cm4gVHJhbnNpdGlvblN1cGVyc2VkZWQ7XHJcblxyXG4gICAgICAgIC8vIFVwZGF0ZSBnbG9iYWxzIGluICRzdGF0ZVxyXG4gICAgICAgICRzdGF0ZS4kY3VycmVudCA9IHRvO1xyXG4gICAgICAgICRzdGF0ZS5jdXJyZW50ID0gdG8uc2VsZjtcclxuICAgICAgICAkc3RhdGUucGFyYW1zID0gdG9QYXJhbXM7XHJcbiAgICAgICAgY29weSgkc3RhdGUucGFyYW1zLCAkc3RhdGVQYXJhbXMpO1xyXG4gICAgICAgICRzdGF0ZS50cmFuc2l0aW9uID0gbnVsbDtcclxuXHJcbiAgICAgICAgaWYgKG9wdGlvbnMubG9jYXRpb24gJiYgdG8ubmF2aWdhYmxlKSB7XHJcbiAgICAgICAgICAkdXJsUm91dGVyLnB1c2godG8ubmF2aWdhYmxlLnVybCwgdG8ubmF2aWdhYmxlLmxvY2Fscy5nbG9iYWxzLiRzdGF0ZVBhcmFtcywge1xyXG4gICAgICAgICAgICAkJGF2b2lkUmVzeW5jOiB0cnVlLCByZXBsYWNlOiBvcHRpb25zLmxvY2F0aW9uID09PSAncmVwbGFjZSdcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKG9wdGlvbnMubm90aWZ5KSB7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogQG5nZG9jIGV2ZW50XHJcbiAgICAgICAgICogQG5hbWUgdWkucm91dGVyLnN0YXRlLiRzdGF0ZSMkc3RhdGVDaGFuZ2VTdWNjZXNzXHJcbiAgICAgICAgICogQGV2ZW50T2YgdWkucm91dGVyLnN0YXRlLiRzdGF0ZVxyXG4gICAgICAgICAqIEBldmVudFR5cGUgYnJvYWRjYXN0IG9uIHJvb3Qgc2NvcGVcclxuICAgICAgICAgKiBAZGVzY3JpcHRpb25cclxuICAgICAgICAgKiBGaXJlZCBvbmNlIHRoZSBzdGF0ZSB0cmFuc2l0aW9uIGlzICoqY29tcGxldGUqKi5cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBldmVudCBFdmVudCBvYmplY3QuXHJcbiAgICAgICAgICogQHBhcmFtIHtTdGF0ZX0gdG9TdGF0ZSBUaGUgc3RhdGUgYmVpbmcgdHJhbnNpdGlvbmVkIHRvLlxyXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSB0b1BhcmFtcyBUaGUgcGFyYW1zIHN1cHBsaWVkIHRvIHRoZSBgdG9TdGF0ZWAuXHJcbiAgICAgICAgICogQHBhcmFtIHtTdGF0ZX0gZnJvbVN0YXRlIFRoZSBjdXJyZW50IHN0YXRlLCBwcmUtdHJhbnNpdGlvbi5cclxuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gZnJvbVBhcmFtcyBUaGUgcGFyYW1zIHN1cHBsaWVkIHRvIHRoZSBgZnJvbVN0YXRlYC5cclxuICAgICAgICAgKi9cclxuICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnJHN0YXRlQ2hhbmdlU3VjY2VzcycsIHRvLnNlbGYsIHRvUGFyYW1zLCBmcm9tLnNlbGYsIGZyb21QYXJhbXMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAkdXJsUm91dGVyLnVwZGF0ZSh0cnVlKTtcclxuXHJcbiAgICAgICAgcmV0dXJuICRzdGF0ZS5jdXJyZW50O1xyXG4gICAgICB9LCBmdW5jdGlvbiAoZXJyb3IpIHtcclxuICAgICAgICBpZiAoJHN0YXRlLnRyYW5zaXRpb24gIT09IHRyYW5zaXRpb24pIHJldHVybiBUcmFuc2l0aW9uU3VwZXJzZWRlZDtcclxuXHJcbiAgICAgICAgJHN0YXRlLnRyYW5zaXRpb24gPSBudWxsO1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIEBuZ2RvYyBldmVudFxyXG4gICAgICAgICAqIEBuYW1lIHVpLnJvdXRlci5zdGF0ZS4kc3RhdGUjJHN0YXRlQ2hhbmdlRXJyb3JcclxuICAgICAgICAgKiBAZXZlbnRPZiB1aS5yb3V0ZXIuc3RhdGUuJHN0YXRlXHJcbiAgICAgICAgICogQGV2ZW50VHlwZSBicm9hZGNhc3Qgb24gcm9vdCBzY29wZVxyXG4gICAgICAgICAqIEBkZXNjcmlwdGlvblxyXG4gICAgICAgICAqIEZpcmVkIHdoZW4gYW4gKiplcnJvciBvY2N1cnMqKiBkdXJpbmcgdHJhbnNpdGlvbi4gSXQncyBpbXBvcnRhbnQgdG8gbm90ZSB0aGF0IGlmIHlvdVxyXG4gICAgICAgICAqIGhhdmUgYW55IGVycm9ycyBpbiB5b3VyIHJlc29sdmUgZnVuY3Rpb25zIChqYXZhc2NyaXB0IGVycm9ycywgbm9uLWV4aXN0ZW50IHNlcnZpY2VzLCBldGMpXHJcbiAgICAgICAgICogdGhleSB3aWxsIG5vdCB0aHJvdyB0cmFkaXRpb25hbGx5LiBZb3UgbXVzdCBsaXN0ZW4gZm9yIHRoaXMgJHN0YXRlQ2hhbmdlRXJyb3IgZXZlbnQgdG9cclxuICAgICAgICAgKiBjYXRjaCAqKkFMTCoqIGVycm9ycy5cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBldmVudCBFdmVudCBvYmplY3QuXHJcbiAgICAgICAgICogQHBhcmFtIHtTdGF0ZX0gdG9TdGF0ZSBUaGUgc3RhdGUgYmVpbmcgdHJhbnNpdGlvbmVkIHRvLlxyXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSB0b1BhcmFtcyBUaGUgcGFyYW1zIHN1cHBsaWVkIHRvIHRoZSBgdG9TdGF0ZWAuXHJcbiAgICAgICAgICogQHBhcmFtIHtTdGF0ZX0gZnJvbVN0YXRlIFRoZSBjdXJyZW50IHN0YXRlLCBwcmUtdHJhbnNpdGlvbi5cclxuICAgICAgICAgKiBAcGFyYW0ge09iamVjdH0gZnJvbVBhcmFtcyBUaGUgcGFyYW1zIHN1cHBsaWVkIHRvIHRoZSBgZnJvbVN0YXRlYC5cclxuICAgICAgICAgKiBAcGFyYW0ge0Vycm9yfSBlcnJvciBUaGUgcmVzb2x2ZSBlcnJvciBvYmplY3QuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZXZ0ID0gJHJvb3RTY29wZS4kYnJvYWRjYXN0KCckc3RhdGVDaGFuZ2VFcnJvcicsIHRvLnNlbGYsIHRvUGFyYW1zLCBmcm9tLnNlbGYsIGZyb21QYXJhbXMsIGVycm9yKTtcclxuXHJcbiAgICAgICAgaWYgKCFldnQuZGVmYXVsdFByZXZlbnRlZCkge1xyXG4gICAgICAgICAgICAkdXJsUm91dGVyLnVwZGF0ZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuICRxLnJlamVjdChlcnJvcik7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgcmV0dXJuIHRyYW5zaXRpb247XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQG5nZG9jIGZ1bmN0aW9uXHJcbiAgICAgKiBAbmFtZSB1aS5yb3V0ZXIuc3RhdGUuJHN0YXRlI2lzXHJcbiAgICAgKiBAbWV0aG9kT2YgdWkucm91dGVyLnN0YXRlLiRzdGF0ZVxyXG4gICAgICpcclxuICAgICAqIEBkZXNjcmlwdGlvblxyXG4gICAgICogU2ltaWxhciB0byB7QGxpbmsgdWkucm91dGVyLnN0YXRlLiRzdGF0ZSNtZXRob2RzX2luY2x1ZGVzICRzdGF0ZS5pbmNsdWRlc30sXHJcbiAgICAgKiBidXQgb25seSBjaGVja3MgZm9yIHRoZSBmdWxsIHN0YXRlIG5hbWUuIElmIHBhcmFtcyBpcyBzdXBwbGllZCB0aGVuIGl0IHdpbGwgYmVcclxuICAgICAqIHRlc3RlZCBmb3Igc3RyaWN0IGVxdWFsaXR5IGFnYWluc3QgdGhlIGN1cnJlbnQgYWN0aXZlIHBhcmFtcyBvYmplY3QsIHNvIGFsbCBwYXJhbXNcclxuICAgICAqIG11c3QgbWF0Y2ggd2l0aCBub25lIG1pc3NpbmcgYW5kIG5vIGV4dHJhcy5cclxuICAgICAqXHJcbiAgICAgKiBAZXhhbXBsZVxyXG4gICAgICogPHByZT5cclxuICAgICAqICRzdGF0ZS4kY3VycmVudC5uYW1lID0gJ2NvbnRhY3RzLmRldGFpbHMuaXRlbSc7XHJcbiAgICAgKlxyXG4gICAgICogLy8gYWJzb2x1dGUgbmFtZVxyXG4gICAgICogJHN0YXRlLmlzKCdjb250YWN0LmRldGFpbHMuaXRlbScpOyAvLyByZXR1cm5zIHRydWVcclxuICAgICAqICRzdGF0ZS5pcyhjb250YWN0RGV0YWlsSXRlbVN0YXRlT2JqZWN0KTsgLy8gcmV0dXJucyB0cnVlXHJcbiAgICAgKlxyXG4gICAgICogLy8gcmVsYXRpdmUgbmFtZSAoLiBhbmQgXiksIHR5cGljYWxseSBmcm9tIGEgdGVtcGxhdGVcclxuICAgICAqIC8vIEUuZy4gZnJvbSB0aGUgJ2NvbnRhY3RzLmRldGFpbHMnIHRlbXBsYXRlXHJcbiAgICAgKiA8ZGl2IG5nLWNsYXNzPVwie2hpZ2hsaWdodGVkOiAkc3RhdGUuaXMoJy5pdGVtJyl9XCI+SXRlbTwvZGl2PlxyXG4gICAgICogPC9wcmU+XHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd8b2JqZWN0fSBzdGF0ZU9yTmFtZSBUaGUgc3RhdGUgbmFtZSAoYWJzb2x1dGUgb3IgcmVsYXRpdmUpIG9yIHN0YXRlIG9iamVjdCB5b3UnZCBsaWtlIHRvIGNoZWNrLlxyXG4gICAgICogQHBhcmFtIHtvYmplY3Q9fSBwYXJhbXMgQSBwYXJhbSBvYmplY3QsIGUuZy4gYHtzZWN0aW9uSWQ6IHNlY3Rpb24uaWR9YCwgdGhhdCB5b3UnZCBsaWtlXHJcbiAgICAgKiB0byB0ZXN0IGFnYWluc3QgdGhlIGN1cnJlbnQgYWN0aXZlIHN0YXRlLlxyXG4gICAgICogQHBhcmFtIHtvYmplY3Q9fSBvcHRpb25zIEFuIG9wdGlvbnMgb2JqZWN0LiAgVGhlIG9wdGlvbnMgYXJlOlxyXG4gICAgICpcclxuICAgICAqIC0gKipgcmVsYXRpdmVgKiogLSB7c3RyaW5nfG9iamVjdH0gLSAgSWYgYHN0YXRlT3JOYW1lYCBpcyBhIHJlbGF0aXZlIHN0YXRlIG5hbWUgYW5kIGBvcHRpb25zLnJlbGF0aXZlYCBpcyBzZXQsIC5pcyB3aWxsXHJcbiAgICAgKiB0ZXN0IHJlbGF0aXZlIHRvIGBvcHRpb25zLnJlbGF0aXZlYCBzdGF0ZSAob3IgbmFtZSkuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgdHJ1ZSBpZiBpdCBpcyB0aGUgc3RhdGUuXHJcbiAgICAgKi9cclxuICAgICRzdGF0ZS5pcyA9IGZ1bmN0aW9uIGlzKHN0YXRlT3JOYW1lLCBwYXJhbXMsIG9wdGlvbnMpIHtcclxuICAgICAgb3B0aW9ucyA9IGV4dGVuZCh7IHJlbGF0aXZlOiAkc3RhdGUuJGN1cnJlbnQgfSwgb3B0aW9ucyB8fCB7fSk7XHJcbiAgICAgIHZhciBzdGF0ZSA9IGZpbmRTdGF0ZShzdGF0ZU9yTmFtZSwgb3B0aW9ucy5yZWxhdGl2ZSk7XHJcblxyXG4gICAgICBpZiAoIWlzRGVmaW5lZChzdGF0ZSkpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfVxyXG4gICAgICBpZiAoJHN0YXRlLiRjdXJyZW50ICE9PSBzdGF0ZSkgeyByZXR1cm4gZmFsc2U7IH1cclxuICAgICAgcmV0dXJuIHBhcmFtcyA/IGVxdWFsRm9yS2V5cyhzdGF0ZS5wYXJhbXMuJCR2YWx1ZXMocGFyYW1zKSwgJHN0YXRlUGFyYW1zKSA6IHRydWU7XHJcbiAgICB9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogQG5nZG9jIGZ1bmN0aW9uXHJcbiAgICAgKiBAbmFtZSB1aS5yb3V0ZXIuc3RhdGUuJHN0YXRlI2luY2x1ZGVzXHJcbiAgICAgKiBAbWV0aG9kT2YgdWkucm91dGVyLnN0YXRlLiRzdGF0ZVxyXG4gICAgICpcclxuICAgICAqIEBkZXNjcmlwdGlvblxyXG4gICAgICogQSBtZXRob2QgdG8gZGV0ZXJtaW5lIGlmIHRoZSBjdXJyZW50IGFjdGl2ZSBzdGF0ZSBpcyBlcXVhbCB0byBvciBpcyB0aGUgY2hpbGQgb2YgdGhlXHJcbiAgICAgKiBzdGF0ZSBzdGF0ZU5hbWUuIElmIGFueSBwYXJhbXMgYXJlIHBhc3NlZCB0aGVuIHRoZXkgd2lsbCBiZSB0ZXN0ZWQgZm9yIGEgbWF0Y2ggYXMgd2VsbC5cclxuICAgICAqIE5vdCBhbGwgdGhlIHBhcmFtZXRlcnMgbmVlZCB0byBiZSBwYXNzZWQsIGp1c3QgdGhlIG9uZXMgeW91J2QgbGlrZSB0byB0ZXN0IGZvciBlcXVhbGl0eS5cclxuICAgICAqXHJcbiAgICAgKiBAZXhhbXBsZVxyXG4gICAgICogUGFydGlhbCBhbmQgcmVsYXRpdmUgbmFtZXNcclxuICAgICAqIDxwcmU+XHJcbiAgICAgKiAkc3RhdGUuJGN1cnJlbnQubmFtZSA9ICdjb250YWN0cy5kZXRhaWxzLml0ZW0nO1xyXG4gICAgICpcclxuICAgICAqIC8vIFVzaW5nIHBhcnRpYWwgbmFtZXNcclxuICAgICAqICRzdGF0ZS5pbmNsdWRlcyhcImNvbnRhY3RzXCIpOyAvLyByZXR1cm5zIHRydWVcclxuICAgICAqICRzdGF0ZS5pbmNsdWRlcyhcImNvbnRhY3RzLmRldGFpbHNcIik7IC8vIHJldHVybnMgdHJ1ZVxyXG4gICAgICogJHN0YXRlLmluY2x1ZGVzKFwiY29udGFjdHMuZGV0YWlscy5pdGVtXCIpOyAvLyByZXR1cm5zIHRydWVcclxuICAgICAqICRzdGF0ZS5pbmNsdWRlcyhcImNvbnRhY3RzLmxpc3RcIik7IC8vIHJldHVybnMgZmFsc2VcclxuICAgICAqICRzdGF0ZS5pbmNsdWRlcyhcImFib3V0XCIpOyAvLyByZXR1cm5zIGZhbHNlXHJcbiAgICAgKlxyXG4gICAgICogLy8gVXNpbmcgcmVsYXRpdmUgbmFtZXMgKC4gYW5kIF4pLCB0eXBpY2FsbHkgZnJvbSBhIHRlbXBsYXRlXHJcbiAgICAgKiAvLyBFLmcuIGZyb20gdGhlICdjb250YWN0cy5kZXRhaWxzJyB0ZW1wbGF0ZVxyXG4gICAgICogPGRpdiBuZy1jbGFzcz1cIntoaWdobGlnaHRlZDogJHN0YXRlLmluY2x1ZGVzKCcuaXRlbScpfVwiPkl0ZW08L2Rpdj5cclxuICAgICAqIDwvcHJlPlxyXG4gICAgICpcclxuICAgICAqIEJhc2ljIGdsb2JiaW5nIHBhdHRlcm5zXHJcbiAgICAgKiA8cHJlPlxyXG4gICAgICogJHN0YXRlLiRjdXJyZW50Lm5hbWUgPSAnY29udGFjdHMuZGV0YWlscy5pdGVtLnVybCc7XHJcbiAgICAgKlxyXG4gICAgICogJHN0YXRlLmluY2x1ZGVzKFwiKi5kZXRhaWxzLiouKlwiKTsgLy8gcmV0dXJucyB0cnVlXHJcbiAgICAgKiAkc3RhdGUuaW5jbHVkZXMoXCIqLmRldGFpbHMuKipcIik7IC8vIHJldHVybnMgdHJ1ZVxyXG4gICAgICogJHN0YXRlLmluY2x1ZGVzKFwiKiouaXRlbS4qKlwiKTsgLy8gcmV0dXJucyB0cnVlXHJcbiAgICAgKiAkc3RhdGUuaW5jbHVkZXMoXCIqLmRldGFpbHMuaXRlbS51cmxcIik7IC8vIHJldHVybnMgdHJ1ZVxyXG4gICAgICogJHN0YXRlLmluY2x1ZGVzKFwiKi5kZXRhaWxzLioudXJsXCIpOyAvLyByZXR1cm5zIHRydWVcclxuICAgICAqICRzdGF0ZS5pbmNsdWRlcyhcIiouZGV0YWlscy4qXCIpOyAvLyByZXR1cm5zIGZhbHNlXHJcbiAgICAgKiAkc3RhdGUuaW5jbHVkZXMoXCJpdGVtLioqXCIpOyAvLyByZXR1cm5zIGZhbHNlXHJcbiAgICAgKiA8L3ByZT5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc3RhdGVPck5hbWUgQSBwYXJ0aWFsIG5hbWUsIHJlbGF0aXZlIG5hbWUsIG9yIGdsb2IgcGF0dGVyblxyXG4gICAgICogdG8gYmUgc2VhcmNoZWQgZm9yIHdpdGhpbiB0aGUgY3VycmVudCBzdGF0ZSBuYW1lLlxyXG4gICAgICogQHBhcmFtIHtvYmplY3Q9fSBwYXJhbXMgQSBwYXJhbSBvYmplY3QsIGUuZy4gYHtzZWN0aW9uSWQ6IHNlY3Rpb24uaWR9YCxcclxuICAgICAqIHRoYXQgeW91J2QgbGlrZSB0byB0ZXN0IGFnYWluc3QgdGhlIGN1cnJlbnQgYWN0aXZlIHN0YXRlLlxyXG4gICAgICogQHBhcmFtIHtvYmplY3Q9fSBvcHRpb25zIEFuIG9wdGlvbnMgb2JqZWN0LiAgVGhlIG9wdGlvbnMgYXJlOlxyXG4gICAgICpcclxuICAgICAqIC0gKipgcmVsYXRpdmVgKiogLSB7c3RyaW5nfG9iamVjdD19IC0gIElmIGBzdGF0ZU9yTmFtZWAgaXMgYSByZWxhdGl2ZSBzdGF0ZSByZWZlcmVuY2UgYW5kIGBvcHRpb25zLnJlbGF0aXZlYCBpcyBzZXQsXHJcbiAgICAgKiAuaW5jbHVkZXMgd2lsbCB0ZXN0IHJlbGF0aXZlIHRvIGBvcHRpb25zLnJlbGF0aXZlYCBzdGF0ZSAob3IgbmFtZSkuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgdHJ1ZSBpZiBpdCBkb2VzIGluY2x1ZGUgdGhlIHN0YXRlXHJcbiAgICAgKi9cclxuICAgICRzdGF0ZS5pbmNsdWRlcyA9IGZ1bmN0aW9uIGluY2x1ZGVzKHN0YXRlT3JOYW1lLCBwYXJhbXMsIG9wdGlvbnMpIHtcclxuICAgICAgb3B0aW9ucyA9IGV4dGVuZCh7IHJlbGF0aXZlOiAkc3RhdGUuJGN1cnJlbnQgfSwgb3B0aW9ucyB8fCB7fSk7XHJcbiAgICAgIGlmIChpc1N0cmluZyhzdGF0ZU9yTmFtZSkgJiYgaXNHbG9iKHN0YXRlT3JOYW1lKSkge1xyXG4gICAgICAgIGlmICghZG9lc1N0YXRlTWF0Y2hHbG9iKHN0YXRlT3JOYW1lKSkge1xyXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzdGF0ZU9yTmFtZSA9ICRzdGF0ZS4kY3VycmVudC5uYW1lO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB2YXIgc3RhdGUgPSBmaW5kU3RhdGUoc3RhdGVPck5hbWUsIG9wdGlvbnMucmVsYXRpdmUpO1xyXG4gICAgICBpZiAoIWlzRGVmaW5lZChzdGF0ZSkpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfVxyXG4gICAgICBpZiAoIWlzRGVmaW5lZCgkc3RhdGUuJGN1cnJlbnQuaW5jbHVkZXNbc3RhdGUubmFtZV0pKSB7IHJldHVybiBmYWxzZTsgfVxyXG4gICAgICByZXR1cm4gcGFyYW1zID8gZXF1YWxGb3JLZXlzKHN0YXRlLnBhcmFtcy4kJHZhbHVlcyhwYXJhbXMpLCAkc3RhdGVQYXJhbXMsIG9iamVjdEtleXMocGFyYW1zKSkgOiB0cnVlO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBAbmdkb2MgZnVuY3Rpb25cclxuICAgICAqIEBuYW1lIHVpLnJvdXRlci5zdGF0ZS4kc3RhdGUjaHJlZlxyXG4gICAgICogQG1ldGhvZE9mIHVpLnJvdXRlci5zdGF0ZS4kc3RhdGVcclxuICAgICAqXHJcbiAgICAgKiBAZGVzY3JpcHRpb25cclxuICAgICAqIEEgdXJsIGdlbmVyYXRpb24gbWV0aG9kIHRoYXQgcmV0dXJucyB0aGUgY29tcGlsZWQgdXJsIGZvciB0aGUgZ2l2ZW4gc3RhdGUgcG9wdWxhdGVkIHdpdGggdGhlIGdpdmVuIHBhcmFtcy5cclxuICAgICAqXHJcbiAgICAgKiBAZXhhbXBsZVxyXG4gICAgICogPHByZT5cclxuICAgICAqIGV4cGVjdCgkc3RhdGUuaHJlZihcImFib3V0LnBlcnNvblwiLCB7IHBlcnNvbjogXCJib2JcIiB9KSkudG9FcXVhbChcIi9hYm91dC9ib2JcIik7XHJcbiAgICAgKiA8L3ByZT5cclxuICAgICAqXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ3xvYmplY3R9IHN0YXRlT3JOYW1lIFRoZSBzdGF0ZSBuYW1lIG9yIHN0YXRlIG9iamVjdCB5b3UnZCBsaWtlIHRvIGdlbmVyYXRlIGEgdXJsIGZyb20uXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdD19IHBhcmFtcyBBbiBvYmplY3Qgb2YgcGFyYW1ldGVyIHZhbHVlcyB0byBmaWxsIHRoZSBzdGF0ZSdzIHJlcXVpcmVkIHBhcmFtZXRlcnMuXHJcbiAgICAgKiBAcGFyYW0ge29iamVjdD19IG9wdGlvbnMgT3B0aW9ucyBvYmplY3QuIFRoZSBvcHRpb25zIGFyZTpcclxuICAgICAqXHJcbiAgICAgKiAtICoqYGxvc3N5YCoqIC0ge2Jvb2xlYW49dHJ1ZX0gLSAgSWYgdHJ1ZSwgYW5kIGlmIHRoZXJlIGlzIG5vIHVybCBhc3NvY2lhdGVkIHdpdGggdGhlIHN0YXRlIHByb3ZpZGVkIGluIHRoZVxyXG4gICAgICogICAgZmlyc3QgcGFyYW1ldGVyLCB0aGVuIHRoZSBjb25zdHJ1Y3RlZCBocmVmIHVybCB3aWxsIGJlIGJ1aWx0IGZyb20gdGhlIGZpcnN0IG5hdmlnYWJsZSBhbmNlc3RvciAoYWthXHJcbiAgICAgKiAgICBhbmNlc3RvciB3aXRoIGEgdmFsaWQgdXJsKS5cclxuICAgICAqIC0gKipgaW5oZXJpdGAqKiAtIHtib29sZWFuPXRydWV9LCBJZiBgdHJ1ZWAgd2lsbCBpbmhlcml0IHVybCBwYXJhbWV0ZXJzIGZyb20gY3VycmVudCB1cmwuXHJcbiAgICAgKiAtICoqYHJlbGF0aXZlYCoqIC0ge29iamVjdD0kc3RhdGUuJGN1cnJlbnR9LCBXaGVuIHRyYW5zaXRpb25pbmcgd2l0aCByZWxhdGl2ZSBwYXRoIChlLmcgJ14nKSwgXHJcbiAgICAgKiAgICBkZWZpbmVzIHdoaWNoIHN0YXRlIHRvIGJlIHJlbGF0aXZlIGZyb20uXHJcbiAgICAgKiAtICoqYGFic29sdXRlYCoqIC0ge2Jvb2xlYW49ZmFsc2V9LCAgSWYgdHJ1ZSB3aWxsIGdlbmVyYXRlIGFuIGFic29sdXRlIHVybCwgZS5nLiBcImh0dHA6Ly93d3cuZXhhbXBsZS5jb20vZnVsbHVybFwiLlxyXG4gICAgICogXHJcbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBjb21waWxlZCBzdGF0ZSB1cmxcclxuICAgICAqL1xyXG4gICAgJHN0YXRlLmhyZWYgPSBmdW5jdGlvbiBocmVmKHN0YXRlT3JOYW1lLCBwYXJhbXMsIG9wdGlvbnMpIHtcclxuICAgICAgb3B0aW9ucyA9IGV4dGVuZCh7XHJcbiAgICAgICAgbG9zc3k6ICAgIHRydWUsXHJcbiAgICAgICAgaW5oZXJpdDogIHRydWUsXHJcbiAgICAgICAgYWJzb2x1dGU6IGZhbHNlLFxyXG4gICAgICAgIHJlbGF0aXZlOiAkc3RhdGUuJGN1cnJlbnRcclxuICAgICAgfSwgb3B0aW9ucyB8fCB7fSk7XHJcblxyXG4gICAgICB2YXIgc3RhdGUgPSBmaW5kU3RhdGUoc3RhdGVPck5hbWUsIG9wdGlvbnMucmVsYXRpdmUpO1xyXG5cclxuICAgICAgaWYgKCFpc0RlZmluZWQoc3RhdGUpKSByZXR1cm4gbnVsbDtcclxuICAgICAgaWYgKG9wdGlvbnMuaW5oZXJpdCkgcGFyYW1zID0gaW5oZXJpdFBhcmFtcygkc3RhdGVQYXJhbXMsIHBhcmFtcyB8fCB7fSwgJHN0YXRlLiRjdXJyZW50LCBzdGF0ZSk7XHJcbiAgICAgIFxyXG4gICAgICB2YXIgbmF2ID0gKHN0YXRlICYmIG9wdGlvbnMubG9zc3kpID8gc3RhdGUubmF2aWdhYmxlIDogc3RhdGU7XHJcblxyXG4gICAgICBpZiAoIW5hdiB8fCBuYXYudXJsID09PSB1bmRlZmluZWQgfHwgbmF2LnVybCA9PT0gbnVsbCkge1xyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiAkdXJsUm91dGVyLmhyZWYobmF2LnVybCwgZmlsdGVyQnlLZXlzKHN0YXRlLnBhcmFtcy4kJGtleXMoKSwgcGFyYW1zIHx8IHt9KSwge1xyXG4gICAgICAgIGFic29sdXRlOiBvcHRpb25zLmFic29sdXRlXHJcbiAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEBuZ2RvYyBmdW5jdGlvblxyXG4gICAgICogQG5hbWUgdWkucm91dGVyLnN0YXRlLiRzdGF0ZSNnZXRcclxuICAgICAqIEBtZXRob2RPZiB1aS5yb3V0ZXIuc3RhdGUuJHN0YXRlXHJcbiAgICAgKlxyXG4gICAgICogQGRlc2NyaXB0aW9uXHJcbiAgICAgKiBSZXR1cm5zIHRoZSBzdGF0ZSBjb25maWd1cmF0aW9uIG9iamVjdCBmb3IgYW55IHNwZWNpZmljIHN0YXRlIG9yIGFsbCBzdGF0ZXMuXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd8b2JqZWN0PX0gc3RhdGVPck5hbWUgKGFic29sdXRlIG9yIHJlbGF0aXZlKSBJZiBwcm92aWRlZCwgd2lsbCBvbmx5IGdldCB0aGUgY29uZmlnIGZvclxyXG4gICAgICogdGhlIHJlcXVlc3RlZCBzdGF0ZS4gSWYgbm90IHByb3ZpZGVkLCByZXR1cm5zIGFuIGFycmF5IG9mIEFMTCBzdGF0ZSBjb25maWdzLlxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd8b2JqZWN0PX0gY29udGV4dCBXaGVuIHN0YXRlT3JOYW1lIGlzIGEgcmVsYXRpdmUgc3RhdGUgcmVmZXJlbmNlLCB0aGUgc3RhdGUgd2lsbCBiZSByZXRyaWV2ZWQgcmVsYXRpdmUgdG8gY29udGV4dC5cclxuICAgICAqIEByZXR1cm5zIHtPYmplY3R8QXJyYXl9IFN0YXRlIGNvbmZpZ3VyYXRpb24gb2JqZWN0IG9yIGFycmF5IG9mIGFsbCBvYmplY3RzLlxyXG4gICAgICovXHJcbiAgICAkc3RhdGUuZ2V0ID0gZnVuY3Rpb24gKHN0YXRlT3JOYW1lLCBjb250ZXh0KSB7XHJcbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSByZXR1cm4gbWFwKG9iamVjdEtleXMoc3RhdGVzKSwgZnVuY3Rpb24obmFtZSkgeyByZXR1cm4gc3RhdGVzW25hbWVdLnNlbGY7IH0pO1xyXG4gICAgICB2YXIgc3RhdGUgPSBmaW5kU3RhdGUoc3RhdGVPck5hbWUsIGNvbnRleHQgfHwgJHN0YXRlLiRjdXJyZW50KTtcclxuICAgICAgcmV0dXJuIChzdGF0ZSAmJiBzdGF0ZS5zZWxmKSA/IHN0YXRlLnNlbGYgOiBudWxsO1xyXG4gICAgfTtcclxuXHJcbiAgICBmdW5jdGlvbiByZXNvbHZlU3RhdGUoc3RhdGUsIHBhcmFtcywgcGFyYW1zQXJlRmlsdGVyZWQsIGluaGVyaXRlZCwgZHN0LCBvcHRpb25zKSB7XHJcbiAgICAgIC8vIE1ha2UgYSByZXN0cmljdGVkICRzdGF0ZVBhcmFtcyB3aXRoIG9ubHkgdGhlIHBhcmFtZXRlcnMgdGhhdCBhcHBseSB0byB0aGlzIHN0YXRlIGlmXHJcbiAgICAgIC8vIG5lY2Vzc2FyeS4gSW4gYWRkaXRpb24gdG8gYmVpbmcgYXZhaWxhYmxlIHRvIHRoZSBjb250cm9sbGVyIGFuZCBvbkVudGVyL29uRXhpdCBjYWxsYmFja3MsXHJcbiAgICAgIC8vIHdlIGFsc28gbmVlZCAkc3RhdGVQYXJhbXMgdG8gYmUgYXZhaWxhYmxlIGZvciBhbnkgJGluamVjdG9yIGNhbGxzIHdlIG1ha2UgZHVyaW5nIHRoZVxyXG4gICAgICAvLyBkZXBlbmRlbmN5IHJlc29sdXRpb24gcHJvY2Vzcy5cclxuICAgICAgdmFyICRzdGF0ZVBhcmFtcyA9IChwYXJhbXNBcmVGaWx0ZXJlZCkgPyBwYXJhbXMgOiBmaWx0ZXJCeUtleXMoc3RhdGUucGFyYW1zLiQka2V5cygpLCBwYXJhbXMpO1xyXG4gICAgICB2YXIgbG9jYWxzID0geyAkc3RhdGVQYXJhbXM6ICRzdGF0ZVBhcmFtcyB9O1xyXG5cclxuICAgICAgLy8gUmVzb2x2ZSAnZ2xvYmFsJyBkZXBlbmRlbmNpZXMgZm9yIHRoZSBzdGF0ZSwgaS5lLiB0aG9zZSBub3Qgc3BlY2lmaWMgdG8gYSB2aWV3LlxyXG4gICAgICAvLyBXZSdyZSBhbHNvIGluY2x1ZGluZyAkc3RhdGVQYXJhbXMgaW4gdGhpczsgdGhhdCB3YXkgdGhlIHBhcmFtZXRlcnMgYXJlIHJlc3RyaWN0ZWRcclxuICAgICAgLy8gdG8gdGhlIHNldCB0aGF0IHNob3VsZCBiZSB2aXNpYmxlIHRvIHRoZSBzdGF0ZSwgYW5kIGFyZSBpbmRlcGVuZGVudCBvZiB3aGVuIHdlIHVwZGF0ZVxyXG4gICAgICAvLyB0aGUgZ2xvYmFsICRzdGF0ZSBhbmQgJHN0YXRlUGFyYW1zIHZhbHVlcy5cclxuICAgICAgZHN0LnJlc29sdmUgPSAkcmVzb2x2ZS5yZXNvbHZlKHN0YXRlLnJlc29sdmUsIGxvY2FscywgZHN0LnJlc29sdmUsIHN0YXRlKTtcclxuICAgICAgdmFyIHByb21pc2VzID0gW2RzdC5yZXNvbHZlLnRoZW4oZnVuY3Rpb24gKGdsb2JhbHMpIHtcclxuICAgICAgICBkc3QuZ2xvYmFscyA9IGdsb2JhbHM7XHJcbiAgICAgIH0pXTtcclxuICAgICAgaWYgKGluaGVyaXRlZCkgcHJvbWlzZXMucHVzaChpbmhlcml0ZWQpO1xyXG5cclxuICAgICAgLy8gUmVzb2x2ZSB0ZW1wbGF0ZSBhbmQgZGVwZW5kZW5jaWVzIGZvciBhbGwgdmlld3MuXHJcbiAgICAgIGZvckVhY2goc3RhdGUudmlld3MsIGZ1bmN0aW9uICh2aWV3LCBuYW1lKSB7XHJcbiAgICAgICAgdmFyIGluamVjdGFibGVzID0gKHZpZXcucmVzb2x2ZSAmJiB2aWV3LnJlc29sdmUgIT09IHN0YXRlLnJlc29sdmUgPyB2aWV3LnJlc29sdmUgOiB7fSk7XHJcbiAgICAgICAgaW5qZWN0YWJsZXMuJHRlbXBsYXRlID0gWyBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICByZXR1cm4gJHZpZXcubG9hZChuYW1lLCB7IHZpZXc6IHZpZXcsIGxvY2FsczogbG9jYWxzLCBwYXJhbXM6ICRzdGF0ZVBhcmFtcywgbm90aWZ5OiBvcHRpb25zLm5vdGlmeSB9KSB8fCAnJztcclxuICAgICAgICB9XTtcclxuXHJcbiAgICAgICAgcHJvbWlzZXMucHVzaCgkcmVzb2x2ZS5yZXNvbHZlKGluamVjdGFibGVzLCBsb2NhbHMsIGRzdC5yZXNvbHZlLCBzdGF0ZSkudGhlbihmdW5jdGlvbiAocmVzdWx0KSB7XHJcbiAgICAgICAgICAvLyBSZWZlcmVuY2VzIHRvIHRoZSBjb250cm9sbGVyIChvbmx5IGluc3RhbnRpYXRlZCBhdCBsaW5rIHRpbWUpXHJcbiAgICAgICAgICBpZiAoaXNGdW5jdGlvbih2aWV3LmNvbnRyb2xsZXJQcm92aWRlcikgfHwgaXNBcnJheSh2aWV3LmNvbnRyb2xsZXJQcm92aWRlcikpIHtcclxuICAgICAgICAgICAgdmFyIGluamVjdExvY2FscyA9IGFuZ3VsYXIuZXh0ZW5kKHt9LCBpbmplY3RhYmxlcywgbG9jYWxzKTtcclxuICAgICAgICAgICAgcmVzdWx0LiQkY29udHJvbGxlciA9ICRpbmplY3Rvci5pbnZva2Uodmlldy5jb250cm9sbGVyUHJvdmlkZXIsIG51bGwsIGluamVjdExvY2Fscyk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXN1bHQuJCRjb250cm9sbGVyID0gdmlldy5jb250cm9sbGVyO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgLy8gUHJvdmlkZSBhY2Nlc3MgdG8gdGhlIHN0YXRlIGl0c2VsZiBmb3IgaW50ZXJuYWwgdXNlXHJcbiAgICAgICAgICByZXN1bHQuJCRzdGF0ZSA9IHN0YXRlO1xyXG4gICAgICAgICAgcmVzdWx0LiQkY29udHJvbGxlckFzID0gdmlldy5jb250cm9sbGVyQXM7XHJcbiAgICAgICAgICBkc3RbbmFtZV0gPSByZXN1bHQ7XHJcbiAgICAgICAgfSkpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIC8vIFdhaXQgZm9yIGFsbCB0aGUgcHJvbWlzZXMgYW5kIHRoZW4gcmV0dXJuIHRoZSBhY3RpdmF0aW9uIG9iamVjdFxyXG4gICAgICByZXR1cm4gJHEuYWxsKHByb21pc2VzKS50aGVuKGZ1bmN0aW9uICh2YWx1ZXMpIHtcclxuICAgICAgICByZXR1cm4gZHN0O1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gJHN0YXRlO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gc2hvdWxkVHJpZ2dlclJlbG9hZCh0bywgZnJvbSwgbG9jYWxzLCBvcHRpb25zKSB7XHJcbiAgICBpZiAodG8gPT09IGZyb20gJiYgKChsb2NhbHMgPT09IGZyb20ubG9jYWxzICYmICFvcHRpb25zLnJlbG9hZCkgfHwgKHRvLnNlbGYucmVsb2FkT25TZWFyY2ggPT09IGZhbHNlKSkpIHtcclxuICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgfVxyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgndWkucm91dGVyLnN0YXRlJylcclxuICAudmFsdWUoJyRzdGF0ZVBhcmFtcycsIHt9KVxyXG4gIC5wcm92aWRlcignJHN0YXRlJywgJFN0YXRlUHJvdmlkZXIpO1xyXG4iLCJmdW5jdGlvbiBwYXJzZVN0YXRlUmVmKHJlZiwgY3VycmVudCkge1xyXG4gIHZhciBwcmVwYXJzZWQgPSByZWYubWF0Y2goL15cXHMqKHtbXn1dKn0pXFxzKiQvKSwgcGFyc2VkO1xyXG4gIGlmIChwcmVwYXJzZWQpIHJlZiA9IGN1cnJlbnQgKyAnKCcgKyBwcmVwYXJzZWRbMV0gKyAnKSc7XHJcbiAgcGFyc2VkID0gcmVmLnJlcGxhY2UoL1xcbi9nLCBcIiBcIikubWF0Y2goL14oW14oXSs/KVxccyooXFwoKC4qKVxcKSk/JC8pO1xyXG4gIGlmICghcGFyc2VkIHx8IHBhcnNlZC5sZW5ndGggIT09IDQpIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgc3RhdGUgcmVmICdcIiArIHJlZiArIFwiJ1wiKTtcclxuICByZXR1cm4geyBzdGF0ZTogcGFyc2VkWzFdLCBwYXJhbUV4cHI6IHBhcnNlZFszXSB8fCBudWxsIH07XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHN0YXRlQ29udGV4dChlbCkge1xyXG4gIHZhciBzdGF0ZURhdGEgPSBlbC5wYXJlbnQoKS5pbmhlcml0ZWREYXRhKCckdWlWaWV3Jyk7XHJcblxyXG4gIGlmIChzdGF0ZURhdGEgJiYgc3RhdGVEYXRhLnN0YXRlICYmIHN0YXRlRGF0YS5zdGF0ZS5uYW1lKSB7XHJcbiAgICByZXR1cm4gc3RhdGVEYXRhLnN0YXRlO1xyXG4gIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIEBuZ2RvYyBkaXJlY3RpdmVcclxuICogQG5hbWUgdWkucm91dGVyLnN0YXRlLmRpcmVjdGl2ZTp1aS1zcmVmXHJcbiAqXHJcbiAqIEByZXF1aXJlcyB1aS5yb3V0ZXIuc3RhdGUuJHN0YXRlXHJcbiAqIEByZXF1aXJlcyAkdGltZW91dFxyXG4gKlxyXG4gKiBAcmVzdHJpY3QgQVxyXG4gKlxyXG4gKiBAZGVzY3JpcHRpb25cclxuICogQSBkaXJlY3RpdmUgdGhhdCBiaW5kcyBhIGxpbmsgKGA8YT5gIHRhZykgdG8gYSBzdGF0ZS4gSWYgdGhlIHN0YXRlIGhhcyBhbiBhc3NvY2lhdGVkIFxyXG4gKiBVUkwsIHRoZSBkaXJlY3RpdmUgd2lsbCBhdXRvbWF0aWNhbGx5IGdlbmVyYXRlICYgdXBkYXRlIHRoZSBgaHJlZmAgYXR0cmlidXRlIHZpYSBcclxuICogdGhlIHtAbGluayB1aS5yb3V0ZXIuc3RhdGUuJHN0YXRlI21ldGhvZHNfaHJlZiAkc3RhdGUuaHJlZigpfSBtZXRob2QuIENsaWNraW5nIFxyXG4gKiB0aGUgbGluayB3aWxsIHRyaWdnZXIgYSBzdGF0ZSB0cmFuc2l0aW9uIHdpdGggb3B0aW9uYWwgcGFyYW1ldGVycy4gXHJcbiAqXHJcbiAqIEFsc28gbWlkZGxlLWNsaWNraW5nLCByaWdodC1jbGlja2luZywgYW5kIGN0cmwtY2xpY2tpbmcgb24gdGhlIGxpbmsgd2lsbCBiZSBcclxuICogaGFuZGxlZCBuYXRpdmVseSBieSB0aGUgYnJvd3Nlci5cclxuICpcclxuICogWW91IGNhbiBhbHNvIHVzZSByZWxhdGl2ZSBzdGF0ZSBwYXRocyB3aXRoaW4gdWktc3JlZiwganVzdCBsaWtlIHRoZSByZWxhdGl2ZSBcclxuICogcGF0aHMgcGFzc2VkIHRvIGAkc3RhdGUuZ28oKWAuIFlvdSBqdXN0IG5lZWQgdG8gYmUgYXdhcmUgdGhhdCB0aGUgcGF0aCBpcyByZWxhdGl2ZVxyXG4gKiB0byB0aGUgc3RhdGUgdGhhdCB0aGUgbGluayBsaXZlcyBpbiwgaW4gb3RoZXIgd29yZHMgdGhlIHN0YXRlIHRoYXQgbG9hZGVkIHRoZSBcclxuICogdGVtcGxhdGUgY29udGFpbmluZyB0aGUgbGluay5cclxuICpcclxuICogWW91IGNhbiBzcGVjaWZ5IG9wdGlvbnMgdG8gcGFzcyB0byB7QGxpbmsgdWkucm91dGVyLnN0YXRlLiRzdGF0ZSNnbyAkc3RhdGUuZ28oKX1cclxuICogdXNpbmcgdGhlIGB1aS1zcmVmLW9wdHNgIGF0dHJpYnV0ZS4gT3B0aW9ucyBhcmUgcmVzdHJpY3RlZCB0byBgbG9jYXRpb25gLCBgaW5oZXJpdGAsXHJcbiAqIGFuZCBgcmVsb2FkYC5cclxuICpcclxuICogQGV4YW1wbGVcclxuICogSGVyZSdzIGFuIGV4YW1wbGUgb2YgaG93IHlvdSdkIHVzZSB1aS1zcmVmIGFuZCBob3cgaXQgd291bGQgY29tcGlsZS4gSWYgeW91IGhhdmUgdGhlIFxyXG4gKiBmb2xsb3dpbmcgdGVtcGxhdGU6XHJcbiAqIDxwcmU+XHJcbiAqIDxhIHVpLXNyZWY9XCJob21lXCI+SG9tZTwvYT4gfCA8YSB1aS1zcmVmPVwiYWJvdXRcIj5BYm91dDwvYT4gfCA8YSB1aS1zcmVmPVwie3BhZ2U6IDJ9XCI+TmV4dCBwYWdlPC9hPlxyXG4gKiBcclxuICogPHVsPlxyXG4gKiAgICAgPGxpIG5nLXJlcGVhdD1cImNvbnRhY3QgaW4gY29udGFjdHNcIj5cclxuICogICAgICAgICA8YSB1aS1zcmVmPVwiY29udGFjdHMuZGV0YWlsKHsgaWQ6IGNvbnRhY3QuaWQgfSlcIj57eyBjb250YWN0Lm5hbWUgfX08L2E+XHJcbiAqICAgICA8L2xpPlxyXG4gKiA8L3VsPlxyXG4gKiA8L3ByZT5cclxuICogXHJcbiAqIFRoZW4gdGhlIGNvbXBpbGVkIGh0bWwgd291bGQgYmUgKGFzc3VtaW5nIEh0bWw1TW9kZSBpcyBvZmYgYW5kIGN1cnJlbnQgc3RhdGUgaXMgY29udGFjdHMpOlxyXG4gKiA8cHJlPlxyXG4gKiA8YSBocmVmPVwiIy9ob21lXCIgdWktc3JlZj1cImhvbWVcIj5Ib21lPC9hPiB8IDxhIGhyZWY9XCIjL2Fib3V0XCIgdWktc3JlZj1cImFib3V0XCI+QWJvdXQ8L2E+IHwgPGEgaHJlZj1cIiMvY29udGFjdHM/cGFnZT0yXCIgdWktc3JlZj1cIntwYWdlOiAyfVwiPk5leHQgcGFnZTwvYT5cclxuICogXHJcbiAqIDx1bD5cclxuICogICAgIDxsaSBuZy1yZXBlYXQ9XCJjb250YWN0IGluIGNvbnRhY3RzXCI+XHJcbiAqICAgICAgICAgPGEgaHJlZj1cIiMvY29udGFjdHMvMVwiIHVpLXNyZWY9XCJjb250YWN0cy5kZXRhaWwoeyBpZDogY29udGFjdC5pZCB9KVwiPkpvZTwvYT5cclxuICogICAgIDwvbGk+XHJcbiAqICAgICA8bGkgbmctcmVwZWF0PVwiY29udGFjdCBpbiBjb250YWN0c1wiPlxyXG4gKiAgICAgICAgIDxhIGhyZWY9XCIjL2NvbnRhY3RzLzJcIiB1aS1zcmVmPVwiY29udGFjdHMuZGV0YWlsKHsgaWQ6IGNvbnRhY3QuaWQgfSlcIj5BbGljZTwvYT5cclxuICogICAgIDwvbGk+XHJcbiAqICAgICA8bGkgbmctcmVwZWF0PVwiY29udGFjdCBpbiBjb250YWN0c1wiPlxyXG4gKiAgICAgICAgIDxhIGhyZWY9XCIjL2NvbnRhY3RzLzNcIiB1aS1zcmVmPVwiY29udGFjdHMuZGV0YWlsKHsgaWQ6IGNvbnRhY3QuaWQgfSlcIj5Cb2I8L2E+XHJcbiAqICAgICA8L2xpPlxyXG4gKiA8L3VsPlxyXG4gKlxyXG4gKiA8YSB1aS1zcmVmPVwiaG9tZVwiIHVpLXNyZWYtb3B0cz1cIntyZWxvYWQ6IHRydWV9XCI+SG9tZTwvYT5cclxuICogPC9wcmU+XHJcbiAqXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSB1aS1zcmVmICdzdGF0ZU5hbWUnIGNhbiBiZSBhbnkgdmFsaWQgYWJzb2x1dGUgb3IgcmVsYXRpdmUgc3RhdGVcclxuICogQHBhcmFtIHtPYmplY3R9IHVpLXNyZWYtb3B0cyBvcHRpb25zIHRvIHBhc3MgdG8ge0BsaW5rIHVpLnJvdXRlci5zdGF0ZS4kc3RhdGUjZ28gJHN0YXRlLmdvKCl9XHJcbiAqL1xyXG4kU3RhdGVSZWZEaXJlY3RpdmUuJGluamVjdCA9IFsnJHN0YXRlJywgJyR0aW1lb3V0J107XHJcbmZ1bmN0aW9uICRTdGF0ZVJlZkRpcmVjdGl2ZSgkc3RhdGUsICR0aW1lb3V0KSB7XHJcbiAgdmFyIGFsbG93ZWRPcHRpb25zID0gWydsb2NhdGlvbicsICdpbmhlcml0JywgJ3JlbG9hZCcsICdhYnNvbHV0ZSddO1xyXG5cclxuICByZXR1cm4ge1xyXG4gICAgcmVzdHJpY3Q6ICdBJyxcclxuICAgIHJlcXVpcmU6IFsnP151aVNyZWZBY3RpdmUnLCAnP151aVNyZWZBY3RpdmVFcSddLFxyXG4gICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCB1aVNyZWZBY3RpdmUpIHtcclxuICAgICAgdmFyIHJlZiA9IHBhcnNlU3RhdGVSZWYoYXR0cnMudWlTcmVmLCAkc3RhdGUuY3VycmVudC5uYW1lKTtcclxuICAgICAgdmFyIHBhcmFtcyA9IG51bGwsIHVybCA9IG51bGwsIGJhc2UgPSBzdGF0ZUNvbnRleHQoZWxlbWVudCkgfHwgJHN0YXRlLiRjdXJyZW50O1xyXG4gICAgICAvLyBTVkdBRWxlbWVudCBkb2VzIG5vdCB1c2UgdGhlIGhyZWYgYXR0cmlidXRlLCBidXQgcmF0aGVyIHRoZSAneGxpbmtIcmVmJyBhdHRyaWJ1dGUuXHJcbiAgICAgIHZhciBocmVmS2luZCA9IHRvU3RyaW5nLmNhbGwoZWxlbWVudC5wcm9wKCdocmVmJykpID09PSAnW29iamVjdCBTVkdBbmltYXRlZFN0cmluZ10nID9cclxuICAgICAgICAgICAgICAgICAneGxpbms6aHJlZicgOiAnaHJlZic7XHJcbiAgICAgIHZhciBuZXdIcmVmID0gbnVsbCwgaXNBbmNob3IgPSBlbGVtZW50LnByb3AoXCJ0YWdOYW1lXCIpLnRvVXBwZXJDYXNlKCkgPT09IFwiQVwiO1xyXG4gICAgICB2YXIgaXNGb3JtID0gZWxlbWVudFswXS5ub2RlTmFtZSA9PT0gXCJGT1JNXCI7XHJcbiAgICAgIHZhciBhdHRyID0gaXNGb3JtID8gXCJhY3Rpb25cIiA6IGhyZWZLaW5kLCBuYXYgPSB0cnVlO1xyXG5cclxuICAgICAgdmFyIG9wdGlvbnMgPSB7IHJlbGF0aXZlOiBiYXNlLCBpbmhlcml0OiB0cnVlIH07XHJcbiAgICAgIHZhciBvcHRpb25zT3ZlcnJpZGUgPSBzY29wZS4kZXZhbChhdHRycy51aVNyZWZPcHRzKSB8fCB7fTtcclxuXHJcbiAgICAgIGFuZ3VsYXIuZm9yRWFjaChhbGxvd2VkT3B0aW9ucywgZnVuY3Rpb24ob3B0aW9uKSB7XHJcbiAgICAgICAgaWYgKG9wdGlvbiBpbiBvcHRpb25zT3ZlcnJpZGUpIHtcclxuICAgICAgICAgIG9wdGlvbnNbb3B0aW9uXSA9IG9wdGlvbnNPdmVycmlkZVtvcHRpb25dO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgICB2YXIgdXBkYXRlID0gZnVuY3Rpb24obmV3VmFsKSB7XHJcbiAgICAgICAgaWYgKG5ld1ZhbCkgcGFyYW1zID0gYW5ndWxhci5jb3B5KG5ld1ZhbCk7XHJcbiAgICAgICAgaWYgKCFuYXYpIHJldHVybjtcclxuXHJcbiAgICAgICAgbmV3SHJlZiA9ICRzdGF0ZS5ocmVmKHJlZi5zdGF0ZSwgcGFyYW1zLCBvcHRpb25zKTtcclxuXHJcbiAgICAgICAgdmFyIGFjdGl2ZURpcmVjdGl2ZSA9IHVpU3JlZkFjdGl2ZVsxXSB8fCB1aVNyZWZBY3RpdmVbMF07XHJcbiAgICAgICAgaWYgKGFjdGl2ZURpcmVjdGl2ZSkge1xyXG4gICAgICAgICAgYWN0aXZlRGlyZWN0aXZlLiQkc2V0U3RhdGVJbmZvKHJlZi5zdGF0ZSwgcGFyYW1zKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKG5ld0hyZWYgPT09IG51bGwpIHtcclxuICAgICAgICAgIG5hdiA9IGZhbHNlO1xyXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBhdHRycy4kc2V0KGF0dHIsIG5ld0hyZWYpO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgaWYgKHJlZi5wYXJhbUV4cHIpIHtcclxuICAgICAgICBzY29wZS4kd2F0Y2gocmVmLnBhcmFtRXhwciwgZnVuY3Rpb24obmV3VmFsLCBvbGRWYWwpIHtcclxuICAgICAgICAgIGlmIChuZXdWYWwgIT09IHBhcmFtcykgdXBkYXRlKG5ld1ZhbCk7XHJcbiAgICAgICAgfSwgdHJ1ZSk7XHJcbiAgICAgICAgcGFyYW1zID0gYW5ndWxhci5jb3B5KHNjb3BlLiRldmFsKHJlZi5wYXJhbUV4cHIpKTtcclxuICAgICAgfVxyXG4gICAgICB1cGRhdGUoKTtcclxuXHJcbiAgICAgIGlmIChpc0Zvcm0pIHJldHVybjtcclxuXHJcbiAgICAgIGVsZW1lbnQuYmluZChcImNsaWNrXCIsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICB2YXIgYnV0dG9uID0gZS53aGljaCB8fCBlLmJ1dHRvbjtcclxuICAgICAgICBpZiAoICEoYnV0dG9uID4gMSB8fCBlLmN0cmxLZXkgfHwgZS5tZXRhS2V5IHx8IGUuc2hpZnRLZXkgfHwgZWxlbWVudC5hdHRyKCd0YXJnZXQnKSkgKSB7XHJcbiAgICAgICAgICAvLyBIQUNLOiBUaGlzIGlzIHRvIGFsbG93IG5nLWNsaWNrcyB0byBiZSBwcm9jZXNzZWQgYmVmb3JlIHRoZSB0cmFuc2l0aW9uIGlzIGluaXRpYXRlZDpcclxuICAgICAgICAgIHZhciB0cmFuc2l0aW9uID0gJHRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICRzdGF0ZS5nbyhyZWYuc3RhdGUsIHBhcmFtcywgb3B0aW9ucyk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuXHJcbiAgICAgICAgICAvLyBpZiB0aGUgc3RhdGUgaGFzIG5vIFVSTCwgaWdub3JlIG9uZSBwcmV2ZW50RGVmYXVsdCBmcm9tIHRoZSA8YT4gZGlyZWN0aXZlLlxyXG4gICAgICAgICAgdmFyIGlnbm9yZVByZXZlbnREZWZhdWx0Q291bnQgPSBpc0FuY2hvciAmJiAhbmV3SHJlZiA/IDE6IDA7XHJcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGlmIChpZ25vcmVQcmV2ZW50RGVmYXVsdENvdW50LS0gPD0gMClcclxuICAgICAgICAgICAgICAkdGltZW91dC5jYW5jZWwodHJhbnNpdGlvbik7XHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEBuZ2RvYyBkaXJlY3RpdmVcclxuICogQG5hbWUgdWkucm91dGVyLnN0YXRlLmRpcmVjdGl2ZTp1aS1zcmVmLWFjdGl2ZVxyXG4gKlxyXG4gKiBAcmVxdWlyZXMgdWkucm91dGVyLnN0YXRlLiRzdGF0ZVxyXG4gKiBAcmVxdWlyZXMgdWkucm91dGVyLnN0YXRlLiRzdGF0ZVBhcmFtc1xyXG4gKiBAcmVxdWlyZXMgJGludGVycG9sYXRlXHJcbiAqXHJcbiAqIEByZXN0cmljdCBBXHJcbiAqXHJcbiAqIEBkZXNjcmlwdGlvblxyXG4gKiBBIGRpcmVjdGl2ZSB3b3JraW5nIGFsb25nc2lkZSB1aS1zcmVmIHRvIGFkZCBjbGFzc2VzIHRvIGFuIGVsZW1lbnQgd2hlbiB0aGVcclxuICogcmVsYXRlZCB1aS1zcmVmIGRpcmVjdGl2ZSdzIHN0YXRlIGlzIGFjdGl2ZSwgYW5kIHJlbW92aW5nIHRoZW0gd2hlbiBpdCBpcyBpbmFjdGl2ZS5cclxuICogVGhlIHByaW1hcnkgdXNlLWNhc2UgaXMgdG8gc2ltcGxpZnkgdGhlIHNwZWNpYWwgYXBwZWFyYW5jZSBvZiBuYXZpZ2F0aW9uIG1lbnVzXHJcbiAqIHJlbHlpbmcgb24gYHVpLXNyZWZgLCBieSBoYXZpbmcgdGhlIFwiYWN0aXZlXCIgc3RhdGUncyBtZW51IGJ1dHRvbiBhcHBlYXIgZGlmZmVyZW50LFxyXG4gKiBkaXN0aW5ndWlzaGluZyBpdCBmcm9tIHRoZSBpbmFjdGl2ZSBtZW51IGl0ZW1zLlxyXG4gKlxyXG4gKiB1aS1zcmVmLWFjdGl2ZSBjYW4gbGl2ZSBvbiB0aGUgc2FtZSBlbGVtZW50IGFzIHVpLXNyZWYgb3Igb24gYSBwYXJlbnQgZWxlbWVudC4gVGhlIGZpcnN0XHJcbiAqIHVpLXNyZWYtYWN0aXZlIGZvdW5kIGF0IHRoZSBzYW1lIGxldmVsIG9yIGFib3ZlIHRoZSB1aS1zcmVmIHdpbGwgYmUgdXNlZC5cclxuICpcclxuICogV2lsbCBhY3RpdmF0ZSB3aGVuIHRoZSB1aS1zcmVmJ3MgdGFyZ2V0IHN0YXRlIG9yIGFueSBjaGlsZCBzdGF0ZSBpcyBhY3RpdmUuIElmIHlvdVxyXG4gKiBuZWVkIHRvIGFjdGl2YXRlIG9ubHkgd2hlbiB0aGUgdWktc3JlZiB0YXJnZXQgc3RhdGUgaXMgYWN0aXZlIGFuZCAqbm90KiBhbnkgb2ZcclxuICogaXQncyBjaGlsZHJlbiwgdGhlbiB5b3Ugd2lsbCB1c2VcclxuICoge0BsaW5rIHVpLnJvdXRlci5zdGF0ZS5kaXJlY3RpdmU6dWktc3JlZi1hY3RpdmUtZXEgdWktc3JlZi1hY3RpdmUtZXF9XHJcbiAqXHJcbiAqIEBleGFtcGxlXHJcbiAqIEdpdmVuIHRoZSBmb2xsb3dpbmcgdGVtcGxhdGU6XHJcbiAqIDxwcmU+XHJcbiAqIDx1bD5cclxuICogICA8bGkgdWktc3JlZi1hY3RpdmU9XCJhY3RpdmVcIiBjbGFzcz1cIml0ZW1cIj5cclxuICogICAgIDxhIGhyZWYgdWktc3JlZj1cImFwcC51c2VyKHt1c2VyOiAnYmlsYm9iYWdnaW5zJ30pXCI+QGJpbGJvYmFnZ2luczwvYT5cclxuICogICA8L2xpPlxyXG4gKiA8L3VsPlxyXG4gKiA8L3ByZT5cclxuICpcclxuICpcclxuICogV2hlbiB0aGUgYXBwIHN0YXRlIGlzIFwiYXBwLnVzZXJcIiAob3IgYW55IGNoaWxkcmVuIHN0YXRlcyksIGFuZCBjb250YWlucyB0aGUgc3RhdGUgcGFyYW1ldGVyIFwidXNlclwiIHdpdGggdmFsdWUgXCJiaWxib2JhZ2dpbnNcIixcclxuICogdGhlIHJlc3VsdGluZyBIVE1MIHdpbGwgYXBwZWFyIGFzIChub3RlIHRoZSAnYWN0aXZlJyBjbGFzcyk6XHJcbiAqIDxwcmU+XHJcbiAqIDx1bD5cclxuICogICA8bGkgdWktc3JlZi1hY3RpdmU9XCJhY3RpdmVcIiBjbGFzcz1cIml0ZW0gYWN0aXZlXCI+XHJcbiAqICAgICA8YSB1aS1zcmVmPVwiYXBwLnVzZXIoe3VzZXI6ICdiaWxib2JhZ2dpbnMnfSlcIiBocmVmPVwiL3VzZXJzL2JpbGJvYmFnZ2luc1wiPkBiaWxib2JhZ2dpbnM8L2E+XHJcbiAqICAgPC9saT5cclxuICogPC91bD5cclxuICogPC9wcmU+XHJcbiAqXHJcbiAqIFRoZSBjbGFzcyBuYW1lIGlzIGludGVycG9sYXRlZCAqKm9uY2UqKiBkdXJpbmcgdGhlIGRpcmVjdGl2ZXMgbGluayB0aW1lIChhbnkgZnVydGhlciBjaGFuZ2VzIHRvIHRoZVxyXG4gKiBpbnRlcnBvbGF0ZWQgdmFsdWUgYXJlIGlnbm9yZWQpLlxyXG4gKlxyXG4gKiBNdWx0aXBsZSBjbGFzc2VzIG1heSBiZSBzcGVjaWZpZWQgaW4gYSBzcGFjZS1zZXBhcmF0ZWQgZm9ybWF0OlxyXG4gKiA8cHJlPlxyXG4gKiA8dWw+XHJcbiAqICAgPGxpIHVpLXNyZWYtYWN0aXZlPSdjbGFzczEgY2xhc3MyIGNsYXNzMyc+XHJcbiAqICAgICA8YSB1aS1zcmVmPVwiYXBwLnVzZXJcIj5saW5rPC9hPlxyXG4gKiAgIDwvbGk+XHJcbiAqIDwvdWw+XHJcbiAqIDwvcHJlPlxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBAbmdkb2MgZGlyZWN0aXZlXHJcbiAqIEBuYW1lIHVpLnJvdXRlci5zdGF0ZS5kaXJlY3RpdmU6dWktc3JlZi1hY3RpdmUtZXFcclxuICpcclxuICogQHJlcXVpcmVzIHVpLnJvdXRlci5zdGF0ZS4kc3RhdGVcclxuICogQHJlcXVpcmVzIHVpLnJvdXRlci5zdGF0ZS4kc3RhdGVQYXJhbXNcclxuICogQHJlcXVpcmVzICRpbnRlcnBvbGF0ZVxyXG4gKlxyXG4gKiBAcmVzdHJpY3QgQVxyXG4gKlxyXG4gKiBAZGVzY3JpcHRpb25cclxuICogVGhlIHNhbWUgYXMge0BsaW5rIHVpLnJvdXRlci5zdGF0ZS5kaXJlY3RpdmU6dWktc3JlZi1hY3RpdmUgdWktc3JlZi1hY3RpdmV9IGJ1dCB3aWxsIG9ubHkgYWN0aXZhdGVcclxuICogd2hlbiB0aGUgZXhhY3QgdGFyZ2V0IHN0YXRlIHVzZWQgaW4gdGhlIGB1aS1zcmVmYCBpcyBhY3RpdmU7IG5vIGNoaWxkIHN0YXRlcy5cclxuICpcclxuICovXHJcbiRTdGF0ZVJlZkFjdGl2ZURpcmVjdGl2ZS4kaW5qZWN0ID0gWyckc3RhdGUnLCAnJHN0YXRlUGFyYW1zJywgJyRpbnRlcnBvbGF0ZSddO1xyXG5mdW5jdGlvbiAkU3RhdGVSZWZBY3RpdmVEaXJlY3RpdmUoJHN0YXRlLCAkc3RhdGVQYXJhbXMsICRpbnRlcnBvbGF0ZSkge1xyXG4gIHJldHVybiAge1xyXG4gICAgcmVzdHJpY3Q6IFwiQVwiLFxyXG4gICAgY29udHJvbGxlcjogWyckc2NvcGUnLCAnJGVsZW1lbnQnLCAnJGF0dHJzJywgZnVuY3Rpb24gKCRzY29wZSwgJGVsZW1lbnQsICRhdHRycykge1xyXG4gICAgICB2YXIgc3RhdGUsIHBhcmFtcywgYWN0aXZlQ2xhc3M7XHJcblxyXG4gICAgICAvLyBUaGVyZSBwcm9iYWJseSBpc24ndCBtdWNoIHBvaW50IGluICRvYnNlcnZpbmcgdGhpc1xyXG4gICAgICAvLyB1aVNyZWZBY3RpdmUgYW5kIHVpU3JlZkFjdGl2ZUVxIHNoYXJlIHRoZSBzYW1lIGRpcmVjdGl2ZSBvYmplY3Qgd2l0aCBzb21lXHJcbiAgICAgIC8vIHNsaWdodCBkaWZmZXJlbmNlIGluIGxvZ2ljIHJvdXRpbmdcclxuICAgICAgYWN0aXZlQ2xhc3MgPSAkaW50ZXJwb2xhdGUoJGF0dHJzLnVpU3JlZkFjdGl2ZUVxIHx8ICRhdHRycy51aVNyZWZBY3RpdmUgfHwgJycsIGZhbHNlKSgkc2NvcGUpO1xyXG5cclxuICAgICAgLy8gQWxsb3cgdWlTcmVmIHRvIGNvbW11bmljYXRlIHdpdGggdWlTcmVmQWN0aXZlW0VxdWFsc11cclxuICAgICAgdGhpcy4kJHNldFN0YXRlSW5mbyA9IGZ1bmN0aW9uIChuZXdTdGF0ZSwgbmV3UGFyYW1zKSB7XHJcbiAgICAgICAgc3RhdGUgPSAkc3RhdGUuZ2V0KG5ld1N0YXRlLCBzdGF0ZUNvbnRleHQoJGVsZW1lbnQpKTtcclxuICAgICAgICBwYXJhbXMgPSBuZXdQYXJhbXM7XHJcbiAgICAgICAgdXBkYXRlKCk7XHJcbiAgICAgIH07XHJcblxyXG4gICAgICAkc2NvcGUuJG9uKCckc3RhdGVDaGFuZ2VTdWNjZXNzJywgdXBkYXRlKTtcclxuXHJcbiAgICAgIC8vIFVwZGF0ZSByb3V0ZSBzdGF0ZVxyXG4gICAgICBmdW5jdGlvbiB1cGRhdGUoKSB7XHJcbiAgICAgICAgaWYgKGlzTWF0Y2goKSkge1xyXG4gICAgICAgICAgJGVsZW1lbnQuYWRkQ2xhc3MoYWN0aXZlQ2xhc3MpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAkZWxlbWVudC5yZW1vdmVDbGFzcyhhY3RpdmVDbGFzcyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBmdW5jdGlvbiBpc01hdGNoKCkge1xyXG4gICAgICAgIGlmICh0eXBlb2YgJGF0dHJzLnVpU3JlZkFjdGl2ZUVxICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgcmV0dXJuIHN0YXRlICYmICRzdGF0ZS5pcyhzdGF0ZS5uYW1lLCBwYXJhbXMpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICByZXR1cm4gc3RhdGUgJiYgJHN0YXRlLmluY2x1ZGVzKHN0YXRlLm5hbWUsIHBhcmFtcyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XVxyXG4gIH07XHJcbn1cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd1aS5yb3V0ZXIuc3RhdGUnKVxyXG4gIC5kaXJlY3RpdmUoJ3VpU3JlZicsICRTdGF0ZVJlZkRpcmVjdGl2ZSlcclxuICAuZGlyZWN0aXZlKCd1aVNyZWZBY3RpdmUnLCAkU3RhdGVSZWZBY3RpdmVEaXJlY3RpdmUpXHJcbiAgLmRpcmVjdGl2ZSgndWlTcmVmQWN0aXZlRXEnLCAkU3RhdGVSZWZBY3RpdmVEaXJlY3RpdmUpO1xyXG4iLCIvKipcclxuICogQG5nZG9jIGZpbHRlclxyXG4gKiBAbmFtZSB1aS5yb3V0ZXIuc3RhdGUuZmlsdGVyOmlzU3RhdGVcclxuICpcclxuICogQHJlcXVpcmVzIHVpLnJvdXRlci5zdGF0ZS4kc3RhdGVcclxuICpcclxuICogQGRlc2NyaXB0aW9uXHJcbiAqIFRyYW5zbGF0ZXMgdG8ge0BsaW5rIHVpLnJvdXRlci5zdGF0ZS4kc3RhdGUjbWV0aG9kc19pcyAkc3RhdGUuaXMoXCJzdGF0ZU5hbWVcIil9LlxyXG4gKi9cclxuJElzU3RhdGVGaWx0ZXIuJGluamVjdCA9IFsnJHN0YXRlJ107XHJcbmZ1bmN0aW9uICRJc1N0YXRlRmlsdGVyKCRzdGF0ZSkge1xyXG4gIHZhciBpc0ZpbHRlciA9IGZ1bmN0aW9uIChzdGF0ZSkge1xyXG4gICAgcmV0dXJuICRzdGF0ZS5pcyhzdGF0ZSk7XHJcbiAgfTtcclxuICBpc0ZpbHRlci4kc3RhdGVmdWwgPSB0cnVlO1xyXG4gIHJldHVybiBpc0ZpbHRlcjtcclxufVxyXG5cclxuLyoqXHJcbiAqIEBuZ2RvYyBmaWx0ZXJcclxuICogQG5hbWUgdWkucm91dGVyLnN0YXRlLmZpbHRlcjppbmNsdWRlZEJ5U3RhdGVcclxuICpcclxuICogQHJlcXVpcmVzIHVpLnJvdXRlci5zdGF0ZS4kc3RhdGVcclxuICpcclxuICogQGRlc2NyaXB0aW9uXHJcbiAqIFRyYW5zbGF0ZXMgdG8ge0BsaW5rIHVpLnJvdXRlci5zdGF0ZS4kc3RhdGUjbWV0aG9kc19pbmNsdWRlcyAkc3RhdGUuaW5jbHVkZXMoJ2Z1bGxPclBhcnRpYWxTdGF0ZU5hbWUnKX0uXHJcbiAqL1xyXG4kSW5jbHVkZWRCeVN0YXRlRmlsdGVyLiRpbmplY3QgPSBbJyRzdGF0ZSddO1xyXG5mdW5jdGlvbiAkSW5jbHVkZWRCeVN0YXRlRmlsdGVyKCRzdGF0ZSkge1xyXG4gIHZhciBpbmNsdWRlc0ZpbHRlciA9IGZ1bmN0aW9uIChzdGF0ZSkge1xyXG4gICAgcmV0dXJuICRzdGF0ZS5pbmNsdWRlcyhzdGF0ZSk7XHJcbiAgfTtcclxuICBpbmNsdWRlc0ZpbHRlci4kc3RhdGVmdWwgPSB0cnVlO1xyXG4gIHJldHVybiAgaW5jbHVkZXNGaWx0ZXI7XHJcbn1cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd1aS5yb3V0ZXIuc3RhdGUnKVxyXG4gIC5maWx0ZXIoJ2lzU3RhdGUnLCAkSXNTdGF0ZUZpbHRlcilcclxuICAuZmlsdGVyKCdpbmNsdWRlZEJ5U3RhdGUnLCAkSW5jbHVkZWRCeVN0YXRlRmlsdGVyKTtcclxuIiwiLyoqXHJcbiAqIEBuZ2RvYyBvYmplY3RcclxuICogQG5hbWUgdWkucm91dGVyLnV0aWwuJHRlbXBsYXRlRmFjdG9yeVxyXG4gKlxyXG4gKiBAcmVxdWlyZXMgJGh0dHBcclxuICogQHJlcXVpcmVzICR0ZW1wbGF0ZUNhY2hlXHJcbiAqIEByZXF1aXJlcyAkaW5qZWN0b3JcclxuICpcclxuICogQGRlc2NyaXB0aW9uXHJcbiAqIFNlcnZpY2UuIE1hbmFnZXMgbG9hZGluZyBvZiB0ZW1wbGF0ZXMuXHJcbiAqL1xyXG4kVGVtcGxhdGVGYWN0b3J5LiRpbmplY3QgPSBbJyRodHRwJywgJyR0ZW1wbGF0ZUNhY2hlJywgJyRpbmplY3RvciddO1xyXG5mdW5jdGlvbiAkVGVtcGxhdGVGYWN0b3J5KCAgJGh0dHAsICAgJHRlbXBsYXRlQ2FjaGUsICAgJGluamVjdG9yKSB7XHJcblxyXG4gIC8qKlxyXG4gICAqIEBuZ2RvYyBmdW5jdGlvblxyXG4gICAqIEBuYW1lIHVpLnJvdXRlci51dGlsLiR0ZW1wbGF0ZUZhY3RvcnkjZnJvbUNvbmZpZ1xyXG4gICAqIEBtZXRob2RPZiB1aS5yb3V0ZXIudXRpbC4kdGVtcGxhdGVGYWN0b3J5XHJcbiAgICpcclxuICAgKiBAZGVzY3JpcHRpb25cclxuICAgKiBDcmVhdGVzIGEgdGVtcGxhdGUgZnJvbSBhIGNvbmZpZ3VyYXRpb24gb2JqZWN0LiBcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBjb25maWcgQ29uZmlndXJhdGlvbiBvYmplY3QgZm9yIHdoaWNoIHRvIGxvYWQgYSB0ZW1wbGF0ZS4gXHJcbiAgICogVGhlIGZvbGxvd2luZyBwcm9wZXJ0aWVzIGFyZSBzZWFyY2ggaW4gdGhlIHNwZWNpZmllZCBvcmRlciwgYW5kIHRoZSBmaXJzdCBvbmUgXHJcbiAgICogdGhhdCBpcyBkZWZpbmVkIGlzIHVzZWQgdG8gY3JlYXRlIHRoZSB0ZW1wbGF0ZTpcclxuICAgKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfG9iamVjdH0gY29uZmlnLnRlbXBsYXRlIGh0bWwgc3RyaW5nIHRlbXBsYXRlIG9yIGZ1bmN0aW9uIHRvIFxyXG4gICAqIGxvYWQgdmlhIHtAbGluayB1aS5yb3V0ZXIudXRpbC4kdGVtcGxhdGVGYWN0b3J5I2Zyb21TdHJpbmcgZnJvbVN0cmluZ30uXHJcbiAgICogQHBhcmFtIHtzdHJpbmd8b2JqZWN0fSBjb25maWcudGVtcGxhdGVVcmwgdXJsIHRvIGxvYWQgb3IgYSBmdW5jdGlvbiByZXR1cm5pbmcgXHJcbiAgICogdGhlIHVybCB0byBsb2FkIHZpYSB7QGxpbmsgdWkucm91dGVyLnV0aWwuJHRlbXBsYXRlRmFjdG9yeSNmcm9tVXJsIGZyb21Vcmx9LlxyXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGNvbmZpZy50ZW1wbGF0ZVByb3ZpZGVyIGZ1bmN0aW9uIHRvIGludm9rZSB2aWEgXHJcbiAgICoge0BsaW5rIHVpLnJvdXRlci51dGlsLiR0ZW1wbGF0ZUZhY3RvcnkjZnJvbVByb3ZpZGVyIGZyb21Qcm92aWRlcn0uXHJcbiAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtcyAgUGFyYW1ldGVycyB0byBwYXNzIHRvIHRoZSB0ZW1wbGF0ZSBmdW5jdGlvbi5cclxuICAgKiBAcGFyYW0ge29iamVjdH0gbG9jYWxzIExvY2FscyB0byBwYXNzIHRvIGBpbnZva2VgIGlmIHRoZSB0ZW1wbGF0ZSBpcyBsb2FkZWQgXHJcbiAgICogdmlhIGEgYHRlbXBsYXRlUHJvdmlkZXJgLiBEZWZhdWx0cyB0byBgeyBwYXJhbXM6IHBhcmFtcyB9YC5cclxuICAgKlxyXG4gICAqIEByZXR1cm4ge3N0cmluZ3xvYmplY3R9ICBUaGUgdGVtcGxhdGUgaHRtbCBhcyBhIHN0cmluZywgb3IgYSBwcm9taXNlIGZvciBcclxuICAgKiB0aGF0IHN0cmluZyxvciBgbnVsbGAgaWYgbm8gdGVtcGxhdGUgaXMgY29uZmlndXJlZC5cclxuICAgKi9cclxuICB0aGlzLmZyb21Db25maWcgPSBmdW5jdGlvbiAoY29uZmlnLCBwYXJhbXMsIGxvY2Fscykge1xyXG4gICAgcmV0dXJuIChcclxuICAgICAgaXNEZWZpbmVkKGNvbmZpZy50ZW1wbGF0ZSkgPyB0aGlzLmZyb21TdHJpbmcoY29uZmlnLnRlbXBsYXRlLCBwYXJhbXMpIDpcclxuICAgICAgaXNEZWZpbmVkKGNvbmZpZy50ZW1wbGF0ZVVybCkgPyB0aGlzLmZyb21VcmwoY29uZmlnLnRlbXBsYXRlVXJsLCBwYXJhbXMpIDpcclxuICAgICAgaXNEZWZpbmVkKGNvbmZpZy50ZW1wbGF0ZVByb3ZpZGVyKSA/IHRoaXMuZnJvbVByb3ZpZGVyKGNvbmZpZy50ZW1wbGF0ZVByb3ZpZGVyLCBwYXJhbXMsIGxvY2FscykgOlxyXG4gICAgICBudWxsXHJcbiAgICApO1xyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIEBuZ2RvYyBmdW5jdGlvblxyXG4gICAqIEBuYW1lIHVpLnJvdXRlci51dGlsLiR0ZW1wbGF0ZUZhY3RvcnkjZnJvbVN0cmluZ1xyXG4gICAqIEBtZXRob2RPZiB1aS5yb3V0ZXIudXRpbC4kdGVtcGxhdGVGYWN0b3J5XHJcbiAgICpcclxuICAgKiBAZGVzY3JpcHRpb25cclxuICAgKiBDcmVhdGVzIGEgdGVtcGxhdGUgZnJvbSBhIHN0cmluZyBvciBhIGZ1bmN0aW9uIHJldHVybmluZyBhIHN0cmluZy5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfG9iamVjdH0gdGVtcGxhdGUgaHRtbCB0ZW1wbGF0ZSBhcyBhIHN0cmluZyBvciBmdW5jdGlvbiB0aGF0IFxyXG4gICAqIHJldHVybnMgYW4gaHRtbCB0ZW1wbGF0ZSBhcyBhIHN0cmluZy5cclxuICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zIFBhcmFtZXRlcnMgdG8gcGFzcyB0byB0aGUgdGVtcGxhdGUgZnVuY3Rpb24uXHJcbiAgICpcclxuICAgKiBAcmV0dXJuIHtzdHJpbmd8b2JqZWN0fSBUaGUgdGVtcGxhdGUgaHRtbCBhcyBhIHN0cmluZywgb3IgYSBwcm9taXNlIGZvciB0aGF0IFxyXG4gICAqIHN0cmluZy5cclxuICAgKi9cclxuICB0aGlzLmZyb21TdHJpbmcgPSBmdW5jdGlvbiAodGVtcGxhdGUsIHBhcmFtcykge1xyXG4gICAgcmV0dXJuIGlzRnVuY3Rpb24odGVtcGxhdGUpID8gdGVtcGxhdGUocGFyYW1zKSA6IHRlbXBsYXRlO1xyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIEBuZ2RvYyBmdW5jdGlvblxyXG4gICAqIEBuYW1lIHVpLnJvdXRlci51dGlsLiR0ZW1wbGF0ZUZhY3RvcnkjZnJvbVVybFxyXG4gICAqIEBtZXRob2RPZiB1aS5yb3V0ZXIudXRpbC4kdGVtcGxhdGVGYWN0b3J5XHJcbiAgICogXHJcbiAgICogQGRlc2NyaXB0aW9uXHJcbiAgICogTG9hZHMgYSB0ZW1wbGF0ZSBmcm9tIHRoZSBhIFVSTCB2aWEgYCRodHRwYCBhbmQgYCR0ZW1wbGF0ZUNhY2hlYC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7c3RyaW5nfEZ1bmN0aW9ufSB1cmwgdXJsIG9mIHRoZSB0ZW1wbGF0ZSB0byBsb2FkLCBvciBhIGZ1bmN0aW9uIFxyXG4gICAqIHRoYXQgcmV0dXJucyBhIHVybC5cclxuICAgKiBAcGFyYW0ge09iamVjdH0gcGFyYW1zIFBhcmFtZXRlcnMgdG8gcGFzcyB0byB0aGUgdXJsIGZ1bmN0aW9uLlxyXG4gICAqIEByZXR1cm4ge3N0cmluZ3xQcm9taXNlLjxzdHJpbmc+fSBUaGUgdGVtcGxhdGUgaHRtbCBhcyBhIHN0cmluZywgb3IgYSBwcm9taXNlIFxyXG4gICAqIGZvciB0aGF0IHN0cmluZy5cclxuICAgKi9cclxuICB0aGlzLmZyb21VcmwgPSBmdW5jdGlvbiAodXJsLCBwYXJhbXMpIHtcclxuICAgIGlmIChpc0Z1bmN0aW9uKHVybCkpIHVybCA9IHVybChwYXJhbXMpO1xyXG4gICAgaWYgKHVybCA9PSBudWxsKSByZXR1cm4gbnVsbDtcclxuICAgIGVsc2UgcmV0dXJuICRodHRwXHJcbiAgICAgICAgLmdldCh1cmwsIHsgY2FjaGU6ICR0ZW1wbGF0ZUNhY2hlLCBoZWFkZXJzOiB7IEFjY2VwdDogJ3RleHQvaHRtbCcgfX0pXHJcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHsgcmV0dXJuIHJlc3BvbnNlLmRhdGE7IH0pO1xyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIEBuZ2RvYyBmdW5jdGlvblxyXG4gICAqIEBuYW1lIHVpLnJvdXRlci51dGlsLiR0ZW1wbGF0ZUZhY3RvcnkjZnJvbVByb3ZpZGVyXHJcbiAgICogQG1ldGhvZE9mIHVpLnJvdXRlci51dGlsLiR0ZW1wbGF0ZUZhY3RvcnlcclxuICAgKlxyXG4gICAqIEBkZXNjcmlwdGlvblxyXG4gICAqIENyZWF0ZXMgYSB0ZW1wbGF0ZSBieSBpbnZva2luZyBhbiBpbmplY3RhYmxlIHByb3ZpZGVyIGZ1bmN0aW9uLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gcHJvdmlkZXIgRnVuY3Rpb24gdG8gaW52b2tlIHZpYSBgJGluamVjdG9yLmludm9rZWBcclxuICAgKiBAcGFyYW0ge09iamVjdH0gcGFyYW1zIFBhcmFtZXRlcnMgZm9yIHRoZSB0ZW1wbGF0ZS5cclxuICAgKiBAcGFyYW0ge09iamVjdH0gbG9jYWxzIExvY2FscyB0byBwYXNzIHRvIGBpbnZva2VgLiBEZWZhdWx0cyB0byBcclxuICAgKiBgeyBwYXJhbXM6IHBhcmFtcyB9YC5cclxuICAgKiBAcmV0dXJuIHtzdHJpbmd8UHJvbWlzZS48c3RyaW5nPn0gVGhlIHRlbXBsYXRlIGh0bWwgYXMgYSBzdHJpbmcsIG9yIGEgcHJvbWlzZSBcclxuICAgKiBmb3IgdGhhdCBzdHJpbmcuXHJcbiAgICovXHJcbiAgdGhpcy5mcm9tUHJvdmlkZXIgPSBmdW5jdGlvbiAocHJvdmlkZXIsIHBhcmFtcywgbG9jYWxzKSB7XHJcbiAgICByZXR1cm4gJGluamVjdG9yLmludm9rZShwcm92aWRlciwgbnVsbCwgbG9jYWxzIHx8IHsgcGFyYW1zOiBwYXJhbXMgfSk7XHJcbiAgfTtcclxufVxyXG5cclxuYW5ndWxhci5tb2R1bGUoJ3VpLnJvdXRlci51dGlsJykuc2VydmljZSgnJHRlbXBsYXRlRmFjdG9yeScsICRUZW1wbGF0ZUZhY3RvcnkpO1xyXG4iLCJ2YXIgJCRVTUZQOyAvLyByZWZlcmVuY2UgdG8gJFVybE1hdGNoZXJGYWN0b3J5UHJvdmlkZXJcclxuXHJcbi8qKlxyXG4gKiBAbmdkb2Mgb2JqZWN0XHJcbiAqIEBuYW1lIHVpLnJvdXRlci51dGlsLnR5cGU6VXJsTWF0Y2hlclxyXG4gKlxyXG4gKiBAZGVzY3JpcHRpb25cclxuICogTWF0Y2hlcyBVUkxzIGFnYWluc3QgcGF0dGVybnMgYW5kIGV4dHJhY3RzIG5hbWVkIHBhcmFtZXRlcnMgZnJvbSB0aGUgcGF0aCBvciB0aGUgc2VhcmNoXHJcbiAqIHBhcnQgb2YgdGhlIFVSTC4gQSBVUkwgcGF0dGVybiBjb25zaXN0cyBvZiBhIHBhdGggcGF0dGVybiwgb3B0aW9uYWxseSBmb2xsb3dlZCBieSAnPycgYW5kIGEgbGlzdFxyXG4gKiBvZiBzZWFyY2ggcGFyYW1ldGVycy4gTXVsdGlwbGUgc2VhcmNoIHBhcmFtZXRlciBuYW1lcyBhcmUgc2VwYXJhdGVkIGJ5ICcmJy4gU2VhcmNoIHBhcmFtZXRlcnNcclxuICogZG8gbm90IGluZmx1ZW5jZSB3aGV0aGVyIG9yIG5vdCBhIFVSTCBpcyBtYXRjaGVkLCBidXQgdGhlaXIgdmFsdWVzIGFyZSBwYXNzZWQgdGhyb3VnaCBpbnRvXHJcbiAqIHRoZSBtYXRjaGVkIHBhcmFtZXRlcnMgcmV0dXJuZWQgYnkge0BsaW5rIHVpLnJvdXRlci51dGlsLnR5cGU6VXJsTWF0Y2hlciNtZXRob2RzX2V4ZWMgZXhlY30uXHJcbiAqXHJcbiAqIFBhdGggcGFyYW1ldGVyIHBsYWNlaG9sZGVycyBjYW4gYmUgc3BlY2lmaWVkIHVzaW5nIHNpbXBsZSBjb2xvbi9jYXRjaC1hbGwgc3ludGF4IG9yIGN1cmx5IGJyYWNlXHJcbiAqIHN5bnRheCwgd2hpY2ggb3B0aW9uYWxseSBhbGxvd3MgYSByZWd1bGFyIGV4cHJlc3Npb24gZm9yIHRoZSBwYXJhbWV0ZXIgdG8gYmUgc3BlY2lmaWVkOlxyXG4gKlxyXG4gKiAqIGAnOidgIG5hbWUgLSBjb2xvbiBwbGFjZWhvbGRlclxyXG4gKiAqIGAnKidgIG5hbWUgLSBjYXRjaC1hbGwgcGxhY2Vob2xkZXJcclxuICogKiBgJ3snIG5hbWUgJ30nYCAtIGN1cmx5IHBsYWNlaG9sZGVyXHJcbiAqICogYCd7JyBuYW1lICc6JyByZWdleHB8dHlwZSAnfSdgIC0gY3VybHkgcGxhY2Vob2xkZXIgd2l0aCByZWdleHAgb3IgdHlwZSBuYW1lLiBTaG91bGQgdGhlXHJcbiAqICAgcmVnZXhwIGl0c2VsZiBjb250YWluIGN1cmx5IGJyYWNlcywgdGhleSBtdXN0IGJlIGluIG1hdGNoZWQgcGFpcnMgb3IgZXNjYXBlZCB3aXRoIGEgYmFja3NsYXNoLlxyXG4gKlxyXG4gKiBQYXJhbWV0ZXIgbmFtZXMgbWF5IGNvbnRhaW4gb25seSB3b3JkIGNoYXJhY3RlcnMgKGxhdGluIGxldHRlcnMsIGRpZ2l0cywgYW5kIHVuZGVyc2NvcmUpIGFuZFxyXG4gKiBtdXN0IGJlIHVuaXF1ZSB3aXRoaW4gdGhlIHBhdHRlcm4gKGFjcm9zcyBib3RoIHBhdGggYW5kIHNlYXJjaCBwYXJhbWV0ZXJzKS4gRm9yIGNvbG9uXHJcbiAqIHBsYWNlaG9sZGVycyBvciBjdXJseSBwbGFjZWhvbGRlcnMgd2l0aG91dCBhbiBleHBsaWNpdCByZWdleHAsIGEgcGF0aCBwYXJhbWV0ZXIgbWF0Y2hlcyBhbnlcclxuICogbnVtYmVyIG9mIGNoYXJhY3RlcnMgb3RoZXIgdGhhbiAnLycuIEZvciBjYXRjaC1hbGwgcGxhY2Vob2xkZXJzIHRoZSBwYXRoIHBhcmFtZXRlciBtYXRjaGVzXHJcbiAqIGFueSBudW1iZXIgb2YgY2hhcmFjdGVycy5cclxuICpcclxuICogRXhhbXBsZXM6XHJcbiAqXHJcbiAqICogYCcvaGVsbG8vJ2AgLSBNYXRjaGVzIG9ubHkgaWYgdGhlIHBhdGggaXMgZXhhY3RseSAnL2hlbGxvLycuIFRoZXJlIGlzIG5vIHNwZWNpYWwgdHJlYXRtZW50IGZvclxyXG4gKiAgIHRyYWlsaW5nIHNsYXNoZXMsIGFuZCBwYXR0ZXJucyBoYXZlIHRvIG1hdGNoIHRoZSBlbnRpcmUgcGF0aCwgbm90IGp1c3QgYSBwcmVmaXguXHJcbiAqICogYCcvdXNlci86aWQnYCAtIE1hdGNoZXMgJy91c2VyL2JvYicgb3IgJy91c2VyLzEyMzQhISEnIG9yIGV2ZW4gJy91c2VyLycgYnV0IG5vdCAnL3VzZXInIG9yXHJcbiAqICAgJy91c2VyL2JvYi9kZXRhaWxzJy4gVGhlIHNlY29uZCBwYXRoIHNlZ21lbnQgd2lsbCBiZSBjYXB0dXJlZCBhcyB0aGUgcGFyYW1ldGVyICdpZCcuXHJcbiAqICogYCcvdXNlci97aWR9J2AgLSBTYW1lIGFzIHRoZSBwcmV2aW91cyBleGFtcGxlLCBidXQgdXNpbmcgY3VybHkgYnJhY2Ugc3ludGF4LlxyXG4gKiAqIGAnL3VzZXIve2lkOlteL10qfSdgIC0gU2FtZSBhcyB0aGUgcHJldmlvdXMgZXhhbXBsZS5cclxuICogKiBgJy91c2VyL3tpZDpbMC05YS1mQS1GXXsxLDh9fSdgIC0gU2ltaWxhciB0byB0aGUgcHJldmlvdXMgZXhhbXBsZSwgYnV0IG9ubHkgbWF0Y2hlcyBpZiB0aGUgaWRcclxuICogICBwYXJhbWV0ZXIgY29uc2lzdHMgb2YgMSB0byA4IGhleCBkaWdpdHMuXHJcbiAqICogYCcvZmlsZXMve3BhdGg6Lip9J2AgLSBNYXRjaGVzIGFueSBVUkwgc3RhcnRpbmcgd2l0aCAnL2ZpbGVzLycgYW5kIGNhcHR1cmVzIHRoZSByZXN0IG9mIHRoZVxyXG4gKiAgIHBhdGggaW50byB0aGUgcGFyYW1ldGVyICdwYXRoJy5cclxuICogKiBgJy9maWxlcy8qcGF0aCdgIC0gZGl0dG8uXHJcbiAqICogYCcvY2FsZW5kYXIve3N0YXJ0OmRhdGV9J2AgLSBNYXRjaGVzIFwiL2NhbGVuZGFyLzIwMTQtMTEtMTJcIiAoYmVjYXVzZSB0aGUgcGF0dGVybiBkZWZpbmVkXHJcbiAqICAgaW4gdGhlIGJ1aWx0LWluICBgZGF0ZWAgVHlwZSBtYXRjaGVzIGAyMDE0LTExLTEyYCkgYW5kIHByb3ZpZGVzIGEgRGF0ZSBvYmplY3QgaW4gJHN0YXRlUGFyYW1zLnN0YXJ0XHJcbiAqXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXR0ZXJuICBUaGUgcGF0dGVybiB0byBjb21waWxlIGludG8gYSBtYXRjaGVyLlxyXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnICBBIGNvbmZpZ3VyYXRpb24gb2JqZWN0IGhhc2g6XHJcbiAqIEBwYXJhbSB7T2JqZWN0PX0gcGFyZW50TWF0Y2hlciBVc2VkIHRvIGNvbmNhdGVuYXRlIHRoZSBwYXR0ZXJuL2NvbmZpZyBvbnRvXHJcbiAqICAgYW4gZXhpc3RpbmcgVXJsTWF0Y2hlclxyXG4gKlxyXG4gKiAqIGBjYXNlSW5zZW5zaXRpdmVgIC0gYHRydWVgIGlmIFVSTCBtYXRjaGluZyBzaG91bGQgYmUgY2FzZSBpbnNlbnNpdGl2ZSwgb3RoZXJ3aXNlIGBmYWxzZWAsIHRoZSBkZWZhdWx0IHZhbHVlIChmb3IgYmFja3dhcmQgY29tcGF0aWJpbGl0eSkgaXMgYGZhbHNlYC5cclxuICogKiBgc3RyaWN0YCAtIGBmYWxzZWAgaWYgbWF0Y2hpbmcgYWdhaW5zdCBhIFVSTCB3aXRoIGEgdHJhaWxpbmcgc2xhc2ggc2hvdWxkIGJlIHRyZWF0ZWQgYXMgZXF1aXZhbGVudCB0byBhIFVSTCB3aXRob3V0IGEgdHJhaWxpbmcgc2xhc2gsIHRoZSBkZWZhdWx0IHZhbHVlIGlzIGB0cnVlYC5cclxuICpcclxuICogQHByb3BlcnR5IHtzdHJpbmd9IHByZWZpeCAgQSBzdGF0aWMgcHJlZml4IG9mIHRoaXMgcGF0dGVybi4gVGhlIG1hdGNoZXIgZ3VhcmFudGVlcyB0aGF0IGFueVxyXG4gKiAgIFVSTCBtYXRjaGluZyB0aGlzIG1hdGNoZXIgKGkuZS4gYW55IHN0cmluZyBmb3Igd2hpY2gge0BsaW5rIHVpLnJvdXRlci51dGlsLnR5cGU6VXJsTWF0Y2hlciNtZXRob2RzX2V4ZWMgZXhlYygpfSByZXR1cm5zXHJcbiAqICAgbm9uLW51bGwpIHdpbGwgc3RhcnQgd2l0aCB0aGlzIHByZWZpeC5cclxuICpcclxuICogQHByb3BlcnR5IHtzdHJpbmd9IHNvdXJjZSAgVGhlIHBhdHRlcm4gdGhhdCB3YXMgcGFzc2VkIGludG8gdGhlIGNvbnN0cnVjdG9yXHJcbiAqXHJcbiAqIEBwcm9wZXJ0eSB7c3RyaW5nfSBzb3VyY2VQYXRoICBUaGUgcGF0aCBwb3J0aW9uIG9mIHRoZSBzb3VyY2UgcHJvcGVydHlcclxuICpcclxuICogQHByb3BlcnR5IHtzdHJpbmd9IHNvdXJjZVNlYXJjaCAgVGhlIHNlYXJjaCBwb3J0aW9uIG9mIHRoZSBzb3VyY2UgcHJvcGVydHlcclxuICpcclxuICogQHByb3BlcnR5IHtzdHJpbmd9IHJlZ2V4ICBUaGUgY29uc3RydWN0ZWQgcmVnZXggdGhhdCB3aWxsIGJlIHVzZWQgdG8gbWF0Y2ggYWdhaW5zdCB0aGUgdXJsIHdoZW5cclxuICogICBpdCBpcyB0aW1lIHRvIGRldGVybWluZSB3aGljaCB1cmwgd2lsbCBtYXRjaC5cclxuICpcclxuICogQHJldHVybnMge09iamVjdH0gIE5ldyBgVXJsTWF0Y2hlcmAgb2JqZWN0XHJcbiAqL1xyXG5mdW5jdGlvbiBVcmxNYXRjaGVyKHBhdHRlcm4sIGNvbmZpZywgcGFyZW50TWF0Y2hlcikge1xyXG4gIGNvbmZpZyA9IGV4dGVuZCh7IHBhcmFtczoge30gfSwgaXNPYmplY3QoY29uZmlnKSA/IGNvbmZpZyA6IHt9KTtcclxuXHJcbiAgLy8gRmluZCBhbGwgcGxhY2Vob2xkZXJzIGFuZCBjcmVhdGUgYSBjb21waWxlZCBwYXR0ZXJuLCB1c2luZyBlaXRoZXIgY2xhc3NpYyBvciBjdXJseSBzeW50YXg6XHJcbiAgLy8gICAnKicgbmFtZVxyXG4gIC8vICAgJzonIG5hbWVcclxuICAvLyAgICd7JyBuYW1lICd9J1xyXG4gIC8vICAgJ3snIG5hbWUgJzonIHJlZ2V4cCAnfSdcclxuICAvLyBUaGUgcmVndWxhciBleHByZXNzaW9uIGlzIHNvbWV3aGF0IGNvbXBsaWNhdGVkIGR1ZSB0byB0aGUgbmVlZCB0byBhbGxvdyBjdXJseSBicmFjZXNcclxuICAvLyBpbnNpZGUgdGhlIHJlZ3VsYXIgZXhwcmVzc2lvbi4gVGhlIHBsYWNlaG9sZGVyIHJlZ2V4cCBicmVha3MgZG93biBhcyBmb2xsb3dzOlxyXG4gIC8vICAgIChbOipdKShbXFx3XFxbXFxdXSspICAgICAgICAgICAgICAtIGNsYXNzaWMgcGxhY2Vob2xkZXIgKCQxIC8gJDIpIChzZWFyY2ggdmVyc2lvbiBoYXMgLSBmb3Igc25ha2UtY2FzZSlcclxuICAvLyAgICBcXHsoW1xcd1xcW1xcXV0rKSg/OlxcOiggLi4uICkpP1xcfSAgLSBjdXJseSBicmFjZSBwbGFjZWhvbGRlciAoJDMpIHdpdGggb3B0aW9uYWwgcmVnZXhwL3R5cGUgLi4uICgkNCkgKHNlYXJjaCB2ZXJzaW9uIGhhcyAtIGZvciBzbmFrZS1jYXNlXHJcbiAgLy8gICAgKD86IC4uLiB8IC4uLiB8IC4uLiApKyAgICAgICAgIC0gdGhlIHJlZ2V4cCBjb25zaXN0cyBvZiBhbnkgbnVtYmVyIG9mIGF0b21zLCBhbiBhdG9tIGJlaW5nIGVpdGhlclxyXG4gIC8vICAgIFtee31cXFxcXSsgICAgICAgICAgICAgICAgICAgICAgIC0gYW55dGhpbmcgb3RoZXIgdGhhbiBjdXJseSBicmFjZXMgb3IgYmFja3NsYXNoXHJcbiAgLy8gICAgXFxcXC4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLSBhIGJhY2tzbGFzaCBlc2NhcGVcclxuICAvLyAgICBcXHsoPzpbXnt9XFxcXF0rfFxcXFwuKSpcXH0gICAgICAgICAgLSBhIG1hdGNoZWQgc2V0IG9mIGN1cmx5IGJyYWNlcyBjb250YWluaW5nIG90aGVyIGF0b21zXHJcbiAgdmFyIHBsYWNlaG9sZGVyICAgICAgID0gLyhbOipdKShbXFx3XFxbXFxdXSspfFxceyhbXFx3XFxbXFxdXSspKD86XFw6KCg/Oltee31cXFxcXSt8XFxcXC58XFx7KD86W157fVxcXFxdK3xcXFxcLikqXFx9KSspKT9cXH0vZyxcclxuICAgICAgc2VhcmNoUGxhY2Vob2xkZXIgPSAvKFs6XT8pKFtcXHdcXFtcXF0tXSspfFxceyhbXFx3XFxbXFxdLV0rKSg/OlxcOigoPzpbXnt9XFxcXF0rfFxcXFwufFxceyg/Oltee31cXFxcXSt8XFxcXC4pKlxcfSkrKSk/XFx9L2csXHJcbiAgICAgIGNvbXBpbGVkID0gJ14nLCBsYXN0ID0gMCwgbSxcclxuICAgICAgc2VnbWVudHMgPSB0aGlzLnNlZ21lbnRzID0gW10sXHJcbiAgICAgIHBhcmVudFBhcmFtcyA9IHBhcmVudE1hdGNoZXIgPyBwYXJlbnRNYXRjaGVyLnBhcmFtcyA6IHt9LFxyXG4gICAgICBwYXJhbXMgPSB0aGlzLnBhcmFtcyA9IHBhcmVudE1hdGNoZXIgPyBwYXJlbnRNYXRjaGVyLnBhcmFtcy4kJG5ldygpIDogbmV3ICQkVU1GUC5QYXJhbVNldCgpLFxyXG4gICAgICBwYXJhbU5hbWVzID0gW107XHJcblxyXG4gIGZ1bmN0aW9uIGFkZFBhcmFtZXRlcihpZCwgdHlwZSwgY29uZmlnLCBsb2NhdGlvbikge1xyXG4gICAgcGFyYW1OYW1lcy5wdXNoKGlkKTtcclxuICAgIGlmIChwYXJlbnRQYXJhbXNbaWRdKSByZXR1cm4gcGFyZW50UGFyYW1zW2lkXTtcclxuICAgIGlmICghL15cXHcrKC0rXFx3KykqKD86XFxbXFxdKT8kLy50ZXN0KGlkKSkgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBwYXJhbWV0ZXIgbmFtZSAnXCIgKyBpZCArIFwiJyBpbiBwYXR0ZXJuICdcIiArIHBhdHRlcm4gKyBcIidcIik7XHJcbiAgICBpZiAocGFyYW1zW2lkXSkgdGhyb3cgbmV3IEVycm9yKFwiRHVwbGljYXRlIHBhcmFtZXRlciBuYW1lICdcIiArIGlkICsgXCInIGluIHBhdHRlcm4gJ1wiICsgcGF0dGVybiArIFwiJ1wiKTtcclxuICAgIHBhcmFtc1tpZF0gPSBuZXcgJCRVTUZQLlBhcmFtKGlkLCB0eXBlLCBjb25maWcsIGxvY2F0aW9uKTtcclxuICAgIHJldHVybiBwYXJhbXNbaWRdO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gcXVvdGVSZWdFeHAoc3RyaW5nLCBwYXR0ZXJuLCBzcXVhc2gsIG9wdGlvbmFsKSB7XHJcbiAgICB2YXIgc3Vycm91bmRQYXR0ZXJuID0gWycnLCcnXSwgcmVzdWx0ID0gc3RyaW5nLnJlcGxhY2UoL1tcXFxcXFxbXFxdXFxeJCorPy4oKXx7fV0vZywgXCJcXFxcJCZcIik7XHJcbiAgICBpZiAoIXBhdHRlcm4pIHJldHVybiByZXN1bHQ7XHJcbiAgICBzd2l0Y2goc3F1YXNoKSB7XHJcbiAgICAgIGNhc2UgZmFsc2U6IHN1cnJvdW5kUGF0dGVybiA9IFsnKCcsICcpJyArIChvcHRpb25hbCA/IFwiP1wiIDogXCJcIildOyBicmVhaztcclxuICAgICAgY2FzZSB0cnVlOiAgc3Vycm91bmRQYXR0ZXJuID0gWyc/KCcsICcpPyddOyBicmVhaztcclxuICAgICAgZGVmYXVsdDogICAgc3Vycm91bmRQYXR0ZXJuID0gWycoJyArIHNxdWFzaCArIFwifFwiLCAnKT8nXTsgYnJlYWs7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gcmVzdWx0ICsgc3Vycm91bmRQYXR0ZXJuWzBdICsgcGF0dGVybiArIHN1cnJvdW5kUGF0dGVyblsxXTtcclxuICB9XHJcblxyXG4gIHRoaXMuc291cmNlID0gcGF0dGVybjtcclxuXHJcbiAgLy8gU3BsaXQgaW50byBzdGF0aWMgc2VnbWVudHMgc2VwYXJhdGVkIGJ5IHBhdGggcGFyYW1ldGVyIHBsYWNlaG9sZGVycy5cclxuICAvLyBUaGUgbnVtYmVyIG9mIHNlZ21lbnRzIGlzIGFsd2F5cyAxIG1vcmUgdGhhbiB0aGUgbnVtYmVyIG9mIHBhcmFtZXRlcnMuXHJcbiAgZnVuY3Rpb24gbWF0Y2hEZXRhaWxzKG0sIGlzU2VhcmNoKSB7XHJcbiAgICB2YXIgaWQsIHJlZ2V4cCwgc2VnbWVudCwgdHlwZSwgY2ZnLCBhcnJheU1vZGU7XHJcbiAgICBpZCAgICAgICAgICA9IG1bMl0gfHwgbVszXTsgLy8gSUVbNzhdIHJldHVybnMgJycgZm9yIHVubWF0Y2hlZCBncm91cHMgaW5zdGVhZCBvZiBudWxsXHJcbiAgICBjZmcgICAgICAgICA9IGNvbmZpZy5wYXJhbXNbaWRdO1xyXG4gICAgc2VnbWVudCAgICAgPSBwYXR0ZXJuLnN1YnN0cmluZyhsYXN0LCBtLmluZGV4KTtcclxuICAgIHJlZ2V4cCAgICAgID0gaXNTZWFyY2ggPyBtWzRdIDogbVs0XSB8fCAobVsxXSA9PSAnKicgPyAnLionIDogbnVsbCk7XHJcbiAgICB0eXBlICAgICAgICA9ICQkVU1GUC50eXBlKHJlZ2V4cCB8fCBcInN0cmluZ1wiKSB8fCBpbmhlcml0KCQkVU1GUC50eXBlKFwic3RyaW5nXCIpLCB7IHBhdHRlcm46IG5ldyBSZWdFeHAocmVnZXhwLCBjb25maWcuY2FzZUluc2Vuc2l0aXZlID8gJ2knIDogdW5kZWZpbmVkKSB9KTtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGlkOiBpZCwgcmVnZXhwOiByZWdleHAsIHNlZ21lbnQ6IHNlZ21lbnQsIHR5cGU6IHR5cGUsIGNmZzogY2ZnXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgdmFyIHAsIHBhcmFtLCBzZWdtZW50O1xyXG4gIHdoaWxlICgobSA9IHBsYWNlaG9sZGVyLmV4ZWMocGF0dGVybikpKSB7XHJcbiAgICBwID0gbWF0Y2hEZXRhaWxzKG0sIGZhbHNlKTtcclxuICAgIGlmIChwLnNlZ21lbnQuaW5kZXhPZignPycpID49IDApIGJyZWFrOyAvLyB3ZSdyZSBpbnRvIHRoZSBzZWFyY2ggcGFydFxyXG5cclxuICAgIHBhcmFtID0gYWRkUGFyYW1ldGVyKHAuaWQsIHAudHlwZSwgcC5jZmcsIFwicGF0aFwiKTtcclxuICAgIGNvbXBpbGVkICs9IHF1b3RlUmVnRXhwKHAuc2VnbWVudCwgcGFyYW0udHlwZS5wYXR0ZXJuLnNvdXJjZSwgcGFyYW0uc3F1YXNoLCBwYXJhbS5pc09wdGlvbmFsKTtcclxuICAgIHNlZ21lbnRzLnB1c2gocC5zZWdtZW50KTtcclxuICAgIGxhc3QgPSBwbGFjZWhvbGRlci5sYXN0SW5kZXg7XHJcbiAgfVxyXG4gIHNlZ21lbnQgPSBwYXR0ZXJuLnN1YnN0cmluZyhsYXN0KTtcclxuXHJcbiAgLy8gRmluZCBhbnkgc2VhcmNoIHBhcmFtZXRlciBuYW1lcyBhbmQgcmVtb3ZlIHRoZW0gZnJvbSB0aGUgbGFzdCBzZWdtZW50XHJcbiAgdmFyIGkgPSBzZWdtZW50LmluZGV4T2YoJz8nKTtcclxuXHJcbiAgaWYgKGkgPj0gMCkge1xyXG4gICAgdmFyIHNlYXJjaCA9IHRoaXMuc291cmNlU2VhcmNoID0gc2VnbWVudC5zdWJzdHJpbmcoaSk7XHJcbiAgICBzZWdtZW50ID0gc2VnbWVudC5zdWJzdHJpbmcoMCwgaSk7XHJcbiAgICB0aGlzLnNvdXJjZVBhdGggPSBwYXR0ZXJuLnN1YnN0cmluZygwLCBsYXN0ICsgaSk7XHJcblxyXG4gICAgaWYgKHNlYXJjaC5sZW5ndGggPiAwKSB7XHJcbiAgICAgIGxhc3QgPSAwO1xyXG4gICAgICB3aGlsZSAoKG0gPSBzZWFyY2hQbGFjZWhvbGRlci5leGVjKHNlYXJjaCkpKSB7XHJcbiAgICAgICAgcCA9IG1hdGNoRGV0YWlscyhtLCB0cnVlKTtcclxuICAgICAgICBwYXJhbSA9IGFkZFBhcmFtZXRlcihwLmlkLCBwLnR5cGUsIHAuY2ZnLCBcInNlYXJjaFwiKTtcclxuICAgICAgICBsYXN0ID0gcGxhY2Vob2xkZXIubGFzdEluZGV4O1xyXG4gICAgICAgIC8vIGNoZWNrIGlmID8mXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9IGVsc2Uge1xyXG4gICAgdGhpcy5zb3VyY2VQYXRoID0gcGF0dGVybjtcclxuICAgIHRoaXMuc291cmNlU2VhcmNoID0gJyc7XHJcbiAgfVxyXG5cclxuICBjb21waWxlZCArPSBxdW90ZVJlZ0V4cChzZWdtZW50KSArIChjb25maWcuc3RyaWN0ID09PSBmYWxzZSA/ICdcXC8/JyA6ICcnKSArICckJztcclxuICBzZWdtZW50cy5wdXNoKHNlZ21lbnQpO1xyXG5cclxuICB0aGlzLnJlZ2V4cCA9IG5ldyBSZWdFeHAoY29tcGlsZWQsIGNvbmZpZy5jYXNlSW5zZW5zaXRpdmUgPyAnaScgOiB1bmRlZmluZWQpO1xyXG4gIHRoaXMucHJlZml4ID0gc2VnbWVudHNbMF07XHJcbiAgdGhpcy4kJHBhcmFtTmFtZXMgPSBwYXJhbU5hbWVzO1xyXG59XHJcblxyXG4vKipcclxuICogQG5nZG9jIGZ1bmN0aW9uXHJcbiAqIEBuYW1lIHVpLnJvdXRlci51dGlsLnR5cGU6VXJsTWF0Y2hlciNjb25jYXRcclxuICogQG1ldGhvZE9mIHVpLnJvdXRlci51dGlsLnR5cGU6VXJsTWF0Y2hlclxyXG4gKlxyXG4gKiBAZGVzY3JpcHRpb25cclxuICogUmV0dXJucyBhIG5ldyBtYXRjaGVyIGZvciBhIHBhdHRlcm4gY29uc3RydWN0ZWQgYnkgYXBwZW5kaW5nIHRoZSBwYXRoIHBhcnQgYW5kIGFkZGluZyB0aGVcclxuICogc2VhcmNoIHBhcmFtZXRlcnMgb2YgdGhlIHNwZWNpZmllZCBwYXR0ZXJuIHRvIHRoaXMgcGF0dGVybi4gVGhlIGN1cnJlbnQgcGF0dGVybiBpcyBub3RcclxuICogbW9kaWZpZWQuIFRoaXMgY2FuIGJlIHVuZGVyc3Rvb2QgYXMgY3JlYXRpbmcgYSBwYXR0ZXJuIGZvciBVUkxzIHRoYXQgYXJlIHJlbGF0aXZlIHRvIChvclxyXG4gKiBzdWZmaXhlcyBvZikgdGhlIGN1cnJlbnQgcGF0dGVybi5cclxuICpcclxuICogQGV4YW1wbGVcclxuICogVGhlIGZvbGxvd2luZyB0d28gbWF0Y2hlcnMgYXJlIGVxdWl2YWxlbnQ6XHJcbiAqIDxwcmU+XHJcbiAqIG5ldyBVcmxNYXRjaGVyKCcvdXNlci97aWR9P3EnKS5jb25jYXQoJy9kZXRhaWxzP2RhdGUnKTtcclxuICogbmV3IFVybE1hdGNoZXIoJy91c2VyL3tpZH0vZGV0YWlscz9xJmRhdGUnKTtcclxuICogPC9wcmU+XHJcbiAqXHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXR0ZXJuICBUaGUgcGF0dGVybiB0byBhcHBlbmQuXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgIEFuIG9iamVjdCBoYXNoIG9mIHRoZSBjb25maWd1cmF0aW9uIGZvciB0aGUgbWF0Y2hlci5cclxuICogQHJldHVybnMge1VybE1hdGNoZXJ9ICBBIG1hdGNoZXIgZm9yIHRoZSBjb25jYXRlbmF0ZWQgcGF0dGVybi5cclxuICovXHJcblVybE1hdGNoZXIucHJvdG90eXBlLmNvbmNhdCA9IGZ1bmN0aW9uIChwYXR0ZXJuLCBjb25maWcpIHtcclxuICAvLyBCZWNhdXNlIG9yZGVyIG9mIHNlYXJjaCBwYXJhbWV0ZXJzIGlzIGlycmVsZXZhbnQsIHdlIGNhbiBhZGQgb3VyIG93biBzZWFyY2hcclxuICAvLyBwYXJhbWV0ZXJzIHRvIHRoZSBlbmQgb2YgdGhlIG5ldyBwYXR0ZXJuLiBQYXJzZSB0aGUgbmV3IHBhdHRlcm4gYnkgaXRzZWxmXHJcbiAgLy8gYW5kIHRoZW4gam9pbiB0aGUgYml0cyB0b2dldGhlciwgYnV0IGl0J3MgbXVjaCBlYXNpZXIgdG8gZG8gdGhpcyBvbiBhIHN0cmluZyBsZXZlbC5cclxuICB2YXIgZGVmYXVsdENvbmZpZyA9IHtcclxuICAgIGNhc2VJbnNlbnNpdGl2ZTogJCRVTUZQLmNhc2VJbnNlbnNpdGl2ZSgpLFxyXG4gICAgc3RyaWN0OiAkJFVNRlAuc3RyaWN0TW9kZSgpLFxyXG4gICAgc3F1YXNoOiAkJFVNRlAuZGVmYXVsdFNxdWFzaFBvbGljeSgpXHJcbiAgfTtcclxuICByZXR1cm4gbmV3IFVybE1hdGNoZXIodGhpcy5zb3VyY2VQYXRoICsgcGF0dGVybiArIHRoaXMuc291cmNlU2VhcmNoLCBleHRlbmQoZGVmYXVsdENvbmZpZywgY29uZmlnKSwgdGhpcyk7XHJcbn07XHJcblxyXG5VcmxNYXRjaGVyLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uICgpIHtcclxuICByZXR1cm4gdGhpcy5zb3VyY2U7XHJcbn07XHJcblxyXG4vKipcclxuICogQG5nZG9jIGZ1bmN0aW9uXHJcbiAqIEBuYW1lIHVpLnJvdXRlci51dGlsLnR5cGU6VXJsTWF0Y2hlciNleGVjXHJcbiAqIEBtZXRob2RPZiB1aS5yb3V0ZXIudXRpbC50eXBlOlVybE1hdGNoZXJcclxuICpcclxuICogQGRlc2NyaXB0aW9uXHJcbiAqIFRlc3RzIHRoZSBzcGVjaWZpZWQgcGF0aCBhZ2FpbnN0IHRoaXMgbWF0Y2hlciwgYW5kIHJldHVybnMgYW4gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIGNhcHR1cmVkXHJcbiAqIHBhcmFtZXRlciB2YWx1ZXMsIG9yIG51bGwgaWYgdGhlIHBhdGggZG9lcyBub3QgbWF0Y2guIFRoZSByZXR1cm5lZCBvYmplY3QgY29udGFpbnMgdGhlIHZhbHVlc1xyXG4gKiBvZiBhbnkgc2VhcmNoIHBhcmFtZXRlcnMgdGhhdCBhcmUgbWVudGlvbmVkIGluIHRoZSBwYXR0ZXJuLCBidXQgdGhlaXIgdmFsdWUgbWF5IGJlIG51bGwgaWZcclxuICogdGhleSBhcmUgbm90IHByZXNlbnQgaW4gYHNlYXJjaFBhcmFtc2AuIFRoaXMgbWVhbnMgdGhhdCBzZWFyY2ggcGFyYW1ldGVycyBhcmUgYWx3YXlzIHRyZWF0ZWRcclxuICogYXMgb3B0aW9uYWwuXHJcbiAqXHJcbiAqIEBleGFtcGxlXHJcbiAqIDxwcmU+XHJcbiAqIG5ldyBVcmxNYXRjaGVyKCcvdXNlci97aWR9P3EmcicpLmV4ZWMoJy91c2VyL2JvYicsIHtcclxuICogICB4OiAnMScsIHE6ICdoZWxsbydcclxuICogfSk7XHJcbiAqIC8vIHJldHVybnMgeyBpZDogJ2JvYicsIHE6ICdoZWxsbycsIHI6IG51bGwgfVxyXG4gKiA8L3ByZT5cclxuICpcclxuICogQHBhcmFtIHtzdHJpbmd9IHBhdGggIFRoZSBVUkwgcGF0aCB0byBtYXRjaCwgZS5nLiBgJGxvY2F0aW9uLnBhdGgoKWAuXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBzZWFyY2hQYXJhbXMgIFVSTCBzZWFyY2ggcGFyYW1ldGVycywgZS5nLiBgJGxvY2F0aW9uLnNlYXJjaCgpYC5cclxuICogQHJldHVybnMge09iamVjdH0gIFRoZSBjYXB0dXJlZCBwYXJhbWV0ZXIgdmFsdWVzLlxyXG4gKi9cclxuVXJsTWF0Y2hlci5wcm90b3R5cGUuZXhlYyA9IGZ1bmN0aW9uIChwYXRoLCBzZWFyY2hQYXJhbXMpIHtcclxuICB2YXIgbSA9IHRoaXMucmVnZXhwLmV4ZWMocGF0aCk7XHJcbiAgaWYgKCFtKSByZXR1cm4gbnVsbDtcclxuICBzZWFyY2hQYXJhbXMgPSBzZWFyY2hQYXJhbXMgfHwge307XHJcblxyXG4gIHZhciBwYXJhbU5hbWVzID0gdGhpcy5wYXJhbWV0ZXJzKCksIG5Ub3RhbCA9IHBhcmFtTmFtZXMubGVuZ3RoLFxyXG4gICAgblBhdGggPSB0aGlzLnNlZ21lbnRzLmxlbmd0aCAtIDEsXHJcbiAgICB2YWx1ZXMgPSB7fSwgaSwgaiwgY2ZnLCBwYXJhbU5hbWU7XHJcblxyXG4gIGlmIChuUGF0aCAhPT0gbS5sZW5ndGggLSAxKSB0aHJvdyBuZXcgRXJyb3IoXCJVbmJhbGFuY2VkIGNhcHR1cmUgZ3JvdXAgaW4gcm91dGUgJ1wiICsgdGhpcy5zb3VyY2UgKyBcIidcIik7XHJcblxyXG4gIGZ1bmN0aW9uIGRlY29kZVBhdGhBcnJheShzdHJpbmcpIHtcclxuICAgIGZ1bmN0aW9uIHJldmVyc2VTdHJpbmcoc3RyKSB7IHJldHVybiBzdHIuc3BsaXQoXCJcIikucmV2ZXJzZSgpLmpvaW4oXCJcIik7IH1cclxuICAgIGZ1bmN0aW9uIHVucXVvdGVEYXNoZXMoc3RyKSB7IHJldHVybiBzdHIucmVwbGFjZSgvXFxcXC0vZywgXCItXCIpOyB9XHJcblxyXG4gICAgdmFyIHNwbGl0ID0gcmV2ZXJzZVN0cmluZyhzdHJpbmcpLnNwbGl0KC8tKD8hXFxcXCkvKTtcclxuICAgIHZhciBhbGxSZXZlcnNlZCA9IG1hcChzcGxpdCwgcmV2ZXJzZVN0cmluZyk7XHJcbiAgICByZXR1cm4gbWFwKGFsbFJldmVyc2VkLCB1bnF1b3RlRGFzaGVzKS5yZXZlcnNlKCk7XHJcbiAgfVxyXG5cclxuICBmb3IgKGkgPSAwOyBpIDwgblBhdGg7IGkrKykge1xyXG4gICAgcGFyYW1OYW1lID0gcGFyYW1OYW1lc1tpXTtcclxuICAgIHZhciBwYXJhbSA9IHRoaXMucGFyYW1zW3BhcmFtTmFtZV07XHJcbiAgICB2YXIgcGFyYW1WYWwgPSBtW2krMV07XHJcbiAgICAvLyBpZiB0aGUgcGFyYW0gdmFsdWUgbWF0Y2hlcyBhIHByZS1yZXBsYWNlIHBhaXIsIHJlcGxhY2UgdGhlIHZhbHVlIGJlZm9yZSBkZWNvZGluZy5cclxuICAgIGZvciAoaiA9IDA7IGogPCBwYXJhbS5yZXBsYWNlOyBqKyspIHtcclxuICAgICAgaWYgKHBhcmFtLnJlcGxhY2Vbal0uZnJvbSA9PT0gcGFyYW1WYWwpIHBhcmFtVmFsID0gcGFyYW0ucmVwbGFjZVtqXS50bztcclxuICAgIH1cclxuICAgIGlmIChwYXJhbVZhbCAmJiBwYXJhbS5hcnJheSA9PT0gdHJ1ZSkgcGFyYW1WYWwgPSBkZWNvZGVQYXRoQXJyYXkocGFyYW1WYWwpO1xyXG4gICAgdmFsdWVzW3BhcmFtTmFtZV0gPSBwYXJhbS52YWx1ZShwYXJhbVZhbCk7XHJcbiAgfVxyXG4gIGZvciAoLyoqLzsgaSA8IG5Ub3RhbDsgaSsrKSB7XHJcbiAgICBwYXJhbU5hbWUgPSBwYXJhbU5hbWVzW2ldO1xyXG4gICAgdmFsdWVzW3BhcmFtTmFtZV0gPSB0aGlzLnBhcmFtc1twYXJhbU5hbWVdLnZhbHVlKHNlYXJjaFBhcmFtc1twYXJhbU5hbWVdKTtcclxuICB9XHJcblxyXG4gIHJldHVybiB2YWx1ZXM7XHJcbn07XHJcblxyXG4vKipcclxuICogQG5nZG9jIGZ1bmN0aW9uXHJcbiAqIEBuYW1lIHVpLnJvdXRlci51dGlsLnR5cGU6VXJsTWF0Y2hlciNwYXJhbWV0ZXJzXHJcbiAqIEBtZXRob2RPZiB1aS5yb3V0ZXIudXRpbC50eXBlOlVybE1hdGNoZXJcclxuICpcclxuICogQGRlc2NyaXB0aW9uXHJcbiAqIFJldHVybnMgdGhlIG5hbWVzIG9mIGFsbCBwYXRoIGFuZCBzZWFyY2ggcGFyYW1ldGVycyBvZiB0aGlzIHBhdHRlcm4gaW4gYW4gdW5zcGVjaWZpZWQgb3JkZXIuXHJcbiAqXHJcbiAqIEByZXR1cm5zIHtBcnJheS48c3RyaW5nPn0gIEFuIGFycmF5IG9mIHBhcmFtZXRlciBuYW1lcy4gTXVzdCBiZSB0cmVhdGVkIGFzIHJlYWQtb25seS4gSWYgdGhlXHJcbiAqICAgIHBhdHRlcm4gaGFzIG5vIHBhcmFtZXRlcnMsIGFuIGVtcHR5IGFycmF5IGlzIHJldHVybmVkLlxyXG4gKi9cclxuVXJsTWF0Y2hlci5wcm90b3R5cGUucGFyYW1ldGVycyA9IGZ1bmN0aW9uIChwYXJhbSkge1xyXG4gIGlmICghaXNEZWZpbmVkKHBhcmFtKSkgcmV0dXJuIHRoaXMuJCRwYXJhbU5hbWVzO1xyXG4gIHJldHVybiB0aGlzLnBhcmFtc1twYXJhbV0gfHwgbnVsbDtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBAbmdkb2MgZnVuY3Rpb25cclxuICogQG5hbWUgdWkucm91dGVyLnV0aWwudHlwZTpVcmxNYXRjaGVyI3ZhbGlkYXRlXHJcbiAqIEBtZXRob2RPZiB1aS5yb3V0ZXIudXRpbC50eXBlOlVybE1hdGNoZXJcclxuICpcclxuICogQGRlc2NyaXB0aW9uXHJcbiAqIENoZWNrcyBhbiBvYmplY3QgaGFzaCBvZiBwYXJhbWV0ZXJzIHRvIHZhbGlkYXRlIHRoZWlyIGNvcnJlY3RuZXNzIGFjY29yZGluZyB0byB0aGUgcGFyYW1ldGVyXHJcbiAqIHR5cGVzIG9mIHRoaXMgYFVybE1hdGNoZXJgLlxyXG4gKlxyXG4gKiBAcGFyYW0ge09iamVjdH0gcGFyYW1zIFRoZSBvYmplY3QgaGFzaCBvZiBwYXJhbWV0ZXJzIHRvIHZhbGlkYXRlLlxyXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHBhcmFtc2AgdmFsaWRhdGVzLCBvdGhlcndpc2UgYGZhbHNlYC5cclxuICovXHJcblVybE1hdGNoZXIucHJvdG90eXBlLnZhbGlkYXRlcyA9IGZ1bmN0aW9uIChwYXJhbXMpIHtcclxuICByZXR1cm4gdGhpcy5wYXJhbXMuJCR2YWxpZGF0ZXMocGFyYW1zKTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBAbmdkb2MgZnVuY3Rpb25cclxuICogQG5hbWUgdWkucm91dGVyLnV0aWwudHlwZTpVcmxNYXRjaGVyI2Zvcm1hdFxyXG4gKiBAbWV0aG9kT2YgdWkucm91dGVyLnV0aWwudHlwZTpVcmxNYXRjaGVyXHJcbiAqXHJcbiAqIEBkZXNjcmlwdGlvblxyXG4gKiBDcmVhdGVzIGEgVVJMIHRoYXQgbWF0Y2hlcyB0aGlzIHBhdHRlcm4gYnkgc3Vic3RpdHV0aW5nIHRoZSBzcGVjaWZpZWQgdmFsdWVzXHJcbiAqIGZvciB0aGUgcGF0aCBhbmQgc2VhcmNoIHBhcmFtZXRlcnMuIE51bGwgdmFsdWVzIGZvciBwYXRoIHBhcmFtZXRlcnMgYXJlXHJcbiAqIHRyZWF0ZWQgYXMgZW1wdHkgc3RyaW5ncy5cclxuICpcclxuICogQGV4YW1wbGVcclxuICogPHByZT5cclxuICogbmV3IFVybE1hdGNoZXIoJy91c2VyL3tpZH0/cScpLmZvcm1hdCh7IGlkOidib2InLCBxOid5ZXMnIH0pO1xyXG4gKiAvLyByZXR1cm5zICcvdXNlci9ib2I/cT15ZXMnXHJcbiAqIDwvcHJlPlxyXG4gKlxyXG4gKiBAcGFyYW0ge09iamVjdH0gdmFsdWVzICB0aGUgdmFsdWVzIHRvIHN1YnN0aXR1dGUgZm9yIHRoZSBwYXJhbWV0ZXJzIGluIHRoaXMgcGF0dGVybi5cclxuICogQHJldHVybnMge3N0cmluZ30gIHRoZSBmb3JtYXR0ZWQgVVJMIChwYXRoIGFuZCBvcHRpb25hbGx5IHNlYXJjaCBwYXJ0KS5cclxuICovXHJcblVybE1hdGNoZXIucHJvdG90eXBlLmZvcm1hdCA9IGZ1bmN0aW9uICh2YWx1ZXMpIHtcclxuICB2YWx1ZXMgPSB2YWx1ZXMgfHwge307XHJcbiAgdmFyIHNlZ21lbnRzID0gdGhpcy5zZWdtZW50cywgcGFyYW1zID0gdGhpcy5wYXJhbWV0ZXJzKCksIHBhcmFtc2V0ID0gdGhpcy5wYXJhbXM7XHJcbiAgaWYgKCF0aGlzLnZhbGlkYXRlcyh2YWx1ZXMpKSByZXR1cm4gbnVsbDtcclxuXHJcbiAgdmFyIGksIHNlYXJjaCA9IGZhbHNlLCBuUGF0aCA9IHNlZ21lbnRzLmxlbmd0aCAtIDEsIG5Ub3RhbCA9IHBhcmFtcy5sZW5ndGgsIHJlc3VsdCA9IHNlZ21lbnRzWzBdO1xyXG5cclxuICBmdW5jdGlvbiBlbmNvZGVEYXNoZXMoc3RyKSB7IC8vIFJlcGxhY2UgZGFzaGVzIHdpdGggZW5jb2RlZCBcIlxcLVwiXHJcbiAgICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KHN0cikucmVwbGFjZSgvLS9nLCBmdW5jdGlvbihjKSB7IHJldHVybiAnJTVDJScgKyBjLmNoYXJDb2RlQXQoMCkudG9TdHJpbmcoMTYpLnRvVXBwZXJDYXNlKCk7IH0pO1xyXG4gIH1cclxuXHJcbiAgZm9yIChpID0gMDsgaSA8IG5Ub3RhbDsgaSsrKSB7XHJcbiAgICB2YXIgaXNQYXRoUGFyYW0gPSBpIDwgblBhdGg7XHJcbiAgICB2YXIgbmFtZSA9IHBhcmFtc1tpXSwgcGFyYW0gPSBwYXJhbXNldFtuYW1lXSwgdmFsdWUgPSBwYXJhbS52YWx1ZSh2YWx1ZXNbbmFtZV0pO1xyXG4gICAgdmFyIGlzRGVmYXVsdFZhbHVlID0gcGFyYW0uaXNPcHRpb25hbCAmJiBwYXJhbS50eXBlLmVxdWFscyhwYXJhbS52YWx1ZSgpLCB2YWx1ZSk7XHJcbiAgICB2YXIgc3F1YXNoID0gaXNEZWZhdWx0VmFsdWUgPyBwYXJhbS5zcXVhc2ggOiBmYWxzZTtcclxuICAgIHZhciBlbmNvZGVkID0gcGFyYW0udHlwZS5lbmNvZGUodmFsdWUpO1xyXG5cclxuICAgIGlmIChpc1BhdGhQYXJhbSkge1xyXG4gICAgICB2YXIgbmV4dFNlZ21lbnQgPSBzZWdtZW50c1tpICsgMV07XHJcbiAgICAgIGlmIChzcXVhc2ggPT09IGZhbHNlKSB7XHJcbiAgICAgICAgaWYgKGVuY29kZWQgIT0gbnVsbCkge1xyXG4gICAgICAgICAgaWYgKGlzQXJyYXkoZW5jb2RlZCkpIHtcclxuICAgICAgICAgICAgcmVzdWx0ICs9IG1hcChlbmNvZGVkLCBlbmNvZGVEYXNoZXMpLmpvaW4oXCItXCIpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmVzdWx0ICs9IGVuY29kZVVSSUNvbXBvbmVudChlbmNvZGVkKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmVzdWx0ICs9IG5leHRTZWdtZW50O1xyXG4gICAgICB9IGVsc2UgaWYgKHNxdWFzaCA9PT0gdHJ1ZSkge1xyXG4gICAgICAgIHZhciBjYXB0dXJlID0gcmVzdWx0Lm1hdGNoKC9cXC8kLykgPyAvXFwvPyguKikvIDogLyguKikvO1xyXG4gICAgICAgIHJlc3VsdCArPSBuZXh0U2VnbWVudC5tYXRjaChjYXB0dXJlKVsxXTtcclxuICAgICAgfSBlbHNlIGlmIChpc1N0cmluZyhzcXVhc2gpKSB7XHJcbiAgICAgICAgcmVzdWx0ICs9IHNxdWFzaCArIG5leHRTZWdtZW50O1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBpZiAoZW5jb2RlZCA9PSBudWxsIHx8IChpc0RlZmF1bHRWYWx1ZSAmJiBzcXVhc2ggIT09IGZhbHNlKSkgY29udGludWU7XHJcbiAgICAgIGlmICghaXNBcnJheShlbmNvZGVkKSkgZW5jb2RlZCA9IFsgZW5jb2RlZCBdO1xyXG4gICAgICBlbmNvZGVkID0gbWFwKGVuY29kZWQsIGVuY29kZVVSSUNvbXBvbmVudCkuam9pbignJicgKyBuYW1lICsgJz0nKTtcclxuICAgICAgcmVzdWx0ICs9IChzZWFyY2ggPyAnJicgOiAnPycpICsgKG5hbWUgKyAnPScgKyBlbmNvZGVkKTtcclxuICAgICAgc2VhcmNoID0gdHJ1ZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiByZXN1bHQ7XHJcbn07XHJcblxyXG4vKipcclxuICogQG5nZG9jIG9iamVjdFxyXG4gKiBAbmFtZSB1aS5yb3V0ZXIudXRpbC50eXBlOlR5cGVcclxuICpcclxuICogQGRlc2NyaXB0aW9uXHJcbiAqIEltcGxlbWVudHMgYW4gaW50ZXJmYWNlIHRvIGRlZmluZSBjdXN0b20gcGFyYW1ldGVyIHR5cGVzIHRoYXQgY2FuIGJlIGRlY29kZWQgZnJvbSBhbmQgZW5jb2RlZCB0b1xyXG4gKiBzdHJpbmcgcGFyYW1ldGVycyBtYXRjaGVkIGluIGEgVVJMLiBVc2VkIGJ5IHtAbGluayB1aS5yb3V0ZXIudXRpbC50eXBlOlVybE1hdGNoZXIgYFVybE1hdGNoZXJgfVxyXG4gKiBvYmplY3RzIHdoZW4gbWF0Y2hpbmcgb3IgZm9ybWF0dGluZyBVUkxzLCBvciBjb21wYXJpbmcgb3IgdmFsaWRhdGluZyBwYXJhbWV0ZXIgdmFsdWVzLlxyXG4gKlxyXG4gKiBTZWUge0BsaW5rIHVpLnJvdXRlci51dGlsLiR1cmxNYXRjaGVyRmFjdG9yeSNtZXRob2RzX3R5cGUgYCR1cmxNYXRjaGVyRmFjdG9yeSN0eXBlKClgfSBmb3IgbW9yZVxyXG4gKiBpbmZvcm1hdGlvbiBvbiByZWdpc3RlcmluZyBjdXN0b20gdHlwZXMuXHJcbiAqXHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb25maWcgIEEgY29uZmlndXJhdGlvbiBvYmplY3Qgd2hpY2ggY29udGFpbnMgdGhlIGN1c3RvbSB0eXBlIGRlZmluaXRpb24uICBUaGUgb2JqZWN0J3NcclxuICogICAgICAgIHByb3BlcnRpZXMgd2lsbCBvdmVycmlkZSB0aGUgZGVmYXVsdCBtZXRob2RzIGFuZC9vciBwYXR0ZXJuIGluIGBUeXBlYCdzIHB1YmxpYyBpbnRlcmZhY2UuXHJcbiAqIEBleGFtcGxlXHJcbiAqIDxwcmU+XHJcbiAqIHtcclxuICogICBkZWNvZGU6IGZ1bmN0aW9uKHZhbCkgeyByZXR1cm4gcGFyc2VJbnQodmFsLCAxMCk7IH0sXHJcbiAqICAgZW5jb2RlOiBmdW5jdGlvbih2YWwpIHsgcmV0dXJuIHZhbCAmJiB2YWwudG9TdHJpbmcoKTsgfSxcclxuICogICBlcXVhbHM6IGZ1bmN0aW9uKGEsIGIpIHsgcmV0dXJuIHRoaXMuaXMoYSkgJiYgYSA9PT0gYjsgfSxcclxuICogICBpczogZnVuY3Rpb24odmFsKSB7IHJldHVybiBhbmd1bGFyLmlzTnVtYmVyKHZhbCkgaXNGaW5pdGUodmFsKSAmJiB2YWwgJSAxID09PSAwOyB9LFxyXG4gKiAgIHBhdHRlcm46IC9cXGQrL1xyXG4gKiB9XHJcbiAqIDwvcHJlPlxyXG4gKlxyXG4gKiBAcHJvcGVydHkge1JlZ0V4cH0gcGF0dGVybiBUaGUgcmVndWxhciBleHByZXNzaW9uIHBhdHRlcm4gdXNlZCB0byBtYXRjaCB2YWx1ZXMgb2YgdGhpcyB0eXBlIHdoZW5cclxuICogICAgICAgICAgIGNvbWluZyBmcm9tIGEgc3Vic3RyaW5nIG9mIGEgVVJMLlxyXG4gKlxyXG4gKiBAcmV0dXJucyB7T2JqZWN0fSAgUmV0dXJucyBhIG5ldyBgVHlwZWAgb2JqZWN0LlxyXG4gKi9cclxuZnVuY3Rpb24gVHlwZShjb25maWcpIHtcclxuICBleHRlbmQodGhpcywgY29uZmlnKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIEBuZ2RvYyBmdW5jdGlvblxyXG4gKiBAbmFtZSB1aS5yb3V0ZXIudXRpbC50eXBlOlR5cGUjaXNcclxuICogQG1ldGhvZE9mIHVpLnJvdXRlci51dGlsLnR5cGU6VHlwZVxyXG4gKlxyXG4gKiBAZGVzY3JpcHRpb25cclxuICogRGV0ZWN0cyB3aGV0aGVyIGEgdmFsdWUgaXMgb2YgYSBwYXJ0aWN1bGFyIHR5cGUuIEFjY2VwdHMgYSBuYXRpdmUgKGRlY29kZWQpIHZhbHVlXHJcbiAqIGFuZCBkZXRlcm1pbmVzIHdoZXRoZXIgaXQgbWF0Y2hlcyB0aGUgY3VycmVudCBgVHlwZWAgb2JqZWN0LlxyXG4gKlxyXG4gKiBAcGFyYW0geyp9IHZhbCAgVGhlIHZhbHVlIHRvIGNoZWNrLlxyXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5ICBPcHRpb25hbC4gSWYgdGhlIHR5cGUgY2hlY2sgaXMgaGFwcGVuaW5nIGluIHRoZSBjb250ZXh0IG9mIGEgc3BlY2lmaWNcclxuICogICAgICAgIHtAbGluayB1aS5yb3V0ZXIudXRpbC50eXBlOlVybE1hdGNoZXIgYFVybE1hdGNoZXJgfSBvYmplY3QsIHRoaXMgaXMgdGhlIG5hbWUgb2YgdGhlXHJcbiAqICAgICAgICBwYXJhbWV0ZXIgaW4gd2hpY2ggYHZhbGAgaXMgc3RvcmVkLiBDYW4gYmUgdXNlZCBmb3IgbWV0YS1wcm9ncmFtbWluZyBvZiBgVHlwZWAgb2JqZWN0cy5cclxuICogQHJldHVybnMge0Jvb2xlYW59ICBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgdmFsdWUgbWF0Y2hlcyB0aGUgdHlwZSwgb3RoZXJ3aXNlIGBmYWxzZWAuXHJcbiAqL1xyXG5UeXBlLnByb3RvdHlwZS5pcyA9IGZ1bmN0aW9uKHZhbCwga2V5KSB7XHJcbiAgcmV0dXJuIHRydWU7XHJcbn07XHJcblxyXG4vKipcclxuICogQG5nZG9jIGZ1bmN0aW9uXHJcbiAqIEBuYW1lIHVpLnJvdXRlci51dGlsLnR5cGU6VHlwZSNlbmNvZGVcclxuICogQG1ldGhvZE9mIHVpLnJvdXRlci51dGlsLnR5cGU6VHlwZVxyXG4gKlxyXG4gKiBAZGVzY3JpcHRpb25cclxuICogRW5jb2RlcyBhIGN1c3RvbS9uYXRpdmUgdHlwZSB2YWx1ZSB0byBhIHN0cmluZyB0aGF0IGNhbiBiZSBlbWJlZGRlZCBpbiBhIFVSTC4gTm90ZSB0aGF0IHRoZVxyXG4gKiByZXR1cm4gdmFsdWUgZG9lcyAqbm90KiBuZWVkIHRvIGJlIFVSTC1zYWZlIChpLmUuIHBhc3NlZCB0aHJvdWdoIGBlbmNvZGVVUklDb21wb25lbnQoKWApLCBpdFxyXG4gKiBvbmx5IG5lZWRzIHRvIGJlIGEgcmVwcmVzZW50YXRpb24gb2YgYHZhbGAgdGhhdCBoYXMgYmVlbiBjb2VyY2VkIHRvIGEgc3RyaW5nLlxyXG4gKlxyXG4gKiBAcGFyYW0geyp9IHZhbCAgVGhlIHZhbHVlIHRvIGVuY29kZS5cclxuICogQHBhcmFtIHtzdHJpbmd9IGtleSAgVGhlIG5hbWUgb2YgdGhlIHBhcmFtZXRlciBpbiB3aGljaCBgdmFsYCBpcyBzdG9yZWQuIENhbiBiZSB1c2VkIGZvclxyXG4gKiAgICAgICAgbWV0YS1wcm9ncmFtbWluZyBvZiBgVHlwZWAgb2JqZWN0cy5cclxuICogQHJldHVybnMge3N0cmluZ30gIFJldHVybnMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgYHZhbGAgdGhhdCBjYW4gYmUgZW5jb2RlZCBpbiBhIFVSTC5cclxuICovXHJcblR5cGUucHJvdG90eXBlLmVuY29kZSA9IGZ1bmN0aW9uKHZhbCwga2V5KSB7XHJcbiAgcmV0dXJuIHZhbDtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBAbmdkb2MgZnVuY3Rpb25cclxuICogQG5hbWUgdWkucm91dGVyLnV0aWwudHlwZTpUeXBlI2RlY29kZVxyXG4gKiBAbWV0aG9kT2YgdWkucm91dGVyLnV0aWwudHlwZTpUeXBlXHJcbiAqXHJcbiAqIEBkZXNjcmlwdGlvblxyXG4gKiBDb252ZXJ0cyBhIHBhcmFtZXRlciB2YWx1ZSAoZnJvbSBVUkwgc3RyaW5nIG9yIHRyYW5zaXRpb24gcGFyYW0pIHRvIGEgY3VzdG9tL25hdGl2ZSB2YWx1ZS5cclxuICpcclxuICogQHBhcmFtIHtzdHJpbmd9IHZhbCAgVGhlIFVSTCBwYXJhbWV0ZXIgdmFsdWUgdG8gZGVjb2RlLlxyXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5ICBUaGUgbmFtZSBvZiB0aGUgcGFyYW1ldGVyIGluIHdoaWNoIGB2YWxgIGlzIHN0b3JlZC4gQ2FuIGJlIHVzZWQgZm9yXHJcbiAqICAgICAgICBtZXRhLXByb2dyYW1taW5nIG9mIGBUeXBlYCBvYmplY3RzLlxyXG4gKiBAcmV0dXJucyB7Kn0gIFJldHVybnMgYSBjdXN0b20gcmVwcmVzZW50YXRpb24gb2YgdGhlIFVSTCBwYXJhbWV0ZXIgdmFsdWUuXHJcbiAqL1xyXG5UeXBlLnByb3RvdHlwZS5kZWNvZGUgPSBmdW5jdGlvbih2YWwsIGtleSkge1xyXG4gIHJldHVybiB2YWw7XHJcbn07XHJcblxyXG4vKipcclxuICogQG5nZG9jIGZ1bmN0aW9uXHJcbiAqIEBuYW1lIHVpLnJvdXRlci51dGlsLnR5cGU6VHlwZSNlcXVhbHNcclxuICogQG1ldGhvZE9mIHVpLnJvdXRlci51dGlsLnR5cGU6VHlwZVxyXG4gKlxyXG4gKiBAZGVzY3JpcHRpb25cclxuICogRGV0ZXJtaW5lcyB3aGV0aGVyIHR3byBkZWNvZGVkIHZhbHVlcyBhcmUgZXF1aXZhbGVudC5cclxuICpcclxuICogQHBhcmFtIHsqfSBhICBBIHZhbHVlIHRvIGNvbXBhcmUgYWdhaW5zdC5cclxuICogQHBhcmFtIHsqfSBiICBBIHZhbHVlIHRvIGNvbXBhcmUgYWdhaW5zdC5cclxuICogQHJldHVybnMge0Jvb2xlYW59ICBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgdmFsdWVzIGFyZSBlcXVpdmFsZW50L2VxdWFsLCBvdGhlcndpc2UgYGZhbHNlYC5cclxuICovXHJcblR5cGUucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uKGEsIGIpIHtcclxuICByZXR1cm4gYSA9PSBiO1xyXG59O1xyXG5cclxuVHlwZS5wcm90b3R5cGUuJHN1YlBhdHRlcm4gPSBmdW5jdGlvbigpIHtcclxuICB2YXIgc3ViID0gdGhpcy5wYXR0ZXJuLnRvU3RyaW5nKCk7XHJcbiAgcmV0dXJuIHN1Yi5zdWJzdHIoMSwgc3ViLmxlbmd0aCAtIDIpO1xyXG59O1xyXG5cclxuVHlwZS5wcm90b3R5cGUucGF0dGVybiA9IC8uKi87XHJcblxyXG5UeXBlLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gXCJ7VHlwZTpcIiArIHRoaXMubmFtZSArIFwifVwiOyB9O1xyXG5cclxuLyoqIEdpdmVuIGFuIGVuY29kZWQgc3RyaW5nLCBvciBhIGRlY29kZWQgb2JqZWN0LCByZXR1cm5zIGEgZGVjb2RlZCBvYmplY3QgKi9cclxuVHlwZS5wcm90b3R5cGUuJG5vcm1hbGl6ZSA9IGZ1bmN0aW9uKHZhbCkge1xyXG4gIHJldHVybiB0aGlzLmlzKHZhbCkgPyB2YWwgOiB0aGlzLmRlY29kZSh2YWwpO1xyXG59O1xyXG5cclxuLypcclxuICogV3JhcHMgYW4gZXhpc3RpbmcgY3VzdG9tIFR5cGUgYXMgYW4gYXJyYXkgb2YgVHlwZSwgZGVwZW5kaW5nIG9uICdtb2RlJy5cclxuICogZS5nLjpcclxuICogLSB1cmxtYXRjaGVyIHBhdHRlcm4gXCIvcGF0aD97cXVlcnlQYXJhbVtdOmludH1cIlxyXG4gKiAtIHVybDogXCIvcGF0aD9xdWVyeVBhcmFtPTEmcXVlcnlQYXJhbT0yXHJcbiAqIC0gJHN0YXRlUGFyYW1zLnF1ZXJ5UGFyYW0gd2lsbCBiZSBbMSwgMl1cclxuICogaWYgYG1vZGVgIGlzIFwiYXV0b1wiLCB0aGVuXHJcbiAqIC0gdXJsOiBcIi9wYXRoP3F1ZXJ5UGFyYW09MSB3aWxsIGNyZWF0ZSAkc3RhdGVQYXJhbXMucXVlcnlQYXJhbTogMVxyXG4gKiAtIHVybDogXCIvcGF0aD9xdWVyeVBhcmFtPTEmcXVlcnlQYXJhbT0yIHdpbGwgY3JlYXRlICRzdGF0ZVBhcmFtcy5xdWVyeVBhcmFtOiBbMSwgMl1cclxuICovXHJcblR5cGUucHJvdG90eXBlLiRhc0FycmF5ID0gZnVuY3Rpb24obW9kZSwgaXNTZWFyY2gpIHtcclxuICBpZiAoIW1vZGUpIHJldHVybiB0aGlzO1xyXG4gIGlmIChtb2RlID09PSBcImF1dG9cIiAmJiAhaXNTZWFyY2gpIHRocm93IG5ldyBFcnJvcihcIidhdXRvJyBhcnJheSBtb2RlIGlzIGZvciBxdWVyeSBwYXJhbWV0ZXJzIG9ubHlcIik7XHJcblxyXG4gIGZ1bmN0aW9uIEFycmF5VHlwZSh0eXBlLCBtb2RlKSB7XHJcbiAgICBmdW5jdGlvbiBiaW5kVG8odHlwZSwgY2FsbGJhY2tOYW1lKSB7XHJcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gdHlwZVtjYWxsYmFja05hbWVdLmFwcGx5KHR5cGUsIGFyZ3VtZW50cyk7XHJcbiAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgLy8gV3JhcCBub24tYXJyYXkgdmFsdWUgYXMgYXJyYXlcclxuICAgIGZ1bmN0aW9uIGFycmF5V3JhcCh2YWwpIHsgcmV0dXJuIGlzQXJyYXkodmFsKSA/IHZhbCA6IChpc0RlZmluZWQodmFsKSA/IFsgdmFsIF0gOiBbXSk7IH1cclxuICAgIC8vIFVud3JhcCBhcnJheSB2YWx1ZSBmb3IgXCJhdXRvXCIgbW9kZS4gUmV0dXJuIHVuZGVmaW5lZCBmb3IgZW1wdHkgYXJyYXkuXHJcbiAgICBmdW5jdGlvbiBhcnJheVVud3JhcCh2YWwpIHtcclxuICAgICAgc3dpdGNoKHZhbC5sZW5ndGgpIHtcclxuICAgICAgICBjYXNlIDA6IHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICAgICAgY2FzZSAxOiByZXR1cm4gbW9kZSA9PT0gXCJhdXRvXCIgPyB2YWxbMF0gOiB2YWw7XHJcbiAgICAgICAgZGVmYXVsdDogcmV0dXJuIHZhbDtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gZmFsc2V5KHZhbCkgeyByZXR1cm4gIXZhbDsgfVxyXG5cclxuICAgIC8vIFdyYXBzIHR5cGUgKC5pcy8uZW5jb2RlLy5kZWNvZGUpIGZ1bmN0aW9ucyB0byBvcGVyYXRlIG9uIGVhY2ggdmFsdWUgb2YgYW4gYXJyYXlcclxuICAgIGZ1bmN0aW9uIGFycmF5SGFuZGxlcihjYWxsYmFjaywgYWxsVHJ1dGh5TW9kZSkge1xyXG4gICAgICByZXR1cm4gZnVuY3Rpb24gaGFuZGxlQXJyYXkodmFsKSB7XHJcbiAgICAgICAgdmFsID0gYXJyYXlXcmFwKHZhbCk7XHJcbiAgICAgICAgdmFyIHJlc3VsdCA9IG1hcCh2YWwsIGNhbGxiYWNrKTtcclxuICAgICAgICBpZiAoYWxsVHJ1dGh5TW9kZSA9PT0gdHJ1ZSlcclxuICAgICAgICAgIHJldHVybiBmaWx0ZXIocmVzdWx0LCBmYWxzZXkpLmxlbmd0aCA9PT0gMDtcclxuICAgICAgICByZXR1cm4gYXJyYXlVbndyYXAocmVzdWx0KTtcclxuICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBXcmFwcyB0eXBlICguZXF1YWxzKSBmdW5jdGlvbnMgdG8gb3BlcmF0ZSBvbiBlYWNoIHZhbHVlIG9mIGFuIGFycmF5XHJcbiAgICBmdW5jdGlvbiBhcnJheUVxdWFsc0hhbmRsZXIoY2FsbGJhY2spIHtcclxuICAgICAgcmV0dXJuIGZ1bmN0aW9uIGhhbmRsZUFycmF5KHZhbDEsIHZhbDIpIHtcclxuICAgICAgICB2YXIgbGVmdCA9IGFycmF5V3JhcCh2YWwxKSwgcmlnaHQgPSBhcnJheVdyYXAodmFsMik7XHJcbiAgICAgICAgaWYgKGxlZnQubGVuZ3RoICE9PSByaWdodC5sZW5ndGgpIHJldHVybiBmYWxzZTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlZnQubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgIGlmICghY2FsbGJhY2sobGVmdFtpXSwgcmlnaHRbaV0pKSByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIHRoaXMuZW5jb2RlID0gYXJyYXlIYW5kbGVyKGJpbmRUbyh0eXBlLCAnZW5jb2RlJykpO1xyXG4gICAgdGhpcy5kZWNvZGUgPSBhcnJheUhhbmRsZXIoYmluZFRvKHR5cGUsICdkZWNvZGUnKSk7XHJcbiAgICB0aGlzLmlzICAgICA9IGFycmF5SGFuZGxlcihiaW5kVG8odHlwZSwgJ2lzJyksIHRydWUpO1xyXG4gICAgdGhpcy5lcXVhbHMgPSBhcnJheUVxdWFsc0hhbmRsZXIoYmluZFRvKHR5cGUsICdlcXVhbHMnKSk7XHJcbiAgICB0aGlzLnBhdHRlcm4gPSB0eXBlLnBhdHRlcm47XHJcbiAgICB0aGlzLiRub3JtYWxpemUgPSBhcnJheUhhbmRsZXIoYmluZFRvKHR5cGUsICckbm9ybWFsaXplJykpO1xyXG4gICAgdGhpcy5uYW1lID0gdHlwZS5uYW1lO1xyXG4gICAgdGhpcy4kYXJyYXlNb2RlID0gbW9kZTtcclxuICB9XHJcblxyXG4gIHJldHVybiBuZXcgQXJyYXlUeXBlKHRoaXMsIG1vZGUpO1xyXG59O1xyXG5cclxuXHJcblxyXG4vKipcclxuICogQG5nZG9jIG9iamVjdFxyXG4gKiBAbmFtZSB1aS5yb3V0ZXIudXRpbC4kdXJsTWF0Y2hlckZhY3RvcnlcclxuICpcclxuICogQGRlc2NyaXB0aW9uXHJcbiAqIEZhY3RvcnkgZm9yIHtAbGluayB1aS5yb3V0ZXIudXRpbC50eXBlOlVybE1hdGNoZXIgYFVybE1hdGNoZXJgfSBpbnN0YW5jZXMuIFRoZSBmYWN0b3J5XHJcbiAqIGlzIGFsc28gYXZhaWxhYmxlIHRvIHByb3ZpZGVycyB1bmRlciB0aGUgbmFtZSBgJHVybE1hdGNoZXJGYWN0b3J5UHJvdmlkZXJgLlxyXG4gKi9cclxuZnVuY3Rpb24gJFVybE1hdGNoZXJGYWN0b3J5KCkge1xyXG4gICQkVU1GUCA9IHRoaXM7XHJcblxyXG4gIHZhciBpc0Nhc2VJbnNlbnNpdGl2ZSA9IGZhbHNlLCBpc1N0cmljdE1vZGUgPSB0cnVlLCBkZWZhdWx0U3F1YXNoUG9saWN5ID0gZmFsc2U7XHJcblxyXG4gIGZ1bmN0aW9uIHZhbFRvU3RyaW5nKHZhbCkgeyByZXR1cm4gdmFsICE9IG51bGwgPyB2YWwudG9TdHJpbmcoKS5yZXBsYWNlKC9cXC8vZywgXCIlMkZcIikgOiB2YWw7IH1cclxuICBmdW5jdGlvbiB2YWxGcm9tU3RyaW5nKHZhbCkgeyByZXR1cm4gdmFsICE9IG51bGwgPyB2YWwudG9TdHJpbmcoKS5yZXBsYWNlKC8lMkYvZywgXCIvXCIpIDogdmFsOyB9XHJcbi8vICBUT0RPOiBpbiAxLjAsIG1ha2Ugc3RyaW5nIC5pcygpIHJldHVybiBmYWxzZSBpZiB2YWx1ZSBpcyB1bmRlZmluZWQgYnkgZGVmYXVsdC5cclxuLy8gIGZ1bmN0aW9uIHJlZ2V4cE1hdGNoZXModmFsKSB7IC8qanNoaW50IHZhbGlkdGhpczp0cnVlICovIHJldHVybiBpc0RlZmluZWQodmFsKSAmJiB0aGlzLnBhdHRlcm4udGVzdCh2YWwpOyB9XHJcbiAgZnVuY3Rpb24gcmVnZXhwTWF0Y2hlcyh2YWwpIHsgLypqc2hpbnQgdmFsaWR0aGlzOnRydWUgKi8gcmV0dXJuIHRoaXMucGF0dGVybi50ZXN0KHZhbCk7IH1cclxuXHJcbiAgdmFyICR0eXBlcyA9IHt9LCBlbnF1ZXVlID0gdHJ1ZSwgdHlwZVF1ZXVlID0gW10sIGluamVjdG9yLCBkZWZhdWx0VHlwZXMgPSB7XHJcbiAgICBzdHJpbmc6IHtcclxuICAgICAgZW5jb2RlOiB2YWxUb1N0cmluZyxcclxuICAgICAgZGVjb2RlOiB2YWxGcm9tU3RyaW5nLFxyXG4gICAgICBpczogZnVuY3Rpb24odmFsKSB7IHJldHVybiB0eXBlb2YgdmFsID09PSBcInN0cmluZ1wiOyB9LFxyXG4gICAgICBwYXR0ZXJuOiAvW14vXSovXHJcbiAgICB9LFxyXG4gICAgaW50OiB7XHJcbiAgICAgIGVuY29kZTogdmFsVG9TdHJpbmcsXHJcbiAgICAgIGRlY29kZTogZnVuY3Rpb24odmFsKSB7IHJldHVybiBwYXJzZUludCh2YWwsIDEwKTsgfSxcclxuICAgICAgaXM6IGZ1bmN0aW9uKHZhbCkgeyByZXR1cm4gaXNEZWZpbmVkKHZhbCkgJiYgdGhpcy5kZWNvZGUodmFsLnRvU3RyaW5nKCkpID09PSB2YWw7IH0sXHJcbiAgICAgIHBhdHRlcm46IC9cXGQrL1xyXG4gICAgfSxcclxuICAgIGJvb2w6IHtcclxuICAgICAgZW5jb2RlOiBmdW5jdGlvbih2YWwpIHsgcmV0dXJuIHZhbCA/IDEgOiAwOyB9LFxyXG4gICAgICBkZWNvZGU6IGZ1bmN0aW9uKHZhbCkgeyByZXR1cm4gcGFyc2VJbnQodmFsLCAxMCkgIT09IDA7IH0sXHJcbiAgICAgIGlzOiBmdW5jdGlvbih2YWwpIHsgcmV0dXJuIHZhbCA9PT0gdHJ1ZSB8fCB2YWwgPT09IGZhbHNlOyB9LFxyXG4gICAgICBwYXR0ZXJuOiAvMHwxL1xyXG4gICAgfSxcclxuICAgIGRhdGU6IHtcclxuICAgICAgZW5jb2RlOiBmdW5jdGlvbiAodmFsKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmlzKHZhbCkpXHJcbiAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgICAgIHJldHVybiBbIHZhbC5nZXRGdWxsWWVhcigpLFxyXG4gICAgICAgICAgKCcwJyArICh2YWwuZ2V0TW9udGgoKSArIDEpKS5zbGljZSgtMiksXHJcbiAgICAgICAgICAoJzAnICsgdmFsLmdldERhdGUoKSkuc2xpY2UoLTIpXHJcbiAgICAgICAgXS5qb2luKFwiLVwiKTtcclxuICAgICAgfSxcclxuICAgICAgZGVjb2RlOiBmdW5jdGlvbiAodmFsKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuaXModmFsKSkgcmV0dXJuIHZhbDtcclxuICAgICAgICB2YXIgbWF0Y2ggPSB0aGlzLmNhcHR1cmUuZXhlYyh2YWwpO1xyXG4gICAgICAgIHJldHVybiBtYXRjaCA/IG5ldyBEYXRlKG1hdGNoWzFdLCBtYXRjaFsyXSAtIDEsIG1hdGNoWzNdKSA6IHVuZGVmaW5lZDtcclxuICAgICAgfSxcclxuICAgICAgaXM6IGZ1bmN0aW9uKHZhbCkgeyByZXR1cm4gdmFsIGluc3RhbmNlb2YgRGF0ZSAmJiAhaXNOYU4odmFsLnZhbHVlT2YoKSk7IH0sXHJcbiAgICAgIGVxdWFsczogZnVuY3Rpb24gKGEsIGIpIHsgcmV0dXJuIHRoaXMuaXMoYSkgJiYgdGhpcy5pcyhiKSAmJiBhLnRvSVNPU3RyaW5nKCkgPT09IGIudG9JU09TdHJpbmcoKTsgfSxcclxuICAgICAgcGF0dGVybjogL1swLTldezR9LSg/OjBbMS05XXwxWzAtMl0pLSg/OjBbMS05XXxbMS0yXVswLTldfDNbMC0xXSkvLFxyXG4gICAgICBjYXB0dXJlOiAvKFswLTldezR9KS0oMFsxLTldfDFbMC0yXSktKDBbMS05XXxbMS0yXVswLTldfDNbMC0xXSkvXHJcbiAgICB9LFxyXG4gICAganNvbjoge1xyXG4gICAgICBlbmNvZGU6IGFuZ3VsYXIudG9Kc29uLFxyXG4gICAgICBkZWNvZGU6IGFuZ3VsYXIuZnJvbUpzb24sXHJcbiAgICAgIGlzOiBhbmd1bGFyLmlzT2JqZWN0LFxyXG4gICAgICBlcXVhbHM6IGFuZ3VsYXIuZXF1YWxzLFxyXG4gICAgICBwYXR0ZXJuOiAvW14vXSovXHJcbiAgICB9LFxyXG4gICAgYW55OiB7IC8vIGRvZXMgbm90IGVuY29kZS9kZWNvZGVcclxuICAgICAgZW5jb2RlOiBhbmd1bGFyLmlkZW50aXR5LFxyXG4gICAgICBkZWNvZGU6IGFuZ3VsYXIuaWRlbnRpdHksXHJcbiAgICAgIGlzOiBhbmd1bGFyLmlkZW50aXR5LFxyXG4gICAgICBlcXVhbHM6IGFuZ3VsYXIuZXF1YWxzLFxyXG4gICAgICBwYXR0ZXJuOiAvLiovXHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgZnVuY3Rpb24gZ2V0RGVmYXVsdENvbmZpZygpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIHN0cmljdDogaXNTdHJpY3RNb2RlLFxyXG4gICAgICBjYXNlSW5zZW5zaXRpdmU6IGlzQ2FzZUluc2Vuc2l0aXZlXHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gaXNJbmplY3RhYmxlKHZhbHVlKSB7XHJcbiAgICByZXR1cm4gKGlzRnVuY3Rpb24odmFsdWUpIHx8IChpc0FycmF5KHZhbHVlKSAmJiBpc0Z1bmN0aW9uKHZhbHVlW3ZhbHVlLmxlbmd0aCAtIDFdKSkpO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogW0ludGVybmFsXSBHZXQgdGhlIGRlZmF1bHQgdmFsdWUgb2YgYSBwYXJhbWV0ZXIsIHdoaWNoIG1heSBiZSBhbiBpbmplY3RhYmxlIGZ1bmN0aW9uLlxyXG4gICAqL1xyXG4gICRVcmxNYXRjaGVyRmFjdG9yeS4kJGdldERlZmF1bHRWYWx1ZSA9IGZ1bmN0aW9uKGNvbmZpZykge1xyXG4gICAgaWYgKCFpc0luamVjdGFibGUoY29uZmlnLnZhbHVlKSkgcmV0dXJuIGNvbmZpZy52YWx1ZTtcclxuICAgIGlmICghaW5qZWN0b3IpIHRocm93IG5ldyBFcnJvcihcIkluamVjdGFibGUgZnVuY3Rpb25zIGNhbm5vdCBiZSBjYWxsZWQgYXQgY29uZmlndXJhdGlvbiB0aW1lXCIpO1xyXG4gICAgcmV0dXJuIGluamVjdG9yLmludm9rZShjb25maWcudmFsdWUpO1xyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIEBuZ2RvYyBmdW5jdGlvblxyXG4gICAqIEBuYW1lIHVpLnJvdXRlci51dGlsLiR1cmxNYXRjaGVyRmFjdG9yeSNjYXNlSW5zZW5zaXRpdmVcclxuICAgKiBAbWV0aG9kT2YgdWkucm91dGVyLnV0aWwuJHVybE1hdGNoZXJGYWN0b3J5XHJcbiAgICpcclxuICAgKiBAZGVzY3JpcHRpb25cclxuICAgKiBEZWZpbmVzIHdoZXRoZXIgVVJMIG1hdGNoaW5nIHNob3VsZCBiZSBjYXNlIHNlbnNpdGl2ZSAodGhlIGRlZmF1bHQgYmVoYXZpb3IpLCBvciBub3QuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IHZhbHVlIGBmYWxzZWAgdG8gbWF0Y2ggVVJMIGluIGEgY2FzZSBzZW5zaXRpdmUgbWFubmVyOyBvdGhlcndpc2UgYHRydWVgO1xyXG4gICAqIEByZXR1cm5zIHtib29sZWFufSB0aGUgY3VycmVudCB2YWx1ZSBvZiBjYXNlSW5zZW5zaXRpdmVcclxuICAgKi9cclxuICB0aGlzLmNhc2VJbnNlbnNpdGl2ZSA9IGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICBpZiAoaXNEZWZpbmVkKHZhbHVlKSlcclxuICAgICAgaXNDYXNlSW5zZW5zaXRpdmUgPSB2YWx1ZTtcclxuICAgIHJldHVybiBpc0Nhc2VJbnNlbnNpdGl2ZTtcclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBAbmdkb2MgZnVuY3Rpb25cclxuICAgKiBAbmFtZSB1aS5yb3V0ZXIudXRpbC4kdXJsTWF0Y2hlckZhY3Rvcnkjc3RyaWN0TW9kZVxyXG4gICAqIEBtZXRob2RPZiB1aS5yb3V0ZXIudXRpbC4kdXJsTWF0Y2hlckZhY3RvcnlcclxuICAgKlxyXG4gICAqIEBkZXNjcmlwdGlvblxyXG4gICAqIERlZmluZXMgd2hldGhlciBVUkxzIHNob3VsZCBtYXRjaCB0cmFpbGluZyBzbGFzaGVzLCBvciBub3QgKHRoZSBkZWZhdWx0IGJlaGF2aW9yKS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IHZhbHVlIGBmYWxzZWAgdG8gbWF0Y2ggdHJhaWxpbmcgc2xhc2hlcyBpbiBVUkxzLCBvdGhlcndpc2UgYHRydWVgLlxyXG4gICAqIEByZXR1cm5zIHtib29sZWFufSB0aGUgY3VycmVudCB2YWx1ZSBvZiBzdHJpY3RNb2RlXHJcbiAgICovXHJcbiAgdGhpcy5zdHJpY3RNb2RlID0gZnVuY3Rpb24odmFsdWUpIHtcclxuICAgIGlmIChpc0RlZmluZWQodmFsdWUpKVxyXG4gICAgICBpc1N0cmljdE1vZGUgPSB2YWx1ZTtcclxuICAgIHJldHVybiBpc1N0cmljdE1vZGU7XHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogQG5nZG9jIGZ1bmN0aW9uXHJcbiAgICogQG5hbWUgdWkucm91dGVyLnV0aWwuJHVybE1hdGNoZXJGYWN0b3J5I2RlZmF1bHRTcXVhc2hQb2xpY3lcclxuICAgKiBAbWV0aG9kT2YgdWkucm91dGVyLnV0aWwuJHVybE1hdGNoZXJGYWN0b3J5XHJcbiAgICpcclxuICAgKiBAZGVzY3JpcHRpb25cclxuICAgKiBTZXRzIHRoZSBkZWZhdWx0IGJlaGF2aW9yIHdoZW4gZ2VuZXJhdGluZyBvciBtYXRjaGluZyBVUkxzIHdpdGggZGVmYXVsdCBwYXJhbWV0ZXIgdmFsdWVzLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHZhbHVlIEEgc3RyaW5nIHRoYXQgZGVmaW5lcyB0aGUgZGVmYXVsdCBwYXJhbWV0ZXIgVVJMIHNxdWFzaGluZyBiZWhhdmlvci5cclxuICAgKiAgICBgbm9zcXVhc2hgOiBXaGVuIGdlbmVyYXRpbmcgYW4gaHJlZiB3aXRoIGEgZGVmYXVsdCBwYXJhbWV0ZXIgdmFsdWUsIGRvIG5vdCBzcXVhc2ggdGhlIHBhcmFtZXRlciB2YWx1ZSBmcm9tIHRoZSBVUkxcclxuICAgKiAgICBgc2xhc2hgOiBXaGVuIGdlbmVyYXRpbmcgYW4gaHJlZiB3aXRoIGEgZGVmYXVsdCBwYXJhbWV0ZXIgdmFsdWUsIHNxdWFzaCAocmVtb3ZlKSB0aGUgcGFyYW1ldGVyIHZhbHVlLCBhbmQsIGlmIHRoZVxyXG4gICAqICAgICAgICAgICAgIHBhcmFtZXRlciBpcyBzdXJyb3VuZGVkIGJ5IHNsYXNoZXMsIHNxdWFzaCAocmVtb3ZlKSBvbmUgc2xhc2ggZnJvbSB0aGUgVVJMXHJcbiAgICogICAgYW55IG90aGVyIHN0cmluZywgZS5nLiBcIn5cIjogV2hlbiBnZW5lcmF0aW5nIGFuIGhyZWYgd2l0aCBhIGRlZmF1bHQgcGFyYW1ldGVyIHZhbHVlLCBzcXVhc2ggKHJlbW92ZSlcclxuICAgKiAgICAgICAgICAgICB0aGUgcGFyYW1ldGVyIHZhbHVlIGZyb20gdGhlIFVSTCBhbmQgcmVwbGFjZSBpdCB3aXRoIHRoaXMgc3RyaW5nLlxyXG4gICAqL1xyXG4gIHRoaXMuZGVmYXVsdFNxdWFzaFBvbGljeSA9IGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICBpZiAoIWlzRGVmaW5lZCh2YWx1ZSkpIHJldHVybiBkZWZhdWx0U3F1YXNoUG9saWN5O1xyXG4gICAgaWYgKHZhbHVlICE9PSB0cnVlICYmIHZhbHVlICE9PSBmYWxzZSAmJiAhaXNTdHJpbmcodmFsdWUpKVxyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIHNxdWFzaCBwb2xpY3k6IFwiICsgdmFsdWUgKyBcIi4gVmFsaWQgcG9saWNpZXM6IGZhbHNlLCB0cnVlLCBhcmJpdHJhcnktc3RyaW5nXCIpO1xyXG4gICAgZGVmYXVsdFNxdWFzaFBvbGljeSA9IHZhbHVlO1xyXG4gICAgcmV0dXJuIHZhbHVlO1xyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIEBuZ2RvYyBmdW5jdGlvblxyXG4gICAqIEBuYW1lIHVpLnJvdXRlci51dGlsLiR1cmxNYXRjaGVyRmFjdG9yeSNjb21waWxlXHJcbiAgICogQG1ldGhvZE9mIHVpLnJvdXRlci51dGlsLiR1cmxNYXRjaGVyRmFjdG9yeVxyXG4gICAqXHJcbiAgICogQGRlc2NyaXB0aW9uXHJcbiAgICogQ3JlYXRlcyBhIHtAbGluayB1aS5yb3V0ZXIudXRpbC50eXBlOlVybE1hdGNoZXIgYFVybE1hdGNoZXJgfSBmb3IgdGhlIHNwZWNpZmllZCBwYXR0ZXJuLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHBhdHRlcm4gIFRoZSBVUkwgcGF0dGVybi5cclxuICAgKiBAcGFyYW0ge09iamVjdH0gY29uZmlnICBUaGUgY29uZmlnIG9iamVjdCBoYXNoLlxyXG4gICAqIEByZXR1cm5zIHtVcmxNYXRjaGVyfSAgVGhlIFVybE1hdGNoZXIuXHJcbiAgICovXHJcbiAgdGhpcy5jb21waWxlID0gZnVuY3Rpb24gKHBhdHRlcm4sIGNvbmZpZykge1xyXG4gICAgcmV0dXJuIG5ldyBVcmxNYXRjaGVyKHBhdHRlcm4sIGV4dGVuZChnZXREZWZhdWx0Q29uZmlnKCksIGNvbmZpZykpO1xyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIEBuZ2RvYyBmdW5jdGlvblxyXG4gICAqIEBuYW1lIHVpLnJvdXRlci51dGlsLiR1cmxNYXRjaGVyRmFjdG9yeSNpc01hdGNoZXJcclxuICAgKiBAbWV0aG9kT2YgdWkucm91dGVyLnV0aWwuJHVybE1hdGNoZXJGYWN0b3J5XHJcbiAgICpcclxuICAgKiBAZGVzY3JpcHRpb25cclxuICAgKiBSZXR1cm5zIHRydWUgaWYgdGhlIHNwZWNpZmllZCBvYmplY3QgaXMgYSBgVXJsTWF0Y2hlcmAsIG9yIGZhbHNlIG90aGVyd2lzZS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgIFRoZSBvYmplY3QgdG8gcGVyZm9ybSB0aGUgdHlwZSBjaGVjayBhZ2FpbnN0LlxyXG4gICAqIEByZXR1cm5zIHtCb29sZWFufSAgUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIG9iamVjdCBtYXRjaGVzIHRoZSBgVXJsTWF0Y2hlcmAgaW50ZXJmYWNlLCBieVxyXG4gICAqICAgICAgICAgIGltcGxlbWVudGluZyBhbGwgdGhlIHNhbWUgbWV0aG9kcy5cclxuICAgKi9cclxuICB0aGlzLmlzTWF0Y2hlciA9IGZ1bmN0aW9uIChvKSB7XHJcbiAgICBpZiAoIWlzT2JqZWN0KG8pKSByZXR1cm4gZmFsc2U7XHJcbiAgICB2YXIgcmVzdWx0ID0gdHJ1ZTtcclxuXHJcbiAgICBmb3JFYWNoKFVybE1hdGNoZXIucHJvdG90eXBlLCBmdW5jdGlvbih2YWwsIG5hbWUpIHtcclxuICAgICAgaWYgKGlzRnVuY3Rpb24odmFsKSkge1xyXG4gICAgICAgIHJlc3VsdCA9IHJlc3VsdCAmJiAoaXNEZWZpbmVkKG9bbmFtZV0pICYmIGlzRnVuY3Rpb24ob1tuYW1lXSkpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogQG5nZG9jIGZ1bmN0aW9uXHJcbiAgICogQG5hbWUgdWkucm91dGVyLnV0aWwuJHVybE1hdGNoZXJGYWN0b3J5I3R5cGVcclxuICAgKiBAbWV0aG9kT2YgdWkucm91dGVyLnV0aWwuJHVybE1hdGNoZXJGYWN0b3J5XHJcbiAgICpcclxuICAgKiBAZGVzY3JpcHRpb25cclxuICAgKiBSZWdpc3RlcnMgYSBjdXN0b20ge0BsaW5rIHVpLnJvdXRlci51dGlsLnR5cGU6VHlwZSBgVHlwZWB9IG9iamVjdCB0aGF0IGNhbiBiZSB1c2VkIHRvXHJcbiAgICogZ2VuZXJhdGUgVVJMcyB3aXRoIHR5cGVkIHBhcmFtZXRlcnMuXHJcbiAgICpcclxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSAgVGhlIHR5cGUgbmFtZS5cclxuICAgKiBAcGFyYW0ge09iamVjdHxGdW5jdGlvbn0gZGVmaW5pdGlvbiAgIFRoZSB0eXBlIGRlZmluaXRpb24uIFNlZVxyXG4gICAqICAgICAgICB7QGxpbmsgdWkucm91dGVyLnV0aWwudHlwZTpUeXBlIGBUeXBlYH0gZm9yIGluZm9ybWF0aW9uIG9uIHRoZSB2YWx1ZXMgYWNjZXB0ZWQuXHJcbiAgICogQHBhcmFtIHtPYmplY3R8RnVuY3Rpb259IGRlZmluaXRpb25GbiAob3B0aW9uYWwpIEEgZnVuY3Rpb24gdGhhdCBpcyBpbmplY3RlZCBiZWZvcmUgdGhlIGFwcFxyXG4gICAqICAgICAgICBydW50aW1lIHN0YXJ0cy4gIFRoZSByZXN1bHQgb2YgdGhpcyBmdW5jdGlvbiBpcyBtZXJnZWQgaW50byB0aGUgZXhpc3RpbmcgYGRlZmluaXRpb25gLlxyXG4gICAqICAgICAgICBTZWUge0BsaW5rIHVpLnJvdXRlci51dGlsLnR5cGU6VHlwZSBgVHlwZWB9IGZvciBpbmZvcm1hdGlvbiBvbiB0aGUgdmFsdWVzIGFjY2VwdGVkLlxyXG4gICAqXHJcbiAgICogQHJldHVybnMge09iamVjdH0gIFJldHVybnMgYCR1cmxNYXRjaGVyRmFjdG9yeVByb3ZpZGVyYC5cclxuICAgKlxyXG4gICAqIEBleGFtcGxlXHJcbiAgICogVGhpcyBpcyBhIHNpbXBsZSBleGFtcGxlIG9mIGEgY3VzdG9tIHR5cGUgdGhhdCBlbmNvZGVzIGFuZCBkZWNvZGVzIGl0ZW1zIGZyb20gYW5cclxuICAgKiBhcnJheSwgdXNpbmcgdGhlIGFycmF5IGluZGV4IGFzIHRoZSBVUkwtZW5jb2RlZCB2YWx1ZTpcclxuICAgKlxyXG4gICAqIDxwcmU+XHJcbiAgICogdmFyIGxpc3QgPSBbJ0pvaG4nLCAnUGF1bCcsICdHZW9yZ2UnLCAnUmluZ28nXTtcclxuICAgKlxyXG4gICAqICR1cmxNYXRjaGVyRmFjdG9yeVByb3ZpZGVyLnR5cGUoJ2xpc3RJdGVtJywge1xyXG4gICAqICAgZW5jb2RlOiBmdW5jdGlvbihpdGVtKSB7XHJcbiAgICogICAgIC8vIFJlcHJlc2VudCB0aGUgbGlzdCBpdGVtIGluIHRoZSBVUkwgdXNpbmcgaXRzIGNvcnJlc3BvbmRpbmcgaW5kZXhcclxuICAgKiAgICAgcmV0dXJuIGxpc3QuaW5kZXhPZihpdGVtKTtcclxuICAgKiAgIH0sXHJcbiAgICogICBkZWNvZGU6IGZ1bmN0aW9uKGl0ZW0pIHtcclxuICAgKiAgICAgLy8gTG9vayB1cCB0aGUgbGlzdCBpdGVtIGJ5IGluZGV4XHJcbiAgICogICAgIHJldHVybiBsaXN0W3BhcnNlSW50KGl0ZW0sIDEwKV07XHJcbiAgICogICB9LFxyXG4gICAqICAgaXM6IGZ1bmN0aW9uKGl0ZW0pIHtcclxuICAgKiAgICAgLy8gRW5zdXJlIHRoZSBpdGVtIGlzIHZhbGlkIGJ5IGNoZWNraW5nIHRvIHNlZSB0aGF0IGl0IGFwcGVhcnNcclxuICAgKiAgICAgLy8gaW4gdGhlIGxpc3RcclxuICAgKiAgICAgcmV0dXJuIGxpc3QuaW5kZXhPZihpdGVtKSA+IC0xO1xyXG4gICAqICAgfVxyXG4gICAqIH0pO1xyXG4gICAqXHJcbiAgICogJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2xpc3QnLCB7XHJcbiAgICogICB1cmw6IFwiL2xpc3Qve2l0ZW06bGlzdEl0ZW19XCIsXHJcbiAgICogICBjb250cm9sbGVyOiBmdW5jdGlvbigkc2NvcGUsICRzdGF0ZVBhcmFtcykge1xyXG4gICAqICAgICBjb25zb2xlLmxvZygkc3RhdGVQYXJhbXMuaXRlbSk7XHJcbiAgICogICB9XHJcbiAgICogfSk7XHJcbiAgICpcclxuICAgKiAvLyAuLi5cclxuICAgKlxyXG4gICAqIC8vIENoYW5nZXMgVVJMIHRvICcvbGlzdC8zJywgbG9ncyBcIlJpbmdvXCIgdG8gdGhlIGNvbnNvbGVcclxuICAgKiAkc3RhdGUuZ28oJ2xpc3QnLCB7IGl0ZW06IFwiUmluZ29cIiB9KTtcclxuICAgKiA8L3ByZT5cclxuICAgKlxyXG4gICAqIFRoaXMgaXMgYSBtb3JlIGNvbXBsZXggZXhhbXBsZSBvZiBhIHR5cGUgdGhhdCByZWxpZXMgb24gZGVwZW5kZW5jeSBpbmplY3Rpb24gdG9cclxuICAgKiBpbnRlcmFjdCB3aXRoIHNlcnZpY2VzLCBhbmQgdXNlcyB0aGUgcGFyYW1ldGVyIG5hbWUgZnJvbSB0aGUgVVJMIHRvIGluZmVyIGhvdyB0b1xyXG4gICAqIGhhbmRsZSBlbmNvZGluZyBhbmQgZGVjb2RpbmcgcGFyYW1ldGVyIHZhbHVlczpcclxuICAgKlxyXG4gICAqIDxwcmU+XHJcbiAgICogLy8gRGVmaW5lcyBhIGN1c3RvbSB0eXBlIHRoYXQgZ2V0cyBhIHZhbHVlIGZyb20gYSBzZXJ2aWNlLFxyXG4gICAqIC8vIHdoZXJlIGVhY2ggc2VydmljZSBnZXRzIGRpZmZlcmVudCB0eXBlcyBvZiB2YWx1ZXMgZnJvbVxyXG4gICAqIC8vIGEgYmFja2VuZCBBUEk6XHJcbiAgICogJHVybE1hdGNoZXJGYWN0b3J5UHJvdmlkZXIudHlwZSgnZGJPYmplY3QnLCB7fSwgZnVuY3Rpb24oVXNlcnMsIFBvc3RzKSB7XHJcbiAgICpcclxuICAgKiAgIC8vIE1hdGNoZXMgdXAgc2VydmljZXMgdG8gVVJMIHBhcmFtZXRlciBuYW1lc1xyXG4gICAqICAgdmFyIHNlcnZpY2VzID0ge1xyXG4gICAqICAgICB1c2VyOiBVc2VycyxcclxuICAgKiAgICAgcG9zdDogUG9zdHNcclxuICAgKiAgIH07XHJcbiAgICpcclxuICAgKiAgIHJldHVybiB7XHJcbiAgICogICAgIGVuY29kZTogZnVuY3Rpb24ob2JqZWN0KSB7XHJcbiAgICogICAgICAgLy8gUmVwcmVzZW50IHRoZSBvYmplY3QgaW4gdGhlIFVSTCB1c2luZyBpdHMgdW5pcXVlIElEXHJcbiAgICogICAgICAgcmV0dXJuIG9iamVjdC5pZDtcclxuICAgKiAgICAgfSxcclxuICAgKiAgICAgZGVjb2RlOiBmdW5jdGlvbih2YWx1ZSwga2V5KSB7XHJcbiAgICogICAgICAgLy8gTG9vayB1cCB0aGUgb2JqZWN0IGJ5IElELCB1c2luZyB0aGUgcGFyYW1ldGVyXHJcbiAgICogICAgICAgLy8gbmFtZSAoa2V5KSB0byBjYWxsIHRoZSBjb3JyZWN0IHNlcnZpY2VcclxuICAgKiAgICAgICByZXR1cm4gc2VydmljZXNba2V5XS5maW5kQnlJZCh2YWx1ZSk7XHJcbiAgICogICAgIH0sXHJcbiAgICogICAgIGlzOiBmdW5jdGlvbihvYmplY3QsIGtleSkge1xyXG4gICAqICAgICAgIC8vIENoZWNrIHRoYXQgb2JqZWN0IGlzIGEgdmFsaWQgZGJPYmplY3RcclxuICAgKiAgICAgICByZXR1cm4gYW5ndWxhci5pc09iamVjdChvYmplY3QpICYmIG9iamVjdC5pZCAmJiBzZXJ2aWNlc1trZXldO1xyXG4gICAqICAgICB9XHJcbiAgICogICAgIGVxdWFsczogZnVuY3Rpb24oYSwgYikge1xyXG4gICAqICAgICAgIC8vIENoZWNrIHRoZSBlcXVhbGl0eSBvZiBkZWNvZGVkIG9iamVjdHMgYnkgY29tcGFyaW5nXHJcbiAgICogICAgICAgLy8gdGhlaXIgdW5pcXVlIElEc1xyXG4gICAqICAgICAgIHJldHVybiBhLmlkID09PSBiLmlkO1xyXG4gICAqICAgICB9XHJcbiAgICogICB9O1xyXG4gICAqIH0pO1xyXG4gICAqXHJcbiAgICogLy8gSW4gYSBjb25maWcoKSBibG9jaywgeW91IGNhbiB0aGVuIGF0dGFjaCBVUkxzIHdpdGhcclxuICAgKiAvLyB0eXBlLWFubm90YXRlZCBwYXJhbWV0ZXJzOlxyXG4gICAqICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCd1c2VycycsIHtcclxuICAgKiAgIHVybDogXCIvdXNlcnNcIixcclxuICAgKiAgIC8vIC4uLlxyXG4gICAqIH0pLnN0YXRlKCd1c2Vycy5pdGVtJywge1xyXG4gICAqICAgdXJsOiBcIi97dXNlcjpkYk9iamVjdH1cIixcclxuICAgKiAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCRzY29wZSwgJHN0YXRlUGFyYW1zKSB7XHJcbiAgICogICAgIC8vICRzdGF0ZVBhcmFtcy51c2VyIHdpbGwgbm93IGJlIGFuIG9iamVjdCByZXR1cm5lZCBmcm9tXHJcbiAgICogICAgIC8vIHRoZSBVc2VycyBzZXJ2aWNlXHJcbiAgICogICB9LFxyXG4gICAqICAgLy8gLi4uXHJcbiAgICogfSk7XHJcbiAgICogPC9wcmU+XHJcbiAgICovXHJcbiAgdGhpcy50eXBlID0gZnVuY3Rpb24gKG5hbWUsIGRlZmluaXRpb24sIGRlZmluaXRpb25Gbikge1xyXG4gICAgaWYgKCFpc0RlZmluZWQoZGVmaW5pdGlvbikpIHJldHVybiAkdHlwZXNbbmFtZV07XHJcbiAgICBpZiAoJHR5cGVzLmhhc093blByb3BlcnR5KG5hbWUpKSB0aHJvdyBuZXcgRXJyb3IoXCJBIHR5cGUgbmFtZWQgJ1wiICsgbmFtZSArIFwiJyBoYXMgYWxyZWFkeSBiZWVuIGRlZmluZWQuXCIpO1xyXG5cclxuICAgICR0eXBlc1tuYW1lXSA9IG5ldyBUeXBlKGV4dGVuZCh7IG5hbWU6IG5hbWUgfSwgZGVmaW5pdGlvbikpO1xyXG4gICAgaWYgKGRlZmluaXRpb25Gbikge1xyXG4gICAgICB0eXBlUXVldWUucHVzaCh7IG5hbWU6IG5hbWUsIGRlZjogZGVmaW5pdGlvbkZuIH0pO1xyXG4gICAgICBpZiAoIWVucXVldWUpIGZsdXNoVHlwZVF1ZXVlKCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9O1xyXG5cclxuICAvLyBgZmx1c2hUeXBlUXVldWUoKWAgd2FpdHMgdW50aWwgYCR1cmxNYXRjaGVyRmFjdG9yeWAgaXMgaW5qZWN0ZWQgYmVmb3JlIGludm9raW5nIHRoZSBxdWV1ZWQgYGRlZmluaXRpb25GbmBzXHJcbiAgZnVuY3Rpb24gZmx1c2hUeXBlUXVldWUoKSB7XHJcbiAgICB3aGlsZSh0eXBlUXVldWUubGVuZ3RoKSB7XHJcbiAgICAgIHZhciB0eXBlID0gdHlwZVF1ZXVlLnNoaWZ0KCk7XHJcbiAgICAgIGlmICh0eXBlLnBhdHRlcm4pIHRocm93IG5ldyBFcnJvcihcIllvdSBjYW5ub3Qgb3ZlcnJpZGUgYSB0eXBlJ3MgLnBhdHRlcm4gYXQgcnVudGltZS5cIik7XHJcbiAgICAgIGFuZ3VsYXIuZXh0ZW5kKCR0eXBlc1t0eXBlLm5hbWVdLCBpbmplY3Rvci5pbnZva2UodHlwZS5kZWYpKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIFJlZ2lzdGVyIGRlZmF1bHQgdHlwZXMuIFN0b3JlIHRoZW0gaW4gdGhlIHByb3RvdHlwZSBvZiAkdHlwZXMuXHJcbiAgZm9yRWFjaChkZWZhdWx0VHlwZXMsIGZ1bmN0aW9uKHR5cGUsIG5hbWUpIHsgJHR5cGVzW25hbWVdID0gbmV3IFR5cGUoZXh0ZW5kKHtuYW1lOiBuYW1lfSwgdHlwZSkpOyB9KTtcclxuICAkdHlwZXMgPSBpbmhlcml0KCR0eXBlcywge30pO1xyXG5cclxuICAvKiBObyBuZWVkIHRvIGRvY3VtZW50ICRnZXQsIHNpbmNlIGl0IHJldHVybnMgdGhpcyAqL1xyXG4gIHRoaXMuJGdldCA9IFsnJGluamVjdG9yJywgZnVuY3Rpb24gKCRpbmplY3Rvcikge1xyXG4gICAgaW5qZWN0b3IgPSAkaW5qZWN0b3I7XHJcbiAgICBlbnF1ZXVlID0gZmFsc2U7XHJcbiAgICBmbHVzaFR5cGVRdWV1ZSgpO1xyXG5cclxuICAgIGZvckVhY2goZGVmYXVsdFR5cGVzLCBmdW5jdGlvbih0eXBlLCBuYW1lKSB7XHJcbiAgICAgIGlmICghJHR5cGVzW25hbWVdKSAkdHlwZXNbbmFtZV0gPSBuZXcgVHlwZSh0eXBlKTtcclxuICAgIH0pO1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfV07XHJcblxyXG4gIHRoaXMuUGFyYW0gPSBmdW5jdGlvbiBQYXJhbShpZCwgdHlwZSwgY29uZmlnLCBsb2NhdGlvbikge1xyXG4gICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgY29uZmlnID0gdW53cmFwU2hvcnRoYW5kKGNvbmZpZyk7XHJcbiAgICB0eXBlID0gZ2V0VHlwZShjb25maWcsIHR5cGUsIGxvY2F0aW9uKTtcclxuICAgIHZhciBhcnJheU1vZGUgPSBnZXRBcnJheU1vZGUoKTtcclxuICAgIHR5cGUgPSBhcnJheU1vZGUgPyB0eXBlLiRhc0FycmF5KGFycmF5TW9kZSwgbG9jYXRpb24gPT09IFwic2VhcmNoXCIpIDogdHlwZTtcclxuICAgIGlmICh0eXBlLm5hbWUgPT09IFwic3RyaW5nXCIgJiYgIWFycmF5TW9kZSAmJiBsb2NhdGlvbiA9PT0gXCJwYXRoXCIgJiYgY29uZmlnLnZhbHVlID09PSB1bmRlZmluZWQpXHJcbiAgICAgIGNvbmZpZy52YWx1ZSA9IFwiXCI7IC8vIGZvciAwLjIueDsgaW4gMC4zLjArIGRvIG5vdCBhdXRvbWF0aWNhbGx5IGRlZmF1bHQgdG8gXCJcIlxyXG4gICAgdmFyIGlzT3B0aW9uYWwgPSBjb25maWcudmFsdWUgIT09IHVuZGVmaW5lZDtcclxuICAgIHZhciBzcXVhc2ggPSBnZXRTcXVhc2hQb2xpY3koY29uZmlnLCBpc09wdGlvbmFsKTtcclxuICAgIHZhciByZXBsYWNlID0gZ2V0UmVwbGFjZShjb25maWcsIGFycmF5TW9kZSwgaXNPcHRpb25hbCwgc3F1YXNoKTtcclxuXHJcbiAgICBmdW5jdGlvbiB1bndyYXBTaG9ydGhhbmQoY29uZmlnKSB7XHJcbiAgICAgIHZhciBrZXlzID0gaXNPYmplY3QoY29uZmlnKSA/IG9iamVjdEtleXMoY29uZmlnKSA6IFtdO1xyXG4gICAgICB2YXIgaXNTaG9ydGhhbmQgPSBpbmRleE9mKGtleXMsIFwidmFsdWVcIikgPT09IC0xICYmIGluZGV4T2Yoa2V5cywgXCJ0eXBlXCIpID09PSAtMSAmJlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbmRleE9mKGtleXMsIFwic3F1YXNoXCIpID09PSAtMSAmJiBpbmRleE9mKGtleXMsIFwiYXJyYXlcIikgPT09IC0xO1xyXG4gICAgICBpZiAoaXNTaG9ydGhhbmQpIGNvbmZpZyA9IHsgdmFsdWU6IGNvbmZpZyB9O1xyXG4gICAgICBjb25maWcuJCRmbiA9IGlzSW5qZWN0YWJsZShjb25maWcudmFsdWUpID8gY29uZmlnLnZhbHVlIDogZnVuY3Rpb24gKCkgeyByZXR1cm4gY29uZmlnLnZhbHVlOyB9O1xyXG4gICAgICByZXR1cm4gY29uZmlnO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGdldFR5cGUoY29uZmlnLCB1cmxUeXBlLCBsb2NhdGlvbikge1xyXG4gICAgICBpZiAoY29uZmlnLnR5cGUgJiYgdXJsVHlwZSkgdGhyb3cgbmV3IEVycm9yKFwiUGFyYW0gJ1wiK2lkK1wiJyBoYXMgdHdvIHR5cGUgY29uZmlndXJhdGlvbnMuXCIpO1xyXG4gICAgICBpZiAodXJsVHlwZSkgcmV0dXJuIHVybFR5cGU7XHJcbiAgICAgIGlmICghY29uZmlnLnR5cGUpIHJldHVybiAobG9jYXRpb24gPT09IFwiY29uZmlnXCIgPyAkdHlwZXMuYW55IDogJHR5cGVzLnN0cmluZyk7XHJcbiAgICAgIHJldHVybiBjb25maWcudHlwZSBpbnN0YW5jZW9mIFR5cGUgPyBjb25maWcudHlwZSA6IG5ldyBUeXBlKGNvbmZpZy50eXBlKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBhcnJheSBjb25maWc6IHBhcmFtIG5hbWUgKHBhcmFtW10pIG92ZXJyaWRlcyBkZWZhdWx0IHNldHRpbmdzLiAgZXhwbGljaXQgY29uZmlnIG92ZXJyaWRlcyBwYXJhbSBuYW1lLlxyXG4gICAgZnVuY3Rpb24gZ2V0QXJyYXlNb2RlKCkge1xyXG4gICAgICB2YXIgYXJyYXlEZWZhdWx0cyA9IHsgYXJyYXk6IChsb2NhdGlvbiA9PT0gXCJzZWFyY2hcIiA/IFwiYXV0b1wiIDogZmFsc2UpIH07XHJcbiAgICAgIHZhciBhcnJheVBhcmFtTm9tZW5jbGF0dXJlID0gaWQubWF0Y2goL1xcW1xcXSQvKSA/IHsgYXJyYXk6IHRydWUgfSA6IHt9O1xyXG4gICAgICByZXR1cm4gZXh0ZW5kKGFycmF5RGVmYXVsdHMsIGFycmF5UGFyYW1Ob21lbmNsYXR1cmUsIGNvbmZpZykuYXJyYXk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiByZXR1cm5zIGZhbHNlLCB0cnVlLCBvciB0aGUgc3F1YXNoIHZhbHVlIHRvIGluZGljYXRlIHRoZSBcImRlZmF1bHQgcGFyYW1ldGVyIHVybCBzcXVhc2ggcG9saWN5XCIuXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIGdldFNxdWFzaFBvbGljeShjb25maWcsIGlzT3B0aW9uYWwpIHtcclxuICAgICAgdmFyIHNxdWFzaCA9IGNvbmZpZy5zcXVhc2g7XHJcbiAgICAgIGlmICghaXNPcHRpb25hbCB8fCBzcXVhc2ggPT09IGZhbHNlKSByZXR1cm4gZmFsc2U7XHJcbiAgICAgIGlmICghaXNEZWZpbmVkKHNxdWFzaCkgfHwgc3F1YXNoID09IG51bGwpIHJldHVybiBkZWZhdWx0U3F1YXNoUG9saWN5O1xyXG4gICAgICBpZiAoc3F1YXNoID09PSB0cnVlIHx8IGlzU3RyaW5nKHNxdWFzaCkpIHJldHVybiBzcXVhc2g7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgc3F1YXNoIHBvbGljeTogJ1wiICsgc3F1YXNoICsgXCInLiBWYWxpZCBwb2xpY2llczogZmFsc2UsIHRydWUsIG9yIGFyYml0cmFyeSBzdHJpbmdcIik7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZ2V0UmVwbGFjZShjb25maWcsIGFycmF5TW9kZSwgaXNPcHRpb25hbCwgc3F1YXNoKSB7XHJcbiAgICAgIHZhciByZXBsYWNlLCBjb25maWd1cmVkS2V5cywgZGVmYXVsdFBvbGljeSA9IFtcclxuICAgICAgICB7IGZyb206IFwiXCIsICAgdG86IChpc09wdGlvbmFsIHx8IGFycmF5TW9kZSA/IHVuZGVmaW5lZCA6IFwiXCIpIH0sXHJcbiAgICAgICAgeyBmcm9tOiBudWxsLCB0bzogKGlzT3B0aW9uYWwgfHwgYXJyYXlNb2RlID8gdW5kZWZpbmVkIDogXCJcIikgfVxyXG4gICAgICBdO1xyXG4gICAgICByZXBsYWNlID0gaXNBcnJheShjb25maWcucmVwbGFjZSkgPyBjb25maWcucmVwbGFjZSA6IFtdO1xyXG4gICAgICBpZiAoaXNTdHJpbmcoc3F1YXNoKSlcclxuICAgICAgICByZXBsYWNlLnB1c2goeyBmcm9tOiBzcXVhc2gsIHRvOiB1bmRlZmluZWQgfSk7XHJcbiAgICAgIGNvbmZpZ3VyZWRLZXlzID0gbWFwKHJlcGxhY2UsIGZ1bmN0aW9uKGl0ZW0pIHsgcmV0dXJuIGl0ZW0uZnJvbTsgfSApO1xyXG4gICAgICByZXR1cm4gZmlsdGVyKGRlZmF1bHRQb2xpY3ksIGZ1bmN0aW9uKGl0ZW0pIHsgcmV0dXJuIGluZGV4T2YoY29uZmlndXJlZEtleXMsIGl0ZW0uZnJvbSkgPT09IC0xOyB9KS5jb25jYXQocmVwbGFjZSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBbSW50ZXJuYWxdIEdldCB0aGUgZGVmYXVsdCB2YWx1ZSBvZiBhIHBhcmFtZXRlciwgd2hpY2ggbWF5IGJlIGFuIGluamVjdGFibGUgZnVuY3Rpb24uXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uICQkZ2V0RGVmYXVsdFZhbHVlKCkge1xyXG4gICAgICBpZiAoIWluamVjdG9yKSB0aHJvdyBuZXcgRXJyb3IoXCJJbmplY3RhYmxlIGZ1bmN0aW9ucyBjYW5ub3QgYmUgY2FsbGVkIGF0IGNvbmZpZ3VyYXRpb24gdGltZVwiKTtcclxuICAgICAgdmFyIGRlZmF1bHRWYWx1ZSA9IGluamVjdG9yLmludm9rZShjb25maWcuJCRmbik7XHJcbiAgICAgIGlmIChkZWZhdWx0VmFsdWUgIT09IG51bGwgJiYgZGVmYXVsdFZhbHVlICE9PSB1bmRlZmluZWQgJiYgIXNlbGYudHlwZS5pcyhkZWZhdWx0VmFsdWUpKVxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkRlZmF1bHQgdmFsdWUgKFwiICsgZGVmYXVsdFZhbHVlICsgXCIpIGZvciBwYXJhbWV0ZXIgJ1wiICsgc2VsZi5pZCArIFwiJyBpcyBub3QgYW4gaW5zdGFuY2Ugb2YgVHlwZSAoXCIgKyBzZWxmLnR5cGUubmFtZSArIFwiKVwiKTtcclxuICAgICAgcmV0dXJuIGRlZmF1bHRWYWx1ZTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFtJbnRlcm5hbF0gR2V0cyB0aGUgZGVjb2RlZCByZXByZXNlbnRhdGlvbiBvZiBhIHZhbHVlIGlmIHRoZSB2YWx1ZSBpcyBkZWZpbmVkLCBvdGhlcndpc2UsIHJldHVybnMgdGhlXHJcbiAgICAgKiBkZWZhdWx0IHZhbHVlLCB3aGljaCBtYXkgYmUgdGhlIHJlc3VsdCBvZiBhbiBpbmplY3RhYmxlIGZ1bmN0aW9uLlxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiAkdmFsdWUodmFsdWUpIHtcclxuICAgICAgZnVuY3Rpb24gaGFzUmVwbGFjZVZhbCh2YWwpIHsgcmV0dXJuIGZ1bmN0aW9uKG9iaikgeyByZXR1cm4gb2JqLmZyb20gPT09IHZhbDsgfTsgfVxyXG4gICAgICBmdW5jdGlvbiAkcmVwbGFjZSh2YWx1ZSkge1xyXG4gICAgICAgIHZhciByZXBsYWNlbWVudCA9IG1hcChmaWx0ZXIoc2VsZi5yZXBsYWNlLCBoYXNSZXBsYWNlVmFsKHZhbHVlKSksIGZ1bmN0aW9uKG9iaikgeyByZXR1cm4gb2JqLnRvOyB9KTtcclxuICAgICAgICByZXR1cm4gcmVwbGFjZW1lbnQubGVuZ3RoID8gcmVwbGFjZW1lbnRbMF0gOiB2YWx1ZTtcclxuICAgICAgfVxyXG4gICAgICB2YWx1ZSA9ICRyZXBsYWNlKHZhbHVlKTtcclxuICAgICAgcmV0dXJuICFpc0RlZmluZWQodmFsdWUpID8gJCRnZXREZWZhdWx0VmFsdWUoKSA6IHNlbGYudHlwZS4kbm9ybWFsaXplKHZhbHVlKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiB0b1N0cmluZygpIHsgcmV0dXJuIFwie1BhcmFtOlwiICsgaWQgKyBcIiBcIiArIHR5cGUgKyBcIiBzcXVhc2g6ICdcIiArIHNxdWFzaCArIFwiJyBvcHRpb25hbDogXCIgKyBpc09wdGlvbmFsICsgXCJ9XCI7IH1cclxuXHJcbiAgICBleHRlbmQodGhpcywge1xyXG4gICAgICBpZDogaWQsXHJcbiAgICAgIHR5cGU6IHR5cGUsXHJcbiAgICAgIGxvY2F0aW9uOiBsb2NhdGlvbixcclxuICAgICAgYXJyYXk6IGFycmF5TW9kZSxcclxuICAgICAgc3F1YXNoOiBzcXVhc2gsXHJcbiAgICAgIHJlcGxhY2U6IHJlcGxhY2UsXHJcbiAgICAgIGlzT3B0aW9uYWw6IGlzT3B0aW9uYWwsXHJcbiAgICAgIHZhbHVlOiAkdmFsdWUsXHJcbiAgICAgIGR5bmFtaWM6IHVuZGVmaW5lZCxcclxuICAgICAgY29uZmlnOiBjb25maWcsXHJcbiAgICAgIHRvU3RyaW5nOiB0b1N0cmluZ1xyXG4gICAgfSk7XHJcbiAgfTtcclxuXHJcbiAgZnVuY3Rpb24gUGFyYW1TZXQocGFyYW1zKSB7XHJcbiAgICBleHRlbmQodGhpcywgcGFyYW1zIHx8IHt9KTtcclxuICB9XHJcblxyXG4gIFBhcmFtU2V0LnByb3RvdHlwZSA9IHtcclxuICAgICQkbmV3OiBmdW5jdGlvbigpIHtcclxuICAgICAgcmV0dXJuIGluaGVyaXQodGhpcywgZXh0ZW5kKG5ldyBQYXJhbVNldCgpLCB7ICQkcGFyZW50OiB0aGlzfSkpO1xyXG4gICAgfSxcclxuICAgICQka2V5czogZnVuY3Rpb24gKCkge1xyXG4gICAgICB2YXIga2V5cyA9IFtdLCBjaGFpbiA9IFtdLCBwYXJlbnQgPSB0aGlzLFxyXG4gICAgICAgIGlnbm9yZSA9IG9iamVjdEtleXMoUGFyYW1TZXQucHJvdG90eXBlKTtcclxuICAgICAgd2hpbGUgKHBhcmVudCkgeyBjaGFpbi5wdXNoKHBhcmVudCk7IHBhcmVudCA9IHBhcmVudC4kJHBhcmVudDsgfVxyXG4gICAgICBjaGFpbi5yZXZlcnNlKCk7XHJcbiAgICAgIGZvckVhY2goY2hhaW4sIGZ1bmN0aW9uKHBhcmFtc2V0KSB7XHJcbiAgICAgICAgZm9yRWFjaChvYmplY3RLZXlzKHBhcmFtc2V0KSwgZnVuY3Rpb24oa2V5KSB7XHJcbiAgICAgICAgICAgIGlmIChpbmRleE9mKGtleXMsIGtleSkgPT09IC0xICYmIGluZGV4T2YoaWdub3JlLCBrZXkpID09PSAtMSkga2V5cy5wdXNoKGtleSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0pO1xyXG4gICAgICByZXR1cm4ga2V5cztcclxuICAgIH0sXHJcbiAgICAkJHZhbHVlczogZnVuY3Rpb24ocGFyYW1WYWx1ZXMpIHtcclxuICAgICAgdmFyIHZhbHVlcyA9IHt9LCBzZWxmID0gdGhpcztcclxuICAgICAgZm9yRWFjaChzZWxmLiQka2V5cygpLCBmdW5jdGlvbihrZXkpIHtcclxuICAgICAgICB2YWx1ZXNba2V5XSA9IHNlbGZba2V5XS52YWx1ZShwYXJhbVZhbHVlcyAmJiBwYXJhbVZhbHVlc1trZXldKTtcclxuICAgICAgfSk7XHJcbiAgICAgIHJldHVybiB2YWx1ZXM7XHJcbiAgICB9LFxyXG4gICAgJCRlcXVhbHM6IGZ1bmN0aW9uKHBhcmFtVmFsdWVzMSwgcGFyYW1WYWx1ZXMyKSB7XHJcbiAgICAgIHZhciBlcXVhbCA9IHRydWUsIHNlbGYgPSB0aGlzO1xyXG4gICAgICBmb3JFYWNoKHNlbGYuJCRrZXlzKCksIGZ1bmN0aW9uKGtleSkge1xyXG4gICAgICAgIHZhciBsZWZ0ID0gcGFyYW1WYWx1ZXMxICYmIHBhcmFtVmFsdWVzMVtrZXldLCByaWdodCA9IHBhcmFtVmFsdWVzMiAmJiBwYXJhbVZhbHVlczJba2V5XTtcclxuICAgICAgICBpZiAoIXNlbGZba2V5XS50eXBlLmVxdWFscyhsZWZ0LCByaWdodCkpIGVxdWFsID0gZmFsc2U7XHJcbiAgICAgIH0pO1xyXG4gICAgICByZXR1cm4gZXF1YWw7XHJcbiAgICB9LFxyXG4gICAgJCR2YWxpZGF0ZXM6IGZ1bmN0aW9uICQkdmFsaWRhdGUocGFyYW1WYWx1ZXMpIHtcclxuICAgICAgdmFyIGtleXMgPSB0aGlzLiQka2V5cygpLCBpLCBwYXJhbSwgcmF3VmFsLCBub3JtYWxpemVkLCBlbmNvZGVkO1xyXG4gICAgICBmb3IgKGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIHBhcmFtID0gdGhpc1trZXlzW2ldXTtcclxuICAgICAgICByYXdWYWwgPSBwYXJhbVZhbHVlc1trZXlzW2ldXTtcclxuICAgICAgICBpZiAoKHJhd1ZhbCA9PT0gdW5kZWZpbmVkIHx8IHJhd1ZhbCA9PT0gbnVsbCkgJiYgcGFyYW0uaXNPcHRpb25hbClcclxuICAgICAgICAgIGJyZWFrOyAvLyBUaGVyZSB3YXMgbm8gcGFyYW1ldGVyIHZhbHVlLCBidXQgdGhlIHBhcmFtIGlzIG9wdGlvbmFsXHJcbiAgICAgICAgbm9ybWFsaXplZCA9IHBhcmFtLnR5cGUuJG5vcm1hbGl6ZShyYXdWYWwpO1xyXG4gICAgICAgIGlmICghcGFyYW0udHlwZS5pcyhub3JtYWxpemVkKSlcclxuICAgICAgICAgIHJldHVybiBmYWxzZTsgLy8gVGhlIHZhbHVlIHdhcyBub3Qgb2YgdGhlIGNvcnJlY3QgVHlwZSwgYW5kIGNvdWxkIG5vdCBiZSBkZWNvZGVkIHRvIHRoZSBjb3JyZWN0IFR5cGVcclxuICAgICAgICBlbmNvZGVkID0gcGFyYW0udHlwZS5lbmNvZGUobm9ybWFsaXplZCk7XHJcbiAgICAgICAgaWYgKGFuZ3VsYXIuaXNTdHJpbmcoZW5jb2RlZCkgJiYgIXBhcmFtLnR5cGUucGF0dGVybi5leGVjKGVuY29kZWQpKVxyXG4gICAgICAgICAgcmV0dXJuIGZhbHNlOyAvLyBUaGUgdmFsdWUgd2FzIG9mIHRoZSBjb3JyZWN0IHR5cGUsIGJ1dCB3aGVuIGVuY29kZWQsIGRpZCBub3QgbWF0Y2ggdGhlIFR5cGUncyByZWdleHBcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH0sXHJcbiAgICAkJHBhcmVudDogdW5kZWZpbmVkXHJcbiAgfTtcclxuXHJcbiAgdGhpcy5QYXJhbVNldCA9IFBhcmFtU2V0O1xyXG59XHJcblxyXG4vLyBSZWdpc3RlciBhcyBhIHByb3ZpZGVyIHNvIGl0J3MgYXZhaWxhYmxlIHRvIG90aGVyIHByb3ZpZGVyc1xyXG5hbmd1bGFyLm1vZHVsZSgndWkucm91dGVyLnV0aWwnKS5wcm92aWRlcignJHVybE1hdGNoZXJGYWN0b3J5JywgJFVybE1hdGNoZXJGYWN0b3J5KTtcclxuYW5ndWxhci5tb2R1bGUoJ3VpLnJvdXRlci51dGlsJykucnVuKFsnJHVybE1hdGNoZXJGYWN0b3J5JywgZnVuY3Rpb24oJHVybE1hdGNoZXJGYWN0b3J5KSB7IH1dKTtcclxuIiwiLyoqXHJcbiAqIEBuZ2RvYyBvYmplY3RcclxuICogQG5hbWUgdWkucm91dGVyLnJvdXRlci4kdXJsUm91dGVyUHJvdmlkZXJcclxuICpcclxuICogQHJlcXVpcmVzIHVpLnJvdXRlci51dGlsLiR1cmxNYXRjaGVyRmFjdG9yeVByb3ZpZGVyXHJcbiAqIEByZXF1aXJlcyAkbG9jYXRpb25Qcm92aWRlclxyXG4gKlxyXG4gKiBAZGVzY3JpcHRpb25cclxuICogYCR1cmxSb3V0ZXJQcm92aWRlcmAgaGFzIHRoZSByZXNwb25zaWJpbGl0eSBvZiB3YXRjaGluZyBgJGxvY2F0aW9uYC4gXHJcbiAqIFdoZW4gYCRsb2NhdGlvbmAgY2hhbmdlcyBpdCBydW5zIHRocm91Z2ggYSBsaXN0IG9mIHJ1bGVzIG9uZSBieSBvbmUgdW50aWwgYSBcclxuICogbWF0Y2ggaXMgZm91bmQuIGAkdXJsUm91dGVyUHJvdmlkZXJgIGlzIHVzZWQgYmVoaW5kIHRoZSBzY2VuZXMgYW55dGltZSB5b3Ugc3BlY2lmeSBcclxuICogYSB1cmwgaW4gYSBzdGF0ZSBjb25maWd1cmF0aW9uLiBBbGwgdXJscyBhcmUgY29tcGlsZWQgaW50byBhIFVybE1hdGNoZXIgb2JqZWN0LlxyXG4gKlxyXG4gKiBUaGVyZSBhcmUgc2V2ZXJhbCBtZXRob2RzIG9uIGAkdXJsUm91dGVyUHJvdmlkZXJgIHRoYXQgbWFrZSBpdCB1c2VmdWwgdG8gdXNlIGRpcmVjdGx5XHJcbiAqIGluIHlvdXIgbW9kdWxlIGNvbmZpZy5cclxuICovXHJcbiRVcmxSb3V0ZXJQcm92aWRlci4kaW5qZWN0ID0gWyckbG9jYXRpb25Qcm92aWRlcicsICckdXJsTWF0Y2hlckZhY3RvcnlQcm92aWRlciddO1xyXG5mdW5jdGlvbiAkVXJsUm91dGVyUHJvdmlkZXIoICAgJGxvY2F0aW9uUHJvdmlkZXIsICAgJHVybE1hdGNoZXJGYWN0b3J5KSB7XHJcbiAgdmFyIHJ1bGVzID0gW10sIG90aGVyd2lzZSA9IG51bGwsIGludGVyY2VwdERlZmVycmVkID0gZmFsc2UsIGxpc3RlbmVyO1xyXG5cclxuICAvLyBSZXR1cm5zIGEgc3RyaW5nIHRoYXQgaXMgYSBwcmVmaXggb2YgYWxsIHN0cmluZ3MgbWF0Y2hpbmcgdGhlIFJlZ0V4cFxyXG4gIGZ1bmN0aW9uIHJlZ0V4cFByZWZpeChyZSkge1xyXG4gICAgdmFyIHByZWZpeCA9IC9eXFxeKCg/OlxcXFxbXmEtekEtWjAtOV18W15cXFxcXFxbXFxdXFxeJCorPy4oKXx7fV0rKSopLy5leGVjKHJlLnNvdXJjZSk7XHJcbiAgICByZXR1cm4gKHByZWZpeCAhPSBudWxsKSA/IHByZWZpeFsxXS5yZXBsYWNlKC9cXFxcKC4pL2csIFwiJDFcIikgOiAnJztcclxuICB9XHJcblxyXG4gIC8vIEludGVycG9sYXRlcyBtYXRjaGVkIHZhbHVlcyBpbnRvIGEgU3RyaW5nLnJlcGxhY2UoKS1zdHlsZSBwYXR0ZXJuXHJcbiAgZnVuY3Rpb24gaW50ZXJwb2xhdGUocGF0dGVybiwgbWF0Y2gpIHtcclxuICAgIHJldHVybiBwYXR0ZXJuLnJlcGxhY2UoL1xcJChcXCR8XFxkezEsMn0pLywgZnVuY3Rpb24gKG0sIHdoYXQpIHtcclxuICAgICAgcmV0dXJuIG1hdGNoW3doYXQgPT09ICckJyA/IDAgOiBOdW1iZXIod2hhdCldO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBAbmdkb2MgZnVuY3Rpb25cclxuICAgKiBAbmFtZSB1aS5yb3V0ZXIucm91dGVyLiR1cmxSb3V0ZXJQcm92aWRlciNydWxlXHJcbiAgICogQG1ldGhvZE9mIHVpLnJvdXRlci5yb3V0ZXIuJHVybFJvdXRlclByb3ZpZGVyXHJcbiAgICpcclxuICAgKiBAZGVzY3JpcHRpb25cclxuICAgKiBEZWZpbmVzIHJ1bGVzIHRoYXQgYXJlIHVzZWQgYnkgYCR1cmxSb3V0ZXJQcm92aWRlcmAgdG8gZmluZCBtYXRjaGVzIGZvclxyXG4gICAqIHNwZWNpZmljIFVSTHMuXHJcbiAgICpcclxuICAgKiBAZXhhbXBsZVxyXG4gICAqIDxwcmU+XHJcbiAgICogdmFyIGFwcCA9IGFuZ3VsYXIubW9kdWxlKCdhcHAnLCBbJ3VpLnJvdXRlci5yb3V0ZXInXSk7XHJcbiAgICpcclxuICAgKiBhcHAuY29uZmlnKGZ1bmN0aW9uICgkdXJsUm91dGVyUHJvdmlkZXIpIHtcclxuICAgKiAgIC8vIEhlcmUncyBhbiBleGFtcGxlIG9mIGhvdyB5b3UgbWlnaHQgYWxsb3cgY2FzZSBpbnNlbnNpdGl2ZSB1cmxzXHJcbiAgICogICAkdXJsUm91dGVyUHJvdmlkZXIucnVsZShmdW5jdGlvbiAoJGluamVjdG9yLCAkbG9jYXRpb24pIHtcclxuICAgKiAgICAgdmFyIHBhdGggPSAkbG9jYXRpb24ucGF0aCgpLFxyXG4gICAqICAgICAgICAgbm9ybWFsaXplZCA9IHBhdGgudG9Mb3dlckNhc2UoKTtcclxuICAgKlxyXG4gICAqICAgICBpZiAocGF0aCAhPT0gbm9ybWFsaXplZCkge1xyXG4gICAqICAgICAgIHJldHVybiBub3JtYWxpemVkO1xyXG4gICAqICAgICB9XHJcbiAgICogICB9KTtcclxuICAgKiB9KTtcclxuICAgKiA8L3ByZT5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBydWxlIEhhbmRsZXIgZnVuY3Rpb24gdGhhdCB0YWtlcyBgJGluamVjdG9yYCBhbmQgYCRsb2NhdGlvbmBcclxuICAgKiBzZXJ2aWNlcyBhcyBhcmd1bWVudHMuIFlvdSBjYW4gdXNlIHRoZW0gdG8gcmV0dXJuIGEgdmFsaWQgcGF0aCBhcyBhIHN0cmluZy5cclxuICAgKlxyXG4gICAqIEByZXR1cm4ge29iamVjdH0gYCR1cmxSb3V0ZXJQcm92aWRlcmAgLSBgJHVybFJvdXRlclByb3ZpZGVyYCBpbnN0YW5jZVxyXG4gICAqL1xyXG4gIHRoaXMucnVsZSA9IGZ1bmN0aW9uIChydWxlKSB7XHJcbiAgICBpZiAoIWlzRnVuY3Rpb24ocnVsZSkpIHRocm93IG5ldyBFcnJvcihcIidydWxlJyBtdXN0IGJlIGEgZnVuY3Rpb25cIik7XHJcbiAgICBydWxlcy5wdXNoKHJ1bGUpO1xyXG4gICAgcmV0dXJuIHRoaXM7XHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogQG5nZG9jIG9iamVjdFxyXG4gICAqIEBuYW1lIHVpLnJvdXRlci5yb3V0ZXIuJHVybFJvdXRlclByb3ZpZGVyI290aGVyd2lzZVxyXG4gICAqIEBtZXRob2RPZiB1aS5yb3V0ZXIucm91dGVyLiR1cmxSb3V0ZXJQcm92aWRlclxyXG4gICAqXHJcbiAgICogQGRlc2NyaXB0aW9uXHJcbiAgICogRGVmaW5lcyBhIHBhdGggdGhhdCBpcyB1c2VkIHdoZW4gYW4gaW52YWxpZCByb3V0ZSBpcyByZXF1ZXN0ZWQuXHJcbiAgICpcclxuICAgKiBAZXhhbXBsZVxyXG4gICAqIDxwcmU+XHJcbiAgICogdmFyIGFwcCA9IGFuZ3VsYXIubW9kdWxlKCdhcHAnLCBbJ3VpLnJvdXRlci5yb3V0ZXInXSk7XHJcbiAgICpcclxuICAgKiBhcHAuY29uZmlnKGZ1bmN0aW9uICgkdXJsUm91dGVyUHJvdmlkZXIpIHtcclxuICAgKiAgIC8vIGlmIHRoZSBwYXRoIGRvZXNuJ3QgbWF0Y2ggYW55IG9mIHRoZSB1cmxzIHlvdSBjb25maWd1cmVkXHJcbiAgICogICAvLyBvdGhlcndpc2Ugd2lsbCB0YWtlIGNhcmUgb2Ygcm91dGluZyB0aGUgdXNlciB0byB0aGVcclxuICAgKiAgIC8vIHNwZWNpZmllZCB1cmxcclxuICAgKiAgICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoJy9pbmRleCcpO1xyXG4gICAqXHJcbiAgICogICAvLyBFeGFtcGxlIG9mIHVzaW5nIGZ1bmN0aW9uIHJ1bGUgYXMgcGFyYW1cclxuICAgKiAgICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoZnVuY3Rpb24gKCRpbmplY3RvciwgJGxvY2F0aW9uKSB7XHJcbiAgICogICAgIHJldHVybiAnL2EvdmFsaWQvdXJsJztcclxuICAgKiAgIH0pO1xyXG4gICAqIH0pO1xyXG4gICAqIDwvcHJlPlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtzdHJpbmd8b2JqZWN0fSBydWxlIFRoZSB1cmwgcGF0aCB5b3Ugd2FudCB0byByZWRpcmVjdCB0byBvciBhIGZ1bmN0aW9uIFxyXG4gICAqIHJ1bGUgdGhhdCByZXR1cm5zIHRoZSB1cmwgcGF0aC4gVGhlIGZ1bmN0aW9uIHZlcnNpb24gaXMgcGFzc2VkIHR3byBwYXJhbXM6IFxyXG4gICAqIGAkaW5qZWN0b3JgIGFuZCBgJGxvY2F0aW9uYCBzZXJ2aWNlcywgYW5kIG11c3QgcmV0dXJuIGEgdXJsIHN0cmluZy5cclxuICAgKlxyXG4gICAqIEByZXR1cm4ge29iamVjdH0gYCR1cmxSb3V0ZXJQcm92aWRlcmAgLSBgJHVybFJvdXRlclByb3ZpZGVyYCBpbnN0YW5jZVxyXG4gICAqL1xyXG4gIHRoaXMub3RoZXJ3aXNlID0gZnVuY3Rpb24gKHJ1bGUpIHtcclxuICAgIGlmIChpc1N0cmluZyhydWxlKSkge1xyXG4gICAgICB2YXIgcmVkaXJlY3QgPSBydWxlO1xyXG4gICAgICBydWxlID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gcmVkaXJlY3Q7IH07XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICghaXNGdW5jdGlvbihydWxlKSkgdGhyb3cgbmV3IEVycm9yKFwiJ3J1bGUnIG11c3QgYmUgYSBmdW5jdGlvblwiKTtcclxuICAgIG90aGVyd2lzZSA9IHJ1bGU7XHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9O1xyXG5cclxuXHJcbiAgZnVuY3Rpb24gaGFuZGxlSWZNYXRjaCgkaW5qZWN0b3IsIGhhbmRsZXIsIG1hdGNoKSB7XHJcbiAgICBpZiAoIW1hdGNoKSByZXR1cm4gZmFsc2U7XHJcbiAgICB2YXIgcmVzdWx0ID0gJGluamVjdG9yLmludm9rZShoYW5kbGVyLCBoYW5kbGVyLCB7ICRtYXRjaDogbWF0Y2ggfSk7XHJcbiAgICByZXR1cm4gaXNEZWZpbmVkKHJlc3VsdCkgPyByZXN1bHQgOiB0cnVlO1xyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogQG5nZG9jIGZ1bmN0aW9uXHJcbiAgICogQG5hbWUgdWkucm91dGVyLnJvdXRlci4kdXJsUm91dGVyUHJvdmlkZXIjd2hlblxyXG4gICAqIEBtZXRob2RPZiB1aS5yb3V0ZXIucm91dGVyLiR1cmxSb3V0ZXJQcm92aWRlclxyXG4gICAqXHJcbiAgICogQGRlc2NyaXB0aW9uXHJcbiAgICogUmVnaXN0ZXJzIGEgaGFuZGxlciBmb3IgYSBnaXZlbiB1cmwgbWF0Y2hpbmcuIGlmIGhhbmRsZSBpcyBhIHN0cmluZywgaXQgaXNcclxuICAgKiB0cmVhdGVkIGFzIGEgcmVkaXJlY3QsIGFuZCBpcyBpbnRlcnBvbGF0ZWQgYWNjb3JkaW5nIHRvIHRoZSBzeW50YXggb2YgbWF0Y2hcclxuICAgKiAoaS5lLiBsaWtlIGBTdHJpbmcucmVwbGFjZSgpYCBmb3IgYFJlZ0V4cGAsIG9yIGxpa2UgYSBgVXJsTWF0Y2hlcmAgcGF0dGVybiBvdGhlcndpc2UpLlxyXG4gICAqXHJcbiAgICogSWYgdGhlIGhhbmRsZXIgaXMgYSBmdW5jdGlvbiwgaXQgaXMgaW5qZWN0YWJsZS4gSXQgZ2V0cyBpbnZva2VkIGlmIGAkbG9jYXRpb25gXHJcbiAgICogbWF0Y2hlcy4gWW91IGhhdmUgdGhlIG9wdGlvbiBvZiBpbmplY3QgdGhlIG1hdGNoIG9iamVjdCBhcyBgJG1hdGNoYC5cclxuICAgKlxyXG4gICAqIFRoZSBoYW5kbGVyIGNhbiByZXR1cm5cclxuICAgKlxyXG4gICAqIC0gKipmYWxzeSoqIHRvIGluZGljYXRlIHRoYXQgdGhlIHJ1bGUgZGlkbid0IG1hdGNoIGFmdGVyIGFsbCwgdGhlbiBgJHVybFJvdXRlcmBcclxuICAgKiAgIHdpbGwgY29udGludWUgdHJ5aW5nIHRvIGZpbmQgYW5vdGhlciBvbmUgdGhhdCBtYXRjaGVzLlxyXG4gICAqIC0gKipzdHJpbmcqKiB3aGljaCBpcyB0cmVhdGVkIGFzIGEgcmVkaXJlY3QgYW5kIHBhc3NlZCB0byBgJGxvY2F0aW9uLnVybCgpYFxyXG4gICAqIC0gKip2b2lkKiogb3IgYW55ICoqdHJ1dGh5KiogdmFsdWUgdGVsbHMgYCR1cmxSb3V0ZXJgIHRoYXQgdGhlIHVybCB3YXMgaGFuZGxlZC5cclxuICAgKlxyXG4gICAqIEBleGFtcGxlXHJcbiAgICogPHByZT5cclxuICAgKiB2YXIgYXBwID0gYW5ndWxhci5tb2R1bGUoJ2FwcCcsIFsndWkucm91dGVyLnJvdXRlciddKTtcclxuICAgKlxyXG4gICAqIGFwcC5jb25maWcoZnVuY3Rpb24gKCR1cmxSb3V0ZXJQcm92aWRlcikge1xyXG4gICAqICAgJHVybFJvdXRlclByb3ZpZGVyLndoZW4oJHN0YXRlLnVybCwgZnVuY3Rpb24gKCRtYXRjaCwgJHN0YXRlUGFyYW1zKSB7XHJcbiAgICogICAgIGlmICgkc3RhdGUuJGN1cnJlbnQubmF2aWdhYmxlICE9PSBzdGF0ZSB8fFxyXG4gICAqICAgICAgICAgIWVxdWFsRm9yS2V5cygkbWF0Y2gsICRzdGF0ZVBhcmFtcykge1xyXG4gICAqICAgICAgJHN0YXRlLnRyYW5zaXRpb25UbyhzdGF0ZSwgJG1hdGNoLCBmYWxzZSk7XHJcbiAgICogICAgIH1cclxuICAgKiAgIH0pO1xyXG4gICAqIH0pO1xyXG4gICAqIDwvcHJlPlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHtzdHJpbmd8b2JqZWN0fSB3aGF0IFRoZSBpbmNvbWluZyBwYXRoIHRoYXQgeW91IHdhbnQgdG8gcmVkaXJlY3QuXHJcbiAgICogQHBhcmFtIHtzdHJpbmd8b2JqZWN0fSBoYW5kbGVyIFRoZSBwYXRoIHlvdSB3YW50IHRvIHJlZGlyZWN0IHlvdXIgdXNlciB0by5cclxuICAgKi9cclxuICB0aGlzLndoZW4gPSBmdW5jdGlvbiAod2hhdCwgaGFuZGxlcikge1xyXG4gICAgdmFyIHJlZGlyZWN0LCBoYW5kbGVySXNTdHJpbmcgPSBpc1N0cmluZyhoYW5kbGVyKTtcclxuICAgIGlmIChpc1N0cmluZyh3aGF0KSkgd2hhdCA9ICR1cmxNYXRjaGVyRmFjdG9yeS5jb21waWxlKHdoYXQpO1xyXG5cclxuICAgIGlmICghaGFuZGxlcklzU3RyaW5nICYmICFpc0Z1bmN0aW9uKGhhbmRsZXIpICYmICFpc0FycmF5KGhhbmRsZXIpKVxyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJpbnZhbGlkICdoYW5kbGVyJyBpbiB3aGVuKClcIik7XHJcblxyXG4gICAgdmFyIHN0cmF0ZWdpZXMgPSB7XHJcbiAgICAgIG1hdGNoZXI6IGZ1bmN0aW9uICh3aGF0LCBoYW5kbGVyKSB7XHJcbiAgICAgICAgaWYgKGhhbmRsZXJJc1N0cmluZykge1xyXG4gICAgICAgICAgcmVkaXJlY3QgPSAkdXJsTWF0Y2hlckZhY3RvcnkuY29tcGlsZShoYW5kbGVyKTtcclxuICAgICAgICAgIGhhbmRsZXIgPSBbJyRtYXRjaCcsIGZ1bmN0aW9uICgkbWF0Y2gpIHsgcmV0dXJuIHJlZGlyZWN0LmZvcm1hdCgkbWF0Y2gpOyB9XTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGV4dGVuZChmdW5jdGlvbiAoJGluamVjdG9yLCAkbG9jYXRpb24pIHtcclxuICAgICAgICAgIHJldHVybiBoYW5kbGVJZk1hdGNoKCRpbmplY3RvciwgaGFuZGxlciwgd2hhdC5leGVjKCRsb2NhdGlvbi5wYXRoKCksICRsb2NhdGlvbi5zZWFyY2goKSkpO1xyXG4gICAgICAgIH0sIHtcclxuICAgICAgICAgIHByZWZpeDogaXNTdHJpbmcod2hhdC5wcmVmaXgpID8gd2hhdC5wcmVmaXggOiAnJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9LFxyXG4gICAgICByZWdleDogZnVuY3Rpb24gKHdoYXQsIGhhbmRsZXIpIHtcclxuICAgICAgICBpZiAod2hhdC5nbG9iYWwgfHwgd2hhdC5zdGlja3kpIHRocm93IG5ldyBFcnJvcihcIndoZW4oKSBSZWdFeHAgbXVzdCBub3QgYmUgZ2xvYmFsIG9yIHN0aWNreVwiKTtcclxuXHJcbiAgICAgICAgaWYgKGhhbmRsZXJJc1N0cmluZykge1xyXG4gICAgICAgICAgcmVkaXJlY3QgPSBoYW5kbGVyO1xyXG4gICAgICAgICAgaGFuZGxlciA9IFsnJG1hdGNoJywgZnVuY3Rpb24gKCRtYXRjaCkgeyByZXR1cm4gaW50ZXJwb2xhdGUocmVkaXJlY3QsICRtYXRjaCk7IH1dO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZXh0ZW5kKGZ1bmN0aW9uICgkaW5qZWN0b3IsICRsb2NhdGlvbikge1xyXG4gICAgICAgICAgcmV0dXJuIGhhbmRsZUlmTWF0Y2goJGluamVjdG9yLCBoYW5kbGVyLCB3aGF0LmV4ZWMoJGxvY2F0aW9uLnBhdGgoKSkpO1xyXG4gICAgICAgIH0sIHtcclxuICAgICAgICAgIHByZWZpeDogcmVnRXhwUHJlZml4KHdoYXQpXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgdmFyIGNoZWNrID0geyBtYXRjaGVyOiAkdXJsTWF0Y2hlckZhY3RvcnkuaXNNYXRjaGVyKHdoYXQpLCByZWdleDogd2hhdCBpbnN0YW5jZW9mIFJlZ0V4cCB9O1xyXG5cclxuICAgIGZvciAodmFyIG4gaW4gY2hlY2spIHtcclxuICAgICAgaWYgKGNoZWNrW25dKSByZXR1cm4gdGhpcy5ydWxlKHN0cmF0ZWdpZXNbbl0od2hhdCwgaGFuZGxlcikpO1xyXG4gICAgfVxyXG5cclxuICAgIHRocm93IG5ldyBFcnJvcihcImludmFsaWQgJ3doYXQnIGluIHdoZW4oKVwiKTtcclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBAbmdkb2MgZnVuY3Rpb25cclxuICAgKiBAbmFtZSB1aS5yb3V0ZXIucm91dGVyLiR1cmxSb3V0ZXJQcm92aWRlciNkZWZlckludGVyY2VwdFxyXG4gICAqIEBtZXRob2RPZiB1aS5yb3V0ZXIucm91dGVyLiR1cmxSb3V0ZXJQcm92aWRlclxyXG4gICAqXHJcbiAgICogQGRlc2NyaXB0aW9uXHJcbiAgICogRGlzYWJsZXMgKG9yIGVuYWJsZXMpIGRlZmVycmluZyBsb2NhdGlvbiBjaGFuZ2UgaW50ZXJjZXB0aW9uLlxyXG4gICAqXHJcbiAgICogSWYgeW91IHdpc2ggdG8gY3VzdG9taXplIHRoZSBiZWhhdmlvciBvZiBzeW5jaW5nIHRoZSBVUkwgKGZvciBleGFtcGxlLCBpZiB5b3Ugd2lzaCB0b1xyXG4gICAqIGRlZmVyIGEgdHJhbnNpdGlvbiBidXQgbWFpbnRhaW4gdGhlIGN1cnJlbnQgVVJMKSwgY2FsbCB0aGlzIG1ldGhvZCBhdCBjb25maWd1cmF0aW9uIHRpbWUuXHJcbiAgICogVGhlbiwgYXQgcnVuIHRpbWUsIGNhbGwgYCR1cmxSb3V0ZXIubGlzdGVuKClgIGFmdGVyIHlvdSBoYXZlIGNvbmZpZ3VyZWQgeW91ciBvd25cclxuICAgKiBgJGxvY2F0aW9uQ2hhbmdlU3VjY2Vzc2AgZXZlbnQgaGFuZGxlci5cclxuICAgKlxyXG4gICAqIEBleGFtcGxlXHJcbiAgICogPHByZT5cclxuICAgKiB2YXIgYXBwID0gYW5ndWxhci5tb2R1bGUoJ2FwcCcsIFsndWkucm91dGVyLnJvdXRlciddKTtcclxuICAgKlxyXG4gICAqIGFwcC5jb25maWcoZnVuY3Rpb24gKCR1cmxSb3V0ZXJQcm92aWRlcikge1xyXG4gICAqXHJcbiAgICogICAvLyBQcmV2ZW50ICR1cmxSb3V0ZXIgZnJvbSBhdXRvbWF0aWNhbGx5IGludGVyY2VwdGluZyBVUkwgY2hhbmdlcztcclxuICAgKiAgIC8vIHRoaXMgYWxsb3dzIHlvdSB0byBjb25maWd1cmUgY3VzdG9tIGJlaGF2aW9yIGluIGJldHdlZW5cclxuICAgKiAgIC8vIGxvY2F0aW9uIGNoYW5nZXMgYW5kIHJvdXRlIHN5bmNocm9uaXphdGlvbjpcclxuICAgKiAgICR1cmxSb3V0ZXJQcm92aWRlci5kZWZlckludGVyY2VwdCgpO1xyXG4gICAqXHJcbiAgICogfSkucnVuKGZ1bmN0aW9uICgkcm9vdFNjb3BlLCAkdXJsUm91dGVyLCBVc2VyU2VydmljZSkge1xyXG4gICAqXHJcbiAgICogICAkcm9vdFNjb3BlLiRvbignJGxvY2F0aW9uQ2hhbmdlU3VjY2VzcycsIGZ1bmN0aW9uKGUpIHtcclxuICAgKiAgICAgLy8gVXNlclNlcnZpY2UgaXMgYW4gZXhhbXBsZSBzZXJ2aWNlIGZvciBtYW5hZ2luZyB1c2VyIHN0YXRlXHJcbiAgICogICAgIGlmIChVc2VyU2VydmljZS5pc0xvZ2dlZEluKCkpIHJldHVybjtcclxuICAgKlxyXG4gICAqICAgICAvLyBQcmV2ZW50ICR1cmxSb3V0ZXIncyBkZWZhdWx0IGhhbmRsZXIgZnJvbSBmaXJpbmdcclxuICAgKiAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAqXHJcbiAgICogICAgIFVzZXJTZXJ2aWNlLmhhbmRsZUxvZ2luKCkudGhlbihmdW5jdGlvbigpIHtcclxuICAgKiAgICAgICAvLyBPbmNlIHRoZSB1c2VyIGhhcyBsb2dnZWQgaW4sIHN5bmMgdGhlIGN1cnJlbnQgVVJMXHJcbiAgICogICAgICAgLy8gdG8gdGhlIHJvdXRlcjpcclxuICAgKiAgICAgICAkdXJsUm91dGVyLnN5bmMoKTtcclxuICAgKiAgICAgfSk7XHJcbiAgICogICB9KTtcclxuICAgKlxyXG4gICAqICAgLy8gQ29uZmlndXJlcyAkdXJsUm91dGVyJ3MgbGlzdGVuZXIgKmFmdGVyKiB5b3VyIGN1c3RvbSBsaXN0ZW5lclxyXG4gICAqICAgJHVybFJvdXRlci5saXN0ZW4oKTtcclxuICAgKiB9KTtcclxuICAgKiA8L3ByZT5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gZGVmZXIgSW5kaWNhdGVzIHdoZXRoZXIgdG8gZGVmZXIgbG9jYXRpb24gY2hhbmdlIGludGVyY2VwdGlvbi4gUGFzc2luZ1xyXG4gICAgICAgICAgICBubyBwYXJhbWV0ZXIgaXMgZXF1aXZhbGVudCB0byBgdHJ1ZWAuXHJcbiAgICovXHJcbiAgdGhpcy5kZWZlckludGVyY2VwdCA9IGZ1bmN0aW9uIChkZWZlcikge1xyXG4gICAgaWYgKGRlZmVyID09PSB1bmRlZmluZWQpIGRlZmVyID0gdHJ1ZTtcclxuICAgIGludGVyY2VwdERlZmVycmVkID0gZGVmZXI7XHJcbiAgfTtcclxuXHJcbiAgLyoqXHJcbiAgICogQG5nZG9jIG9iamVjdFxyXG4gICAqIEBuYW1lIHVpLnJvdXRlci5yb3V0ZXIuJHVybFJvdXRlclxyXG4gICAqXHJcbiAgICogQHJlcXVpcmVzICRsb2NhdGlvblxyXG4gICAqIEByZXF1aXJlcyAkcm9vdFNjb3BlXHJcbiAgICogQHJlcXVpcmVzICRpbmplY3RvclxyXG4gICAqIEByZXF1aXJlcyAkYnJvd3NlclxyXG4gICAqXHJcbiAgICogQGRlc2NyaXB0aW9uXHJcbiAgICpcclxuICAgKi9cclxuICB0aGlzLiRnZXQgPSAkZ2V0O1xyXG4gICRnZXQuJGluamVjdCA9IFsnJGxvY2F0aW9uJywgJyRyb290U2NvcGUnLCAnJGluamVjdG9yJywgJyRicm93c2VyJ107XHJcbiAgZnVuY3Rpb24gJGdldCggICAkbG9jYXRpb24sICAgJHJvb3RTY29wZSwgICAkaW5qZWN0b3IsICAgJGJyb3dzZXIpIHtcclxuXHJcbiAgICB2YXIgYmFzZUhyZWYgPSAkYnJvd3Nlci5iYXNlSHJlZigpLCBsb2NhdGlvbiA9ICRsb2NhdGlvbi51cmwoKSwgbGFzdFB1c2hlZFVybDtcclxuXHJcbiAgICBmdW5jdGlvbiBhcHBlbmRCYXNlUGF0aCh1cmwsIGlzSHRtbDUsIGFic29sdXRlKSB7XHJcbiAgICAgIGlmIChiYXNlSHJlZiA9PT0gJy8nKSByZXR1cm4gdXJsO1xyXG4gICAgICBpZiAoaXNIdG1sNSkgcmV0dXJuIGJhc2VIcmVmLnNsaWNlKDAsIC0xKSArIHVybDtcclxuICAgICAgaWYgKGFic29sdXRlKSByZXR1cm4gYmFzZUhyZWYuc2xpY2UoMSkgKyB1cmw7XHJcbiAgICAgIHJldHVybiB1cmw7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVE9ETzogT3B0aW1pemUgZ3JvdXBzIG9mIHJ1bGVzIHdpdGggbm9uLWVtcHR5IHByZWZpeCBpbnRvIHNvbWUgc29ydCBvZiBkZWNpc2lvbiB0cmVlXHJcbiAgICBmdW5jdGlvbiB1cGRhdGUoZXZ0KSB7XHJcbiAgICAgIGlmIChldnQgJiYgZXZ0LmRlZmF1bHRQcmV2ZW50ZWQpIHJldHVybjtcclxuICAgICAgdmFyIGlnbm9yZVVwZGF0ZSA9IGxhc3RQdXNoZWRVcmwgJiYgJGxvY2F0aW9uLnVybCgpID09PSBsYXN0UHVzaGVkVXJsO1xyXG4gICAgICBsYXN0UHVzaGVkVXJsID0gdW5kZWZpbmVkO1xyXG4gICAgICBpZiAoaWdub3JlVXBkYXRlKSByZXR1cm4gdHJ1ZTtcclxuXHJcbiAgICAgIGZ1bmN0aW9uIGNoZWNrKHJ1bGUpIHtcclxuICAgICAgICB2YXIgaGFuZGxlZCA9IHJ1bGUoJGluamVjdG9yLCAkbG9jYXRpb24pO1xyXG5cclxuICAgICAgICBpZiAoIWhhbmRsZWQpIHJldHVybiBmYWxzZTtcclxuICAgICAgICBpZiAoaXNTdHJpbmcoaGFuZGxlZCkpICRsb2NhdGlvbi5yZXBsYWNlKCkudXJsKGhhbmRsZWQpO1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICB9XHJcbiAgICAgIHZhciBuID0gcnVsZXMubGVuZ3RoLCBpO1xyXG5cclxuICAgICAgZm9yIChpID0gMDsgaSA8IG47IGkrKykge1xyXG4gICAgICAgIGlmIChjaGVjayhydWxlc1tpXSkpIHJldHVybjtcclxuICAgICAgfVxyXG4gICAgICAvLyBhbHdheXMgY2hlY2sgb3RoZXJ3aXNlIGxhc3QgdG8gYWxsb3cgZHluYW1pYyB1cGRhdGVzIHRvIHRoZSBzZXQgb2YgcnVsZXNcclxuICAgICAgaWYgKG90aGVyd2lzZSkgY2hlY2sob3RoZXJ3aXNlKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBsaXN0ZW4oKSB7XHJcbiAgICAgIGxpc3RlbmVyID0gbGlzdGVuZXIgfHwgJHJvb3RTY29wZS4kb24oJyRsb2NhdGlvbkNoYW5nZVN1Y2Nlc3MnLCB1cGRhdGUpO1xyXG4gICAgICByZXR1cm4gbGlzdGVuZXI7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFpbnRlcmNlcHREZWZlcnJlZCkgbGlzdGVuKCk7XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgLyoqXHJcbiAgICAgICAqIEBuZ2RvYyBmdW5jdGlvblxyXG4gICAgICAgKiBAbmFtZSB1aS5yb3V0ZXIucm91dGVyLiR1cmxSb3V0ZXIjc3luY1xyXG4gICAgICAgKiBAbWV0aG9kT2YgdWkucm91dGVyLnJvdXRlci4kdXJsUm91dGVyXHJcbiAgICAgICAqXHJcbiAgICAgICAqIEBkZXNjcmlwdGlvblxyXG4gICAgICAgKiBUcmlnZ2VycyBhbiB1cGRhdGU7IHRoZSBzYW1lIHVwZGF0ZSB0aGF0IGhhcHBlbnMgd2hlbiB0aGUgYWRkcmVzcyBiYXIgdXJsIGNoYW5nZXMsIGFrYSBgJGxvY2F0aW9uQ2hhbmdlU3VjY2Vzc2AuXHJcbiAgICAgICAqIFRoaXMgbWV0aG9kIGlzIHVzZWZ1bCB3aGVuIHlvdSBuZWVkIHRvIHVzZSBgcHJldmVudERlZmF1bHQoKWAgb24gdGhlIGAkbG9jYXRpb25DaGFuZ2VTdWNjZXNzYCBldmVudCxcclxuICAgICAgICogcGVyZm9ybSBzb21lIGN1c3RvbSBsb2dpYyAocm91dGUgcHJvdGVjdGlvbiwgYXV0aCwgY29uZmlnLCByZWRpcmVjdGlvbiwgZXRjKSBhbmQgdGhlbiBmaW5hbGx5IHByb2NlZWRcclxuICAgICAgICogd2l0aCB0aGUgdHJhbnNpdGlvbiBieSBjYWxsaW5nIGAkdXJsUm91dGVyLnN5bmMoKWAuXHJcbiAgICAgICAqXHJcbiAgICAgICAqIEBleGFtcGxlXHJcbiAgICAgICAqIDxwcmU+XHJcbiAgICAgICAqIGFuZ3VsYXIubW9kdWxlKCdhcHAnLCBbJ3VpLnJvdXRlciddKVxyXG4gICAgICAgKiAgIC5ydW4oZnVuY3Rpb24oJHJvb3RTY29wZSwgJHVybFJvdXRlcikge1xyXG4gICAgICAgKiAgICAgJHJvb3RTY29wZS4kb24oJyRsb2NhdGlvbkNoYW5nZVN1Y2Nlc3MnLCBmdW5jdGlvbihldnQpIHtcclxuICAgICAgICogICAgICAgLy8gSGFsdCBzdGF0ZSBjaGFuZ2UgZnJvbSBldmVuIHN0YXJ0aW5nXHJcbiAgICAgICAqICAgICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgKiAgICAgICAvLyBQZXJmb3JtIGN1c3RvbSBsb2dpY1xyXG4gICAgICAgKiAgICAgICB2YXIgbWVldHNSZXF1aXJlbWVudCA9IC4uLlxyXG4gICAgICAgKiAgICAgICAvLyBDb250aW51ZSB3aXRoIHRoZSB1cGRhdGUgYW5kIHN0YXRlIHRyYW5zaXRpb24gaWYgbG9naWMgYWxsb3dzXHJcbiAgICAgICAqICAgICAgIGlmIChtZWV0c1JlcXVpcmVtZW50KSAkdXJsUm91dGVyLnN5bmMoKTtcclxuICAgICAgICogICAgIH0pO1xyXG4gICAgICAgKiB9KTtcclxuICAgICAgICogPC9wcmU+XHJcbiAgICAgICAqL1xyXG4gICAgICBzeW5jOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB1cGRhdGUoKTtcclxuICAgICAgfSxcclxuXHJcbiAgICAgIGxpc3RlbjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgcmV0dXJuIGxpc3RlbigpO1xyXG4gICAgICB9LFxyXG5cclxuICAgICAgdXBkYXRlOiBmdW5jdGlvbihyZWFkKSB7XHJcbiAgICAgICAgaWYgKHJlYWQpIHtcclxuICAgICAgICAgIGxvY2F0aW9uID0gJGxvY2F0aW9uLnVybCgpO1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoJGxvY2F0aW9uLnVybCgpID09PSBsb2NhdGlvbikgcmV0dXJuO1xyXG5cclxuICAgICAgICAkbG9jYXRpb24udXJsKGxvY2F0aW9uKTtcclxuICAgICAgICAkbG9jYXRpb24ucmVwbGFjZSgpO1xyXG4gICAgICB9LFxyXG5cclxuICAgICAgcHVzaDogZnVuY3Rpb24odXJsTWF0Y2hlciwgcGFyYW1zLCBvcHRpb25zKSB7XHJcbiAgICAgICAgJGxvY2F0aW9uLnVybCh1cmxNYXRjaGVyLmZvcm1hdChwYXJhbXMgfHwge30pKTtcclxuICAgICAgICBsYXN0UHVzaGVkVXJsID0gb3B0aW9ucyAmJiBvcHRpb25zLiQkYXZvaWRSZXN5bmMgPyAkbG9jYXRpb24udXJsKCkgOiB1bmRlZmluZWQ7XHJcbiAgICAgICAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5yZXBsYWNlKSAkbG9jYXRpb24ucmVwbGFjZSgpO1xyXG4gICAgICB9LFxyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIEBuZ2RvYyBmdW5jdGlvblxyXG4gICAgICAgKiBAbmFtZSB1aS5yb3V0ZXIucm91dGVyLiR1cmxSb3V0ZXIjaHJlZlxyXG4gICAgICAgKiBAbWV0aG9kT2YgdWkucm91dGVyLnJvdXRlci4kdXJsUm91dGVyXHJcbiAgICAgICAqXHJcbiAgICAgICAqIEBkZXNjcmlwdGlvblxyXG4gICAgICAgKiBBIFVSTCBnZW5lcmF0aW9uIG1ldGhvZCB0aGF0IHJldHVybnMgdGhlIGNvbXBpbGVkIFVSTCBmb3IgYSBnaXZlblxyXG4gICAgICAgKiB7QGxpbmsgdWkucm91dGVyLnV0aWwudHlwZTpVcmxNYXRjaGVyIGBVcmxNYXRjaGVyYH0sIHBvcHVsYXRlZCB3aXRoIHRoZSBwcm92aWRlZCBwYXJhbWV0ZXJzLlxyXG4gICAgICAgKlxyXG4gICAgICAgKiBAZXhhbXBsZVxyXG4gICAgICAgKiA8cHJlPlxyXG4gICAgICAgKiAkYm9iID0gJHVybFJvdXRlci5ocmVmKG5ldyBVcmxNYXRjaGVyKFwiL2Fib3V0LzpwZXJzb25cIiksIHtcclxuICAgICAgICogICBwZXJzb246IFwiYm9iXCJcclxuICAgICAgICogfSk7XHJcbiAgICAgICAqIC8vICRib2IgPT0gXCIvYWJvdXQvYm9iXCI7XHJcbiAgICAgICAqIDwvcHJlPlxyXG4gICAgICAgKlxyXG4gICAgICAgKiBAcGFyYW0ge1VybE1hdGNoZXJ9IHVybE1hdGNoZXIgVGhlIGBVcmxNYXRjaGVyYCBvYmplY3Qgd2hpY2ggaXMgdXNlZCBhcyB0aGUgdGVtcGxhdGUgb2YgdGhlIFVSTCB0byBnZW5lcmF0ZS5cclxuICAgICAgICogQHBhcmFtIHtvYmplY3Q9fSBwYXJhbXMgQW4gb2JqZWN0IG9mIHBhcmFtZXRlciB2YWx1ZXMgdG8gZmlsbCB0aGUgbWF0Y2hlcidzIHJlcXVpcmVkIHBhcmFtZXRlcnMuXHJcbiAgICAgICAqIEBwYXJhbSB7b2JqZWN0PX0gb3B0aW9ucyBPcHRpb25zIG9iamVjdC4gVGhlIG9wdGlvbnMgYXJlOlxyXG4gICAgICAgKlxyXG4gICAgICAgKiAtICoqYGFic29sdXRlYCoqIC0ge2Jvb2xlYW49ZmFsc2V9LCAgSWYgdHJ1ZSB3aWxsIGdlbmVyYXRlIGFuIGFic29sdXRlIHVybCwgZS5nLiBcImh0dHA6Ly93d3cuZXhhbXBsZS5jb20vZnVsbHVybFwiLlxyXG4gICAgICAgKlxyXG4gICAgICAgKiBAcmV0dXJucyB7c3RyaW5nfSBSZXR1cm5zIHRoZSBmdWxseSBjb21waWxlZCBVUkwsIG9yIGBudWxsYCBpZiBgcGFyYW1zYCBmYWlsIHZhbGlkYXRpb24gYWdhaW5zdCBgdXJsTWF0Y2hlcmBcclxuICAgICAgICovXHJcbiAgICAgIGhyZWY6IGZ1bmN0aW9uKHVybE1hdGNoZXIsIHBhcmFtcywgb3B0aW9ucykge1xyXG4gICAgICAgIGlmICghdXJsTWF0Y2hlci52YWxpZGF0ZXMocGFyYW1zKSkgcmV0dXJuIG51bGw7XHJcblxyXG4gICAgICAgIHZhciBpc0h0bWw1ID0gJGxvY2F0aW9uUHJvdmlkZXIuaHRtbDVNb2RlKCk7XHJcbiAgICAgICAgaWYgKGFuZ3VsYXIuaXNPYmplY3QoaXNIdG1sNSkpIHtcclxuICAgICAgICAgIGlzSHRtbDUgPSBpc0h0bWw1LmVuYWJsZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFxyXG4gICAgICAgIHZhciB1cmwgPSB1cmxNYXRjaGVyLmZvcm1hdChwYXJhbXMpO1xyXG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xyXG5cclxuICAgICAgICBpZiAoIWlzSHRtbDUgJiYgdXJsICE9PSBudWxsKSB7XHJcbiAgICAgICAgICB1cmwgPSBcIiNcIiArICRsb2NhdGlvblByb3ZpZGVyLmhhc2hQcmVmaXgoKSArIHVybDtcclxuICAgICAgICB9XHJcbiAgICAgICAgdXJsID0gYXBwZW5kQmFzZVBhdGgodXJsLCBpc0h0bWw1LCBvcHRpb25zLmFic29sdXRlKTtcclxuXHJcbiAgICAgICAgaWYgKCFvcHRpb25zLmFic29sdXRlIHx8ICF1cmwpIHtcclxuICAgICAgICAgIHJldHVybiB1cmw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgc2xhc2ggPSAoIWlzSHRtbDUgJiYgdXJsID8gJy8nIDogJycpLCBwb3J0ID0gJGxvY2F0aW9uLnBvcnQoKTtcclxuICAgICAgICBwb3J0ID0gKHBvcnQgPT09IDgwIHx8IHBvcnQgPT09IDQ0MyA/ICcnIDogJzonICsgcG9ydCk7XHJcblxyXG4gICAgICAgIHJldHVybiBbJGxvY2F0aW9uLnByb3RvY29sKCksICc6Ly8nLCAkbG9jYXRpb24uaG9zdCgpLCBwb3J0LCBzbGFzaCwgdXJsXS5qb2luKCcnKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9XHJcbn1cclxuXHJcbmFuZ3VsYXIubW9kdWxlKCd1aS5yb3V0ZXIucm91dGVyJykucHJvdmlkZXIoJyR1cmxSb3V0ZXInLCAkVXJsUm91dGVyUHJvdmlkZXIpO1xyXG4iLCJcclxuJFZpZXdQcm92aWRlci4kaW5qZWN0ID0gW107XHJcbmZ1bmN0aW9uICRWaWV3UHJvdmlkZXIoKSB7XHJcblxyXG4gIHRoaXMuJGdldCA9ICRnZXQ7XHJcbiAgLyoqXHJcbiAgICogQG5nZG9jIG9iamVjdFxyXG4gICAqIEBuYW1lIHVpLnJvdXRlci5zdGF0ZS4kdmlld1xyXG4gICAqXHJcbiAgICogQHJlcXVpcmVzIHVpLnJvdXRlci51dGlsLiR0ZW1wbGF0ZUZhY3RvcnlcclxuICAgKiBAcmVxdWlyZXMgJHJvb3RTY29wZVxyXG4gICAqXHJcbiAgICogQGRlc2NyaXB0aW9uXHJcbiAgICpcclxuICAgKi9cclxuICAkZ2V0LiRpbmplY3QgPSBbJyRyb290U2NvcGUnLCAnJHRlbXBsYXRlRmFjdG9yeSddO1xyXG4gIGZ1bmN0aW9uICRnZXQoICAgJHJvb3RTY29wZSwgICAkdGVtcGxhdGVGYWN0b3J5KSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAvLyAkdmlldy5sb2FkKCdmdWxsLnZpZXdOYW1lJywgeyB0ZW1wbGF0ZTogLi4uLCBjb250cm9sbGVyOiAuLi4sIHJlc29sdmU6IC4uLiwgYXN5bmM6IGZhbHNlLCBwYXJhbXM6IC4uLiB9KVxyXG4gICAgICAvKipcclxuICAgICAgICogQG5nZG9jIGZ1bmN0aW9uXHJcbiAgICAgICAqIEBuYW1lIHVpLnJvdXRlci5zdGF0ZS4kdmlldyNsb2FkXHJcbiAgICAgICAqIEBtZXRob2RPZiB1aS5yb3V0ZXIuc3RhdGUuJHZpZXdcclxuICAgICAgICpcclxuICAgICAgICogQGRlc2NyaXB0aW9uXHJcbiAgICAgICAqXHJcbiAgICAgICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lIG5hbWVcclxuICAgICAgICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnMgb3B0aW9uIG9iamVjdC5cclxuICAgICAgICovXHJcbiAgICAgIGxvYWQ6IGZ1bmN0aW9uIGxvYWQobmFtZSwgb3B0aW9ucykge1xyXG4gICAgICAgIHZhciByZXN1bHQsIGRlZmF1bHRzID0ge1xyXG4gICAgICAgICAgdGVtcGxhdGU6IG51bGwsIGNvbnRyb2xsZXI6IG51bGwsIHZpZXc6IG51bGwsIGxvY2FsczogbnVsbCwgbm90aWZ5OiB0cnVlLCBhc3luYzogdHJ1ZSwgcGFyYW1zOiB7fVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgb3B0aW9ucyA9IGV4dGVuZChkZWZhdWx0cywgb3B0aW9ucyk7XHJcblxyXG4gICAgICAgIGlmIChvcHRpb25zLnZpZXcpIHtcclxuICAgICAgICAgIHJlc3VsdCA9ICR0ZW1wbGF0ZUZhY3RvcnkuZnJvbUNvbmZpZyhvcHRpb25zLnZpZXcsIG9wdGlvbnMucGFyYW1zLCBvcHRpb25zLmxvY2Fscyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChyZXN1bHQgJiYgb3B0aW9ucy5ub3RpZnkpIHtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBAbmdkb2MgZXZlbnRcclxuICAgICAgICAgKiBAbmFtZSB1aS5yb3V0ZXIuc3RhdGUuJHN0YXRlIyR2aWV3Q29udGVudExvYWRpbmdcclxuICAgICAgICAgKiBAZXZlbnRPZiB1aS5yb3V0ZXIuc3RhdGUuJHZpZXdcclxuICAgICAgICAgKiBAZXZlbnRUeXBlIGJyb2FkY2FzdCBvbiByb290IHNjb3BlXHJcbiAgICAgICAgICogQGRlc2NyaXB0aW9uXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBGaXJlZCBvbmNlIHRoZSB2aWV3ICoqYmVnaW5zIGxvYWRpbmcqKiwgKmJlZm9yZSogdGhlIERPTSBpcyByZW5kZXJlZC5cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBldmVudCBFdmVudCBvYmplY3QuXHJcbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IHZpZXdDb25maWcgVGhlIHZpZXcgY29uZmlnIHByb3BlcnRpZXMgKHRlbXBsYXRlLCBjb250cm9sbGVyLCBldGMpLlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogQGV4YW1wbGVcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIDxwcmU+XHJcbiAgICAgICAgICogJHNjb3BlLiRvbignJHZpZXdDb250ZW50TG9hZGluZycsXHJcbiAgICAgICAgICogZnVuY3Rpb24oZXZlbnQsIHZpZXdDb25maWcpe1xyXG4gICAgICAgICAqICAgICAvLyBBY2Nlc3MgdG8gYWxsIHRoZSB2aWV3IGNvbmZpZyBwcm9wZXJ0aWVzLlxyXG4gICAgICAgICAqICAgICAvLyBhbmQgb25lIHNwZWNpYWwgcHJvcGVydHkgJ3RhcmdldFZpZXcnXHJcbiAgICAgICAgICogICAgIC8vIHZpZXdDb25maWcudGFyZ2V0Vmlld1xyXG4gICAgICAgICAqIH0pO1xyXG4gICAgICAgICAqIDwvcHJlPlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCckdmlld0NvbnRlbnRMb2FkaW5nJywgb3B0aW9ucyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiByZXN1bHQ7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgfVxyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgndWkucm91dGVyLnN0YXRlJykucHJvdmlkZXIoJyR2aWV3JywgJFZpZXdQcm92aWRlcik7XHJcbiIsIi8qKlxyXG4gKiBAbmdkb2MgZGlyZWN0aXZlXHJcbiAqIEBuYW1lIHVpLnJvdXRlci5zdGF0ZS5kaXJlY3RpdmU6dWktdmlld1xyXG4gKlxyXG4gKiBAcmVxdWlyZXMgdWkucm91dGVyLnN0YXRlLiRzdGF0ZVxyXG4gKiBAcmVxdWlyZXMgJGNvbXBpbGVcclxuICogQHJlcXVpcmVzICRjb250cm9sbGVyXHJcbiAqIEByZXF1aXJlcyAkaW5qZWN0b3JcclxuICogQHJlcXVpcmVzIHVpLnJvdXRlci5zdGF0ZS4kdWlWaWV3U2Nyb2xsXHJcbiAqIEByZXF1aXJlcyAkZG9jdW1lbnRcclxuICpcclxuICogQHJlc3RyaWN0IEVDQVxyXG4gKlxyXG4gKiBAZGVzY3JpcHRpb25cclxuICogVGhlIHVpLXZpZXcgZGlyZWN0aXZlIHRlbGxzICRzdGF0ZSB3aGVyZSB0byBwbGFjZSB5b3VyIHRlbXBsYXRlcy5cclxuICpcclxuICogQHBhcmFtIHtzdHJpbmc9fSBuYW1lIEEgdmlldyBuYW1lLiBUaGUgbmFtZSBzaG91bGQgYmUgdW5pcXVlIGFtb25nc3QgdGhlIG90aGVyIHZpZXdzIGluIHRoZVxyXG4gKiBzYW1lIHN0YXRlLiBZb3UgY2FuIGhhdmUgdmlld3Mgb2YgdGhlIHNhbWUgbmFtZSB0aGF0IGxpdmUgaW4gZGlmZmVyZW50IHN0YXRlcy5cclxuICpcclxuICogQHBhcmFtIHtzdHJpbmc9fSBhdXRvc2Nyb2xsIEl0IGFsbG93cyB5b3UgdG8gc2V0IHRoZSBzY3JvbGwgYmVoYXZpb3Igb2YgdGhlIGJyb3dzZXIgd2luZG93XHJcbiAqIHdoZW4gYSB2aWV3IGlzIHBvcHVsYXRlZC4gQnkgZGVmYXVsdCwgJGFuY2hvclNjcm9sbCBpcyBvdmVycmlkZGVuIGJ5IHVpLXJvdXRlcidzIGN1c3RvbSBzY3JvbGxcclxuICogc2VydmljZSwge0BsaW5rIHVpLnJvdXRlci5zdGF0ZS4kdWlWaWV3U2Nyb2xsfS4gVGhpcyBjdXN0b20gc2VydmljZSBsZXQncyB5b3VcclxuICogc2Nyb2xsIHVpLXZpZXcgZWxlbWVudHMgaW50byB2aWV3IHdoZW4gdGhleSBhcmUgcG9wdWxhdGVkIGR1cmluZyBhIHN0YXRlIGFjdGl2YXRpb24uXHJcbiAqXHJcbiAqICpOb3RlOiBUbyByZXZlcnQgYmFjayB0byBvbGQgW2AkYW5jaG9yU2Nyb2xsYF0oaHR0cDovL2RvY3MuYW5ndWxhcmpzLm9yZy9hcGkvbmcuJGFuY2hvclNjcm9sbClcclxuICogZnVuY3Rpb25hbGl0eSwgY2FsbCBgJHVpVmlld1Njcm9sbFByb3ZpZGVyLnVzZUFuY2hvclNjcm9sbCgpYC4qXHJcbiAqXHJcbiAqIEBwYXJhbSB7c3RyaW5nPX0gb25sb2FkIEV4cHJlc3Npb24gdG8gZXZhbHVhdGUgd2hlbmV2ZXIgdGhlIHZpZXcgdXBkYXRlcy5cclxuICogXHJcbiAqIEBleGFtcGxlXHJcbiAqIEEgdmlldyBjYW4gYmUgdW5uYW1lZCBvciBuYW1lZC4gXHJcbiAqIDxwcmU+XHJcbiAqIDwhLS0gVW5uYW1lZCAtLT5cclxuICogPGRpdiB1aS12aWV3PjwvZGl2PiBcclxuICogXHJcbiAqIDwhLS0gTmFtZWQgLS0+XHJcbiAqIDxkaXYgdWktdmlldz1cInZpZXdOYW1lXCI+PC9kaXY+XHJcbiAqIDwvcHJlPlxyXG4gKlxyXG4gKiBZb3UgY2FuIG9ubHkgaGF2ZSBvbmUgdW5uYW1lZCB2aWV3IHdpdGhpbiBhbnkgdGVtcGxhdGUgKG9yIHJvb3QgaHRtbCkuIElmIHlvdSBhcmUgb25seSB1c2luZyBhIFxyXG4gKiBzaW5nbGUgdmlldyBhbmQgaXQgaXMgdW5uYW1lZCB0aGVuIHlvdSBjYW4gcG9wdWxhdGUgaXQgbGlrZSBzbzpcclxuICogPHByZT5cclxuICogPGRpdiB1aS12aWV3PjwvZGl2PiBcclxuICogJHN0YXRlUHJvdmlkZXIuc3RhdGUoXCJob21lXCIsIHtcclxuICogICB0ZW1wbGF0ZTogXCI8aDE+SEVMTE8hPC9oMT5cIlxyXG4gKiB9KVxyXG4gKiA8L3ByZT5cclxuICogXHJcbiAqIFRoZSBhYm92ZSBpcyBhIGNvbnZlbmllbnQgc2hvcnRjdXQgZXF1aXZhbGVudCB0byBzcGVjaWZ5aW5nIHlvdXIgdmlldyBleHBsaWNpdGx5IHdpdGggdGhlIHtAbGluayB1aS5yb3V0ZXIuc3RhdGUuJHN0YXRlUHJvdmlkZXIjdmlld3MgYHZpZXdzYH1cclxuICogY29uZmlnIHByb3BlcnR5LCBieSBuYW1lLCBpbiB0aGlzIGNhc2UgYW4gZW1wdHkgbmFtZTpcclxuICogPHByZT5cclxuICogJHN0YXRlUHJvdmlkZXIuc3RhdGUoXCJob21lXCIsIHtcclxuICogICB2aWV3czoge1xyXG4gKiAgICAgXCJcIjoge1xyXG4gKiAgICAgICB0ZW1wbGF0ZTogXCI8aDE+SEVMTE8hPC9oMT5cIlxyXG4gKiAgICAgfVxyXG4gKiAgIH0gICAgXHJcbiAqIH0pXHJcbiAqIDwvcHJlPlxyXG4gKiBcclxuICogQnV0IHR5cGljYWxseSB5b3UnbGwgb25seSB1c2UgdGhlIHZpZXdzIHByb3BlcnR5IGlmIHlvdSBuYW1lIHlvdXIgdmlldyBvciBoYXZlIG1vcmUgdGhhbiBvbmUgdmlldyBcclxuICogaW4gdGhlIHNhbWUgdGVtcGxhdGUuIFRoZXJlJ3Mgbm90IHJlYWxseSBhIGNvbXBlbGxpbmcgcmVhc29uIHRvIG5hbWUgYSB2aWV3IGlmIGl0cyB0aGUgb25seSBvbmUsIFxyXG4gKiBidXQgeW91IGNvdWxkIGlmIHlvdSB3YW50ZWQsIGxpa2Ugc286XHJcbiAqIDxwcmU+XHJcbiAqIDxkaXYgdWktdmlldz1cIm1haW5cIj48L2Rpdj5cclxuICogPC9wcmU+IFxyXG4gKiA8cHJlPlxyXG4gKiAkc3RhdGVQcm92aWRlci5zdGF0ZShcImhvbWVcIiwge1xyXG4gKiAgIHZpZXdzOiB7XHJcbiAqICAgICBcIm1haW5cIjoge1xyXG4gKiAgICAgICB0ZW1wbGF0ZTogXCI8aDE+SEVMTE8hPC9oMT5cIlxyXG4gKiAgICAgfVxyXG4gKiAgIH0gICAgXHJcbiAqIH0pXHJcbiAqIDwvcHJlPlxyXG4gKiBcclxuICogUmVhbGx5IHRob3VnaCwgeW91J2xsIHVzZSB2aWV3cyB0byBzZXQgdXAgbXVsdGlwbGUgdmlld3M6XHJcbiAqIDxwcmU+XHJcbiAqIDxkaXYgdWktdmlldz48L2Rpdj5cclxuICogPGRpdiB1aS12aWV3PVwiY2hhcnRcIj48L2Rpdj4gXHJcbiAqIDxkaXYgdWktdmlldz1cImRhdGFcIj48L2Rpdj4gXHJcbiAqIDwvcHJlPlxyXG4gKiBcclxuICogPHByZT5cclxuICogJHN0YXRlUHJvdmlkZXIuc3RhdGUoXCJob21lXCIsIHtcclxuICogICB2aWV3czoge1xyXG4gKiAgICAgXCJcIjoge1xyXG4gKiAgICAgICB0ZW1wbGF0ZTogXCI8aDE+SEVMTE8hPC9oMT5cIlxyXG4gKiAgICAgfSxcclxuICogICAgIFwiY2hhcnRcIjoge1xyXG4gKiAgICAgICB0ZW1wbGF0ZTogXCI8Y2hhcnRfdGhpbmcvPlwiXHJcbiAqICAgICB9LFxyXG4gKiAgICAgXCJkYXRhXCI6IHtcclxuICogICAgICAgdGVtcGxhdGU6IFwiPGRhdGFfdGhpbmcvPlwiXHJcbiAqICAgICB9XHJcbiAqICAgfSAgICBcclxuICogfSlcclxuICogPC9wcmU+XHJcbiAqXHJcbiAqIEV4YW1wbGVzIGZvciBgYXV0b3Njcm9sbGA6XHJcbiAqXHJcbiAqIDxwcmU+XHJcbiAqIDwhLS0gSWYgYXV0b3Njcm9sbCBwcmVzZW50IHdpdGggbm8gZXhwcmVzc2lvbixcclxuICogICAgICB0aGVuIHNjcm9sbCB1aS12aWV3IGludG8gdmlldyAtLT5cclxuICogPHVpLXZpZXcgYXV0b3Njcm9sbC8+XHJcbiAqXHJcbiAqIDwhLS0gSWYgYXV0b3Njcm9sbCBwcmVzZW50IHdpdGggdmFsaWQgZXhwcmVzc2lvbixcclxuICogICAgICB0aGVuIHNjcm9sbCB1aS12aWV3IGludG8gdmlldyBpZiBleHByZXNzaW9uIGV2YWx1YXRlcyB0byB0cnVlIC0tPlxyXG4gKiA8dWktdmlldyBhdXRvc2Nyb2xsPSd0cnVlJy8+XHJcbiAqIDx1aS12aWV3IGF1dG9zY3JvbGw9J2ZhbHNlJy8+XHJcbiAqIDx1aS12aWV3IGF1dG9zY3JvbGw9J3Njb3BlVmFyaWFibGUnLz5cclxuICogPC9wcmU+XHJcbiAqL1xyXG4kVmlld0RpcmVjdGl2ZS4kaW5qZWN0ID0gWyckc3RhdGUnLCAnJGluamVjdG9yJywgJyR1aVZpZXdTY3JvbGwnLCAnJGludGVycG9sYXRlJ107XHJcbmZ1bmN0aW9uICRWaWV3RGlyZWN0aXZlKCAgICRzdGF0ZSwgICAkaW5qZWN0b3IsICAgJHVpVmlld1Njcm9sbCwgICAkaW50ZXJwb2xhdGUpIHtcclxuXHJcbiAgZnVuY3Rpb24gZ2V0U2VydmljZSgpIHtcclxuICAgIHJldHVybiAoJGluamVjdG9yLmhhcykgPyBmdW5jdGlvbihzZXJ2aWNlKSB7XHJcbiAgICAgIHJldHVybiAkaW5qZWN0b3IuaGFzKHNlcnZpY2UpID8gJGluamVjdG9yLmdldChzZXJ2aWNlKSA6IG51bGw7XHJcbiAgICB9IDogZnVuY3Rpb24oc2VydmljZSkge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIHJldHVybiAkaW5qZWN0b3IuZ2V0KHNlcnZpY2UpO1xyXG4gICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgfVxyXG5cclxuICB2YXIgc2VydmljZSA9IGdldFNlcnZpY2UoKSxcclxuICAgICAgJGFuaW1hdG9yID0gc2VydmljZSgnJGFuaW1hdG9yJyksXHJcbiAgICAgICRhbmltYXRlID0gc2VydmljZSgnJGFuaW1hdGUnKTtcclxuXHJcbiAgLy8gUmV0dXJucyBhIHNldCBvZiBET00gbWFuaXB1bGF0aW9uIGZ1bmN0aW9ucyBiYXNlZCBvbiB3aGljaCBBbmd1bGFyIHZlcnNpb25cclxuICAvLyBpdCBzaG91bGQgdXNlXHJcbiAgZnVuY3Rpb24gZ2V0UmVuZGVyZXIoYXR0cnMsIHNjb3BlKSB7XHJcbiAgICB2YXIgc3RhdGljcyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIGVudGVyOiBmdW5jdGlvbiAoZWxlbWVudCwgdGFyZ2V0LCBjYikgeyB0YXJnZXQuYWZ0ZXIoZWxlbWVudCk7IGNiKCk7IH0sXHJcbiAgICAgICAgbGVhdmU6IGZ1bmN0aW9uIChlbGVtZW50LCBjYikgeyBlbGVtZW50LnJlbW92ZSgpOyBjYigpOyB9XHJcbiAgICAgIH07XHJcbiAgICB9O1xyXG5cclxuICAgIGlmICgkYW5pbWF0ZSkge1xyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIGVudGVyOiBmdW5jdGlvbihlbGVtZW50LCB0YXJnZXQsIGNiKSB7XHJcbiAgICAgICAgICB2YXIgcHJvbWlzZSA9ICRhbmltYXRlLmVudGVyKGVsZW1lbnQsIG51bGwsIHRhcmdldCwgY2IpO1xyXG4gICAgICAgICAgaWYgKHByb21pc2UgJiYgcHJvbWlzZS50aGVuKSBwcm9taXNlLnRoZW4oY2IpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbGVhdmU6IGZ1bmN0aW9uKGVsZW1lbnQsIGNiKSB7XHJcbiAgICAgICAgICB2YXIgcHJvbWlzZSA9ICRhbmltYXRlLmxlYXZlKGVsZW1lbnQsIGNiKTtcclxuICAgICAgICAgIGlmIChwcm9taXNlICYmIHByb21pc2UudGhlbikgcHJvbWlzZS50aGVuKGNiKTtcclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCRhbmltYXRvcikge1xyXG4gICAgICB2YXIgYW5pbWF0ZSA9ICRhbmltYXRvciAmJiAkYW5pbWF0b3Ioc2NvcGUsIGF0dHJzKTtcclxuXHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgZW50ZXI6IGZ1bmN0aW9uKGVsZW1lbnQsIHRhcmdldCwgY2IpIHthbmltYXRlLmVudGVyKGVsZW1lbnQsIG51bGwsIHRhcmdldCk7IGNiKCk7IH0sXHJcbiAgICAgICAgbGVhdmU6IGZ1bmN0aW9uKGVsZW1lbnQsIGNiKSB7IGFuaW1hdGUubGVhdmUoZWxlbWVudCk7IGNiKCk7IH1cclxuICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gc3RhdGljcygpO1xyXG4gIH1cclxuXHJcbiAgdmFyIGRpcmVjdGl2ZSA9IHtcclxuICAgIHJlc3RyaWN0OiAnRUNBJyxcclxuICAgIHRlcm1pbmFsOiB0cnVlLFxyXG4gICAgcHJpb3JpdHk6IDQwMCxcclxuICAgIHRyYW5zY2x1ZGU6ICdlbGVtZW50JyxcclxuICAgIGNvbXBpbGU6IGZ1bmN0aW9uICh0RWxlbWVudCwgdEF0dHJzLCAkdHJhbnNjbHVkZSkge1xyXG4gICAgICByZXR1cm4gZnVuY3Rpb24gKHNjb3BlLCAkZWxlbWVudCwgYXR0cnMpIHtcclxuICAgICAgICB2YXIgcHJldmlvdXNFbCwgY3VycmVudEVsLCBjdXJyZW50U2NvcGUsIGxhdGVzdExvY2FscyxcclxuICAgICAgICAgICAgb25sb2FkRXhwICAgICA9IGF0dHJzLm9ubG9hZCB8fCAnJyxcclxuICAgICAgICAgICAgYXV0b1Njcm9sbEV4cCA9IGF0dHJzLmF1dG9zY3JvbGwsXHJcbiAgICAgICAgICAgIHJlbmRlcmVyICAgICAgPSBnZXRSZW5kZXJlcihhdHRycywgc2NvcGUpO1xyXG5cclxuICAgICAgICBzY29wZS4kb24oJyRzdGF0ZUNoYW5nZVN1Y2Nlc3MnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgIHVwZGF0ZVZpZXcoZmFsc2UpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHNjb3BlLiRvbignJHZpZXdDb250ZW50TG9hZGluZycsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgdXBkYXRlVmlldyhmYWxzZSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHVwZGF0ZVZpZXcodHJ1ZSk7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGNsZWFudXBMYXN0VmlldygpIHtcclxuICAgICAgICAgIGlmIChwcmV2aW91c0VsKSB7XHJcbiAgICAgICAgICAgIHByZXZpb3VzRWwucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIHByZXZpb3VzRWwgPSBudWxsO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGlmIChjdXJyZW50U2NvcGUpIHtcclxuICAgICAgICAgICAgY3VycmVudFNjb3BlLiRkZXN0cm95KCk7XHJcbiAgICAgICAgICAgIGN1cnJlbnRTY29wZSA9IG51bGw7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgaWYgKGN1cnJlbnRFbCkge1xyXG4gICAgICAgICAgICByZW5kZXJlci5sZWF2ZShjdXJyZW50RWwsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgIHByZXZpb3VzRWwgPSBudWxsO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIHByZXZpb3VzRWwgPSBjdXJyZW50RWw7XHJcbiAgICAgICAgICAgIGN1cnJlbnRFbCA9IG51bGw7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiB1cGRhdGVWaWV3KGZpcnN0VGltZSkge1xyXG4gICAgICAgICAgdmFyIG5ld1Njb3BlLFxyXG4gICAgICAgICAgICAgIG5hbWUgICAgICAgICAgICA9IGdldFVpVmlld05hbWUoc2NvcGUsIGF0dHJzLCAkZWxlbWVudCwgJGludGVycG9sYXRlKSxcclxuICAgICAgICAgICAgICBwcmV2aW91c0xvY2FscyAgPSBuYW1lICYmICRzdGF0ZS4kY3VycmVudCAmJiAkc3RhdGUuJGN1cnJlbnQubG9jYWxzW25hbWVdO1xyXG5cclxuICAgICAgICAgIGlmICghZmlyc3RUaW1lICYmIHByZXZpb3VzTG9jYWxzID09PSBsYXRlc3RMb2NhbHMpIHJldHVybjsgLy8gbm90aGluZyB0byBkb1xyXG4gICAgICAgICAgbmV3U2NvcGUgPSBzY29wZS4kbmV3KCk7XHJcbiAgICAgICAgICBsYXRlc3RMb2NhbHMgPSAkc3RhdGUuJGN1cnJlbnQubG9jYWxzW25hbWVdO1xyXG5cclxuICAgICAgICAgIHZhciBjbG9uZSA9ICR0cmFuc2NsdWRlKG5ld1Njb3BlLCBmdW5jdGlvbihjbG9uZSkge1xyXG4gICAgICAgICAgICByZW5kZXJlci5lbnRlcihjbG9uZSwgJGVsZW1lbnQsIGZ1bmN0aW9uIG9uVWlWaWV3RW50ZXIoKSB7XHJcbiAgICAgICAgICAgICAgaWYoY3VycmVudFNjb3BlKSB7XHJcbiAgICAgICAgICAgICAgICBjdXJyZW50U2NvcGUuJGVtaXQoJyR2aWV3Q29udGVudEFuaW1hdGlvbkVuZGVkJyk7XHJcbiAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICBpZiAoYW5ndWxhci5pc0RlZmluZWQoYXV0b1Njcm9sbEV4cCkgJiYgIWF1dG9TY3JvbGxFeHAgfHwgc2NvcGUuJGV2YWwoYXV0b1Njcm9sbEV4cCkpIHtcclxuICAgICAgICAgICAgICAgICR1aVZpZXdTY3JvbGwoY2xvbmUpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGNsZWFudXBMYXN0VmlldygpO1xyXG4gICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgY3VycmVudEVsID0gY2xvbmU7XHJcbiAgICAgICAgICBjdXJyZW50U2NvcGUgPSBuZXdTY29wZTtcclxuICAgICAgICAgIC8qKlxyXG4gICAgICAgICAgICogQG5nZG9jIGV2ZW50XHJcbiAgICAgICAgICAgKiBAbmFtZSB1aS5yb3V0ZXIuc3RhdGUuZGlyZWN0aXZlOnVpLXZpZXcjJHZpZXdDb250ZW50TG9hZGVkXHJcbiAgICAgICAgICAgKiBAZXZlbnRPZiB1aS5yb3V0ZXIuc3RhdGUuZGlyZWN0aXZlOnVpLXZpZXdcclxuICAgICAgICAgICAqIEBldmVudFR5cGUgZW1pdHMgb24gdWktdmlldyBkaXJlY3RpdmUgc2NvcGVcclxuICAgICAgICAgICAqIEBkZXNjcmlwdGlvbiAgICAgICAgICAgKlxyXG4gICAgICAgICAgICogRmlyZWQgb25jZSB0aGUgdmlldyBpcyAqKmxvYWRlZCoqLCAqYWZ0ZXIqIHRoZSBET00gaXMgcmVuZGVyZWQuXHJcbiAgICAgICAgICAgKlxyXG4gICAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IGV2ZW50IEV2ZW50IG9iamVjdC5cclxuICAgICAgICAgICAqL1xyXG4gICAgICAgICAgY3VycmVudFNjb3BlLiRlbWl0KCckdmlld0NvbnRlbnRMb2FkZWQnKTtcclxuICAgICAgICAgIGN1cnJlbnRTY29wZS4kZXZhbChvbmxvYWRFeHApO1xyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICByZXR1cm4gZGlyZWN0aXZlO1xyXG59XHJcblxyXG4kVmlld0RpcmVjdGl2ZUZpbGwuJGluamVjdCA9IFsnJGNvbXBpbGUnLCAnJGNvbnRyb2xsZXInLCAnJHN0YXRlJywgJyRpbnRlcnBvbGF0ZSddO1xyXG5mdW5jdGlvbiAkVmlld0RpcmVjdGl2ZUZpbGwgKCAgJGNvbXBpbGUsICAgJGNvbnRyb2xsZXIsICAgJHN0YXRlLCAgICRpbnRlcnBvbGF0ZSkge1xyXG4gIHJldHVybiB7XHJcbiAgICByZXN0cmljdDogJ0VDQScsXHJcbiAgICBwcmlvcml0eTogLTQwMCxcclxuICAgIGNvbXBpbGU6IGZ1bmN0aW9uICh0RWxlbWVudCkge1xyXG4gICAgICB2YXIgaW5pdGlhbCA9IHRFbGVtZW50Lmh0bWwoKTtcclxuICAgICAgcmV0dXJuIGZ1bmN0aW9uIChzY29wZSwgJGVsZW1lbnQsIGF0dHJzKSB7XHJcbiAgICAgICAgdmFyIGN1cnJlbnQgPSAkc3RhdGUuJGN1cnJlbnQsXHJcbiAgICAgICAgICAgIG5hbWUgPSBnZXRVaVZpZXdOYW1lKHNjb3BlLCBhdHRycywgJGVsZW1lbnQsICRpbnRlcnBvbGF0ZSksXHJcbiAgICAgICAgICAgIGxvY2FscyAgPSBjdXJyZW50ICYmIGN1cnJlbnQubG9jYWxzW25hbWVdO1xyXG5cclxuICAgICAgICBpZiAoISBsb2NhbHMpIHtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgICRlbGVtZW50LmRhdGEoJyR1aVZpZXcnLCB7IG5hbWU6IG5hbWUsIHN0YXRlOiBsb2NhbHMuJCRzdGF0ZSB9KTtcclxuICAgICAgICAkZWxlbWVudC5odG1sKGxvY2Fscy4kdGVtcGxhdGUgPyBsb2NhbHMuJHRlbXBsYXRlIDogaW5pdGlhbCk7XHJcblxyXG4gICAgICAgIHZhciBsaW5rID0gJGNvbXBpbGUoJGVsZW1lbnQuY29udGVudHMoKSk7XHJcblxyXG4gICAgICAgIGlmIChsb2NhbHMuJCRjb250cm9sbGVyKSB7XHJcbiAgICAgICAgICBsb2NhbHMuJHNjb3BlID0gc2NvcGU7XHJcbiAgICAgICAgICBsb2NhbHMuJGVsZW1lbnQgPSAkZWxlbWVudDtcclxuICAgICAgICAgIHZhciBjb250cm9sbGVyID0gJGNvbnRyb2xsZXIobG9jYWxzLiQkY29udHJvbGxlciwgbG9jYWxzKTtcclxuICAgICAgICAgIGlmIChsb2NhbHMuJCRjb250cm9sbGVyQXMpIHtcclxuICAgICAgICAgICAgc2NvcGVbbG9jYWxzLiQkY29udHJvbGxlckFzXSA9IGNvbnRyb2xsZXI7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICAkZWxlbWVudC5kYXRhKCckbmdDb250cm9sbGVyQ29udHJvbGxlcicsIGNvbnRyb2xsZXIpO1xyXG4gICAgICAgICAgJGVsZW1lbnQuY2hpbGRyZW4oKS5kYXRhKCckbmdDb250cm9sbGVyQ29udHJvbGxlcicsIGNvbnRyb2xsZXIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgbGluayhzY29wZSk7XHJcbiAgICAgIH07XHJcbiAgICB9XHJcbiAgfTtcclxufVxyXG5cclxuLyoqXHJcbiAqIFNoYXJlZCB1aS12aWV3IGNvZGUgZm9yIGJvdGggZGlyZWN0aXZlczpcclxuICogR2l2ZW4gc2NvcGUsIGVsZW1lbnQsIGFuZCBpdHMgYXR0cmlidXRlcywgcmV0dXJuIHRoZSB2aWV3J3MgbmFtZVxyXG4gKi9cclxuZnVuY3Rpb24gZ2V0VWlWaWV3TmFtZShzY29wZSwgYXR0cnMsIGVsZW1lbnQsICRpbnRlcnBvbGF0ZSkge1xyXG4gIHZhciBuYW1lID0gJGludGVycG9sYXRlKGF0dHJzLnVpVmlldyB8fCBhdHRycy5uYW1lIHx8ICcnKShzY29wZSk7XHJcbiAgdmFyIGluaGVyaXRlZCA9IGVsZW1lbnQuaW5oZXJpdGVkRGF0YSgnJHVpVmlldycpO1xyXG4gIHJldHVybiBuYW1lLmluZGV4T2YoJ0AnKSA+PSAwID8gIG5hbWUgOiAgKG5hbWUgKyAnQCcgKyAoaW5oZXJpdGVkID8gaW5oZXJpdGVkLnN0YXRlLm5hbWUgOiAnJykpO1xyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgndWkucm91dGVyLnN0YXRlJykuZGlyZWN0aXZlKCd1aVZpZXcnLCAkVmlld0RpcmVjdGl2ZSk7XHJcbmFuZ3VsYXIubW9kdWxlKCd1aS5yb3V0ZXIuc3RhdGUnKS5kaXJlY3RpdmUoJ3VpVmlldycsICRWaWV3RGlyZWN0aXZlRmlsbCk7XHJcbiIsIi8qKlxyXG4gKiBAbmdkb2Mgb2JqZWN0XHJcbiAqIEBuYW1lIHVpLnJvdXRlci5zdGF0ZS4kdWlWaWV3U2Nyb2xsUHJvdmlkZXJcclxuICpcclxuICogQGRlc2NyaXB0aW9uXHJcbiAqIFByb3ZpZGVyIHRoYXQgcmV0dXJucyB0aGUge0BsaW5rIHVpLnJvdXRlci5zdGF0ZS4kdWlWaWV3U2Nyb2xsfSBzZXJ2aWNlIGZ1bmN0aW9uLlxyXG4gKi9cclxuZnVuY3Rpb24gJFZpZXdTY3JvbGxQcm92aWRlcigpIHtcclxuXHJcbiAgdmFyIHVzZUFuY2hvclNjcm9sbCA9IGZhbHNlO1xyXG5cclxuICAvKipcclxuICAgKiBAbmdkb2MgZnVuY3Rpb25cclxuICAgKiBAbmFtZSB1aS5yb3V0ZXIuc3RhdGUuJHVpVmlld1Njcm9sbFByb3ZpZGVyI3VzZUFuY2hvclNjcm9sbFxyXG4gICAqIEBtZXRob2RPZiB1aS5yb3V0ZXIuc3RhdGUuJHVpVmlld1Njcm9sbFByb3ZpZGVyXHJcbiAgICpcclxuICAgKiBAZGVzY3JpcHRpb25cclxuICAgKiBSZXZlcnRzIGJhY2sgdG8gdXNpbmcgdGhlIGNvcmUgW2AkYW5jaG9yU2Nyb2xsYF0oaHR0cDovL2RvY3MuYW5ndWxhcmpzLm9yZy9hcGkvbmcuJGFuY2hvclNjcm9sbCkgc2VydmljZSBmb3JcclxuICAgKiBzY3JvbGxpbmcgYmFzZWQgb24gdGhlIHVybCBhbmNob3IuXHJcbiAgICovXHJcbiAgdGhpcy51c2VBbmNob3JTY3JvbGwgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICB1c2VBbmNob3JTY3JvbGwgPSB0cnVlO1xyXG4gIH07XHJcblxyXG4gIC8qKlxyXG4gICAqIEBuZ2RvYyBvYmplY3RcclxuICAgKiBAbmFtZSB1aS5yb3V0ZXIuc3RhdGUuJHVpVmlld1Njcm9sbFxyXG4gICAqXHJcbiAgICogQHJlcXVpcmVzICRhbmNob3JTY3JvbGxcclxuICAgKiBAcmVxdWlyZXMgJHRpbWVvdXRcclxuICAgKlxyXG4gICAqIEBkZXNjcmlwdGlvblxyXG4gICAqIFdoZW4gY2FsbGVkIHdpdGggYSBqcUxpdGUgZWxlbWVudCwgaXQgc2Nyb2xscyB0aGUgZWxlbWVudCBpbnRvIHZpZXcgKGFmdGVyIGFcclxuICAgKiBgJHRpbWVvdXRgIHNvIHRoZSBET00gaGFzIHRpbWUgdG8gcmVmcmVzaCkuXHJcbiAgICpcclxuICAgKiBJZiB5b3UgcHJlZmVyIHRvIHJlbHkgb24gYCRhbmNob3JTY3JvbGxgIHRvIHNjcm9sbCB0aGUgdmlldyB0byB0aGUgYW5jaG9yLFxyXG4gICAqIHRoaXMgY2FuIGJlIGVuYWJsZWQgYnkgY2FsbGluZyB7QGxpbmsgdWkucm91dGVyLnN0YXRlLiR1aVZpZXdTY3JvbGxQcm92aWRlciNtZXRob2RzX3VzZUFuY2hvclNjcm9sbCBgJHVpVmlld1Njcm9sbFByb3ZpZGVyLnVzZUFuY2hvclNjcm9sbCgpYH0uXHJcbiAgICovXHJcbiAgdGhpcy4kZ2V0ID0gWyckYW5jaG9yU2Nyb2xsJywgJyR0aW1lb3V0JywgZnVuY3Rpb24gKCRhbmNob3JTY3JvbGwsICR0aW1lb3V0KSB7XHJcbiAgICBpZiAodXNlQW5jaG9yU2Nyb2xsKSB7XHJcbiAgICAgIHJldHVybiAkYW5jaG9yU2Nyb2xsO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBmdW5jdGlvbiAoJGVsZW1lbnQpIHtcclxuICAgICAgcmV0dXJuICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAkZWxlbWVudFswXS5zY3JvbGxJbnRvVmlldygpO1xyXG4gICAgICB9LCAwLCBmYWxzZSk7XHJcbiAgICB9O1xyXG4gIH1dO1xyXG59XHJcblxyXG5hbmd1bGFyLm1vZHVsZSgndWkucm91dGVyLnN0YXRlJykucHJvdmlkZXIoJyR1aVZpZXdTY3JvbGwnLCAkVmlld1Njcm9sbFByb3ZpZGVyKTtcclxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9