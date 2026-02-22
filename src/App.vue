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