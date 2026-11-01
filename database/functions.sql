USE wasfa;

-- Retorna a quantidade de ingredientes de uma receita pelo seu ID.
DELIMITER $$
CREATE FUNCTION fn_total_ingredientes(p_id_receita INT)
RETURNS INT
READS SQL DATA
BEGIN
    DECLARE total INT;
    SELECT COUNT(*) INTO total
    FROM receita_ingredientes
    WHERE id_receita = p_id_receita;
    RETURN total;
END $$
DELIMITER ;

-- Teste: SELECT fn_total_ingredientes(1);
