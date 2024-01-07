import {RootState} from './store';

export const selectAuthState = (state: RootState) => state.auth;

export const selectProfileState = (state: RootState) => state.profile;