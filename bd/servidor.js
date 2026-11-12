//imports
import express from "express";
import { listarTodos, salvarTodos } from "./MANIPULADOR/manipulador_arquivo.js";

const app = express(); //criação da instancia do express
const PORT = 3000;
app.use(express.json()); //convertendo de maneira mais direta (middleware)

//Logica das rotas
app.get("/", (req, res) => {
  res.send("Bem vindo ao sistema de cadastro de alunos");
});

//Get /alunos - Listar todos os alunos
app.get("/alunos", async (req, res) => {
  try {
    const alunos = await listarTodos();
    return res.status(200).json(alunos);
  } catch (error) {
    //verificação interna de erro
    console.log("Erro ao listar alunos: " + error.message);

    //resposta de erro para o cliente
    res.status(500).send("Erro ao listar alunos: " + error.message);
  }
});

//POST /alunos - Cadastrar um novo aluno
app.post("/aluno", async (req, res) => {
  try {
    //desestruturação dos dados recebidos no corpo da requisição
    const {
      id,
      matricula,
      nome,
      turma,
      data,
      presente,
      motivoSaida,
      minutosFora,
      alertaTempo,
    } = req.body;

    //validação de dados
    if (
      !id ||
      !matricula ||
      !nome ||
      !turma ||
      !data ||
      presente === undefined
    ) {
      return res
        .status(400)
        .send(
          "Dados incompletos. Por favor, forneça todos os campos obrigatórios.",
        );
    }

    //criação do objeto aluno
    const novoAluno = {
      id: Number(id),
      matricula,
      nome,
      turma,
      data,
      presente,
      motivoSaida: motivoSaida || null, // Se não fornecido, será nulo
      minutosFora: Number(minutosFora) || 0, // Se não fornecido, será 0
      alertaTempo: alertaTempo || false, // Se não fornecido, será falso
    };

    //leitura do arquivo existente
    const registrosAlunos = await listarTodos();
    registrosAlunos.push(novoAluno); //adicionando o novo aluno ao array existente

    //salvando o arquivo atualizado
    await salvarTodos(registrosAlunos);

    res.status(201).send("Aluno cadastrado com sucesso!");
  } 
  catch (error) {
    //verificação interna de erro
    console.log("Erro ao cadastrar aluno: " + error.message);

    //resposta de erro para o cliente
    res.status(500).send("Erro ao cadastrar aluno: " + error.message);
  }
});

//funções auxiliares
app.listen(PORT, () => {
  console.log("Está rodando na porta: ", PORT);
});

//DELETE /aluno/:id - Deletar um aluno pelo ID
app.delete("/aluno/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    //Leio os dados cadastrados
    const dados = await listarTodos();

     //Mantém apenas os itens com id diferente
    const dadosAtualizados = dados.filter(
      (aluno) => aluno.id !== id,
    );

     //verificar se deletou
    if (dadosAtualizados.length === dados.length) {
      return res.status(404).json({ erro: "Aluno não deletado" });
    }
    //Salvar a lista nova
    await salvarTodos(dadosAtualizados);

    //Mensagem de resposta para insomina falando que deu certo
    return res
      .status(200)
      .json({ mensagem: "Aluno excluído com sucesso" });

  }
   catch (error) {
    console.log("Erro ao deletar aluno: " + error.message);
    res.status(500).send("Erro ao deletar aluno: " + error.message);
  }
});

//PUT /aluno/:id - Atualizar um aluno pelo ID
app.put("/aluno/:id", async (req, res) => {
    try{
        const id = Number(req.params.id);

        //Leio os dados cadastrados
        const dados = await listarTodos();

        //Procuro o aluno pelo ID
        const alunoIndex = dados.findIndex((aluno) => aluno.id === id); 

        //Se não encontrar, retorna erro
        if (alunoIndex === -1) {
            return res.status(404).json({ erro: "Aluno não encontrado" });
        }

        //Atualiza os dados do aluno
        const alunoAtualizado = { ...dados[alunoIndex], ...req.body };
        dados[alunoIndex] = alunoAtualizado;

        //Salva a lista atualizada
        await salvarTodos(dados);

        //Mensagem de resposta para insomina falando que deu certo
        return res.status(200).json({ mensagem: "Aluno atualizado com sucesso", aluno: alunoAtualizado });
    }
    catch (error) {
    console.log("Erro ao atualizar aluno: " + error.message);
    res.status(500).send("Erro ao atualizar aluno: " + error.message);
  }
});