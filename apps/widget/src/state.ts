import type { SubmitState, WidgetAction, WidgetInit, WidgetState } from './types.js';

const defaultSubmitState: SubmitState = {
  title: '',
  details: '',
  email: '',
  includeUser: false,
  includeScreenshot: false,
  uploading: false,
  submitting: false,
  error: undefined,
  captchaToken: undefined,
  screenshot: undefined,
};

export function createInitialState(init: WidgetInit, profileHash?: string): WidgetState {
  return {
    open: false,
    submit: { ...defaultSubmitState },
    profileHash,
    tags: [],
    captcha: init.captcha,
  };
}

export function widgetReducer(state: WidgetState, action: WidgetAction): WidgetState {
  switch (action.type) {
    case 'OPEN':
      return { ...state, open: true, submit: { ...state.submit, error: undefined } };
    case 'CLOSE':
      return { ...state, open: false };
    case 'SUBMIT_UPDATE':
      return { ...state, submit: { ...state.submit, ...action.payload, error: undefined } };
    case 'UPLOAD_START':
      return {
        ...state,
        submit: {
          ...state.submit,
          uploading: true,
          error: undefined,
          screenshot: state.submit.screenshot ?? {},
        },
      };
    case 'UPLOAD_OK':
      return {
        ...state,
        submit: {
          ...state.submit,
          uploading: false,
          screenshot: { ...(state.submit.screenshot ?? {}), publicUrl: action.payload.publicUrl },
        },
      };
    case 'UPLOAD_ERR':
      return {
        ...state,
        submit: {
          ...state.submit,
          uploading: false,
          error: action.payload.error,
          screenshot: undefined,
          includeScreenshot: false,
        },
      };
    case 'SUBMIT_START':
      return {
        ...state,
        submit: { ...state.submit, submitting: true, error: undefined },
      };
    case 'SUBMIT_OK':
      return {
        ...state,
        submit: {
          ...defaultSubmitState,
          includeUser: state.submit.includeUser,
          captchaToken: state.captcha ? undefined : state.submit.captchaToken,
        },
      };
    case 'SUBMIT_ERR':
      return {
        ...state,
        submit: { ...state.submit, submitting: false, error: action.payload.error },
      };
    case 'IDENTIFY_SET':
      return {
        ...state,
        profileHash: action.payload?.profileHash,
        submit: { ...state.submit },
      };
    case 'SET_TAGS':
      return { ...state, tags: [...action.payload] };
    default:
      return state;
  }
}
