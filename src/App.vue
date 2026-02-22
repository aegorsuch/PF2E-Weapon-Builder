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
      <div class="row mt-4">
        <div class="col-md-4">
          <label class="fw-bold mb-2">1-Point Traits</label>
          <div class="d-flex flex-wrap gap-2">
            <button v-for="t in ['Backstabber', 'Backswing', 'Brace', 'Climbing', 'Combination', 'Concealable', 'Disarm', 'Finesse', 'Forceful', 'Free-Hand', 'Kickback', 'Propulsive', 'Shove', 'Sweep', 'Thrown 20', 'Twin', 'Two-Hand', 'Versatile B', 'Versatile P', 'Versatile S']" 
                    :key="t" type="button"
                    @click="toggleTrait('onePoint', t)"
                    :class="['btn btn-sm', traits.onePoint.includes(t) ? 'btn-primary' : 'btn-outline-secondary']">
              {{ t }}
            </button>
          </div>
        </div>

        <div class="col-md-4">
          <label class="fw-bold mb-2">2-Point Traits</label>
          <div class="d-flex flex-wrap gap-2">
            <button v-for="t in ['Agile', 'Capacity 5', 'Concussive', 'Deadly', 'Grapple', 'Hampering', 'Jousting', 'Modular', 'Parry', 'Ranged Trip', 'Razing', 'Resonant', 'Training', 'Trip']" 
                    :key="t" type="button"
                    @click="toggleTrait('twoPoint', t)"
                    :class="['btn btn-sm', traits.twoPoint.includes(t) ? 'btn-primary' : 'btn-outline-secondary']">
              {{ t }}
            </button>
          </div>
        </div>

        <div class="col-md-4">
          <label class="fw-bold mb-2">3-Point Traits</label>
          <div class="d-flex flex-wrap gap-2">
            <button v-for="t in ['Attached', 'Critical Fusion', 'Double Barrel', 'Fatal', 'Fatal Aim', 'Injection', 'Reach', 'Recovery', 'Repeating', 'Scatter 10', 'Tethered', 'Unarmed']" 
                    :key="t" type="button"
                    @click="toggleTrait('threePoint', t)"
                    :class="['btn btn-sm', traits.threePoint.includes(t) ? 'btn-primary' : 'btn-outline-secondary']">
              {{ t }}
            </button>
          </div>
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
        combined.push('Volley 30');
      }

      if (this.selectedAncestry) combined.push(this.selectedAncestry);

      return combined.sort();
    }
  },
  methods: {
    toggleTrait(group, trait) {
      const index = this.traits[group].indexOf(trait);
      if (index > -1) {
        this.traits[group].splice(index, 1); // Remove if already there
      } else {
        this.traits[group].push(trait); // Add if not there
      }
    },
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