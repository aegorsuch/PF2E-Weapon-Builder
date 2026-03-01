<template>
  <div id="app" class="container pb-5">
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

      <div class="d-flex flex-wrap gap-3 mt-2">
        <label class="me-2 mb-2">Proficiency
          <select class="form-select block" v-model="adjustements.proficiency">
            <option :value="0">Simple</option>
            <option :value="3">Martial</option>
            <option :value="5">Advanced</option>
          </select>
        </label>
        <label class="me-2 mb-2">Hands
          <select class="form-select block" v-model="adjustements.hands">
            <option :value="0">1</option>
            <option v-if="!isMelee" :value="1">1+</option>
            <option :value="6">2</option>
          </select>
        </label>
        <label class="me-2 mb-2">Damage
          <select class="form-select" v-model="adjustements.die">
            <option :value="3">d4</option>
            <option :value="0">d6</option>
            <option :value="-3">d8</option>
            <option :value="-6">d10</option>
            <option :value="-9">d12</option>
          </select>
        </label>
        <label class="me-2 mb-2">Weapon Group
          <select class="form-select" v-model="selectedGroup">
            <option value="">None</option>
            <option v-for="g in groups" :key="g" :value="g">{{ g }}</option>
          </select>
        </label>
        <label class="me-2 mb-2">Ancestry
          <select class="form-select" v-model="selectedAncestry">
            <option value="">None</option>
            <option v-for="a in ancestries" :key="a" :value="a">{{ a }}</option>
          </select>
        </label>
      </div>

      <template v-if="!isMelee">
        <div class="d-flex flex-wrap gap-2 align-items-end mt-2">
          <label>Reload
            <select class="form-select" v-model="adjustements.reload">
              <option :value="0">Reload 0</option>
              <option :value="3">Reload 1</option>
              <option :value="6">Reload 2</option>
            </select>
          </label>
          <label>Range
            <select class="form-select" v-model="adjustements.range">
              <option :value="4">20</option>
              <option :value="3">30</option>
              <option :value="1">50</option>
              <option :value="0">60</option>
              <option :value="-2">100</option>
              <option :value="-3">120</option>
            </select>
          </label>
          <label>Volley
            <select class="form-select" v-model="adjustements.volley">
              <option :value="0">None</option>
              <option :value="3">Volley 30</option>
            </select>
          </label>
        </div>
      </template>

      <hr>

      <div class="row mt-4">
        <div v-for="(traitList, pointKey) in traitCategories" :key="pointKey" class="col-md-4">
          <label class="fw-bold mb-2">{{ pointKey === 'onePoint' ? '1-Point' : pointKey === 'twoPoint' ? '2-Point' : '3-Point' }} Traits</label>
          <div class="d-flex flex-wrap gap-2">
            <button v-for="t in traitList" 
                    :key="t" 
                    type="button" 
                    @click="toggleTrait(pointKey, t)"
                    class="btn btn-sm"
                    :disabled="!isTraitAllowed(t)"
                    :class="{
                      'selected-trait': traits[pointKey].includes(t),
                      'btn-outline-secondary opacity-75': !traits[pointKey].includes(t),
                      'opacity-25 pointer-none': !isTraitAllowed(t) && !traits[pointKey].includes(t)
                    }">
              {{ t }}
            </button>
          </div>
        </div>
      </div>
    </form>
    
    <hr />

    <div v-if="allTraits.length > 0" class="mt-4 p-3 bg-light rounded border">
      <h4>Weapon Summary</h4>
      <div class="lead"><strong>Traits:</strong> {{ allTraits.join(', ') }}</div>
    </div>
  </div>
</template>

<script>
const groupTraitWhitelist = {
  'Axe': ['Agile', 'Climbing', 'Combination', 'Critical Fusion', 'Deadly', 'Disarm', 'Dwarf', 'Finesse', 'Forceful', 'Orc', 'Parry', 'Shove', 'Sweep', 'Thrown 10', 'Thrown 20', 'Two-Hand', 'Trip', 'Versatile P'],
  'Bow': ['Deadly', 'Finesse', 'Propulsive', 'Volley'],
  'Brawling': ['Agile', 'Disarm', 'Fatal', 'Finesse', 'Grapple', 'Shove', 'Trip', 'Unarmed'],
  'Crossbow': ['Agile', 'Backstabber', 'Combination', 'Deadly', 'Fatal Aim', 'Finesse', 'Parry', 'Repeating'],
  'Hammer': ['Fatal', 'Shove', 'Thrown', 'Versatile'],
  'Knife': ['Agile', 'Backstabber', 'Concealable', 'Deadly', 'Finesse', 'Thrown', 'Twin', 'Versatile'],
  'Pick': ['Fatal', 'Forceful', 'Shove'],
  'Polearm': ['Forceful', 'Reach', 'Shove', 'Sweep', 'Trip'],
  'Sword': ['Agile', 'Deadly', 'Disarm', 'Finesse', 'Forceful', 'Parry', 'Twin', 'Versatile']
};

export default {
  name: 'App',
  data: () => ({
    range: 'melee',
    adjustements: { proficiency: 0, die: 0, hands: 0, reload: 0, volley: 0, range: 0 },
    traits: { onePoint: [], twoPoint: [], threePoint: [] },
    selectedAncestry: '',
    selectedGroup: '',