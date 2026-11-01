USE wasfa;

DELIMITER $$
-- Procedure 1: cadastra uma receita
CREATE PROCEDURE sp_cadastrar_receita(
    IN p_nome VARCHAR(100),
    IN p_modo_preparo TEXT,
    IN p_tempo_preparo INT,
    IN p_dificuldade VARCHAR(20)
)
BEGIN
    INSERT INTO receitas (nome, modo_preparo, tempo_preparo, dificuldade)
    VALUES (p_nome, p_modo_preparo, p_tempo_preparo, p_dificuldade);
END $$

-- Procedure 2: lista ingredientes de uma receita pelo ID
CREATE PROCEDURE sp_listar_ingredientes(IN p_id_receita INT)
BEGIN
    SELECT i.nome, ri.quantidade
    FROM receita_ingredientes ri
    JOIN ingredientes i ON ri.id_ingrediente = i.id_ingrediente
    WHERE ri.id_receita = p_id_receita
    ORDER BY i.nome;
END $$
DELIMITER ;

-- Teste 1: CALL sp_cadastrar_receita('Receita teste', 'Misture tudo.', 10, 'Facil');
-- Teste 2: CALL sp_listar_ingredientes(1);
