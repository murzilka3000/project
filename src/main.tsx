import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { Provider } from "react-redux"
import { store } from "@/app/store.ts"
import { BrowserRouter } from "react-router-dom"

import App from "./App.tsx"
import "@/styles/index.scss"
import "@/styles/app.scss"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <App />
      </Provider>
    </BrowserRouter>
  </StrictMode>
)
