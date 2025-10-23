import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { autoSeed } from "./lib/seedData.ts";

// Auto-seed database on app start
autoSeed();

createRoot(document.getElementById("root")!).render(<App />);
