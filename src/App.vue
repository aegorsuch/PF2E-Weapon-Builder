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
          <select class="form-select" v-model="adjustements.proficiency">
            <option :value="0">Simple</option>
            <option :value="3">Martial</option>
            <option :value="5">Advanced</option>
          </select>
        </label>
        <label class="me-2 mb-2">Hands
          <select class="form-select" v-model="adjustements.hands">
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
          <label class="fw-bold mb-2">
            {{ pointKey === 'onePoint' ? '1-Point' : pointKey === 'twoPoint' ? '2-Point' : '3-Point' }} Traits
          </label>
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
  'Axe': ['Agile', 'Climbing', 'Combination', 'Deadly', 'Disarm', 'Finesse', 'Forceful', 'Parry', 'Shove', 'Sweep', 'Thrown 10', 'Thrown 20', 'Trip', 'Two-Hand', 'Vehicular', 'Versatile P'],
  'Bow': ['Capacity 3', 'Combination', 'Concussive', 'Deadly', 'Finesse', 'Forceful', 'Modular (B P or S)', 'Monk', 'Parry', 'Propulsive','Razing'],
  'Brawling': ['Agile', 'Backstabber', 'Combination', 'Deadly', 'Disarm', 'Fatal', 'Finesse', 'Free-Hand', 'Grapple', 'Modular (B P or S)', 'Monk', 'Parry', 'Reach', 'Shove', 'Trip', 'Twin', 'Unarmed'],
  'Club': ['Agile', 'Attached to Crossbow or Firearm', 'Backswing', 'Combination', 'Concealable', 'Deadly', 'Disarm', 'Fatal', 'Free-Hand', 'Finesse', 'Forceful', 'Monk', 'Parry', 'Ranged Trip', 'Razing', 'Reach', 'Recovery', 'Shove', 'Sweep', 'Tearing', 'Tethered', 'Thrown 10', 'Thrown 20', 'Thrown 30', 'Trip', 'Twin', 'Two-Hand', 'Versatile B', 'Versatile P'],
  'Crossbow': ['Backstabber', 'Capacity 5', 'Combination', 'Deadly', 'Fatal Aim', 'Finesse', 'Free-Hand', 'Parry', 'Repeating'],
  'Dart': ['Agile','Concealable', 'Deadly', 'Disarm', 'Finesse', 'Free-Hand', 'Monk', 'Propulsive', 'Recovery', 'Sweep', 'Tethered', 'Thrown 10', 'Thrown 20', 'Thrown 30'],
  'Firearm':['Agile', 'Attached to Shield', 'Backstabber', 'Capacity 3', 'Capacity 5', 'Combination', 'Concealable', 'Concussive', 'Double Barrel', 'Fatal', 'Fatal Aim', 'Kickback', 'Modular (B P or S)', 'Razing', 'Repeating', 'Scatter 5', 'Scatter 10'],
  'Flail': ['Agile', 'Backswing', 'Combination', 'Deadly', 'Disarm', 'Finesse', 'Forceful', 'Grapple', 'Hampering', 'Monk', 'Parry', 'Ranged Trip', 'Razing', 'Reach', 'Sweep', 'Tethered', 'Thrown 10', 'Thrown 20', 'Thrown 30', 'Training', 'Trip', 'Twin', 'Versatile B', 'Versatile P'],
  'Hammer': ['Agile', 'Backswing', 'Brace', 'Combination', 'Razing', 'Reach', 'Shove', 'Thrown 20', 'Trip', 'Two-Hand', 'Versatile P'],
  'Knife': ['Agile', 'Attached to Crossbow or Firearm', 'Backstabber', 'Combination', 'Concealable',   'Deadly', 'Disarm', 'Fatal', 'Finesse', 'Free-Hand', 'Injection', 'Monk', 'Parry', 'Resonant', 'Sweep', 'Thrown 10', 'Thrown 20', 'Trip', 'Twin', 'Two-Hand', 'Versatile B', 'Versatile P', 'Versatile S'],

  'Pick': ['Agile', 'Backstabber', 'Deadly', 'Fatal', 'Modular (B P or S)', 'Modular (P and grapple or S and sweep)', 'Trip'],

  'Polearm': ['Forceful', 'Reach', 'Shove', 'Sweep', 'Trip'],
  'Sword': ['Agile', 'Deadly', 'Disarm', 'Finesse', 'Forceful', 'Parry', 'Twin', 'Versatile']
};

export default {
  name: 'App',
  data() {
    return {
      range: 'melee',
      adjustements: { proficiency: 0, die: 0, hands: 0, reload: 0, volley: 0, range: 0 },
      traits: { onePoint: [], twoPoint: [], threePoint: [] },
      selectedAncestry: '',
      selectedGroup: '',
      groups: ['Axe','Bow','Brawling','Club','Crossbow','Dart','Firearm','Flail','Hammer','Knife','Mace','Pick','Polearm','Shield','Sling','Spear','Sword'],
      ancestries: ['Dwarf', 'Elf', 'Gnome', 'Goblin', 'Halfling', 'Orc', 'Azarketi'],
      traitCategories: {
        onePoint: ['Backstabber', 'Backswing', 'Brace', 'Capacity 3', 'Climbing', 'Combination', 'Concealable', 'Disarm', 'Finesse', 'Forceful', 'Free-Hand', 'Grapple', 'Kickback', 'Parry', 'Propulsive', 'Shove', 'Sweep', 'Tearing', 'Thrown 10', 'Trip', 'Twin', 'Two-Hand', 'Vehicular', 'Versatile B', 'Versatile P', 'Versatile S'],
        twoPoint: ['Agile', 'Attached to Crossbow or Firearm', 'Attached to Shield', 'Capacity 5', 'Concussive', 'Deadly', 'Hampering', 'Jousting', 'Modular (B P or S)', 'Modular (P and grapple or S and sweep)', 'Monk', 'Ranged Trip', 'Razing', 'Resonant', 'Scatter 5', 'Thrown 20', 'Training'],
        threePoint: ['Double Barrel', 'Fatal', 'Fatal Aim', 'Injection', 'Reach', 'Recovery', 'Repeating', 'Scatter 10', 'Tethered', 'Thrown 30', 'Unarmed']
      }
    };
  },
  computed: {
    isMelee() { return this.range === 'melee'; },
    total() {
      let bonusPoint = 2;
      let baseCost = this.adjustements.proficiency + this.adjustements.die + this.adjustements.hands;
      if (!this.isMelee) {
        baseCost = baseCost - 3 + this.adjustements.reload + this.adjustements.volley + this.adjustements.range;
      }
      let traitsCost = this.traits.onePoint.length + (this.traits.twoPoint.length * 2) + (this.traits.threePoint.length * 3);
      return bonusPoint + baseCost - traitsCost;
    },
    allTraits() {
      let combined = ['Uncommon'];
      const traitDieMap = { 3: 'd8', 0: 'd10', '-3': 'd12', '-6': 'd12', '-9': 'd12' };
      const baseDieMap = { 3: 'd4', 0: 'd6', '-3': 'd8', '-6': 'd10', '-9': 'd12' };
      const stepUp = { 'd4': 'd6', 'd6': 'd8', 'd8': 'd10', 'd10': 'd12', 'd12': 'd12' };
      const stepDown = { 'd12': 'd10', 'd10': 'd8', 'd8': 'd6', 'd6': 'd4', 'd4': 'd4' };
      
      const traitDie = traitDieMap[this.adjustements.die] || 'd12';
      const currentBaseDie = baseDieMap[this.adjustements.die] || 'd12';
      const hasDoubleBarrel = this.traits.threePoint.includes('Double Barrel');

      this.traits.onePoint.forEach(t => combined.push(t === 'Two-Hand' ? `Two-Hand ${traitDie}` : t));
      this.traits.twoPoint.forEach(t => {
        if (t === 'Deadly') combined.push(`Deadly ${traitDie}`);
        else if (t === 'Jousting') combined.push(`Jousting ${stepDown[currentBaseDie]}`);
        else combined.push(t);
      });
      this.traits.threePoint.forEach(t => {
        if (t === 'Fatal' || t === 'Fatal Aim') {
            const finalDie = hasDoubleBarrel ? stepUp[traitDie] : traitDie;
            combined.push(`${t} ${finalDie}`);
        } else combined.push(t);
      });
      if (this.isMelee && this.traits.onePoint.includes('Combination')) {
        combined.push('Critical Fusion');
      }

      if (!this.isMelee && this.adjustements.volley === 3) combined.push('Volley 30');
      if (this.selectedAncestry) combined.push(this.selectedAncestry);
      return combined.sort();
    }
  },
  methods: {
    isTraitAllowed(traitName) {
      if (!this.selectedGroup) return true;
      const allowed = groupTraitWhitelist[this.selectedGroup];
      if (!allowed) return true;
      return allowed.some(a => traitName.toLowerCase().includes(a.toLowerCase()));
    },
    toggleTrait(group, trait) {
      if (!this.isTraitAllowed(trait)) return;
      const index = this.traits[group].indexOf(trait);
      if (index > -1) {
        this.traits[group].splice(index, 1);
      } else {
        this.traits[group].push(trait);
      }
    },
    resetBuilder() {
      this.range = 'melee';
      this.selectedAncestry = '';
      this.selectedGroup = '';
      this.adjustements = { proficiency: 0, die: 0, hands: 0, reload: 0, volley: 0, range: 0 };
      this.traits = { onePoint: [], twoPoint: [], threePoint: [] };
    },
    copyToClipboard() {
      const textToCopy = `Group: ${this.selectedGroup || 'N/A'}, Traits: ${this.allTraits.join(", ")}`;
      navigator.clipboard.writeText(textToCopy).then(() => {
        alert("Traits copied!");
      });
    }
  }
};
</script>

<style scoped>
.selected-trait {
  background-color: #198754 !important;
  color: white !important;
  border-color: #198754 !important;
  font-weight: bold !important;
}
.pointer-none {
  pointer-events: none;
}
</style>