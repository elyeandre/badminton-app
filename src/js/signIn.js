import '../css/index-ui.css';
import '../css/signIn.css';

const doc = document;
const { log } = console;
const { error } = console;

const getById = (id) => doc.getElementById(id);
const getAll = (selector) => doc.querySelectorAll(selector);
const get = (selector) => doc.querySelector(selector);
