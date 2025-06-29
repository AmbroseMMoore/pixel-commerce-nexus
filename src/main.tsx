
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import ErrorBoundary from './components/ErrorBoundary'
import SEOProvider from './components/seo/SEOProvider'

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <SEOProvider>
      <App />
    </SEOProvider>
  </ErrorBoundary>
);
