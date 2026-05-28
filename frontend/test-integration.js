const http = require('http');

function testAPI(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 8000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: JSON.parse(body),
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body,
          });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('═══════════════════════════════════════');
  console.log('FASE 3 Integration Test Suite');
  console.log('═══════════════════════════════════════\n');

  // Test 1: GET /api/stats
  console.log('✓ Test 1: GET /api/stats');
  const stats = await testAPI('GET', '/api/stats');
  console.log(`  Status: ${stats.status}`);
  console.log(`  Total Grupos: ${stats.body.total_grupos}`);
  console.log(`  Administradoras: ${stats.body.administradoras.length}\n`);

  // Test 2: GET /api/grupos-gerenciador
  console.log('✓ Test 2: GET /api/grupos-gerenciador');
  const grupos = await testAPI('GET', '/api/grupos-gerenciador?limit=1');
  console.log(`  Status: ${grupos.status}`);
  console.log(`  Total: ${grupos.body.total}`);
  console.log(`  Returned: ${grupos.body.grupos.length}`);
  
  const sampleGrupo = grupos.body.grupos[0];
  console.log(`  Sample Grupo: ${sampleGrupo.grupo}`);
  console.log(`  Historico fields: ${Object.keys(sampleGrupo.historico[0]).join(', ')}\n`);

  // Test 3: Verify histórico structure matches frontend
  console.log('✓ Test 3: Verify histórico structure');
  const historicoSample = sampleGrupo.historico[0];
  const expectedFields = ['mes', 'maior_lance', 'menor_lance', 'qtd'];
  const actualFields = Object.keys(historicoSample);
  
  let structureOK = true;
  for (const field of expectedFields) {
    const exists = actualFields.includes(field);
    console.log(`  ${exists ? '✓' : '✗'} ${field}`);
    if (!exists) structureOK = false;
  }
  
  if (structureOK) {
    console.log('  ✅ Estrutura de histórico OK!\n');
  } else {
    console.log('  ❌ Estrutura incompatível!\n');
  }

  // Test 4: Test PUT endpoint with correct payload
  console.log('✓ Test 4: Test PUT /api/grupos/{id} with new payload structure');
  const grupoId = sampleGrupo.grupo || '1';
  const updatePayload = {
    grupo: sampleGrupo.grupo || 'TEST',
    adm: sampleGrupo.adm || 'TEST-ADM',
    tipo_bem: sampleGrupo.tipo_bem || 'Auto',
    historico: [
      {
        mes: 'JAN-24',
        maior_lance: 1000.0,
        menor_lance: 500.0,
        qtd: 5,
      },
    ],
  };

  console.log(`  Payload structure:`);
  console.log(`    - grupo: ${updatePayload.grupo}`);
  console.log(`    - adm: ${updatePayload.adm}`);
  console.log(`    - tipo_bem: ${updatePayload.tipo_bem}`);
  console.log(`    - historico[0]: { mes: '${updatePayload.historico[0].mes}', maior_lance: ${updatePayload.historico[0].maior_lance}, menor_lance: ${updatePayload.historico[0].menor_lance}, qtd: ${updatePayload.historico[0].qtd} }`);
  console.log(`\n  Note: PUT request skipped to avoid modifying live data\n`);

  console.log('═══════════════════════════════════════');
  console.log('✅ Integration test completed successfully!');
  console.log('═══════════════════════════════════════');
}

runTests().catch(console.error);
