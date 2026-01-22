import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './app/store';
import App from './App';
import './index.css';

async function enableMocks() {
  if (import.meta.env.DEV) {
    const { worker } = await import('./features/mocks/browser');
    return worker.start();
  }
}

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);

enableMocks();


