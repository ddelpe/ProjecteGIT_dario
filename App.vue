<template>
  <div>
    <!-- Secció de configuració -->
    <section v-if="currentScreen === 'setup'" class="setup-container">
      <h2 class="setup-title">Configuració dels Jugadors</h2>
      <p class="setup-instruccions">
        Introdueix els noms dels jugadors per començar el joc.
      </p>
      <div class="toggle-container">
        <label for="two-players-toggle">Dos Jugadors:</label>
        <label class="switch">
          <input type="checkbox" v-model="isTwoPlayers" />
          <span class="slider round"></span>
        </label>
      </div>
      <div class="player-input-group">
        <label for="player1-name" class="player-label">Nom del Jugador 1:</label>
        <input type="text" v-model="player1Name" class="player-input" required />
      </div>
      <div class="player-input-group" v-if="isTwoPlayers">
        <label for="player2-name" class="player-label">Nom del Jugador 2:</label>
        <input type="text" v-model="player2Name" class="player-input" required />
      </div>
      <button @click="startGame" class="setup-button">Següent</button>
    </section>

    <!-- Secció de selecció de l'equip -->
    <section v-if="currentScreen === 'teamSelection'" id="team-selection-section">
      <h2>Selecciona el teu Equip</h2>
      <h2 id="credits-display">
        Crèdits restants: <span id="credits-value">{{ creditsDisplay }}</span>
      </h2>
      <div id="team-section">
        <h2 id="current-player-selection">{{ currentPlayerSelectionMessage }}</h2>
        <div id="selected-team-grid" class="grid-container" ref="teamContainer">
          <pokemon-card
            v-for="(poke, index) in currentPlayerTeam"
            :key="index"
            :pokemon="poke"
            :is-selected="isPokemonInTeam(poke.name)"
            @toggle-selection="handleToggleSelection"
          />
        </div>
      </div>
      <button id="next-player-button" @click="handleNextPlayer">
        {{ buttonLabel }}
      </button>
      <div id="sort-options-section">
        <h2>Opcions d'Ordenació</h2>
        <form id="sort-options-form">
          <fieldset>
            <legend>Ordena per:</legend>
            <label>
              <input type="radio" name="sort-criteria" value="name" v-model="sortCriteria" />
              Nom
            </label>
            <label>
              <input type="radio" name="sort-criteria" value="points" v-model="sortCriteria" />
              Punts
            </label>
            <label>
              <input type="radio" name="sort-criteria" value="type" v-model="sortCriteria" />
              Tipus
            </label>
          </fieldset>
          <fieldset>
            <legend>Mètode d'ordenació:</legend>
            <label>
              <input type="radio" name="sort-method" value="bubble" v-model="sortMethod" />
              Bombolla
            </label>
            <label>
              <input type="radio" name="sort-method" value="insertion" v-model="sortMethod" />
              Inserció
            </label>
            <label>
              <input type="radio" name="sort-method" value="selection" v-model="sortMethod" />
              Selecció
            </label>
          </fieldset>
          <button type="button" id="sort-team" @click="handleSortOptions">
            Ordenar
          </button>
        </form>
      </div>
      <div id="pokemon-grid" class="grid-container" ref="gridContainer">
        <pokemon-card
          v-for="(poke, index) in globalPokemonList"
          :key="index"
          :pokemon="poke"
          :is-selected="isPokemonInTeam(poke.name)"
          @toggle-selection="handleToggleSelection"
        />
      </div>
    </section>

    <!-- Secció de vista general dels equips (pre-batalla) -->
    <section v-if="currentScreen === 'teamsOverview'" id="teams-overview-section">
      <h2>Vista General dels Equips</h2>
      <h3 id="player1-team-name">Equip del jugador {{ player1Name }}</h3>
      <div id="player1-team-display" class="player1-selected-team-grid">
        <pokemon-card
          v-for="(poke, index) in player1Team"
          :key="index"
          :pokemon="poke"
        />
      </div>
      <h3 id="player2-team-name">Equip del Jugador {{ player2Name }}</h3>
      <div id="player2-team-display" class="player2-selected-team-grid">
        <pokemon-card
          v-for="(poke, index) in player2Team"
          :key="index"
          :pokemon="poke"
        />
      </div>
      <button @click="startBattle">Iniciar la Batalla</button>
    </section>

    <!-- Arena de combat -->
    <section v-if="currentScreen === 'battle'" id="battle-section">
      <h2>Moment de la Batalla!</h2>
      <p id="current-turn-display">És el torn de {{ currentTurnPlayer }}!</p>
      <div class="battle-container">
        <div class="pokemon-fighter">
          <pokemon-card v-if="pokemon1Arena" :pokemon="pokemon1Arena"  />
          <p>Poder especial: {{ pokemon1Arena.special_power }}</p>
        </div>
        <p class="vs-text">VS</p>
        <div class="pokemon-fighter">
          <pokemon-card v-if="pokemon2Arena" :pokemon="pokemon2Arena"  />
          <p>Poder especial: {{ pokemon2Arena.special_power }}</p>
        </div>
        <div class="battle-log-container">
          <h2>Registre de la Batalla</h2>
          <div id="battle-log">
            <p v-for="(log, index) in battleLog" :key="index">{{ log }}</p>
          </div>
        </div>
      </div>
      <div v-if="!battleEnded">
        <button id="perform-attack-button" @click="fightRound">Atacar!</button>
      </div>
      <div v-else>
        <p>{{ winnerMessage }}</p>
      </div>
    </section>
  </div>
</template>

<script>
import { PokemonTeamViewModel } from "./src/components/viewModels/viewModel.js";
import PokemonCard from "./src/components/viewModels/PokemonCard.vue";
export default {
  components: {
    "pokemon-card": PokemonCard,
  },
  data() {
    return {
      currentScreen: "setup",
      isTwoPlayers: true,
      player1Name: "",
      player2Name: "",
      currentPlayerSelectionMessage: "",
      sortCriteria: "",
      sortMethod: "",
      globalPokemonList: [],
      buttonLabel: "Següent Jugador",
      viewModel: new PokemonTeamViewModel(),
      currentBattlePokemon1: null,
      currentBattlePokemon2: null,
      battleLog: [],
      battleTurn: 1,
      battleEnded: false,
      winnerMessage: "",
      jsonUrl: "./pokemon_data.json",
    };
  },
  computed: {
    creditsDisplay() {
      return this.viewModel.currentPlayer.team.credits;
    },
    currentPlayerTeam() {
      return this.viewModel.getCurrentTeam();
    },
    player1Team() {
      return this.viewModel.player1.team.selectedTeam;
    },
    player2Team() {
      return this.viewModel.player2.team.selectedTeam;
    },
    currentTurnPlayer() {
      return this.viewModel.currentPlayer === this.viewModel.player1
        ? this.player1Name
        : this.player2Name;
    },
    pokemon1Arena() {
      return this.currentBattlePokemon1;
    },
    pokemon2Arena() {
      return this.currentBattlePokemon2;
    },
  },
  methods: {
    async fetchAndLoadPokemons() {
      try {
        const response = await fetch(this.jsonUrl);
        if (!response.ok) {
          throw new Error("HTTP error: " + response.status);
        }
        const data = await response.json();
        this.viewModel.pokemonList.loadPokemons(data);
        this.globalPokemonList = this.viewModel.pokemonList.allPokemons;
      } catch (error) {
        console.error("Error loading Pokémon data:", error);
      }
    },
    startGame() {
      if (!this.player1Name || (this.isTwoPlayers && !this.player2Name)) {
        alert("Si us plau, introdueix els noms de tots els jugadors.");
        return;
      }
      if (!this.isTwoPlayers) {
        this.player2Name = "CPU";
      }
      this.currentScreen = "teamSelection";
      this.startTeamSelection();
    },
    startTeamSelection() {
      this.viewModel.initializeMatch(this.player1Name, this.player2Name);
      this.viewModel.currentPlayer = this.viewModel.player1;
      this.currentPlayerSelectionMessage = `${this.player1Name}, selecciona el teu equip Pokémon`;
      this.renderGlobalList();
    },
    renderGlobalList() {
      this.globalPokemonList = this.viewModel.getGlobalList();
    },
    handleNextPlayer() {
      if (this.viewModel.currentPlayer === this.viewModel.player1) {
        if (this.viewModel.player1.team.selectedTeam.length === 0) {
          alert(`${this.viewModel.player1.getName()}, selecciona almenys un Pokémon!`);
          return;
        }
        this.viewModel.switchPlayer();
        if (this.isTwoPlayers) {
          this.currentPlayerSelectionMessage = `${this.player2Name}, selecciona el teu equip Pokémon`;
          this.buttonLabel = "Fi de la selecció d'equips";
          this.renderGlobalList();
        } else {
          this.viewModel.autoSelectCpuTeam();
          this.currentScreen = "teamsOverview";
        }
      } else if (this.viewModel.currentPlayer === this.viewModel.player2) {
        this.currentScreen = "teamsOverview";
      }
    },
    handleSortOptions() {
      this.viewModel.sortGlobalList(this.sortCriteria, this.sortMethod);
      this.renderGlobalList();
    },
    isPokemonInTeam(name) {
      const playerTeam =
        this.viewModel.currentPlayer === this.viewModel.player1
          ? this.viewModel.player1.team
          : this.viewModel.player2.team;
      return playerTeam.selectedTeam.some((p) => p.name === name);
    },
    handleToggleSelection(pokemon) {
      const isInTeam = this.isPokemonInTeam(pokemon.name);
      if (isInTeam) {
        this.viewModel.removePokemonFromTeam(pokemon.name);
      } else {
        const addResult = this.viewModel.addPokemonToCurrentPlayer(pokemon);
        if (!addResult) {
          alert("No es pot afegir el Pokémon.");
        }
      }
    },
    startBattle() {
      this.currentScreen = "battle";
      this.currentBattlePokemon1 = this.viewModel.player1.team.selectedTeam[0];
      this.currentBattlePokemon2 = this.viewModel.player2.team.selectedTeam[0];
      this.battleLog = [`⚔️ ${this.player1Name} vs ${this.player2Name}!`];
      this.battleTurn = 1;
      this.battleEnded = false;
      this.winnerMessage = "";
      this.viewModel.currentPlayer = this.viewModel.player1;
    },
    fightRound() {
      const pokemon1 = this.getRandomFighter(this.viewModel.player1.team);
      const pokemon2 = this.getRandomFighter(this.viewModel.player2.team);

      if (!pokemon1 || !pokemon2) return;

      this.currentBattlePokemon1 = pokemon1;
      this.currentBattlePokemon2 = pokemon2;

      if (pokemon1.special_power === pokemon2.special_power) {
        this.addToBattleLog(`💥 ${pokemon1.name} y ${pokemon2.name} se derrotan mutuamente!`);
        this.viewModel.player1.team.removePokemon(pokemon1.name);
        this.viewModel.player2.team.removePokemon(pokemon2.name);
      } else if (pokemon1.special_power > pokemon2.special_power) {
        this.addToBattleLog(`💥 ${pokemon1.name} derrota a ${pokemon2.name}!`);
        this.viewModel.player2.team.removePokemon(pokemon2.name);
      } else {
        this.addToBattleLog(`💥 ${pokemon2.name} derrota a ${pokemon1.name}!`);
        this.viewModel.player1.team.removePokemon(pokemon1.name);
      }

      if (this.viewModel.player1.team.selectedTeam.length === 0) {
        this.battleEnded = true;
        this.winnerMessage = `${this.player2Name} ha ganado!`;
      } else if (this.viewModel.player2.team.selectedTeam.length === 0) {
        this.battleEnded = true;
        this.winnerMessage = `${this.player1Name} ha ganado!`;
      }
    },
    getRandomFighter(team) {
      if (team.selectedTeam.length === 0) return null;
      const randomIndex = Math.floor(Math.random() * team.selectedTeam.length);
      return team.selectedTeam[randomIndex];
    },
    addToBattleLog(message) {
      this.battleLog.push(message);
    },
  },
  mounted() {
    this.fetchAndLoadPokemons();
  },
};
</script>