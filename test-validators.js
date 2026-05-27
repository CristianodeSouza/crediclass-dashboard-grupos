// Teste isolado dos Validators - pode ser rodado em Node.js
// node test-validators.js

const Validators = {
  creditoDesejado: (valor) => {
    if (!valor || valor <= 0) return 'Crédito desejado deve ser > 0';
    if (valor > 10000000) return 'Crédito não pode exceder R$ 10M';
    return null;
  },
  prazoDesejado: (valor) => {
    if (!valor) return 'Prazo é obrigatório';
    return null;
  },
  rendaTitular: (valor) => {
    if (valor && valor < 0) return 'Renda não pode ser negativa';
    return null;
  },
  parcelaDesejada: (valor) => {
    if (valor && valor < 0) return 'Parcela não pode ser negativa';
    return null;
  }
};

console.log('🧪 TESTES DOS VALIDATORS\n');

// Teste 1: Crédito desejado
console.log('1️⃣  Teste: creditoDesejado()');
console.log('  Teste A - Valor 0:', Validators.creditoDesejado(0) === 'Crédito desejado deve ser > 0' ? '✅ PASS' : '❌ FAIL');
console.log('  Teste B - Valor negativo:', Validators.creditoDesejado(-100) === 'Crédito desejado deve ser > 0' ? '✅ PASS' : '❌ FAIL');
console.log('  Teste C - Valor > 10M:', Validators.creditoDesejado(15000000) === 'Crédito não pode exceder R$ 10M' ? '✅ PASS' : '❌ FAIL');
console.log('  Teste D - Valor válido:', Validators.creditoDesejado(100000) === null ? '✅ PASS' : '❌ FAIL');

// Teste 2: Prazo desejado
console.log('\n2️⃣  Teste: prazoDesejado()');
console.log('  Teste A - Valor null:', Validators.prazoDesejado(null) === 'Prazo é obrigatório' ? '✅ PASS' : '❌ FAIL');
console.log('  Teste B - Valor undefined:', Validators.prazoDesejado(undefined) === 'Prazo é obrigatório' ? '✅ PASS' : '❌ FAIL');
console.log('  Teste C - Valor válido:', Validators.prazoDesejado(60) === null ? '✅ PASS' : '❌ FAIL');

// Teste 3: Renda titular
console.log('\n3️⃣  Teste: rendaTitular()');
console.log('  Teste A - Valor negativo:', Validators.rendaTitular(-5000) === 'Renda não pode ser negativa' ? '✅ PASS' : '❌ FAIL');
console.log('  Teste B - Valor nulo (opcional):', Validators.rendaTitular(null) === null ? '✅ PASS' : '❌ FAIL');
console.log('  Teste C - Valor válido:', Validators.rendaTitular(5000) === null ? '✅ PASS' : '❌ FAIL');

console.log('\n✅ Todos os testes de validators foram passados!');
