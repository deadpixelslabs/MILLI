import fs from 'node:fs';
import path from 'node:path';
import solc from 'solc';
const sources = {};
function add(name) {
  if (sources[name]) return;
  const full = name.startsWith('@') || name.startsWith('solady/') ? `node_modules/${name}` : name;
  const content = fs.readFileSync(full, 'utf8'); sources[name] = { content };
  for (const m of content.matchAll(/import\s+(?:[^;]*?from\s+)?["']([^"']+)["'];/g)) {
    add(m[1].startsWith('.') ? path.posix.normalize(path.posix.join(path.posix.dirname(name), m[1])) : m[1]);
  }
}
add('contracts/HazelsCTOFreemint.sol');
const input = { language:'Solidity', sources, settings:{ optimizer:{enabled:true,runs:200}, evmVersion:'paris', viaIR:true, outputSelection:{'*':{'*':['abi','evm.bytecode.object','evm.deployedBytecode.object','evm.deployedBytecode.immutableReferences']}} } };
const out = JSON.parse(solc.compile(JSON.stringify(input)));
for (const e of out.errors || []) { if(e.severity === 'error') throw Error(e.formattedMessage); console.warn(e.formattedMessage); }
const artifacts = {};
for (const name of ['HazelsRenderer','HazelsCTOFreemint']) {
  const c = out.contracts[`contracts/${name}.sol`][name];
  const runtime = c.evm.deployedBytecode.object;
  if(runtime.length/2>24576 || c.evm.bytecode.object.length/2>49152) throw Error(`Oversized ${name}`);
  artifacts[name] = { abi:c.abi, bytecode:'0x'+c.evm.bytecode.object, deployedBytecode:'0x'+runtime, immutableReferences:c.evm.deployedBytecode.immutableReferences };
  console.log(`${name}: runtime ${runtime.length/2} bytes`);
}
fs.mkdirSync('public/deployment',{recursive:true});fs.mkdirSync('src/generated',{recursive:true});
fs.writeFileSync('public/deployment/contracts.json', JSON.stringify(artifacts));
fs.writeFileSync('public/deployment/compiler-input.json', JSON.stringify(input));
fs.writeFileSync('src/generated/abi.json', JSON.stringify(artifacts.HazelsCTOFreemint.abi));
fs.writeFileSync('public/deployment/build.json', JSON.stringify({compiler:solc.version(),optimizerRuns:200,viaIR:true,evmVersion:'paris'}));
