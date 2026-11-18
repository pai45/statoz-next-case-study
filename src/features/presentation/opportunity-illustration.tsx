import { sitePath } from '../../hosting';
type Habit='follow'|'predict'|'play';
const descriptions:Record<Habit,string>={follow:'An illuminated stadium and match timeline illustrate following the action.',predict:'Three outcomes lead to a selected and locked prediction using virtual coins.',play:'An arcade controller, basketball and archery target illustrate everyday sports play.'};
/** Original editable SVG artwork, separate from the live source product screens. */
export function OpportunityIllustration({habit}:{habit:Habit}){
 return <img className={'habit-illustration habit-'+habit} src={sitePath('/assets/investor-artifacts/')+habit+'.svg'} alt={descriptions[habit]}/>;
}
