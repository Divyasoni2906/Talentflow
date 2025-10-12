import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './app/store';
import App from './App';
import './index.css';

async function main() {
  // The 'if' condition has been removed.
  // This ensures the mock server will start in both development AND production.
  const { worker } = await import('./features/mocks/browser');
  await worker.start();

  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
    </React.StrictMode>
  );
}

main();

