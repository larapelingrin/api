import express from "express";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";        
                                                            
const express = require('express');
const { lerRegistros, salvarRegistros } = require('./funcoes/manipulador_arquivo');
const { processarRegistro, sanitizarTexto } = require('./funcoes/processamento');

const app = express();
const PORTA = 3000;

app.use(express.json());

// Função auxiliar para validar ID inteiro positivo
function validarId(idParam) {
  const id = Number(idParam);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// GET /alunos (com suporte a ?turma=3A e ?alerta=true)
app.get('/alunos', (req, res) => {
  try {
    let registros = lerRegistros();
    const { turma, alerta } = req.query;

    if (turma) {
      const turmaFiltro = sanitizarTexto(turma);
      registros = registros.filter((r) => r.turma === turmaFiltro);
    }

    if (alerta !== undefined) {
      const alertaBool = alerta === 'true';
      registros = registros.filter((r) => r.alertaTempo === alertaBool);
    }

    return res.status(200).json(registros);
  } catch (erro) {
    return res.status(500).json({ erro: erro.message });
  }
});

// GET /alunos/:id
app.get('/alunos/:id', (req, res) => {
  const id = validarId(req.params.id);
  if (!id) {
    return res.status(400).json({ erro: 'O ID informado deve ser um número inteiro positivo.' });
  }

  const registros = lerRegistros();
  const aluno = registros.find((r) => r.id === id);

  if (!aluno) {
    return res.status(404).json({ erro: `Registro com ID ${id} não encontrado.` });
  }

  return res.status(200).json(aluno);
});

// POST /alunos
app.post('/alunos', (req, res) => {
  const { matricula, nome, turma, minutosFora } = req.body;

  if (!matricula || !String(matricula).trim() || !nome || !String(nome).trim() || !turma || !String(turma).trim()) {
    return res.status(400).json({
      erro: 'Os campos matricula, nome e turma são obrigatórios.'
    });
  }

  if (minutosFora !== undefined && (isNaN(Number(minutosFora)) || Number(minutosFora) < 0)) {
    return res.status(400).json({
      erro: 'O campo minutosFora deve ser um número maior ou igual a zero.'
    });
  }

  try {
    const registros = lerRegistros();
    const proximoId = registros.length > 0 ? Math.max(...registros.map((r) => r.id)) + 1 : 1;

    const dadosProcessados = processarRegistro(req.body);
    const novoRegistro = {
      id: proximoId,
      ...dadosProcessados
    };

    registros.push(novoRegistro);
    salvarRegistros(registros);

    return res.status(201).json(novoRegistro);
  } catch (erro) {
    return res.status(500).json({ erro: erro.message });
  }
});

// PATCH /alunos/:id/retorno
app.patch('/alunos/:id/retorno', (req, res) => {
  const id = validarId(req.params.id);
  if (!id) {
    return res.status(400).json({ erro: 'O ID informado deve ser um número inteiro positivo.' });
  }

  const { minutosFora } = req.body;
  if (minutosFora === undefined || typeof minutosFora !== 'number' || isNaN(minutosFora) || minutosFora < 0) {
    return res.status(400).json({
      erro: 'Informe um valor numérico válido e não negativo para minutosFora.'
    });
  }

  try {
    const registros = lerRegistros();
    const indice = registros.findIndex((r) => r.id === id);

    if (indice === -1) {
      return res.status(404).json({ erro: `Registro com ID ${id} não encontrado.` });
    }

    const registroAtualizado = processarRegistro({ minutosFora }, registros[indice]);
    registros[indice] = registroAtualizado;

    salvarRegistros(registros);
    return res.status(200).json(registroAtualizado);
  } catch (erro) {
    return res.status(500).json({ erro: erro.message });
  }
});

// DELETE /alunos/:id
app.delete('/alunos/:id', (req, res) => {
  const id = validarId(req.params.id);
  if (!id) {
    return res.status(400).json({ erro: 'O ID informado deve ser um número inteiro positivo.' });
  }

  try {
    const registros = lerRegistros();
    const indice = registros.findIndex((r) => r.id === id);

    if (indice === -1) {
      return res.status(404).json({ erro: `Registro com ID ${id} não encontrado.` });
    }

    const [registroExcluido] = registros.splice(indice, 1);
    salvarRegistros(registros);

    return res.status(200).json({
      mensagem: 'Registro removido com sucesso.',
      registro: registroExcluido
    });
  } catch (erro) {
    return res.status(500).json({ erro: erro.message });
  }
});

app.listen(PORTA, () => {
  console.log(`Servidor rodando em http://localhost:${PORTA}`);
});
