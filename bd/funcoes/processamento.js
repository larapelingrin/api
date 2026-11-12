function sanitizarTexto(valor) {
  if (typeof valor !== 'string') return '';
  return valor.trim().toLocaleUpperCase('pt-BR');
}

function obterDataAtual() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const dia = String(hoje.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

function verificarAlertaTempo(minutos) {
  return Number(minutos) > 15;
}

function processarRegistro(dados, registroExistente = {}) {
  const mesclado = { ...registroExistente, ...dados };

  const matricula = sanitizarTexto(mesclado.matricula);
  const nome = sanitizarTexto(mesclado.nome);
  const turma = sanitizarTexto(mesclado.turma);
  const data = mesclado.data ? String(mesclado.data).trim() : obterDataAtual();
  const presente = mesclado.presente === undefined ? true : Boolean(mesclado.presente);

  let minutosFora = mesclado.minutosFora !== undefined ? Number(mesclado.minutosFora) : 0;
  let motivoSaida = mesclado.motivoSaida !== undefined ? sanitizarTexto(mesclado.motivoSaida) : '';

  // Regra adicional: aluno ausente
  if (!presente) {
    minutosFora = 0;
    motivoSaida = 'AUSENTE';
  }

  // Regra de ouro: alertaTempo sempre calculado pela aplicação
  const alertaTempo = verificarAlertaTempo(minutosFora);

  return {
    ...(registroExistente.id !== undefined && { id: registroExistente.id }),
    matricula,
    nome,
    turma,
    data,
    presente,
    motivoSaida,
    minutosFora,
    alertaTempo
  };
}

module.exports = {
  sanitizarTexto,
  obterDataAtual,
  verificarAlertaTempo,
  processarRegistro
};
