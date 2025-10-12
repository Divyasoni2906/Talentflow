import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './app/store';
import App from './App';
import './index.css';

async function main() {
  // We only enable mocking in the development environment.
  // When you switch to a real backend, you can remove this entire function.
  if (process.env.NODE_ENV === 'development') {
    const { worker } = await import('./features/mocks/browser');
    await worker.start();
  }

  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
    </React.StrictMode>
  );
}
main();

