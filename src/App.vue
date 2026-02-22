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
      <label class="me-2">
        Proficiency
        <select class="form-select block" v-model="adjustements.proficiency">
          <option :value="0">Simple</option>
          <option :value="3">Martial</option>
          <option :value="5">Advanced</option>
        </select>
      </label>
      <label class="me-2">
        Hands
        <select class="form-select block" v-model="adjustements.hands">
          <option :value="0">1</option>
          <option v-if="!isMelee" :value="1">1+</option>
          <option :value="6">2</option>
        </select>
      </label>
      <label class="me-2">
        Damage
        <select class="form-select" v-model="adjustements.die">
          <option :value="3">d4</option>
          <option :value="0">d6</option>
          <option :value="-3">d8</option>
          <option :value="-6">d10</option>
          <option :value="-9">d12</option>
        </select>
      </label>
      <label v-if="!isMelee" class="me-2">
        Reload
        <select class="form-select" v-model="adjustements.reload">
          <option :value="0">Reload 0</option>
          <option :value="3">Reload 1</option>
          <option :value="6">Reload 2</option>
        </select>
      </label>
      <label v-if="!isMelee" class="me-2">
        Range
        <select class="form-select" v-model="adjustements.range">
          <option :value="4">20</option>
          <option :value="3">30</option>
          <option :value="1">50</option>
          <option :value="0">60</option>
          <option :value="-2">100</option>
          <option :value="-3">120</option>
        </select>
      </label>
      <label v-if="!isMelee" class="me-2">
        Volley
        <select class="form-select" v-model="adjustements.volley">
          <option :value="0">No Volley</option>
          <option :value="3">Volley 30</option>
        </select>
      </label>
      <hr>
      <label class="me-2">
        Ancestry
        <select class="form-select" v-model="selectedAncestry">
          <option value="">None</option>
          <option value="Dwarf">Dwarf</option>
          <option value="Elf">Elf</option>
          <option value="Gnome">Gnome</option>
          <option value="Goblin">Goblin</option>
          <option value="Halfling">Halfling</option>
          <option value="Kobold">Kobold</option>
          <option value="Orc">Orc</option>
        </select>
      </label>
      <hr>
      <div class="row">
        <div class="col">
          1-Point Traits
          <select class="form-select" v-model="traits.onePoint" multiple>
            <option value="Backstabber">Backstabber</option>
            <option value="Backswing">Backswing</option>
            <option value="Brace">Brace</option>
            <option value="Climbing">Climbing</option>            
            <option value="Combination">Combination</option>
            <option value="Concealable">Concealable</option>
            <option value="Disarm">Disarm</option>
            <option value="Finesse">Finesse</option>
            <option value="Forceful">Forceful</option>            
            <option value="Free-Hand">Free-Hand</option>
            <option value="Kickback">Kickback</option>
            <option value="Propulsive">Propulsive</option>
            <option value="Shove">Shove</option>
            <option value="Sweep">Sweep</option>
            <option value="Thrown 20">Thrown 20</option>
            <option value="Twin">Twin</option>
            <option value="Two-Hand">Two-Hand</option>
            <option value="Versatile B">Versatile B</option>
            <option value="Versatile P">Versatile P</option>
            <option value="Versatile S">Versatile S</option>
          </select>
        </div>
        <div class="col">
          2-Point Traits
          <select class="form-select" v-model="traits.twoPoint" multiple>
            <option value="Agile">Agile</option>
            <option value="Capacity 5">Capacity 5</option>            
            <option value="Concussive">Concussive</option>
            <option value="Deadly">Deadly</option>
            <option value="Grapple">Grapple</option>            
            <option value="Hampering">Hampering</option>
            <option value="Jousting">Jousting</option>
            <option value="Modular">Modular</option>
            <option value="Parry">Parry</option>
            <option value="Ranged Trip">Ranged Trip</option>
            <option value="Razing">Razing</option>
            <option value="Resonant">Resonant</option>
            <option value="Training">Training</option>
            <option value="Trip">Trip</option>
          </select>
        </div>
        <div class="col">
          3-Point Traits
          <select class="form-select" v-model="traits.threePoint" multiple>
            <option value="Attached">Attached</option>
            <option value="Critical Fusion">Critical Fusion</option>
            <option value="Double Barrel">Double Barrel</option>
            <option value="Fatal">Fatal</option>
            <option value="Fatal Aim">Fatal Aim</option>
            <option value="Injection">Injection</option>
            <option value="Reach">Reach</option>
            <option value="Recovery">Recovery</option>
            <option value="Repeating">Repeating</option>
            <option value="Scatter 10">Scatter 10</option>
            <option value="Tethered">Tethered</option>
            <option value="Unarmed">Unarmed</option>
          </select>
        </div>
      </div>
    </form>
    <hr />
    <div>
      <div v-if="allTraits.length > 0" class="mt-4">
        <h4>Traits</h4>
        <div class="d-flex flex-wrap gap-2">
          <span v-for="(trait, index) in allTraits" 
             :key="index" 
              class="badge bg-primary">
            {{ trait }}
          </span>
        </div>
      </div>
      <hr />
    </div>
  </div>
</template>

<script>
export default {
  name: 'App',
  data: () => ({
    range: 'melee',
    adjustements: {
      proficiency: 0,
      die: 0,
      hands: 0,
      reload: 0,
      volley: 0,
      range: 0,
    },
    traits: {
      onePoint: [],
      twoPoint: [],
      threePoint: [],
    },
    selectedAncestry: '',
  }),
  computed: {
    isMelee () {
      return this.range === 'melee';
    },
    total () {
      let bonusPoint = 2;
      let baseCost = this.adjustements.proficiency + this.adjustements.die + this.adjustements.hands;
      if(!this.isMelee) {
        baseCost = baseCost - 3 + this.adjustements.reload + this.adjustements.volley + this.adjustements.range;
      }
      let traitsCost = this.traits.onePoint.length + 
                       this.traits.twoPoint.length * 2 + 
                       this.traits.threePoint.length * 3;
      return bonusPoint + baseCost - traitsCost;
    },
    allTraits() {
      let combined = ['Uncommon'];
      
      // Corrected Die Mapping
      const traitDieMap = { 
        3: 'd8',     // base d4 -> trait d8
        0: 'd10',    // base d6 -> trait d10
        '-3': 'd12', // base d8 -> trait d12
        '-6': 'd12', // base d10 -> trait d12
        '-9': 'd12'  // base d12 -> trait d12
      };
      
      const traitDie = traitDieMap[this.adjustements.die] || 'd12';

      // Add 1-Point Traits
      this.traits.onePoint.forEach(t => {
        if (t === 'Two-Hand') combined.push(`Two-Hand ${traitDie}`);
        else if (t === 'Thrown 20') combined.push('Thrown 20ft');
        else combined.push(t);
      });

      // Add 2-Point Traits
      this.traits.twoPoint.forEach(t => {
        if (t === 'Deadly') combined.push(`Deadly ${traitDie}`);
        else combined.push(t);
      });

      // Add 3-Point Traits
      this.traits.threePoint.forEach(t => {
        if (t === 'Fatal') combined.push(`Fatal ${traitDie}`);
        else combined.push(t);
      });

      // Volley Check
      if (!this.isMelee && this.adjustements.volley === 3) {
        combined.push('Volley 30ft');
      }

      if (this.selectedAncestry) combined.push(this.selectedAncestry);

      return combined.sort();
    }
  },
  methods: {
    resetBuilder() {
      this.range = 'melee';
      this.selectedAncestry = '';
      this.adjustements = { proficiency: 0, die: 0, hands: 0, reload: 0, volley: 0, range: 0 };
      this.traits = { onePoint: [], twoPoint: [], threePoint: [] };
    },
    copyToClipboard() {
      const textToCopy = this.allTraits.join(", ");
      if (textToCopy === "") {
        alert("No traits selected to copy!");
        return;
      }
      navigator.clipboard.writeText(textToCopy).then(() => {
        alert("Traits copied to clipboard!");
      }).catch(err => {
        console.error('Could not copy text: ', err);
      });
    }
  }
}
</script>