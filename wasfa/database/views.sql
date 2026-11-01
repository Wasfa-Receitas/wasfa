USE wasfa;

-- View 1: mostra receitas com quantidade de ingredientes
CREATE OR REPLACE VIEW vw_resumo_receitas AS
SELECT r.id_receita, r.nome, r.tempo_preparo,
       COUNT(ri.id_ingrediente) AS total_ingredientes
FROM receitas r
LEFT JOIN receita_ingredientes ri ON r.id_receita = ri.id_receita
GROUP BY r.id_receita, r.nome, r.tempo_preparo;

-- View 2: mostra cada receita e seus ingredientes
CREATE OR REPLACE VIEW vw_ingredientes_receitas AS
SELECT r.nome AS receita, i.nome AS ingrediente, ri.quantidade
FROM receitas r
JOIN receita_ingredientes ri ON r.id_receita = ri.id_receita
JOIN ingredientes i ON ri.id_ingrediente = i.id_ingrediente;

-- Testes: SELECT * FROM vw_resumo_receitas;
--         SELECT * FROM vw_ingredientes_receitas;
