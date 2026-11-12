const fs = require('fs');
const path = require('path');

const CAMINHO_ARQUIVO = path.join(__dirname, '..', 'bd', 'registros_alunos.json');

function lerRegistros() {
  try {
    if (!fs.existsSync(CAMINHO_ARQUIVO)) {
      fs.writeFileSync(CAMINHO_ARQUIVO, '[]', 'utf-8');
      return [];
    }
    const conteudo = fs.readFileSync(CAMINHO_ARQUIVO, 'utf-8');
    return JSON.parse(conteudo || '[]');
  } catch (erro) {
    throw new Error('Erro ao ler o arquivo de registros: ' + erro.message);
  }
}

function salvarRegistros(registros) {
  try {
    const jsonFormatado = JSON.stringify(registros, null, 2);
    fs.writeFileSync(CAMINHO_ARQUIVO, jsonFormatado, 'utf-8');
  } catch (erro) {
    throw new Error('Erro ao salvar o arquivo de registros: ' + erro.message);
  }
}

module.exports = {
  lerRegistros,
  salvarRegistros
};
