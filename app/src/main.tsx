// Point d'entrée de l'application : monte le composant racine App dans la div#root du index.html.
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css' // styles globaux + import de Tailwind CSS

ReactDOM.createRoot(document.getElementById('root')!).render(
  // StrictMode aide à détecter les effets de bord problématiques en développement.
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
