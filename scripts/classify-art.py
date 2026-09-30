"""Author palette regions without editing any approved SVG geometry.
Requires picosvg==0.22.3 only when authoring regions; normal builds use the JSON.
"""
from pathlib import Path
from picosvg.svg_types import SVGPath
import xml.etree.ElementTree as E
import json, hashlib
files=['01-ink-hoodie.svg','02-indigo-denim.svg','03-braided-leather.svg']
bgs=[(155,146,134),(195,141,118),(102,121,141)]
result=[]
for pose,file in enumerate(files):
 raw=Path('art/approved',file).read_bytes(); root=E.fromstring(raw); classes=[]; colors={'h':[], 'o':[]}
 for i,p in enumerate(root):
  col=p.get('fill'); col='#'+''.join(c*2 for c in col[1:]) if len(col)==4 else col; rgb=tuple(int(col[j:j+2],16) for j in (1,3,5)); r,g,b=rgb
  group=''
  if i and max(abs(rgb[j]-bgs[pose][j]) for j in range(3))<9:group='b'
  elif i:
   box=SVGPath(d=p.get('d')).bounding_box();x=box.x+box.w/2;y=box.y+box.h/2
   skin=r>85 and r-g>12 and g-b>5
   face=(360<x<475 and 215<y<355) or (475<x<506 and 232<y<287)
   # Preserve the face, skin and hardware. Tint only existing illustrated material.
   if not skin and not face and max(rgb)<145:
    if pose==0:hair=y<352 or x<max(20,222-(y-350)*.47) or (320<x<364 and y<445) or (x>480 and y<445)
    elif pose==1:hair=y<390 or x<max(55,258-(y-390)*.51)
    else:hair=y<395 or (170<x<308 and y>350)
    if hair:group='h'
    elif y>395 and max(rgb)<125:group='o'
  if group in colors:
   if col not in colors[group]:colors[group].append(col)
   group+=format(colors[group].index(col),'03x')
  classes.append(group)
 result.append({'file':file,'sha256':hashlib.sha256(raw).hexdigest(),'classes':classes,'colors':colors})
 print(file,len(classes),{k:len(v) for k,v in colors.items()})
Path('art/regions.json').write_text(json.dumps(result,separators=(',',':'))+'\n')
