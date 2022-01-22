import React, { useEffect } from "react";
import ReactDom from "react-dom";
// Slomux - реализация Flux, в которой, как следует из названия, что-то сломано.
// Нужно починить то, что сломано, и подготовить Slomux к использованию на больших проектах, где крайне важна производительность

// ВНИМАНИЕ! Замена slomux на готовое решение не является решением задачи

const createStore = (reducer, initialState) => {
  let currentState = initialState
  let listeners = []

  const getState = () => currentState
  const dispatch = action => {
    currentState = reducer(currentState, action)
    listeners.forEach(listener => listener())
  }

  const subscribe = listener => {
    listeners.push(listener)

    return () => {
      const index = listeners.indexOf(listener)
      listeners.splice(index, 1)
    }
  }

  return { getState, dispatch, subscribe }
}

const useStore = () => {
  const { store } = React.useContext(Context)

  return store
}

const useSelector = selector => {
  const { getState, subscribe } = useStore()

  const [state, setState] = React.useState(getState())

  useEffect(() => subscribe(() => setState(getState())), [subscribe])

  return selector(state)
}

const useDispatch = () => {
  const { dispatch } = useStore()

  return dispatch
}

const Context = React.createContext(null)

const Provider = ({ store, children }) => {
  return <Context.Provider value={{ store }}>{children}</Context.Provider>
}

// APP

// actions
const UPDATE_COUNTER = "UPDATE_COUNTER"
const CHANGE_STEP_SIZE = "CHANGE_STEP_SIZE"

// action creators
const updateCounter = payload => ({
  type: UPDATE_COUNTER,
  payload,
})

const changeStepSize = payload => ({
  type: CHANGE_STEP_SIZE,
  payload,
})

// reducers
const defaultState = {
  counter: 1,
  stepSize: 1,
}

const reducer = (state = defaultState, action) => {
  switch (action.type) {
    case UPDATE_COUNTER:
      return {
        ...state,
        counter: state.counter + action.payload * state.stepSize,
      };
    case CHANGE_STEP_SIZE:
      return { ...state, stepSize: action.payload }
    default:
      return state
  }
}

// ВНИМАНИЕ! Использование собственной реализации useSelector и dispatch обязательно
const Counter = () => {
  const counter = useSelector(state => state.counter)
  const dispatch = useDispatch()

  return (
    <div>
      <button onClick={() => dispatch(updateCounter(-1))}>-</button>
      <span> {counter} </span>
      <button onClick={() => dispatch(updateCounter(1))}>+</button>
    </div>
  )
}

const Step = () => {
  const stepSize = useSelector(state => state.stepSize)
  const dispatch = useDispatch()

  return (
    <div>
      <div>
        Значение счётчика должно увеличиваться или уменьшаться на заданную
        величину шага
      </div>
      <div>Текущая величина шага: {stepSize}</div>
      <input
        type="range"
        min="1"
        max="5"
        value={stepSize}
        onChange={({ target }) => dispatch(changeStepSize(target.value))}
      />
    </div>
  )
}

ReactDom.render(
  <Provider store={createStore(reducer, defaultState)}>
    <Step />
    <Counter />
  </Provider>,
  document.getElementById("app")
)
