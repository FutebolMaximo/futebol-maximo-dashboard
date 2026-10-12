const fs = require('fs');

const FILE_PATH = 'C:\\Users\\jose\\Desktop\\Suporte Knime\\Futebol Maximo\\DB 2026.csv';

if (!fs.existsSync(FILE_PATH)) {
  console.log('Arquivo não encontrado:');
  console.log(FILE_PATH);
  process.exit(1);
}

const buffer = fs.readFileSync(FILE_PATH);
const text = buffer.toString('utf8');

console.log('Tamanho do arquivo em bytes:');
console.log(buffer.length);

console.log('Primeiros 30 bytes em hexadecimal:');
console.log(buffer.slice(0, 30).toString('hex'));

console.log('Primeiros 1000 caracteres:');
console.log(text.slice(0, 1000));