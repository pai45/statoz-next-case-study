import {FilterChips} from '../../design-system/components/navigation/filter-chips';
import type {Chapter} from '../../content';
import type {usePresentation} from '../../session';
export function GameLaunchControls({chapter,presentation}:{chapter:Chapter;presentation:ReturnType<typeof usePresentation>}){
 return <section className="game-launch-controls" aria-label="Games presentation controls"><div className="eyebrow">CHOOSE A STARTING PAGE</div><FilterChips label="Launch a real game" value={presentation.state.target} items={(chapter.targets||[]).map((target,id)=>({id,label:target.label}))} onChange={target=>presentation.update({target})}/><p>Explore the real app inside the phone. Play in the investor window while sharing it. These shortcuts open the selected page in both presentation views.</p></section>;
}
