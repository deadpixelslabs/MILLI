# Rebuild the registered face fragment without changing its visible vector paths.
# Optional artwork-authoring dependency: pip install picosvg==0.22.3
from pathlib import Path
from picosvg.svg import SVG
import re
s=Path('art/references/02-indigo-denim.svg').read_text()
body=re.sub(r'^<svg[^>]+>','',s).removesuffix('</svg>')
clip='M275 210Q289 205 303 225L337 220Q391 185 431 151L457 144Q491 144 492 192L498 245L479 267L455 284L471 290L455 305L444 335Q433 355 420 360Q409 365 397 354L395 407Q407 424 436 437L440 470Q354 504 247 421L289 401L293 349L269 305L260 270Q251 249 265 225Z'
svg=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 768 840"><defs><clipPath id="crop"><path d="{clip}"/></clipPath></defs><g transform="translate(17 50)" clip-path="url(#crop)">{body}</g></svg>'
pico=SVG.fromstring(svg).topicosvg(ndigits=2)
Path('art/approved-face.svg').write_text(pico.tostring())
print('Cropped face:',len(pico.tostring()),'bytes')
