USE wasfa;


SELECT nome, tempo_preparo
FROM receitas
WHERE dificuldade = 'Facil' AND tempo_preparo <= 15
ORDER BY tempo_preparo, nome;


SELECT r.nome AS receita, i.nome AS ingrediente, ri.quantidade
FROM receitas r
JOIN receita_ingredientes ri ON r.id_receita = ri.id_receita
JOIN ingredientes i ON ri.id_ingrediente = i.id_ingrediente
WHERE r.nome = 'Panqueca de banana'
ORDER BY i.nome;

SELECT r.nome, COUNT(ri.id_ingrediente) AS total_ingredientes
FROM receitas r
JOIN receita_ingredientes ri ON r.id_receita = ri.id_receita
GROUP BY r.id_receita, r.nome
ORDER BY total_ingredientes DESC, r.nome;


SELECT i.nome, COUNT(ri.id_receita) AS total_receitas
FROM ingredientes i
JOIN receita_ingredientes ri ON i.id_ingrediente = ri.id_ingrediente
GROUP BY i.id_ingrediente, i.nome
ORDER BY total_receitas DESC, i.nome;


SELECT dificuldade, COUNT(*) AS quantidade_receitas,
       ROUND(AVG(tempo_preparo), 1) AS media_minutos
FROM receitas
GROUP BY dificuldade
ORDER BY media_minutos;
