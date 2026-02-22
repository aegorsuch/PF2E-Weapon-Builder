<template>
  <div id="app" class="container">
    <form>
      <div class="d-flex justify-content-between align-items-center mt-3">
        <h1 class="mb-0">Points Left: {{ total }}</h1>
        <div>
          <button type="button" class="btn btn-outline-primary me-2" @click="copyToClipboard">
            Copy Traits
          </button>
          <button type="button" class="btn btn-outline-danger" @click="resetBuilder">
            Clear All
          </button>
        </div>
      </div>

      <div class="mt-3">
        <div class="form-check">
          <input v-model="range" class="form-check-input" type="radio" id="range-melee" value="melee">
          <label class="form-check-label" for="range-melee">Melee</label>
        </div>
        <div class="form-check">
          <input v-model="range" class="form-check-input" type="radio" id="range-ranged" value="ranged">
          <label class="form-check-label" for="range-ranged">Ranged</label>
        </div>
      </div>

      <hr>
      <div class="d-flex flex-wrap align-items-end gap-3">
        <div>
          <label class="form-label mb-1 fw-bold">Proficiency</label>
          <select class="form-select" v-model="adjustements.proficiency" style="width: auto;">
            <option :value="0">Simple</option>
            <option :value="3">Martial</option>
            <option :value="5">Advanced</option>
          </select>
        </div>

        <div>
          <label class="form-label mb-1 fw-bold">Hands</label>
          <select class="form-select" v-model="adjustements.hands" style="width: auto;">
            <option :value="0">1</option>
            <option v-if="!isMelee" :value="1">1+</option>
            <option :value="6">2</option>
          </select>
        </div>

        <div>
          <label class="form-label mb-1 fw-bold">Damage</label>
          <select class="form-select" v-model="adjustements.die" style="width: auto;">
            <option :value="3">d4</option>
            <option :value="0">d6</option>
            <option :value="-3">d8</option>
            <option :value="-6">d10</option>
            <option :value="-9">d12</option>
          </select>
        </div>

        <div v-if="!isMelee">
          <label class="form-label mb-1 fw-bold">Reload</label>
          <select class="form-select" v-model="adjustements.reload" style="width: auto;">
            <option :value="0">0</option>
            <option :value="3">1</option>
            <option :value="6">2</option>
          </select>
        </div>

        <div>
          <label class="form-label mb-1 fw-bold">Ancestry</label>
          <select class="form-select" v-model="selectedAncestry" style="width: auto;">
            <option value="">None</option>
            <option value="Dwarf">Dwarf</option>
            <option value="Elf">Elf</option>
            <option value="Gnome">Gnome</option>
            <option value="Goblin">Goblin</option>
            <option value="Halfling">Halfling</option>
            <option value="Kobold">Kobold</option>
            <option value="Orc">Orc</option>
          </select>
        </div>
      </div>
      <hr>

      <div class="row">
        <div class="col">
          <label class="fw-bold mb-2">1-Point Traits</label>
          <select class="form-select" v-model="traits.onePoint" multiple style="height: 300px;">
            <option value="Backstabber">Backstabber</option>
            <option value="Backswing">Backswing</option>
            <option value="Disarm">Disarm </option>
            <option value="Finesse">Finesse</option>
            <option value="Free-Hand">Free-Hand</option>
            <option value="Shove">Shove</option>
            <option value="Sweep">Sweep</option>
            <option value="Versatile">Versatile</option>
          </select>
        </div>
        <div class="col">
          <label class="fw-bold mb-2">2-Point Traits</label>
          <select class="form-select" v-model="traits.twoPoint" multiple style="height: 300px;">
            <option value="Agile">Agile</option>
            <option value="Deadly">Deadly</option>
            <option value="Grapple">Grapple</option>
            <option value="Trip">Trip</option>
          </select>
        </div>
        <div class="col">
          <label class="fw-bold mb-2">3-Point Traits</label>
          <select class="form-select" v-model="traits.threePoint" multiple style="height: 300px;">
            <option value="Fatal">Fatal</option>
            <option value="Reach">Reach</option>
            <option value="Forceful">Forceful</option>
          </select>
        </div>
      </div>
    </form>
    <hr />
    <div v-if="