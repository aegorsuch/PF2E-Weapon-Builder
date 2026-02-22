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
          <option :value="4">20ft</option>
          <option :value="3">30ft</option>
          <option :value="1">50ft</option>
          <option :value="0">60ft</option>
          <option :value="-2">100ft</option>
          <option :value="-3">120ft</option>
        </select>
      </label>
      <label v-if="!isMelee" class="me-2">
        Volley
        <select class="form-select" v-model="adjustements.volley">
          <option :value="0">No Volley</option>
          <option :value="3">Volley 30ft</option>
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
            <option value="Disarm">Disarm </option>
            <option value="Finesse">Finesse</option>
            <option value="Free-Hand">Free-Hand</option>
            <option value="Propulsive ">Propulsive </option>
            <option value="Shove">Shove</option>
            <option value="Sweep">Sweep</option>
            <option value="Thrown">Thrown</option>
            <option value="Twin">Twin</option>
            <option value="Two-Hand">Two-Hand</option>
            <option value="Versatile">Versatile</option>
          </select>
        </div>
        <div class="col">
          2-Point Traits
          <select class="form-select" v-model="traits.twoPoint" multiple>
            <option value="Agile">Agile</option>
            <option value="Deadly">Deadly</option>
            <option value="Grapple">Grapple</option>
            <option value="Jousting">Jousting</option>
            <option value="Parry">Parry</option>
            <option value="Trip">Trip</option>
          </select>
        </div>
        <div class="col">
          3-Point Traits
          <select class="form-select" v-model="traits.threePoint" multiple>
            <option value="Attached">Attached</option>
            <option value="Fatal">Fatal</option>
            <option value="Reach">Reach</option>
            <option value="Forceful">Forceful</option>
            <option value="Repeating">Repeating</option>
          </select>
        </div>
      </div>
    </form>
    <hr />
    <div>
      <div v-if="allTraits.length > 0" class="mt-4">
        <h4>Selected Traits (Alphabetical)</h4>
        <div class="d-flex flex-wrap gap-2">
          <span v-for="(trait, index) in allTraits" 
                :key="index" 
                class="badge"
                :class="trait === selectedAncestry ? 'bg-success' : 'bg-primary'">
            {{ trait }}
          </span>
        </div>
      </div>
      <hr />
      <h4>Source</h4>
      <p>The implemented calculation has not been in any way confirmed by Paizo. Built on <a href="https://docs.google.com/document/d/1j0uUtVcTgvn2a0oMYFKMwe_-tAPOdnFY21_0FOiX2DI/edit" target="_blank">the document</a> for details.</p>
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
      const combined = [
        'Uncommon',
        ...this.traits.onePoint, 
        ...this.traits.twoPoint, 
        ...this.traits.threePoint
      ];
      if (this.selectedAncestry) {
        combined.push(this.selectedAncestry);
      }
      return combined.sort();
    }
  },
  methods: {
    resetBuilder() {
      this.range = 'melee';
      this.selectedAncestry = '';
      this.adjustements = {
        proficiency: 0,
        die: 0,
        hands: 0,
        reload: 0,
        volley: 0,
        range: 0,
      };
      this.traits = {
        onePoint: [],
        twoPoint: [],
        threePoint: [],
      };
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