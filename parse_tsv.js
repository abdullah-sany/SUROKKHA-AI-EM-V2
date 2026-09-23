import fs from 'fs';

const tsv = fs.readFileSync('hospitals.tsv', 'utf8');
const lines = tsv.trim().split('\n');

const facilities = [];
// Assuming existing hf-1 to hf-8 are in server.ts
// We will just read the current hospitals from src/data/hospitals.json
let existing = [];
if (fs.existsSync('./src/data/hospitals.json')) {
  existing = JSON.parse(fs.readFileSync('./src/data/hospitals.json', 'utf8'));
}

for (const line of lines) {
  if (!line.trim()) continue;
  const parts = line.split('|');
  const [ext_id, name, type, div, dist, area, owner, phone, address, email] = parts;
  
  facilities.push({
    id: 'hf-import-' + ext_id,
    name: name,
    nameBn: null,
    agency: null,
    facilityType: type,
    division: div,
    district: dist,
    area: area,
    ownership: owner,
    phone: phone,
    emergencyPhone: null,
    verified: true,
    source: 'all_hospitals_list_19-Aug(2).pdf',
    lastVerifiedAt: null,
    active: true,
    address: address,
    email: email
  });
}

const allFacilities = [...existing.filter(f => parseInt(f.id.replace('hf-import-','')) <= 25), ...facilities];

fs.writeFileSync('./src/data/hospitals.json', JSON.stringify(allFacilities, null, 2));
console.log(`Now we have ${allFacilities.length} imported hospitals.`);
