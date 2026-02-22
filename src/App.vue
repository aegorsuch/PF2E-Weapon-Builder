computed: {
    isMelee () {
      return this.range === 'melee';
    },
    total () {
      // 1. Start with the "Bonus Point"
      let bonusPoint = 2;

      // 2. Calculate the "Cost" of the base weapon
      let baseCost = this.adjustements.proficiency + this.adjustements.die + this.adjustements.hands;
      
      // 3. Apply Ranged penalties if applicable
      if(!this.isMelee) {
        baseCost = baseCost - 3 + this.adjustements.reload + this.adjustements.volley + this.adjustements.range;
      }

      // 4. Subtract the cost of selected traits
      let traitsCost = this.traits.onePoint.length + 
                       this.traits.twoPoint.length * 2 + 
                       this.traits.threePoint.length * 3;

      // Final Math: Bonus + Base Stats - Traits
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