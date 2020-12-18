import { pushError } from './pnotify';
import { load } from './storage';
import fetchFunctions from './fetchMe';
import hbs from '../templates/authorization-modal.hbs';

const urlLocation = location.href;
if (urlLocation.includes('')) console.log(urlLocation);

function validate(evt) {
  let errors = [];

  const authBackdrop = document.querySelector('.backdrop');
  const googleAuthBtn = document.querySelector('.google-auth');
  const loginInput = document.querySelector('#authorization-modal-email');
  const passwordInput = document.querySelector('#authorization-modal-password');
  const loginBtn = document.querySelector('.authorization-modal-login');
  const registerBtn = document.querySelector('.authorization-modal-register');
  if (evt.target === googleAuthBtn) return;
  if (evt.target === loginBtn) return validateLogin(evt);
  if (evt.target === registerBtn) return validateRegistration(evt);

  async function fetchLogin() {
    const info = {
      email: loginInput.value,
      password: passwordInput.value,
    };

    const request = {
      point: fetchFunctions.points.login,
      body: info,
      method: 'POST',
    };

    let response = await fetchFunctions.login(request);

    if (response) {
      location.reload();
    }
  }

  async function fetchRegistration() {
    const info = {
      email: loginInput.value,
      password: passwordInput.value,
    };
    const request = {
      point: fetchFunctions.points.reg,
      body: info,
      method: 'POST',
    };
    try {
      let response = await fetchFunctions.getRequest(request);
      if (response.id) {
        await fetchLogin();
      }
    } catch (error) {
      console.log(error);
    }
  }

  function validateLogin(evt) {
    evt.preventDefault();
    if (loginInput.value.length === 0) {
      errors.push('Empty email input!');
      pushError('Empty email input!');
      return;
    }

    fetchLogin();
  }

  function validatePassword() {
    const p = passwordInput.value;
    if (p.length <= 8) {
      errors.push('Your password must be at least 8 characters');
      pushError('Your password must be at least 8 characters');
    }
    if (p.search(/[a-z]/i) < 0) {
      errors.push('Your password must contain at least one letter.');
      pushError('Your password must contain at least one letter.');
    }
    if (p.search(/[0-9]/) < 0) {
      errors.push('Your password must contain at least one digit.');
      pushError('Your password must contain at least one digit.');
    }
  }

  function validateLoginForRegistration() {
    if (loginInput.value.length === 0) {
      pushError('Enter email');
    } else if (loginInput.value.length <= 5) {
      pushError('Your login must be at least 6 characters');
    }
  }

  function validateRegistration(evt) {
    evt.preventDefault();
    errors = [];

    validatePassword();
    validateLoginForRegistration();

    if (errors.length < 1) {
      fetchRegistration();
    }
  }
}
export default function openModalAuth() {
  if (load('User')) {
    document.querySelector('button[data-office]').click();
    return false;
  }
  const markup = hbs();
  document.body.addEventListener('click', validate);
  return markup;
}
