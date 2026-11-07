-- Execute uma vez em bancos existentes. Novos bancos usam schema.sql.
USE wasfa;

ALTER TABLE receitas
    ADD COLUMN imagem_url VARCHAR(2048) NULL;
