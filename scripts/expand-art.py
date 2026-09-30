"""Trace the six existing source portraits and author material regions. One-time authoring tool."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from PIL import Image, ImageDraw
from picosvg.svg_types import SVGPath
from picosvg.svg_transform import Affine2D
import xml.etree.ElementTree as E
import vtracer,json,hashlib,sys
names=['04-bob-bomber','05-fringe-varsity','06-wolf-blazer','07-pony-cardigan','08-waves-utility','09-bun-windbreaker']
source=Image.open(sys.argv[1]).convert('RGB')
work=Path('/tmp/hazels-traits-authoring');work.mkdir(exist_ok=True)

def build(i):
 x=(i%3)*512;y=(i//3)*512
 tile=source.crop((x,y,x+512,y+512)); bg=tile.getpixel((12,12)); marker=(255,0,255)
 for seed in [(0,0),(511,0),(0,128),(511,128),(0,256),(511,256),(0,384),(511,384)]:
  color=tile.getpixel(seed)
  if sum(abs(color[k]-bg[k]) for k in range(3))<75:ImageDraw.floodfill(tile,seed,marker,thresh=75)
 png=work/(names[i]+'.png');tile.save(png)
 svg=work/(names[i]+'.svg')
 vtracer.convert_image_to_svg_py(str(png),str(svg),colormode='color',hierarchical='stacked',mode='spline',filter_speckle=4,color_precision=6,layer_difference=16,corner_threshold=60,length_threshold=4,max_iterations=10,splice_threshold=45,path_precision=2)
 root=E.fromstring(svg.read_text()); out=E.Element('svg',{'xmlns':'http://www.w3.org/2000/svg','width':'724','height':'724','viewBox':'0 0 724 724'})
 classes=[];colors={'h':[],'o':[]}; scale=724/512
 for p in root:
  if not p.tag.endswith('path'):continue
  shape=SVGPath(d=p.get('d'));tf=Affine2D.fromstring(p.get('transform',''))
  shape=shape.apply_transform(tf).apply_transform(Affine2D.identity().scale(scale));d=shape.round_floats(2).as_path().d
  col=p.get('fill');col='#'+''.join(c*2 for c in col[1:]) if len(col)==4 else col
  r,g,b=rgb=tuple(int(col[j:j+2],16) for j in (1,3,5))
  box=shape.bounding_box();cx=box.x+box.w/2;cy=box.y+box.h/2;group=''
  skin=r>85 and r-g>12 and g-b>5
  face=(340<cx<530 and 180<cy<390)
  if r>230 and b>230 and g<30:
   group='b';col='#'+''.join(f'{v:02x}' for v in bg)
  elif not skin and not face:
   hair=cy<345 or (i in (1,2,4) and cy<475 and cx<320) or (i==3 and cx<250 and cy<565)
   if hair:group='h'
   elif cy>390:group='o'
  if group in colors:
   if col not in colors[group]:colors[group].append(col)
   group+=format(colors[group].index(col),'03x')
  E.SubElement(out,'path',{'fill':col,'d':d});classes.append(group)
 raw=E.tostring(out,encoding='unicode',short_empty_elements=True)
 filename=names[i]+'.svg';Path('art/expanded',filename).write_text(raw)
 print(filename,len(classes),len(raw),{k:len(v) for k,v in colors.items()},flush=True)
 return {'file':filename,'directory':'expanded','sha256':hashlib.sha256(raw.encode()).hexdigest(),'classes':classes,'colors':colors,'background':'#'+''.join(f'{v:02x}' for v in bg)}
with ThreadPoolExecutor(max_workers=6) as ex:regions=list(ex.map(build,range(6)))
Path('art/expanded/regions.json').write_text(json.dumps(regions,separators=(',',':'))+'\n')
