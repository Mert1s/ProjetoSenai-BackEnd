const con = require('./dbmysql');
const express = require('express')
const bodyparser = require('body-parser');
const { request } = require('express');
const app = express()
const cors = require('cors');

con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
});
app.use(cors({ origin: '*' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/dados', (request, response, next) => {
    const id = request.query
    console.log(request.params)
        if (JSON.stringify(id) == "{}")
        con.query("SELECT * FROM pessoa as p join endereco as e on e.pessoa_id = p.idpessoa order by p.idpessoa asc", function (err, result, fields) {
            if (err) throw err;
            response.send(result);
        });
    else {
        con.query(`SELECT * FROM pessoa left join endereco on endereco.pessoa_id = pessoa.idpessoa where idpessoa = ${request.query.idpessoa}`, function (err, result, fields) {
            if (err) throw err;
            response.send(result);
        });
    }
})

app.post('/dados', (request, response) => {
    console.log(request.body)
    const req = request.body;
    const { endereco } = req
    const cep = req.cep
    const sql = `insert into pessoa (nome,sobrenome,telefone,email) values ("${req.nome}", "${req.sobrenome}", "${req.telefone}", "${req.email}")`;

    con.query(sql, function (err, result) {
        if (err) { response.send(false); throw err; }
        const sql2 = `INSERT INTO endereco (cep, logradouro, numero, bairro, localidade, complemento,uf, pessoa_id) VALUES ("${String(endereco.cep).replace('-', '')}", "${endereco.logradouro}", "${String(endereco.numero).replace(undefined, '')}", "${endereco.bairro}", "${endereco.localidade}", "${endereco.complemento}", "${endereco.uf}", ${result.insertId});`
        if (!!result.affectedRows == true)
            con.query(sql2, function (err, result) {
                if (err) { response.send(false); throw err; };
                response.send(true)
            })
        else {
            response.send(false)
        }
    });
})

app.put('/dados', (request, response) => {
    const { endereco } = request.body
    const sql1 = `UPDATE PESSOA SET NOME = "${request.body.nome}", SOBRENOME = "${request.body.sobrenome}", TELEFONE = "${request.body.telefone}", EMAIL= "${request.body.email}" WHERE idpessoa = ${request.body.idpessoa}`
    const sql2 = `UPDATE ENDERECO SET cep = "${String(endereco.cep).replace('-', '')}", logradouro = "${endereco.logradouro}", numero = "${String(endereco.numero).replace(undefined, '')}", bairro = "${endereco.bairro}", localidade =  "${endereco.localidade}", complemento = "${endereco.complemento}",uf = "${endereco.uf}" where idendereco = ${endereco.idendereco}`   
    con.query(sql1, function (err, result) {
        if (err) { response.send(false); throw err; }
        if (!!result.affectedRows == true)
            con.query(sql2, function (err, result) {
                if (err) { response.send(false); throw err; };
                response.send(true)
            })
        else {
            response.send(false)
        }
    });
})
app.delete('/dados', (request, response) =>{    
    console.log(JSON.stringify(request.query))
    con.query(`delete from pessoa where idpessoa = ${request.query.idpessoa}`,function (err, result) {
        if (err) { response.send(false); throw err; }
        else{response.send(true)}
    })
})

app.listen(3000, function () {
    console.log('Server listening on port 3000!');
});

