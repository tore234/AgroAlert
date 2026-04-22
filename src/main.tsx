import { createRoot } from "react-dom/client";
import App from "./app/App";
import { ThemeProvider } from "./ThemeContext";

// @ts-ignore
import "./styles/index.css";
// @ts-ignore
import "leaflet/dist/leaflet.css";

const rootElement = document.getElementById("root");

if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );
}
