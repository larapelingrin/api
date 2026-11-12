//trazer a lista

//saber qual é o ultimo id

//somar +1 pra ser o proximo id

//return
import {listarTodos} from "../MANIPULADOR/manipulador_arquivo.js";
export async function gerarNovoId(){
    const registroAlunos = await listarTodos();
//pegar Ids existentes
const ids= registroAlunos.map((aluno)=> aluno.id);
const novoID = Math.max(...ids) + 1;
return novoID
}