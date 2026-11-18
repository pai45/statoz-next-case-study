"""Copy reviewed presentation inputs; source projects are never modified."""
from pathlib import Path
import shutil, json, hashlib
root=Path(__file__).resolve().parents[1]
workspace=root.parent
designer=Path('C:/Users/priya/OneDrive/Desktop/StatOz Designer')
assets=root/'public/assets'; assets.mkdir(parents=True,exist_ok=True)
records=[]
def copy(source,dest,description):
    dest.parent.mkdir(parents=True,exist_ok=True)
    shutil.copy2(source,dest)
    records.append({'file':str(dest.relative_to(root)).replace('\\','/'),'source':str(source),'description':description,'sha256':hashlib.sha256(dest.read_bytes()).hexdigest()})
v6=json.loads((designer/'build/statoz-video/.checks/statoz-investor-demo-v6-20261102.json').read_text(encoding='utf-8'))
for alias,asset_id in v6['assets'].items():
    matches=[p for p in (designer/'storage/assets').glob(asset_id+'.*') if p.suffix in ['.png','.jpg','.webp','.mp4']]
    if not matches: raise RuntimeError('Missing video asset '+alias)
    src=matches[0]; copy(src,assets/(alias+src.suffix),'Source-verified investor demo capture / footage')
    meta=designer/'storage/assets'/(asset_id+'.json')
    if meta.exists(): records[-1]['provenance']=json.loads(meta.read_text(encoding='utf-8')).get('source','')
copy(designer/'build/statoz-video/statoz-investor-demo-v7-beat-synced-1920x1080.mp4',assets/'investor-demo.mp4','Investor video v7; 3 November 2026. Music: Digital Clouds by Alejandro Magana (A. M.), Mixkit Stock Music Free License.')
copy(workspace/'statoz-investors/public/assets/brand/logo.png',assets/'logo.png','Existing StatOz brand logo; original proportions preserved')
for name in ['orbitron-latin-variable.woff2','space-grotesk-variable.ttf','space-grotesk-OFL.txt']:
    source=workspace/'statoz-game-studio/src/app/fonts'/name
    if source.exists():copy(source,assets/name,'Existing locally hosted brand typeface / license')
font_license=workspace/'statoz-website/public/assets/fonts/Orbitron-OFL.txt'
for source in (workspace/'statoz-website/public').rglob('*OFL*'):
    if source.is_file():copy(source,assets/('license-'+source.name),'Existing font license')
copy(workspace/'statoz-products/src/design-system/styles/tokens.css',assets/'statoz-tokens.css','Vendored StatOz semantic tokens')
copy(workspace/'statoz-games/dist/site/games/cricketer/cricketer-player.glb',assets/'cricketer.glb','Actual StatOz Cricketer player model for interactive studio preview')
copy(workspace/'statoz-games/dist/site/games/cricketer/PLAYER-LICENSE.txt',assets/'PLAYER-LICENSE.txt','Player model attribution; retain with packaged model')
copy(workspace/'statoz-games/dist/site/games/cricketer/wicket.glb',assets/'wicket.glb','Actual wicket model')
copy(workspace/'statoz-games/.cache/game-assets/seed/portfolio-formula-car.glb',assets/'formula-car.glb','Actual Formula car model')
copy(Path('C:/Users/priya/Downloads/StatOz by the Numbers (Nov 2026) (1).pdf'),root/'public/data/statoz-by-the-numbers-nov-2026.pdf','User-supplied platform report; as of 2 November 2026; unchanged')
deck=Path('C:/Users/priya/AppData/Local/StatOz/next/investors/projects/0cbb42ce-1e5a-41c5-9219-3529765a2f81.json')
raw=json.loads(deck.read_text(encoding='utf-8'))
snapshot={'name':raw['name'],'updatedAt':raw['updatedAt'],'brief':raw['brief'],'slides':raw['pages']}
(root/'public/data/pitch-deck-source.json').write_text(json.dumps(snapshot,indent=2),encoding='utf-8')
def ignore(directory,names):
    return [n for n in names if n in ['_game-assets','downloads','.git','node_modules'] or Path(n).suffix in ['.apk','.ipa','.zip','.statozpack']]
for product in ['sports','games']:
    source=workspace/f'statoz-{product}-web/out'; dest=root/f'demos/{product}'
    print('Packaging',product,flush=True);shutil.copytree(source,dest,dirs_exist_ok=True,ignore=ignore)
    if product=='games':
        for chunk in dest.rglob('*.js'):
            text=chunk.read_text(encoding='utf-8')
            changed=text.replace('https://pai45.github.io/statoz-next-games-web/game-library/catalogue.json','http://127.0.0.1:4413/statoz-next-games-web/game-library/catalogue.json').replace('http://127.0.0.1:4405/catalogue.json','http://127.0.0.1:4413/statoz-next-games-web/game-library/catalogue.json')
            if changed!=text:chunk.write_text(changed,encoding='utf-8')
        shutil.copytree(workspace/'statoz-games/dist/site',dest/'game-library',dirs_exist_ok=True)
    records.append({'file':f'demos/{product}','source':str(source),'description':'Existing static product export, copied without downloads or superseded _game-assets. Games catalogue URLs localized in the copied JS; unchanged game-library bundle hashes retained.'})
(root/'public/data/asset-provenance.json').write_text(json.dumps(records,indent=2),encoding='utf-8')
print('Packaged media, fonts, report, models, deck and product builds.',flush=True)
import subprocess
subprocess.run(['node',str(root/'scripts/adapt-demos.mjs')],check=True)
