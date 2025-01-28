import  {createSlice } from '@reduxjs/toolkit';

const initialState = {
    isSignedIn: false,
    userData: [],
}

const Slice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
      Signin(state, action) {
        state.isSignedIn = true
        state.userData = [action?.payload?.userData];
      },
      Signout(state) {
        state.isSignedIn = false
        state.userData = [];
      }
    }
  })

  export const { Signin, Signout } = Slice.actions
  export default Slice.reducer
