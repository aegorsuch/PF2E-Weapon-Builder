<template>
  <div id="app" class="container pb-5">
    <form>
      <div class="d-flex justify-content-between align-items-center mt-3">
        <h1 class="mb-0" :class="{'text-danger': total < 0}">Points Left: {{ total }}</h1>
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
        <div class="form-check form-check-inline">
          <input v-model="range" class="form-check-input" type="radio" id="mode-melee" value="melee">
          <label class="form-check-label" for="mode-melee">Melee</label>
        </div>
        <div class="form-check form-check-inline">
          <input v-model="range" class="form-check-input" type="radio" id="mode-ranged" value="ranged">
          <label class="form-check-label" for="mode-ranged">Ranged</label>
        </div>
        <div class="form-check form-check-inline">
          <input v-model="range" class="form-check-input" type="radio" id="mode-combo" value="combination">
          <label class="form-check-label" for="mode-combo">Combination</label>
        </div>
      </div>

      <hr>

      <div class="d-flex flex-wrap gap-3 mt-2">
        <label class="me-2 mb-2">Proficiency
          <select class="form-select" v-model="adjustements.proficiency">
            <option :value="0">Simple</option>
            <option :value="isCombo ? 6 : 3">Martial</option>
            <option :value="isCombo ? 10 : 5">Advanced</option>
          </select>
        </label>
        <label class="me-2 mb-2">Hands
          <select class="form-select" v-model="adjustements.hands">
            <option :value="0">1</option>
            <option v-if="range === 'ranged'" :value="1">1+</option>
            <option :value="isCombo ? 8 : 6">2</option>
          </select>
        </label>
        <label class="me-2 mb-2">Ancestry
          <select class="form-select" v-model="selectedAncestry">
            <option value="">None</option>
            <option v-for="a in ancestries" :key="a" :value="a">{{ a }}</option>
          </select>
        </label>
      </div>

      <hr>

      <div class="row">
        <div v-if="range !== 'ranged'" :class="isCombo ? 'col-md-6 border-end' : 'col-12'">
          <h3 v-if="isCombo" class="text-primary mb-3">Melee Form</h3>
          
          <div class="d-flex gap-3 mb-3">
            <label class="flex-grow-1">Melee Group
              <select class="form-select" v-model="meleeForm.group">
                <option value="">None</option>
                <option v-for="g in groups" :key="g" :value="g">{{ g }}</option>
              </select>
            </label>
            <label class="flex-grow-1">Melee Die
              <select class="form-select" v-model="meleeForm.die">
                <option :value="3">d4</option>
                <option :value="0">d6</option>
                <option :value="-3">d8</option>
                <option :value="-6">d10</option>
                <option :value="-9">d12</option>
              </select>
            </label>
          </div>

          <div v-for="(traitList, pointKey) in traitCategories" :key="'m'+pointKey" class="mb-3">
            <label class="fw-bold small">{{ formatPointLabel(pointKey) }} Melee Traits</label>
            <div class="d-flex flex-wrap gap-2 mt-1">
              <button v-for="t in traitList" :key="t" type="button"
                @click="toggleTrait('melee', pointKey, t)"
                class="btn btn-sm"
                :disabled="!isTraitAllowed(t, meleeForm.group)"
                :class="getTraitClass(t, 'melee', pointKey, meleeForm.group)">
                {{ t }}
              </button>
            </div>
          </div>
        </div>

        <div v-if="range !== 'melee'" :class="isCombo ? 'col-md-6' : 'col-12'">
          <h3 v-if="isCombo" class="text-success mb-3">Ranged Form</h3>
          
          <div class="d-flex flex-wrap gap-3 mb-3">
            <label class="flex-grow-1">Ranged Group
              <select class="form-select" v-model="rangedForm.group">
                <option value="">None</option>
                <option v-for="g in groups" :key="g" :value="g">{{ g }}</option>
              </select>
            </label>
            <label class="flex-grow-1">Ranged Die
              <select class="form-select" v-model="rangedForm.die">
                <option :value="3">d4</option>
                <option :value="0">d6</option>
                <option :value="-3">d8</option>
                <option :value="-6">d10</option>
                <option :value="-9">d12</option>
              </select>
            </label>
          </div>

          <div class="d-flex flex-wrap gap-2 mb-3">
            <label class="small">Reload
              <select class="form-select form-select-sm" v-model="rangedForm.reload">
                <option :value="0">0</option>
                <option :value="3">1</option>
                <option :value="6">2</option>
              </select>
            </label>
            <label class="small">Range
              <select class="form-select form-select-sm" v-model="rangedForm.range">
                <option :value="4">20</option>
                <option :value="3">30</option>
                <option :value="1">50</option>
                <option :value="0">60</option>
                <option :value="-2">100</option>
                <option :value="-3">120</option>
              </select>
            </label>
            <label class="small">Volley
              <select class="form-select form-select-sm" v-model="rangedForm.volley">
                <option :value="0">None</option>
                <option :value="3">30ft</option>
              </select>
            </label>
          </div>

          <div v-for="(traitList, pointKey) in traitCategories" :key="'r'+pointKey" class="mb-3">
            <label class="fw-bold small">{{ formatPointLabel(pointKey) }} Ranged Traits</label>
            <div class="d-flex flex-wrap gap-2 mt-1">
              <button v-for="t in traitList" :key="t" type="button"
                @click="toggleTrait('ranged', pointKey, t)"
                class="btn btn-sm"
                :disabled="!isTraitAllowed(t, rangedForm.group)"
                :class="getTraitClass(t, 'ranged', pointKey, rangedForm.group)">
                {{ t }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
    
    <hr />

    <div v-if="allTraits.length > 0" class="mt-4 p-3 bg-light rounded border shadow-sm">
      <h4>Weapon Summary</h4>
      <div v-if="isCombo" class="mb-2"><strong>Mode:</strong> Combination Weapon</div>
      <div class="lead"><strong>Traits:</strong> {{ allTraits.join(', ') }}</div>
    </div>
  </div>
</template>

<script>
const groupTraitWhitelist = {
  'Axe': ['Agile', 'Climbing', 'Combination', 'Deadly', 'Disarm', 'Finesse', 'Forceful', 'Parry', 'Shove', 'Sweep', 'Thrown 10', 'Thrown 20', 'Trip', 'Two-Hand', 'Vehicular', 'Versatile P'],
  'Bow': ['Capacity 3', 'Combination', 'Concussive', 'Deadly', 'Finesse', 'Forceful', 'Modular (B P or S)', 'Monk', 'Parry', 'Propulsive','Razing'],
  'Brawling': ['Agile', 'Backstabber', 'Combination', 'Deadly', 'Disarm', 'Fatal', 'Finesse', 'Free-Hand', 'Grapple', 'Modular (B P or S)', 'Monk', 'Parry', 'Reach', 'Shove', 'Trip', 'Twin', 'Unarmed'],
  'Club': ['Agile', 'Attached to Crossbow or Firearm', 'Backswing', 'Combination', 'Concealable', 'Deadly', 'Disarm', 'Fatal', 'Free-Hand', 'Finesse', 'Forceful', 'Monk', 'Parry', 'Ranged Trip', 'Razing', 'Reach', 'Recovery', 'Shove', 'Sweep', 'Tearing', 'Tethered', 'Thrown 10', 'Thrown 20', 'Thrown 30', 'Trip', 'Twin', 'Twin (Sheath)', 'Two-Hand', 'Vehicular', 'Versatile B', 'Versatile P'],
  'Crossbow': ['Backstabber', 'Capacity 5', 'Combination', 'Deadly', 'Fatal Aim', 'Finesse', 'Free-Hand', 'Parry', 'Repeating'],
  'Dart': ['Agile','Concealable', 'Deadly', 'Disarm', 'Finesse', 'Free-Hand', 'Monk', 'Propulsive', 'Recovery', 'Sweep', 'Tethered', 'Thrown 10', 'Thrown 20', 'Thrown 30'],
  'Firearm':['Agile', 'Attached to Shield', 'Backstabber', 'Capacity 3', 'Capacity 5', 'Combination', 'Concealable', 'Concussive', 'Double Barrel', 'Fatal', 'Fatal Aim', 'Kickback', 'Modular (B P or S)', 'Razing', 'Repeating', 'Scatter 5', 'Scatter 10'],
  'Flail': ['Agile', 'Backswing', 'Combination', 'Deadly', 'Disarm', 'Finesse', 'Forceful', 'Grapple', 'Hampering', 'Monk', 'Parry', 'Ranged Trip', 'Razing', 'Reach', 'Sweep', 'Tethered', 'Thrown 10', 'Thrown 20', 'Thrown 30', 'Training', 'Trip', 'Twin', 'Versatile B', 'Versatile P'],
  'Hammer': ['Agile', 'Backswing', 'Brace', 'Combination', 'Razing', 'Reach', 'Shove', 'Thrown 20', 'Trip', 'Two-Hand', 'Versatile P'],
  'Knife': ['Agile', 'Attached to Crossbow or Firearm', 'Backstabber', 'Combination', 'Concealable', 'Deadly', 'Disarm', 'Fatal', 'Finesse', 'Free-Hand', 'Injection', 'Monk', 'Parry', 'Resonant', 'Sweep', 'Thrown 10', 'Thrown 20', 'Trip', 'Twin', 'Two-Hand', 'Vehicular', 'Versatile B', 'Versatile P', 'Versatile S'],
  'Pick': ['Agile', 'Backstabber', 'Deadly', 'Fatal', 'Modular (B P or S)', 'Modular (P and grapple or S and sweep)', 'Trip'],
  'Polearm': ['Backswing', 'Deadly', 'Disarm', 'Forceful', 'Hampering', 'Razing', 'Reach', 'Shove', 'Sweep', 'Tethered', 'Thrown 20', 'Trip', 'Versatile B', 'Versatile P', 'Versatile S'],
  'Shield': ['Attached to Shield'],
  'Sling': ['Agile', 'Combination', 'Concussive', 'Propulsive', 'Ranged Trip', 'Razing', 'Scatter 5', 'Thrown 20'],
  'Spear': ['Agile', 'Backstabber', 'Backswing', 'Combination', 'Deadly', 'Disarm', 'Finesse', 'Grapple', 'Injection', 'Jousting', 'Monk', 'Parry', 'Razing', 'Reach', 'Shove', 'Sweep', 'Tethered', 'Thrown 20', 'Versatile B', 'Versatile S'],
  'Sword': ['Agile', 'Backstabber', 'Backswing', 'Brace', 'Combination', 'Concealable', 'Deadly', 'Disarm', 'Fatal', 'Finesse', 'Forceful', 'Free-Hand', 'Injection', 'Modular (B P or S)', 'Monk', 'Parry', 'Reach', 'Resonant', 'Sweep', 'Trip', 'Twin', 'Twin (Sheath)', 'Two-Hand', 'Vehicular', 'Versatile P', 'Versatile S']
};

export default {
  name: 'App',
  data() {
    return {
      range: 'melee', // melee, ranged, combination
      selectedAncestry: '',
      adjustements: { proficiency: 0, hands: 0 },
      meleeForm: {
        group: '',
        die: 0,
        traits: { onePoint: [], twoPoint: [], threePoint: [] }
      },
      rangedForm: {
        group: '',
        die: 0,
        reload: 0,
        volley: 0,
        range: 4, // default 20ft
        traits: { onePoint: [], twoPoint: [], threePoint: [] }
      },
      groups: ['Axe','Bow','Brawling','Club','Crossbow','Dart','Firearm','Flail','Hammer','Knife','Mace','Pick','Polearm','Shield','Sling','Spear','Sword'],
      ancestries: ['Dwarf', 'Elf', 'Gnome', 'Goblin', 'Halfling', 'Jotunborn', 'Orc', 'Tengu'],
      traitCategories: {
        onePoint: ['Backstabber', 'Backswing', 'Brace', 'Capacity 3', 'Climbing', 'Combination', 'Concealable', 'Disarm', 'Finesse', 'Forceful', 'Free-Hand', 'Grapple', 'Kickback', 'Parry', 'Propulsive', 'Shove', 'Sweep', 'Tearing', 'Thrown 10', 'Trip', 'Twin', 'Twin (Sheath)', 'Twin (Sword)', 'Two-Hand', 'Vehicular', 'Versatile B', 'Versatile P', 'Versatile S'],
        twoPoint: ['Agile', 'Attached to Crossbow or Firearm', 'Attached to Shield', 'Capacity 5', 'Concussive', 'Deadly', 'Hampering', 'Jousting', 'Modular (B P or S)', 'Modular (P and grapple or S and sweep)', 'Monk', 'Ranged Trip', 'Razing', 'Resonant', 'Scatter 5', 'Thrown 20', 'Training'],
        threePoint: ['Double Barrel', 'Fatal', 'Fatal Aim', 'Injection', 'Reach', 'Recovery', 'Repeating', 'Scatter 10', 'Tethered', 'Thrown 30', 'Unarmed']
      }
    };
  },
  computed: {
    isCombo() { return this.range === 'combination'; },
    total() {
      // 1. Starting Budget
      let points = this.isCombo ? 3 : 4;

      // 2. Global Bonuses
      points += this.adjustements.proficiency;
      points += this.adjustements.hands;
      if (this.rangedForm.group === 'Firearm') points += 1;

      // 3. Melee Costs
      if (this.range !== 'ranged') {
        points += this.meleeForm.die;
        points -= this.calcTraitPoints(this.meleeForm.traits);
        if (this.isCombo) points -= 3; // Critical Fusion cost
      }

      // 4. Ranged Costs/Bonuses
      if (this.range !== 'melee') {
        points += this.rangedForm.die;
        points -= 3; // base ranged penalty from guide logic
        points += this.rangedForm.reload;
        points += this.rangedForm.volley;
        points += (this.rangedForm.range - 4); // range cost/gain
        points -= this.calcTraitPoints(this.rangedForm.traits);
      }

      return points;
    },
    allTraits() {
      let combined = ['Uncommon'];
      const traitDieMap = { 3: 'd8', 0: 'd10', '-3': 'd12', '-6': 'd12', '-9': 'd12' };
      const stepUp = { 'd4': 'd6', 'd6': 'd8', 'd8': 'd10', 'd10': 'd12', 'd12': 'd12' };

      const processForm = (form, isRangedForm) => {
        const tDie = traitDieMap[form.die] || 'd12';
        const hasDouble = form.traits.threePoint.includes('Double Barrel');

        Object.keys(form.traits).forEach(key => {
          form.traits[key].forEach(t => {
            let label = t;
            if (t === 'Two-Hand') label = `Two-Hand ${tDie}`;
            if (t === 'Deadly') label = `Deadly ${tDie}`;
            if (t === 'Fatal' || t === 'Fatal Aim') {
              label = `${t} ${hasDouble ? stepUp[tDie] : tDie}`;
            }
            if (!combined.includes(label)) combined.push(label);
          });
        });
        
        if (this.isCombo && !isRangedForm && form.traits.onePoint.includes('Combination')) {
          if (!combined.includes('Critical Fusion')) combined.push('Critical Fusion');
        }
        if (isRangedForm && form.volley === 3) combined.push('Volley 30');
      };

      if (this.range !== 'ranged') processForm(this.meleeForm, false);
      if (this.range !== 'melee') processForm(this.rangedForm, true);
      
      if (this.selectedAncestry) combined.push(this.selectedAncestry);
      return combined.sort();
    }
  },
  methods: {
    calcTraitPoints(traits) {
      return traits.onePoint.length + (traits.twoPoint.length * 2) + (traits.threePoint.length * 3);
    },
    isTraitAllowed(traitName, group) {
      if (!group) return true;
      const allowed = groupTraitWhitelist[group];
      return allowed ? allowed.some(a => traitName.toLowerCase().includes(a.toLowerCase())) : true;
    },
    toggleTrait(formKey, pointKey, trait) {
      const target = formKey === 'melee' ? this.meleeForm : this.rangedForm;
      const index = target.traits[pointKey].indexOf(trait);
      if (index > -1) {
        target.traits[pointKey].splice(index, 1);
      } else {
        target.traits[pointKey].push(trait);
      }
    },
    getTraitClass(t, formKey, pointKey, group) {
      const target = formKey === 'melee' ? this.meleeForm : this.rangedForm;
      const isSelected = target.traits[pointKey].includes(t);
      const isAllowed = this.isTraitAllowed(t, group);
      return {
        'selected-trait': isSelected,
        'btn-outline-secondary opacity-75': !isSelected,
        'opacity-25 pointer-none': !isAllowed && !isSelected
      };
    },
    formatPointLabel(key) {
      if (key === 'onePoint') return '1-Point';
      if (key === 'twoPoint') return '2-Point';
      return '3-Point';
    },
    resetBuilder() {
      this.range = 'melee';
      this.selectedAncestry = '';
      this.adjustements = { proficiency: 0, hands: 0 };
      this.meleeForm = { group: '', die: 0, traits: { onePoint: [], twoPoint: [], threePoint: [] } };
      this.rangedForm = { group: '', die: 0, reload: 0, volley: 0, range: 4, traits: { onePoint: [], twoPoint: [], threePoint: [] } };
    },
    copyToClipboard() {
      const text = `Weapon Type: ${this.range}, Traits: ${this.allTraits.join(", ")}`;
      navigator.clipboard.writeText(text).then(() => alert("Copied!"));
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
.pointer-none { pointer-events: none; }
</style>