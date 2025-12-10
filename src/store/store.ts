import { Action, configureStore, ThunkAction } from "@reduxjs/toolkit"
import localeReducer from "./localeSlice"

export const store = configureStore({
  reducer: {
    locale: localeReducer
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
