import { createApp } from 'vue'; // Importem la funció createApp de Vue
import App from './App.vue'; // Importem el component App
// Importem només els altres mòduls locals
import { PokemonTeamViewModel } from "./src/components/viewModels/viewModel.js";

document.addEventListener('DOMContentLoaded', () => {
    // Inicialitza el joc
//    const pokemonUI = new PokeDOMContentLoadedmonUI();
//    const viewModel = new PokemonTeamViewModel(pokemonUI);
//    pokemonUI.viewModel = viewModel;
//    pokemonUI.init();
    
    console.log('Game initialized successfully.');

    // Muntem Vue a l'element #app
    createApp(App).mount('#app'); // Utilitzem createApp per muntar l'aplicació Vue

    console.log('Vue.js App initialized successfully.');
});