import {RootState} from './store';

export const selectAuthState = (state: RootState) => state.auth;

export const selectProfileState = (state: RootState) => state.profile;

export const selectCharitiesState = (state: RootState) => state.charities

export const selectResourceState = (state: RootState) => state.resource

export const selectCampaignsState = (state: RootState) => state.campaigns