import { createStore, applyMiddleware } from 'redux'

import setup from '../__test-helpers__/setup'
import { push, replace, back, next } from '../src/connectRoutes'

it('push: verify client-only `push` function calls `history.push()` using history from enclosed state', () => {
  const { enhancer, reducer, history } = setup('/first')

  const createStore = reducer => ({
    // eslint-disable-line arrow-parens
    dispatch: jest.fn(),
    getState: () => reducer()
  })

  const rootReducer = (state = {}, action = {}) => ({
    location: reducer(state.location, action)
  })

  const store = enhancer(createStore)(rootReducer)

  push('/second/bar')
  const action = store.dispatch.mock.calls[1][0] /*? */

  expect(action.type).toEqual('SECOND')
  expect(action.meta.location.current.pathname).toEqual('/second/bar')

  expect(history.length).toEqual(2)
})

it('replace: verify client-only `replace` function calls `history.replace()` using history from enclosed state', () => {
  const { enhancer, reducer } = setup('/first')

  const createStore = reducer => ({
    // eslint-disable-line arrow-parens
    dispatch: jest.fn(),
    getState: () => reducer()
  })

  const rootReducer = (state = {}, action = {}) => ({
    location: reducer(state.location, action)
  })

  const store = enhancer(createStore)(rootReducer)

  replace('/second/bar')
  const action = store.dispatch.mock.calls[1][0] /*? */

  expect(action.type).toEqual('SECOND')
  expect(action.meta.location.current.pathname).toEqual('/second/bar')

  expect(window.history.length).toEqual(1) // key difference between this test and previous `push` test
})

it('back: verify client-only `back` and `next` functions call `history.goBack/goForward()` using history from enclosed state', () => {
  const { history, enhancer, reducer } = setup('/first')

  const createStore = reducer => ({
    // eslint-disable-line arrow-parens
    dispatch: jest.fn(),
    getState: () => reducer()
  })

  const rootReducer = (state = {}, action = {}) => ({
    location: reducer(state.location, action)
  })

  const store = enhancer(createStore)(rootReducer)

  history.push('/second/bar')
  let action = store.dispatch.mock.calls[1][0] /*? */

  expect(action.type).toEqual('SECOND')
  expect(action.meta.location.current.pathname).toEqual('/second/bar')

  back() // THIS IS WHAT WE ARE VERIFYING
  action = store.dispatch.mock.calls[2][0] /*? */

  expect(action.type).toEqual('FIRST')
  expect(action.meta.location.current.pathname).toEqual('/first')

  next() // THIS IS WHAT WE ARE VERIFYING
  action = store.dispatch.mock.calls[3][0] /*? */

  expect(action.type).toEqual('SECOND')
  expect(action.meta.location.current.pathname).toEqual('/second/bar')
})

it('verify window.document is not used server side', () => {
  window.isSSR = true

  const { middleware, windowDocument, reducer } = setup()
  const middlewares = applyMiddleware(middleware)

  const rootReducer = (state = {}, action = {}) => ({
    location: reducer(state.location, action),
    title: `title: ${action.type}`
  })

  const store = createStore(rootReducer, undefined, middlewares)

  store.dispatch({ type: 'FIRST' })

  expect(windowDocument.title).toEqual('title: FIRST') // fake document object used instead
  expect(document.title).toEqual('')

  delete window.isSSR
})
