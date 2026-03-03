<template>
  <div id="app" class="container pb-5">
    <form>
      <div class="d-flex justify-content-between align-items-center mt-3">
        <h1 class="mb-0" :class="{'text-danger': total < 0}">Points Left: {{ total }}</h1>
        <div>
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
            <template v-if="!isCombo">
              <option :value="-2">Unarmed (-2)</option>
              <option :value="0">Simple (+0)</option>
              <option :value="3">Martial (+3)</option>
              <option :value="5">Advanced (+5)</option>
            </template>
            <template v-else>
              <option :value="6">Martial (+6)</option>
              <option :value="10">Advanced (+10)</option>
            </template>
          </select>
        </label>

        <label class="me-2 mb-2">Hands
          <select class="form-select" v-model="adjustements.hands">
            <template v-if="isCombo">
              <option :value="0">1 / 1 Hand (+0)</option>
              <option :value="7">1+ / 2 Hands (+7)</option>
              <option :value="8">2 / 2 Hands (+8)</option>
            </template>
            <template v-else-if="range === 'ranged'">
              <option :value="0">1 Hand (+0)</option>
              <option :value="1">1+ Hand (+1)</option>
              <option :value="2">2 Hands (+2)</option>
            </template>
            <template v-else>
              <option :value="0">1 Hand (+0)</option>
              <option :value="6">2 Hands (+6)</option>
            </template>
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
          <div class="d-flex flex-wrap gap-3 mb-3">
            <label class="flex-grow-1">Melee Group
              <select class="form-select" v-model="meleeForm.group">
                <option value="">None</option>
                <option v-for="g in meleeGroups" :key="g" :value="g">{{ g }}</option>
              </select>
            </label>
            <label class="flex-grow-1">Damage Type
              <select class="form-select" v-model="meleeForm.damageType">
                <option value="B">B</option>
                <option value="P">P</option>
                <option value="S">S</option>
              </select>
            </label>
            <label class="flex-grow-1">Melee Die
              <select class="form-select" v-model="meleeForm.die">
                <option :value="3">d4 (0)</option>
                <option :value="0">d6 (-3)</option>
                <option :value="-3">d8 (-6)</option>
                <option :value="-6">d10 (-9)</option>
                <option :value="-9">d12 (-12)</option>
              </select>
            </label>
          </div>
          <div v-for="(traitList, pointKey) in traitCategories" :key="'m'+pointKey" class="mb-3">
            <label class="fw-bold small">{{ formatPointLabel(pointKey) }} Melee Traits</label>
            <div class="d-flex flex-wrap gap-2 mt-1">
              <button v-for="t in traitList" :key="t" type="button"
                @click="toggleTrait('melee', pointKey, t)"
                class="btn btn-sm"
                :disabled="!isTraitAllowed(t, meleeForm.group, meleeForm.damageType)"
                :class="getTraitClass(t, 'melee', pointKey, meleeForm.group, meleeForm.damageType)">
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
                <option v-for="g in rangedGroups" :key="g" :value="g">{{ g }}</option>
              </select>
            </label>
            <label class="flex-grow-1">Damage Type
              <select class="form-select" v-model="rangedForm.damageType">
                <option value="B">B</option>
                <option value="P">P</option>
                <option value="S">S</option>
              </select>
            </label>
            <label class="flex-grow-1">Ranged Die
              <select class="form-select" v-model="rangedForm.die">
                <option :value="3">d4 (0)</option>
                <option :value="0">d6 (-3)</option>
                <option :value="-3">d8 (-6)</option>
                <option :value="-6">d10 (-9)</option>
                <option :value="-9">d12 (-12)</option>
              </select>
            </label>
          </div>
          <div class="d-flex flex-wrap gap-2 mb-3">
            <label class="small">Reload
              <select class="form-select form-select-sm" v-model="rangedForm.reload">
                <option :value="0">0 (+0)</option>
                <option :value="3">1 (+3)</option>
                <option :value="6">2 (+6)</option>
              </select>
            </label>
            <label class="small">Range
              <select class="form-select form-select-sm" v-model="rangedForm.range">
                <option :value="0">20 (0)</option>
                <option :value="-1">50 (-1)</option>
                <option :value="-2">110 (-2)</option>
                <option :value="-3">180 (-3)</option>
                <option :value="-4">250 (-4)</option>
                <option :value="-5">320 (-5)</option>
              </select>
            </label>
            <label class="small">Volley
              <select class="form-select form-select-sm" v-model="rangedForm.volley">
                <option :value="0">None (+0)</option>
                <option :value="3">30 (+3)</option>
              </select>
            </label>
          </div>
          <div v-for="(traitList, pointKey) in traitCategories" :key="'r'+pointKey" class="mb-3">
            <label class="fw-bold small">{{ formatPointLabel(pointKey) }} Ranged Traits</label>
            <div class="d-flex flex-wrap gap-2 mt-1">
              <button v-for="t in traitList" :key="t" type="button"
                @click="toggleTrait('ranged', pointKey, t)"
                class="btn btn-sm"
                :disabled="!isTraitAllowed(t, rangedForm.group, rangedForm.damageType)"
                :class="getTraitClass(t, 'ranged', pointKey, rangedForm.group, rangedForm.damageType)">
                {{ t }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
    <hr />
    <div class="mt-4 p-3 bg-light rounded border shadow-sm">
      <h4>Weapon Summary (13gp+)</h4>
      <div v-if="range !== 'ranged'" class="mb-2">
        <strong class="text-primary">{{ isCombo ? 'Melee Form:' : 'Traits:' }}</strong> 
        {{ getFormTraits(meleeForm, false).join(', ') }}
        <div v-if="isCombo" class="small" :class="meleeSpent >= meleeQuota ? 'text-success' : 'text-muted'">
          Investment: {{ meleeSpent }} / {{ meleeQuota }} WP {{ meleeSpent >= meleeQuota ? '✔' : '' }}
        </div>
      </div>
      <div v-if="range !== 'melee'">
        <strong class="text-success">{{ isCombo ? 'Ranged Form:' : 'Traits:' }}</strong> 
        {{ getFormTraits(rangedForm, true).join(', ') }}
        <div v-if="isCombo" class="small" :class="rangedSpent >= rangedQuota ? 'text-success' : 'text-muted'">
          Investment: {{ rangedSpent }} / {{ rangedQuota }} WP {{ rangedSpent >= rangedQuota ? '✔' : '' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const groupTraitWhitelist = {
  'Axe': ['Agile', 'Climbing', 'Deadly', 'Disarm', 'Finesse', 'Forceful', 'Parry', 'Shove', 'Sweep', 'Thrown 10', 'Thrown 20', 'Thrown 30', 'Thrown 60', 'Trip', 'Two-Hand', 'Vehicular', 'Versatile P'],
  'Bow': ['Agile', 'Capacity 3', 'Concussive', 'Deadly', 'Finesse', 'Forceful', 'Modular (B P or S)', 'Monk', 'Parry', 'Propulsive','Razing'],
  'Brawling': ['Agile', 'Backstabber', 'Deadly', 'Disarm', 'Fatal', 'Finesse', 'Free-Hand', 'Grapple', 'Modular (B P or S)', 'Monk', 'Parry', 'Reach', 'Shove', 'Trip', 'Twin', 'Unarmed', 'Versatile P'],
  'Club': ['Agile', 'Attached to Crossbow or Firearm', 'Backswing', 'Concealable', 'Deadly', 'Disarm', 'Fatal', 'Free-Hand', 'Finesse', 'Forceful', 'Monk', 'Parry', 'Ranged Trip', 'Razing', 'Reach', 'Recovery', 'Shove', 'Sweep', 'Tearing', 'Tethered', 'Thrown 10', 'Thrown 20', 'Thrown 30', 'Thrown 60', 'Trip', 'Twin', 'Two-Hand', 'Vehicular', 'Versatile B', 'Versatile P'],
  'Crossbow': ['Backstabber', 'Capacity 5', 'Deadly', 'Fatal Aim', 'Free-Hand', 'Parry', 'Repeating'],
  'Dart': ['Agile','Concealable', 'Deadly', 'Disarm', 'Finesse', 'Free-Hand', 'Monk', 'Propulsive', 'Recovery', 'Sweep', 'Tethered', 'Thrown 10', 'Thrown 20', 'Thrown 30', 'Thrown 60'],
  'Firearm':['Agile', 'Attached to Shield', 'Backstabber', 'Capacity 3', 'Capacity 5', 'Concealable', 'Concussive', 'Double Barrel', 'Fatal', 'Fatal Aim', 'Kickback', 'Modular (B P or S)', 'Razing', 'Repeating', 'Scatter 5', 'Scatter 10'],
  'Flail': ['Agile', 'Backswing', 'Deadly', 'Disarm', 'Finesse', 'Forceful', 'Grapple', 'Hampering', 'Monk', 'Parry', 'Ranged Trip', 'Razing', 'Reach', 'Sweep', 'Tethered', 'Thrown 10', 'Thrown 20', 'Thrown 30', 'Thrown 60', 'Training', 'Trip', 'Twin', 'Versatile B', 'Versatile P'],
  'Hammer': ['Agile', 'Backswing', 'Brace', 'Razing', 'Reach', 'Shove', 'Thrown 20', 'Thrown 60', 'Trip', 'Two-Hand', 'Versatile P'],
  'Knife': ['Agile', 'Attached to Crossbow or Firearm', 'Backstabber', 'Concealable', 'Deadly', 'Disarm', 'Fatal', 'Finesse', 'Free-Hand', 'Injection', 'Monk', 'Parry', 'Resonant', 'Sweep', 'Thrown 10', 'Thrown 20', 'Thrown 30', 'Thrown 60', 'Trip', 'Twin', 'Two-Hand', 'Vehicular', 'Versatile B', 'Versatile P', 'Versatile S'],
  'Pick': ['Agile', 'Backstabber', 'Deadly', 'Fatal', 'Modular (B P or S)', 'Trip'],
  'Polearm': ['Backswing', 'Deadly', 'Disarm', 'Forceful', 'Hampering', 'Razing', 'Reach', 'Shove', 'Sweep', 'Tethered', 'Thrown 20', 'Thrown 60', 'Trip', 'Versatile B', 'Versatile P', 'Versatile S'],
  'Shield': ['Attached to Shield'],
  'Sling': ['Agile', 'Concussive', 'Propulsive', 'Ranged Trip', 'Razing', 'Scatter 5', 'Thrown 20', 'Thrown 60'],
  'Spear': ['Agile', 'Backstabber', 'Backswing', 'Deadly', 'Disarm', 'Finesse', 'Grapple', 'Injection', 'Jousting', 'Monk', 'Parry', 'Razing', 'Reach', 'Shove', 'Sweep', 'Tethered', 'Thrown 20', 'Thrown 60', 'Versatile B', 'Versatile S'],
  'Sword': ['Agile', 'Backstabber', 'Backswing', 'Brace', 'Concealable', 'Deadly', 'Disarm', 'Fatal', 'Finesse', 'Forceful', 'Free-Hand', 'Injection', 'Modular (B P or S)', 'Monk', 'Parry', 'Reach', 'Resonant', 'Sweep', 'Trip', 'Twin', 'Two-Hand', 'Vehicular', 'Versatile P', 'Versatile S']
};

export default {
  name: 'App',
  data() {
    return {
      range: 'melee', 
      selectedAncestry: '',
      adjustements: { proficiency: 3, hands: 0 },
      meleeForm: { group: '', die: 3, damageType: 'S', traits: { onePoint: [], twoPoint: [], threePoint: [] } },
      rangedForm: { group: '', die: 3, damageType: 'P', reload: 0, volley: 0, range: 0, traits: { onePoint: [], twoPoint: [], threePoint: [] } },
      meleeGroups: ['Axe', 'Brawling', 'Club', 'Dart', 'Flail', 'Knife', 'Hammer', 'Pick', 'Polearm', 'Shield', 'Spear', 'Sword'],
      rangedGroups: ['Bow', 'Crossbow', 'Dart', 'Sling', 'Firearm', 'Knife'],
      ancestries: ['Dwarf', 'Elf', 'Gnome', 'Goblin', 'Halfling', 'Jotunborn', 'Orc', 'Tengu'],
      traitCategories: {
        onePoint: ['Agile', 'Finesse', 'Fatal Aim', 'Monk', 'Razing', 'Repeating', 'Hampering', 'Tethered', 'Thrown 10', 'Thrown 20', 'Thrown 30', 'Training', 'Backstabber', 'Backswing', 'Brace', 'Climbing', 'Concealable', 'Disarm', 'Forceful', 'Free-Hand', 'Grapple', 'Kickback', 'Propulsive', 'Shove', 'Sweep', 'Tearing', 'Trip', 'Twin', 'Two-Hand', 'Vehicular', 'Versatile B', 'Versatile P', 'Versatile S'],
        twoPoint: ['Capacity 3', 'Thrown 60', 'Attached to Crossbow or Firearm', 'Attached to Shield', 'Concussive', 'Deadly', 'Jousting', 'Modular (B P or S)', 'Parry', 'Ranged Trip', 'Resonant', 'Scatter 5', 'Versatile P'],
        threePoint: ['Capacity 5', 'Double Barrel', 'Fatal', 'Injection', 'Reach', 'Recovery', 'Repeating', 'Scatter 10']
      }
    };
  },
  watch: {
    range(newVal) {
      if (newVal === 'combination' && (this.adjustements.proficiency !== 6 && this.adjustements.proficiency !== 10)) {
        this.adjustements.proficiency = 6;
      }
    }
  },
  computed: {
    isCombo() { return this.range === 'combination'; },
    meleeQuota() {
      const prof = this.adjustements.proficiency;
      const hands = this.adjustements.hands;
      if (hands === 0) return prof === 6 ? 4 : 6;
      return prof === 6 ? 7 : 9;
    },
    rangedQuota() {
      return this.adjustements.proficiency === 6 ? 6 : 8;
    },
    meleeSpent() {
      let cost = Math.abs(this.meleeForm.die - 3);
      cost += this.calcTraitPoints(this.meleeForm.traits);
      return cost;
    },
    rangedSpent() {
      let cost = Math.abs(this.rangedForm.die - 3);
      cost += this.calcTraitPoints(this.rangedForm.traits);
      cost += Math.abs(this.rangedForm.range);
      return cost;
    },
    total() {
      let points = this.isCombo ? 3 : 4; 
      points += this.adjustements.proficiency;
      points += this.adjustements.hands;
      points += 1; // Expensive
      if (this.range !== 'melee' && this.rangedForm.group === 'Firearm') points += 1;

      if (this.range !== 'ranged') {
        points -= this.meleeSpent;
        if (this.isCombo) points -= 3;
      }

      if (this.range !== 'melee') {
        points += this.rangedForm.reload;
        points += this.rangedForm.volley;
        points -= this.rangedSpent;
      }
      return points;
    }
  },
  methods: {
    calcTraitPoints(traits) {
      let sum = traits.onePoint.length;
      sum += (traits.twoPoint.length * 2) + (traits.threePoint.length * 3);
      return sum;
    },
    getFormTraits(form, isRangedForm) {
      let list = ['Uncommon'];
      const traitDieMap = { 3: 'd8', 0: 'd10', '-3': 'd12', '-6': 'd12', '-9': 'd12' };
      const stepUp = { 'd4': 'd6', 'd6': 'd8', 'd8': 'd10', 'd10': 'd12', 'd12': 'd12' };
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
          if (!list.includes(label)) list.push(label);
        });
      });

      if (this.adjustements.proficiency === -2 && !list.includes('Unarmed')) list.push('Unarmed');

      if (this.isCombo) {
        if (!list.includes('Combination')) list.push('Combination');
        if (!isRangedForm && !list.includes('Critical Fusion')) list.push('Critical Fusion');
      }

      if (isRangedForm && form.volley === 3) list.push('Volley 30');
      if (this.selectedAncestry) list.push(this.selectedAncestry);
      return list.sort();
    },
    isTraitAllowed(traitName, group, baseDamage) {
      if (traitName === 'Versatile B' && baseDamage === 'B') return false;
      if (traitName === 'Versatile P' && baseDamage === 'P') return false;
      if (traitName === 'Versatile S' && baseDamage === 'S') return false;
      if (!group) return true;
      const allowed = groupTraitWhitelist[group];
      return allowed ? allowed.some(a => traitName.toLowerCase().includes(a.toLowerCase())) : true;
    },
    toggleTrait(formKey, pointKey, trait) {
      const target = formKey === 'melee' ? this.meleeForm : this.rangedForm;
      const index = target.traits[pointKey].indexOf(trait);
      if (index > -1) target.traits[pointKey].splice(index, 1);
      else target.traits[pointKey].push(trait);
    },
    getTraitClass(t, formKey, pointKey, group, baseDamage) {
      const target = formKey === 'melee' ? this.meleeForm : this.rangedForm;
      const isSelected = target.traits[pointKey].includes(t);
      return {
        'selected-trait': isSelected,
        'btn-outline-secondary opacity-75': !isSelected,
        'opacity-25 pointer-none': !this.isTraitAllowed(t, group, baseDamage) && !isSelected
      };
    },
    formatPointLabel(key) {
      return key === 'onePoint' ? '1-Point' : key === 'twoPoint' ? '2-Point' : '3-Point';
    },
    resetBuilder() {
      this.range = 'melee';
      this.selectedAncestry = '';
      this.adjustements = { proficiency: 3, hands: 0 };
      this.meleeForm = { group: '', die: 3, damageType: 'S', traits: { onePoint: [], twoPoint: [], threePoint: [] } };
      this.rangedForm = { group: '', die: 3, damageType: 'P', reload: 0, volley: 0, range: 0, traits: { onePoint: [], twoPoint: [], threePoint: [] } };
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