<template>
  <div id="app" class="container pb-5">
    <form>
      <div class="builder-card mb-3 mt-3">
        <div class="d-flex justify-content-between align-items-center mb-3 gap-2">
          <h2 class="section-title mb-0">Base Setup</h2>
          <button type="button" class="btn btn-outline-danger btn-sm" @click="resetBuilder">
            Clear All
          </button>
        </div>
        <div class="progress mb-3" style="height: 30px;">
          <div class="progress-bar" 
            :class="total >= 0 ? 'bg-success' : 'bg-danger'"
            role="progressbar" 
            :style="{ width: pointsUsedPercentage + '%' }"
            :aria-valuenow="pointsUsed" 
            :aria-valuemin="0" 
            :aria-valuemax="totalAvailablePoints">
            {{ pointsUsed === 0 ? '' : pointsUsed + '/' + totalAvailablePoints }}
          </div>
        </div>

        <div class="mode-toggle-row mt-3 mb-2">
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

        <div v-if="switchNotice" class="switch-notice mb-2">{{ switchNotice }}</div>

        <div class="control-row mt-2 mb-1">
          <label class="control-field control-field-sm">Proficiency
            <select class="form-select form-select-sm" v-model="adjustements.proficiency">
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

          <label class="control-field control-field-sm">Hands
            <select class="form-select form-select-sm" v-model="adjustements.hands">
              <template v-if="isCombo">
                <option :value="0">1 Melee / 1 Ranged Hands (+0)</option>
                <option :value="7">1+ Melee / 2 Ranged Hands (+7)</option>
                <option :value="8">2 Melee / 2 Ranged Hands (+8)</option>
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

          <label class="control-field control-field-sm">Ancestry
            <select class="form-select form-select-sm" v-model="selectedAncestry">
              <option value="">None</option>
              <option v-for="a in ancestries" :key="a" :value="a">{{ a }}</option>
            </select>
          </label>
        </div>
      </div>

      <div class="row g-3">
        <div v-if="range !== 'ranged'" :class="isCombo ? 'col-lg-6' : 'col-12'">
          <div class="builder-card builder-card-form h-100">
          <h3 class="section-title-sm text-primary mb-3">{{ isCombo ? 'Melee Form' : 'Melee Setup' }}</h3>
          <div v-if="isCombo" class="mb-3">
            <div class="progress" style="height: 25px;">
              <div class="progress-bar" 
                :class="meleeSpent >= meleeQuota ? 'bg-success' : 'bg-warning'"
                role="progressbar" 
                :style="{ width: Math.min(Math.max(meleeSpent / meleeQuota * 100, 0), 100) + '%' }"
                :aria-valuenow="meleeSpent" 
                :aria-valuemin="0" 
                :aria-valuemax="meleeQuota">
                {{ meleeSpent }}/{{ meleeQuota }}{{ meleeSpent >= meleeQuota ? ' ✔' : '' }}
              </div>
            </div>
          </div>
          <div class="control-row mb-3">
            <label class="control-field">Melee Group
              <select class="form-select form-select-sm" v-model="meleeForm.group">
                <option value="">None</option>
                <option v-for="g in meleeGroups" :key="g" :value="g">{{ g }}</option>
              </select>
            </label>
            <label class="control-field">Damage Type
              <select class="form-select form-select-sm" v-model="meleeForm.damageType">
                <option value="B">B</option>
                <option value="P">P</option>
                <option value="S">S</option>
              </select>
            </label>
            <label class="control-field">Melee Die
              <select class="form-select form-select-sm" v-model="meleeForm.die">
                <option :value="3">d4 (0)</option>
                <option :value="0">d6 (-3)</option>
                <option :value="-3">d8 (-6)</option>
                <option :value="-6">d10 (-9)</option>
                <option :value="-9">d12 (-12)</option>
              </select>
            </label>
          </div>
          <div v-for="(traitList, pointKey) in traitCategories" :key="'m'+pointKey" class="trait-block mb-3">
            <div class="d-flex justify-content-between align-items-center gap-2 mb-1">
              <label class="fw-bold small mb-0">{{ formatPointLabel(pointKey) }} Melee Traits</label>
            </div>
            <div class="trait-button-grid mt-1">
              <button v-for="t in traitList" :key="t" type="button"
                @click="toggleTrait('melee', pointKey, t)"
                class="btn btn-sm"
                :title="traitDescriptions[t]"
                :disabled="!isTraitAllowed(t, meleeForm.group, meleeForm.damageType, meleeForm.die) && !meleeForm.traits[pointKey].includes(t)"
                :class="getTraitClass(t, 'melee', pointKey, meleeForm.group, meleeForm.damageType, meleeForm.die)">
                {{ t }}
              </button>
            </div>
          </div>
          </div>
        </div>

        <div v-if="range !== 'melee'" :class="isCombo ? 'col-lg-6' : 'col-12'">
          <div class="builder-card builder-card-form h-100">
          <h3 class="section-title-sm text-success mb-3">{{ isCombo ? 'Ranged Form' : 'Ranged Setup' }}</h3>
          <div v-if="isCombo" class="mb-3">
            <div class="progress" style="height: 25px;">
              <div class="progress-bar" 
                :class="rangedSpent >= rangedQuota ? 'bg-success' : 'bg-warning'"
                role="progressbar" 
                :style="{ width: Math.min(Math.max(rangedSpent / rangedQuota * 100, 0), 100) + '%' }"
                :aria-valuenow="rangedSpent" 
                :aria-valuemin="0" 
                :aria-valuemax="rangedQuota">
                {{ rangedSpent }}/{{ rangedQuota }}{{ rangedSpent >= rangedQuota ? ' ✔' : '' }}
              </div>
            </div>
          </div>
          <div class="control-row mb-3">
            <label class="control-field">Ranged Group
              <select class="form-select form-select-sm" v-model="rangedForm.group">
                <option value="">None</option>
                <option v-for="g in rangedGroups" :key="g" :value="g">{{ g }}</option>
              </select>
            </label>
            <label class="control-field">Damage Type
              <select class="form-select form-select-sm" v-model="rangedForm.damageType">
                <option value="B">B</option>
                <option value="P">P</option>
                <option value="S">S</option>
              </select>
            </label>
            <label class="control-field">Ranged Die
              <select class="form-select form-select-sm" v-model="rangedForm.die">
                <option :value="3">d4 (0)</option>
                <option :value="0">d6 (-3)</option>
                <option :value="-3">d8 (-6)</option>
                <option :value="-6">d10 (-9)</option>
                <option :value="-9">d12 (-12)</option>
              </select>
            </label>
          </div>
          <div class="control-row mb-3">
            <label class="control-field control-field-sm">Reload
              <select class="form-select form-select-sm" v-model="rangedForm.reload">
                <option :value="0">0 (+0)</option>
                <option :value="3">1 (+3)</option>
                <option :value="6">2 (+6)</option>
              </select>
            </label>
            <label class="control-field control-field-sm">Range
              <select class="form-select form-select-sm" v-model="rangedForm.range">
                <option :value="0">20 (0)</option>
                <option :value="-1">50 (-1)</option>
                <option :value="-2">110 (-2)</option>
                <option :value="-3">180 (-3)</option>
                <option :value="-4">250 (-4)</option>
                <option :value="-5">320 (-5)</option>
              </select>
            </label>
            <label class="control-field control-field-sm">Volley
              <select class="form-select form-select-sm" v-model="rangedForm.volley">
                <option :value="0">None (+0)</option>
                <option :value="3">30 (+3)</option>
              </select>
            </label>
          </div>
          <div v-for="(traitList, pointKey) in traitCategories" :key="'r'+pointKey" class="trait-block mb-3">
            <div class="d-flex justify-content-between align-items-center gap-2 mb-1">
              <label class="fw-bold small mb-0">{{ formatPointLabel(pointKey) }} Ranged Traits</label>
            </div>
            <div class="trait-button-grid mt-1">
              <button v-for="t in traitList" :key="t" type="button"
                @click="toggleTrait('ranged', pointKey, t)"
                class="btn btn-sm"
                :title="traitDescriptions[t]"
                :disabled="!isTraitAllowed(t, rangedForm.group, rangedForm.damageType, rangedForm.die) && !rangedForm.traits[pointKey].includes(t)"
                :class="getTraitClass(t, 'ranged', pointKey, rangedForm.group, rangedForm.damageType, rangedForm.die)">
                {{ t }}
              </button>
            </div>
          </div>
          </div>
        </div>
      </div>
    </form>
    <hr />
    <div class="mt-4 p-3 bg-light rounded border shadow-sm">
      <h4>Weapon Summary (13gp+)</h4>
      <div v-if="range !== 'ranged'" class="mb-2">
        <div class="d-flex flex-wrap align-items-center gap-2 mb-1">
          <strong class="text-primary">{{ isCombo ? 'Melee Form:' : 'Traits:' }}</strong>
          <button
            type="button"
            class="btn btn-outline-info btn-sm summary-copy-btn"
            @click="copyTraitsToClipboard('melee')">
            Copy Traits
          </button>
        </div>
        {{ getFormTraits(meleeForm, false).join(', ') }}
      </div>
      <div v-if="range !== 'melee'">
        <div class="d-flex flex-wrap align-items-center gap-2 mb-1">
          <strong class="text-success">{{ isCombo ? 'Ranged Form:' : 'Traits:' }}</strong>
          <button
            type="button"
            class="btn btn-outline-info btn-sm summary-copy-btn"
            @click="copyTraitsToClipboard('ranged')">
            Copy Traits
          </button>
        </div>
        {{ getFormTraits(rangedForm, true).join(', ') }}
      </div>
      <div v-if="copyNotice" class="copy-notice mt-2">{{ copyNotice }}</div>
    </div>
  </div>
</template>

<script>
const groupTraitWhitelist = {
  'Axe': ['Agile', 'Climbing', 'Deadly', 'Disarm', 'Finesse', 'Forceful', 'Parry', 'Shove', 'Sweep', 'Thrown 30', 'Thrown 60', 'Trip', 'Two-Hand', 'Vehicular', 'Versatile P'],
  'Bow': ['Capacity 3', 'Concussive', 'Deadly', 'Forceful', 'Modular (B P or S)', 'Monk', 'Parry', 'Propulsive','Razing'],
  'Brawling': ['Agile', 'Backstabber', 'Deadly', 'Disarm', 'Fatal', 'Finesse', 'Free-Hand', 'Grapple', 'Modular (B P or S)', 'Monk', 'Parry', 'Reach', 'Shove', 'Trip', 'Twin', 'Unarmed', 'Versatile P'],
  'Club': ['Agile', 'Attached to Crossbow or Firearm', 'Backswing', 'Concealable', 'Deadly', 'Disarm', 'Fatal', 'Free-Hand', 'Finesse', 'Forceful', 'Monk', 'Parry', 'Ranged Trip', 'Razing', 'Reach', 'Recovery', 'Shove', 'Sweep', 'Tearing', 'Tethered', 'Thrown 30', 'Thrown 60', 'Trip', 'Twin', 'Two-Hand', 'Vehicular', 'Versatile B', 'Versatile P'],
  'Crossbow': ['Backstabber', 'Capacity 5', 'Deadly', 'Fatal Aim', 'Free-Hand', 'Parry', 'Repeating'],
  'Dart': ['Agile','Concealable', 'Deadly', 'Disarm', 'Finesse', 'Free-Hand', 'Monk', 'Propulsive', 'Recovery', 'Sweep', 'Tearing', 'Tethered', 'Thrown 30', 'Thrown 60'],
  'Firearm':['Attached to Shield', 'Capacity 3', 'Capacity 5', 'Concealable', 'Concussive', 'Double Barrel', 'Fatal', 'Fatal Aim', 'Kickback', 'Modular (B P or S)', 'Razing', 'Repeating', 'Scatter 5', 'Scatter 10'],
  'Flail': ['Agile', 'Backswing', 'Deadly', 'Disarm', 'Finesse', 'Forceful', 'Grapple', 'Hampering', 'Monk', 'Parry', 'Ranged Trip', 'Razing', 'Reach', 'Sweep', 'Tethered', 'Thrown 30', 'Thrown 60', 'Training', 'Trip', 'Twin', 'Versatile B', 'Versatile P'],
  'Hammer': ['Agile', 'Backswing', 'Brace', 'Razing', 'Reach', 'Shove', 'Thrown 60', 'Trip', 'Two-Hand', 'Versatile P'],
  'Knife': ['Agile', 'Attached to Crossbow or Firearm', 'Backstabber', 'Concealable', 'Deadly', 'Disarm', 'Fatal', 'Finesse', 'Forceful', 'Free-Hand', 'Injection', 'Monk', 'Parry', 'Resonant', 'Sweep', 'Tearing', 'Thrown 30', 'Thrown 60', 'Trip', 'Twin', 'Two-Hand', 'Vehicular', 'Versatile B', 'Versatile P', 'Versatile S'],
  'Pick': ['Agile', 'Backstabber', 'Deadly', 'Fatal', 'Modular (B P or S)', 'Trip'],
  'Polearm': ['Backswing', 'Deadly', 'Disarm', 'Forceful', 'Hampering', 'Razing', 'Reach', 'Shove', 'Sweep', 'Tethered', 'Thrown 60', 'Trip', 'Versatile B', 'Versatile P', 'Versatile S'],
  'Shield': ['Attached to Shield'],
  'Sling': ['Agile', 'Concussive', 'Propulsive', 'Ranged Trip', 'Razing', 'Scatter 5', 'Thrown 60'],
  'Spear': ['Agile', 'Backstabber', 'Backswing', 'Deadly', 'Disarm', 'Finesse', 'Grapple', 'Injection', 'Jousting', 'Monk', 'Parry', 'Razing', 'Reach', 'Shove', 'Sweep', 'Tethered', 'Thrown 60', 'Versatile B', 'Versatile S'],
  'Sword': ['Agile', 'Backstabber', 'Backswing', 'Brace', 'Concealable', 'Deadly', 'Disarm', 'Fatal', 'Finesse', 'Forceful', 'Free-Hand', 'Injection', 'Modular (B P or S)', 'Monk', 'Parry', 'Reach', 'Resonant', 'Sweep', 'Trip', 'Twin', 'Two-Hand', 'Vehicular', 'Versatile P', 'Versatile S']
};

export default {
  name: 'App',
  data() {
    return {
      range: 'melee', 
      modeStateStore: {},
      isResettingBuilder: false,
      switchNotice: '',
      switchNoticeTimer: null,
      copyNotice: '',
      copyNoticeTimer: null,
      selectedAncestry: '',
      adjustements: { proficiency: 0, hands: 0 },
      meleeForm: { group: '', die: 3, damageType: 'S', traits: { onePoint: [], twoPoint: [], threePoint: [] } },
      rangedForm: { group: '', die: 3, damageType: 'P', reload: 0, volley: 0, range: 0, traits: { onePoint: [], twoPoint: [], threePoint: [] } },
      meleeGroups: ['Axe', 'Brawling', 'Club', 'Dart', 'Flail', 'Knife', 'Hammer', 'Pick', 'Polearm', 'Shield', 'Spear', 'Sword'],
      rangedGroups: ['Bow', 'Crossbow', 'Dart', 'Sling', 'Firearm', 'Knife'],
      ancestries: ['Dwarf', 'Elf', 'Gnome', 'Goblin', 'Halfling', 'Jotunborn', 'Orc', 'Tengu'],
      traitCategories: {
        onePoint: ['Agile', 'Backstabber', 'Backswing', 'Brace', 'Climbing', 'Concealable', 'Disarm', 'Fatal Aim', 'Finesse', 'Forceful', 'Free-Hand', 'Grapple', 'Hampering', 'Kickback', 'Monk', 'Parry', 'Propulsive', 'Razing', 'Repeating', 'Shove', 'Sweep', 'Tearing', 'Tethered', 'Thrown 30', 'Training', 'Trip', 'Twin', 'Two-Hand', 'Vehicular', 'Versatile B', 'Versatile P', 'Versatile S'],
        twoPoint: ['Capacity 3', 'Thrown 60', 'Attached to Crossbow or Firearm', 'Attached to Shield', 'Concussive', 'Deadly', 'Jousting', 'Modular (B P or S)', 'Ranged Trip', 'Resonant', 'Scatter 5'],
        threePoint: ['Capacity 5', 'Double Barrel', 'Fatal', 'Injection', 'Reach', 'Recovery', 'Repeating', 'Scatter 10']
      },
      traitDescriptions: {
        'Agile': 'The multiple attack penalty you take with this weapon on the second attack on your turn is –4 instead of –5, and –8 instead of –10 on the third and subsequent attacks in the turn.',
        'Attached to Crossbow or Firearm': 'An attached weapon must be combined with another piece of gear to be used. The trait lists what type of item the weapon must be attached to. You must be wielding or wearing the item the weapon is attached to in order to attack with it.',
        'Attached to Shield': 'An attached weapon must be combined with another piece of gear to be used. The trait lists what type of item the weapon must be attached to. You must be wielding or wearing the item the weapon is attached to in order to attack with it.',
        'Backstabber': 'When you hit an off-guard creature, this weapon deals 1 precision damage in addition to its normal damage. The precision damage increases to 2 if the weapon is a +3 weapon.',
        'Backswing': 'You can use the momentum from a missed attack with this weapon to lead into your next attack. After missing with this weapon on your turn, you gain a +1 circumstance bonus to your next attack with this weapon before the end of your turn.',
        'Brace': '',
        'Capacity 3': '',
        'Capacity 5': '',
        'Climbing': '',
        'Concealable': 'This weapon is designed to be inconspicuous or easily concealed. You gain a +2 circumstance bonus to Stealth checks and DCs to hide or conceal a weapon with this trait.',
        'Concussive': '',
        'Deadly': 'On a critical hit, the weapon adds a weapon damage die of the listed size. Roll this after doubling the weapon\'s damage. This increases to two dice if the weapon has a greater striking rune and three dice if the weapon has a major striking rune.',
        'Disarm': 'You can use this weapon to Disarm with the Athletics skill even if you don\'t have a free hand. This uses the weapon\'s reach (if different from your own) and adds the weapon\'s item bonus to attack rolls (if any) as an item bonus to the Athletics check.',
        'Double Barrel': '',
        'Fatal': 'The fatal trait includes a die size. On a critical hit, the weapon\'s damage die increases to that die size instead of the normal die size, and the weapon adds one additional damage die of the listed size.',
        'Fatal Aim': '',
        'Finesse': 'You can use your Dexterity modifier instead of your Strength modifier on attack rolls using this melee weapon. You still calculate damage using Strength.',
        'Forceful': 'This weapon becomes more dangerous as you build momentum. When you attack with it more than once on your turn, the second attack gains a circumstance bonus to damage equal to the number of weapon damage dice, and each later attack gains a circumstance bonus to damage equal to double the number of damage dice.',
        'Free-Hand': 'This weapon doesn\'t take up your hand, usually because it is built into your armor. A free-hand weapon can\'t be Disarmed. You can use the hand covered by your free-hand weapon to wield other items, perform manipulate actions, and so on.',
        'Grapple': 'You can use this weapon to Grapple with the Athletics skill even if you don\'t have a free hand. This uses the weapon\'s reach (if different from your own) and adds the weapon\'s item bonus to attack rolls as an item bonus to the Athletics check.',
        'Hampering': '',
        'Injection': '',
        'Jousting': 'The weapon is suited for mounted combat with a harness or similar means. When mounted, if you moved at least 10 feet on the action before your attack, add a circumstance bonus to damage for that attack equal to the number of damage dice for the weapon.',
        'Kickback': '',
        'Modular (B P or S)': '',
        'Monk': 'Many monks learn to use these weapons.',
        'Nonlethal': 'Attacks with this weapon are nonlethal, and are used to knock creatures unconscious instead of kill them. You can use a nonlethal weapon to make a lethal attack with a –2 circumstance penalty.',
        'Parry': 'This weapon can be used defensively to block attacks. While wielding this weapon, if your proficiency with it is trained or better, you can spend a single action to position your weapon defensively, gaining a +1 circumstance bonus to AC until the start of your next turn.',
        'Propulsive': 'You add half your Strength modifier (if positive) to damage rolls with a propulsive ranged weapon. If you have a negative Strength modifier, you add your full Strength modifier instead.',
        'Ranged Trip': 'The weapon can be used to Trip with the Athletics skill within the weapon\'s first range increment. The skill check takes a –2 circumstance penalty. You can add the weapon\'s item bonus to attack rolls as a bonus to the check.',
        'Razing': '',
        'Reach': 'This weapon can be used to attack enemies up to 10 feet away instead of only adjacent enemies. For creatures with reach, the weapon increases their reach by 5 feet.',
        'Recovery': '',
        'Repeating': '',
        'Resonant': '',
        'Scatter 5': '',
        'Scatter 10': '',
        'Shove': 'You can use this weapon to Shove with the Athletics skill even if you don\'t have a free hand. This uses the weapon\'s reach (if different from your own) and adds the weapon\'s item bonus to attack rolls as an item bonus to the Athletics check.',
        'Sweep': 'This weapon makes wide swinging attacks. When you attack with this weapon, you gain a +1 circumstance bonus to your attack roll if you already attempted to attack a different target this turn using this weapon.',
        'Tearing': '',
        'Tethered': '',
        'Thrown 30': 'You can throw this weapon as a ranged attack; it is a ranged weapon when thrown. You add your Strength modifier to damage as you would for a melee weapon.',
        'Thrown 60': 'You can throw this weapon as a ranged attack; it is a ranged weapon when thrown. You add your Strength modifier to damage as you would for a melee weapon.',
        'Training': '',
        'Trip': 'You can use this weapon to Trip with the Athletics skill even if you don\'t have a free hand. This uses the weapon\'s reach (if different from your own) and adds the weapon\'s item bonus to attack rolls as an item bonus to the Athletics check.',
        'Twin': 'These weapons are used as a pair. When you attack with a twin weapon, you add a circumstance bonus to the damage roll equal to the weapon\'s number of damage dice if you have previously attacked with a different weapon of the same type this turn.',
        'Two-Hand': 'This weapon can be wielded with two hands to change its weapon damage die to the indicated value. This change applies to all the weapon\'s damage dice.',
        'Unarmed': 'An unarmed attack uses your body rather than a manufactured weapon. An unarmed attack isn\'t a weapon, though has a weapon group and might have weapon traits. An unarmed attack can\'t be Disarmed.',
        'Vehicular': '',
        'Versatile B': 'A versatile weapon can be used to deal a different type of damage than its listed type. This trait indicates the alternate damage type.',
        'Versatile P': 'A versatile weapon can be used to deal a different type of damage than its listed type. This trait indicates the alternate damage type.',
        'Versatile S': 'A versatile weapon can be used to deal a different type of damage than its listed type. This trait indicates the alternate damage type.',
        'Volley': 'This ranged weapon is less effective at close distances. Your attacks against targets that are at a distance within the range listed take a –2 penalty.'
      }
    };
  },
  watch: {
    range(newVal, oldVal) {
      if (this.isResettingBuilder || !oldVal) return;
      this.modeStateStore[oldVal] = this.captureCurrentState();
      this.restoreStateForMode(newVal);
      this.showSwitchNotice(newVal);
    }
  },
  mounted() {
    document.body.classList.add('dark-mode');
    this.initModeStateStore();
  },
  beforeDestroy() {
    if (this.switchNoticeTimer) {
      clearTimeout(this.switchNoticeTimer);
      this.switchNoticeTimer = null;
    }
    if (this.copyNoticeTimer) {
      clearTimeout(this.copyNoticeTimer);
      this.copyNoticeTimer = null;
    }
    document.body.classList.remove('dark-mode');
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
    },
    totalAvailablePoints() {
      let points = this.isCombo ? 3 : 4;
      points += this.adjustements.proficiency;
      points += this.adjustements.hands;
      points += 1; // Expensive
      if (this.range !== 'melee' && this.rangedForm.group === 'Firearm') points += 1;
      if (this.range !== 'melee') {
        points += this.rangedForm.reload;
        points += this.rangedForm.volley;
      }
      return points;
    },
    pointsUsed() {
      return this.totalAvailablePoints - this.total;
    },
    pointsUsedPercentage() {
      if (this.totalAvailablePoints === 0) return 0;
      const percentage = (this.pointsUsed / this.totalAvailablePoints) * 100;
      return Math.min(Math.max(percentage, 0), 100);
    }
  },
  methods: {
    deepClone(value) {
      return JSON.parse(JSON.stringify(value));
    },
    createEmptyTraits() {
      return { onePoint: [], twoPoint: [], threePoint: [] };
    },
    createDefaultMeleeForm() {
      return { group: '', die: 3, damageType: 'S', traits: this.createEmptyTraits() };
    },
    createDefaultRangedForm() {
      return { group: '', die: 3, damageType: 'P', reload: 0, volley: 0, range: 0, traits: this.createEmptyTraits() };
    },
    getDefaultStateForMode(mode) {
      const defaults = {
        selectedAncestry: '',
        meleeForm: this.createDefaultMeleeForm(),
        rangedForm: this.createDefaultRangedForm()
      };

      if (mode === 'combination') {
        return {
          adjustements: { proficiency: 6, hands: 0 },
          ...defaults
        };
      }

      return {
        adjustements: { proficiency: 0, hands: 0 },
        ...defaults
      };
    },
    normalizeAdjustementsForMode(mode, adjustements) {
      const normalized = this.deepClone(adjustements || { proficiency: 0, hands: 0 });
      if (mode === 'combination') {
        if (![6, 10].includes(normalized.proficiency)) normalized.proficiency = 6;
        if (![0, 7, 8].includes(normalized.hands)) normalized.hands = 0;
        return normalized;
      }

      if (![-2, 0, 3, 5].includes(normalized.proficiency)) normalized.proficiency = 0;
      if (mode === 'melee' && ![0, 6].includes(normalized.hands)) normalized.hands = 0;
      if (mode === 'ranged' && ![0, 1, 2].includes(normalized.hands)) normalized.hands = 0;
      return normalized;
    },
    captureCurrentState() {
      return {
        selectedAncestry: this.selectedAncestry,
        adjustements: this.deepClone(this.adjustements),
        meleeForm: this.deepClone(this.meleeForm),
        rangedForm: this.deepClone(this.rangedForm)
      };
    },
    applyState(state, mode) {
      const nextState = this.deepClone(state);
      this.selectedAncestry = nextState.selectedAncestry || '';
      this.adjustements = this.normalizeAdjustementsForMode(mode, nextState.adjustements);
      this.meleeForm = nextState.meleeForm || this.createDefaultMeleeForm();
      this.rangedForm = nextState.rangedForm || this.createDefaultRangedForm();
    },
    initModeStateStore() {
      this.modeStateStore = {
        melee: this.getDefaultStateForMode('melee'),
        ranged: this.getDefaultStateForMode('ranged'),
        combination: this.getDefaultStateForMode('combination')
      };
      this.modeStateStore[this.range] = this.captureCurrentState();
      this.restoreStateForMode(this.range);
    },
    restoreStateForMode(mode) {
      if (!this.modeStateStore[mode]) {
        this.modeStateStore[mode] = this.getDefaultStateForMode(mode);
      }
      this.applyState(this.modeStateStore[mode], mode);
    },
    formatModeLabel(mode) {
      return mode === 'combination' ? 'Combination' : mode.charAt(0).toUpperCase() + mode.slice(1);
    },
    showSwitchNotice(mode) {
      this.switchNotice = `Restored ${this.formatModeLabel(mode)} build`;
      if (this.switchNoticeTimer) clearTimeout(this.switchNoticeTimer);
      this.switchNoticeTimer = setTimeout(() => {
        this.switchNotice = '';
        this.switchNoticeTimer = null;
      }, 1700);
    },
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
    isTraitAllowed(traitName, group, baseDamage, die) {
      if (traitName === 'Versatile B' && baseDamage === 'B') return false;
      if (traitName === 'Versatile P' && baseDamage === 'P') return false;
      if (traitName === 'Versatile S' && baseDamage === 'S') return false;
      if (traitName === 'Agile' && (die === -3 || die === -6 || die === -9)) return false; // d8, d10, d12
      if (traitName === 'Finesse' && (die === -6 || die === -9)) return false; // d10, d12
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
    showCopyNotice(message) {
      this.copyNotice = message;
      if (this.copyNoticeTimer) clearTimeout(this.copyNoticeTimer);
      this.copyNoticeTimer = setTimeout(() => {
        this.copyNotice = '';
        this.copyNoticeTimer = null;
      }, 1700);
    },
    copyToClipboard(text) {
      if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text);
      }

      return new Promise((resolve, reject) => {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        try {
          const success = document.execCommand('copy');
          document.body.removeChild(textarea);
          if (success) resolve();
          else reject(new Error('Copy command failed'));
        } catch (err) {
          document.body.removeChild(textarea);
          reject(err);
        }
      });
    },
    async copyTraitsToClipboard(formKey) {
      const isRangedForm = formKey === 'ranged';
      const form = isRangedForm ? this.rangedForm : this.meleeForm;
      const traitsText = this.getFormTraits(form, isRangedForm).join(', ');
      try {
        await this.copyToClipboard(traitsText);
        this.showCopyNotice('Traits copied to clipboard');
      } catch (error) {
        this.showCopyNotice('Unable to copy traits on this browser');
      }
    },
    getTraitClass(t, formKey, pointKey, group, baseDamage, die) {
      const target = formKey === 'melee' ? this.meleeForm : this.rangedForm;
      const isSelected = target.traits[pointKey].includes(t);
      const isAllowed = this.isTraitAllowed(t, group, baseDamage, die);
      return {
        'selected-trait': isSelected && isAllowed,
        'illegal-selected-trait': isSelected && !isAllowed,
        'btn-outline-secondary opacity-75': !isSelected && isAllowed,
        'opacity-25 pointer-none': !isSelected && !isAllowed
      };
    },
    formatPointLabel(key) {
      return key === 'onePoint' ? '1-Point' : key === 'twoPoint' ? '2-Point' : '3-Point';
    },
    resetBuilder() {
      this.isResettingBuilder = true;
      this.modeStateStore = {
        melee: this.getDefaultStateForMode('melee'),
        ranged: this.getDefaultStateForMode('ranged'),
        combination: this.getDefaultStateForMode('combination')
      };
      this.range = 'melee';
      this.applyState(this.modeStateStore.melee, 'melee');
      this.$nextTick(() => {
        this.isResettingBuilder = false;
      });
    }
  }
};
</script>

<style scoped>
#app {
  border-radius: 12px;
  padding-top: 0.75rem;
  background: #111827;
  color: #e5e7eb;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.builder-card {
  background: #182334;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 1rem;
}

.builder-card-form {
  padding: 1rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: #bfdbfe;
}

.section-title-sm {
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.01em;
}

.mode-toggle-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.85rem 1.25rem;
}

.mode-toggle-row .form-check {
  margin-right: 0;
}

.switch-notice {
  color: #93c5fd;
  font-size: 0.85rem;
  line-height: 1.2;
}

.copy-notice {
  color: #86efac;
  font-size: 0.85rem;
  line-height: 1.2;
}

.summary-copy-btn {
  padding: 0.14rem 0.5rem;
  font-size: 0.72rem;
  line-height: 1.2;
}

.builder-card .section-title-sm.mb-3 {
  margin-bottom: 0.75rem !important;
}

.builder-card .control-row.mb-3 {
  margin-bottom: 0.8rem !important;
}

.builder-card .trait-block {
  margin-bottom: 0.8rem !important;
}

.builder-card .trait-block:last-child {
  margin-bottom: 0 !important;
}

.selected-trait {
  background-color: #198754 !important;
  color: white !important;
  border-color: #198754 !important;
  font-weight: bold !important;
}
.illegal-selected-trait {
  background-color: #dc3545 !important;
  color: white !important;
  border-color: #dc3545 !important;
  font-weight: bold !important;
}
.pointer-none { pointer-events: none; }

.trait-button-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem 0.7rem;
}

.trait-button-grid .btn {
  border-radius: 999px;
  padding: 0.35rem 0.7rem;
  line-height: 1.2;
}

.control-row {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 0.9rem 1rem;
}

.control-field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 170px;
  flex: 1 1 220px;
  font-size: 0.95rem;
}

.control-field-sm {
  min-width: 140px;
  flex-basis: 170px;
}

.control-field .form-select {
  min-height: 2.2rem;
}

#app hr {
  border-color: #374151;
  opacity: 1;
}

#app .text-primary {
  color: #93c5fd !important;
}

#app .text-success {
  color: #86efac !important;
}

#app .form-select,
#app .form-check-input,
#app .btn-outline-secondary,
#app .btn-outline-danger {
  background-color: #1f2937;
  color: #e5e7eb;
  border-color: #4b5563;
}

#app .form-select:focus,
#app .form-check-input:focus,
#app .btn:focus {
  box-shadow: 0 0 0 0.2rem rgba(96, 165, 250, 0.25);
}

#app .form-check-input:checked {
  background-color: #3b82f6;
  border-color: #3b82f6;
}

#app .progress {
  background-color: #374151;
}

#app .bg-light {
  background-color: #1f2937 !important;
  color: #e5e7eb;
  border-color: #4b5563 !important;
}

#app .shadow-sm {
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.15) !important;
}

/* Keep dimmed trait buttons readable on dark backgrounds. */
#app .btn.opacity-75 {
  opacity: 0.9 !important;
}

#app .opacity-25.pointer-none {
  opacity: 0.6 !important;
  color: #cbd5e1 !important;
  border-color: #64748b !important;
}

/* Mobile responsive adjustments */
@media (max-width: 576px) {
  h1 {
    font-size: 1.5rem;
  }
  
  h3 {
    font-size: 1.2rem;
  }
  
  .btn {
    padding: 0.4rem 0.8rem;
    font-size: 0.85rem;
  }

  .builder-card,
  .builder-card-form {
    padding: 0.8rem;
  }

  .builder-card .control-row.mb-3,
  .builder-card .trait-block {
    margin-bottom: 0.65rem !important;
  }

  .section-title,
  .section-title-sm {
    font-size: 0.95rem;
  }

  .mode-toggle-row {
    gap: 0.55rem 0.8rem;
  }

  .trait-button-grid {
    gap: 0.45rem 0.5rem;
  }

  .trait-button-grid .btn {
    padding: 0.32rem 0.58rem;
    font-size: 0.8rem;
  }
  
  .form-select {
    font-size: 0.9rem;
  }

  .control-row {
    gap: 0.65rem;
  }

  .control-field,
  .control-field-sm {
    min-width: 100%;
    flex-basis: 100%;
    font-size: 0.92rem;
  }
  
  .progress {
    font-size: 0.8rem;
  }
  
  .d-flex.flex-wrap {
    gap: 0.5rem !important;
  }
  
  label {
    font-size: 0.95rem;
  }
}

@media (max-width: 768px) {
  .row {
    gap: 1rem;
  }
}
</style>

<style>
body.dark-mode {
  background: #0b1220;
  color: #e5e7eb;
}
</style>