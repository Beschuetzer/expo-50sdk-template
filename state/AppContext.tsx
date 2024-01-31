// TaskContext.js
import React, { createContext, useContext, useReducer } from "react";

const AppContext = createContext(null);

const initialState = {
  tasks: [],
};

const taskReducer = (state: any, action: any) => {
  switch (action.type) {
    case "ADD_TASK":
      return {
        ...state,
        tasks: [...state.tasks, action.payload],
      };
    case "TOGGLE_TASK":
      return {
        ...state,
        tasks: state.tasks.map((task: any) =>
          task.id === action.payload
            ? { ...task, completed: !task.completed }
            : task
        ),
      };
    case "REMOVE_TASK":
      return {
        ...state,
        tasks: state.tasks.filter((task: any) => task.id !== action.payload),
      };
    default:
      return state;
  }
};

export const TaskProvider = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useTaskContext = () => useContext(AppContext);
