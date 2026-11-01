USE wasfa;

-- CONSULTA 1: receitas faceis com ate 15 minutos (WHERE e ORDER BY)
SELECT nome, tempo_preparo
FROM receitas
WHERE dificuldade = 'Facil' AND tempo_preparo <= 15
ORDER BY tempo_preparo, nome;

-- CONSULTA 2: ingredientes da panqueca (JOIN e WHERE)
SELECT r.nome AS receita, i.nome AS ingrediente, ri.quantidade
FROM receitas r
JOIN receita_ingredientes ri ON r.id_receita = ri.id_receita
JOIN ingredientes i ON ri.id_ingrediente = i.id_ingrediente
WHERE r.nome = 'Panqueca de banana'
ORDER BY i.nome;

-- CONSULTA 3: quantidade de ingredientes de cada receita (COUNT e GROUP BY)
SELECT r.nome, COUNT(ri.id_ingrediente) AS total_ingredientes
FROM receitas r
JOIN receita_ingredientes ri ON r.id_receita = ri.id_receita
GROUP BY r.id_receita, r.nome
ORDER BY total_ingredientes DESC, r.nome;

-- CONSULTA 4: quantas receitas usam cada ingrediente (JOIN, COUNT e GROUP BY)
SELECT i.nome, COUNT(ri.id_receita) AS total_receitas
FROM ingredientes i
JOIN receita_ingredientes ri ON i.id_ingrediente = ri.id_ingrediente
GROUP BY i.id_ingrediente, i.nome
ORDER BY total_receitas DESC, i.nome;

-- CONSULTA 5: tempo medio por dificuldade (AVG e GROUP BY)
SELECT dificuldade, COUNT(*) AS quantidade_receitas,
       ROUND(AVG(tempo_preparo), 1) AS media_minutos
FROM receitas
GROUP BY dificuldade
ORDER BY media_minutos;
