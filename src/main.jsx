import React from "react";
import ReactDOM from "react-dom/client";
import VooxEnglishTrainer from "../voox-english-trainer.jsx";
import { appStorage } from "./lib/appStorage.js";

// O app usa window.storage.get/set como interface de persistência (mesmo
// contrato do build standalone). Injetamos o adapter antes de montar; trocar
// para Supabase depois é só mudar src/lib/appStorage.js.
window.storage = appStorage;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <VooxEnglishTrainer />
  </React.StrictMode>
);
