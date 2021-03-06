# Flux Standard Actions (FSA)
One of the goals of **Pure Redux Router** is to *NOT* alter your actions and be 100% *flux standard action*-compliant. That allows
for automatic support for packages such as `redux-actions`. 

So simply put, to do that, we stuffed all the info our middleware, reducer, etc, depends on in the `meta` key of your actions.

Without further ado, let's take a look at what your actions look like--here's our pure utility function, `nestAction()`, used to format 
and nest your actions:


## The Meta key is the *key*
*Note: If you or other middleware are making use of the `meta` key we'll make sure to hold on to that info as well.*

```javascript
const nestAction = (
  pathname: string,
  receivedAction: Action,
  prev: Location,
  kind?: string,
): Action => {
  const { type, payload = {}, meta } = receivedAction

  return {
    type,     // this will remain exactly what you dispatched
    payload,  // this will remain exactly what you dispatched

              // no additional keys!

    meta: {   // all routing information crammed into the meta key
      ...meta,
      location: {
        current: {
          pathname,
          type,
          payload,
        },
        prev,
        load: kind === 'load' ? true : undefined,
        backNext: kind === 'backNext' ? true : undefined,
        redirect: meta.isRedirect ? pathname : undefined,
      },
    },
  }
}
```

So in short, we take a more basic action you dispatch (or that the address-bar listening enhancer dispatches) and assign 
all the location-related information we have to its `meta` key.

## Flow Type
For an even clearer sense of what is on the `meta` key of your *flux standard actions*, here's its ***Flow*** type:

```javascript
type Action = {
  type: string,
  payload: Object,
  meta?: Meta,
}

type Meta = {
  location: {
    current: Location,
    prev: Location,
    load?: true,
    backNext?: true,
    redirect?: string,
  },
}

type Location = {
  pathname: string,
  type: string,
  payload: Object,
}
```

## Conclusion
You will rarely need to inspect the `meta` key. It's primarily for use by our `location` reducer. However, a common
use for it is to use the `load` and `backNext` keys (especially the `load`) to make some determinations in your
reducers. `backNext` simply indicates the browser back/next buttons were used. You can also use the `prev` route to 
do things like declaratively trigger fancy animations in your components because it will indicate which direction 
the user is moving in a funnel/sequence of pages. 
