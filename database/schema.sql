-- 1. Cria o banco de dados do Wasfa
CREATE DATABASE IF NOT EXISTS wasfa;
USE wasfa;

-- Usuarios cadastrados
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL
);

-- Receitas cadastradas no proprio banco
CREATE TABLE IF NOT EXISTS receitas (
    id_receita INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    modo_preparo TEXT NOT NULL,
    tempo_preparo INT NOT NULL,
    dificuldade VARCHAR(20) NOT NULL,
    imagem_url VARCHAR(2048) NULL
);

-- Ingredientes disponiveis
CREATE TABLE IF NOT EXISTS ingredientes (
    id_ingrediente INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE
);

-- Liga receitas aos seus ingredientes (relacao muitos para muitos)
CREATE TABLE IF NOT EXISTS receita_ingredientes (
    id_receita INT NOT NULL,
    id_ingrediente INT NOT NULL,
    quantidade VARCHAR(50) NOT NULL,
    PRIMARY KEY (id_receita, id_ingrediente),
    FOREIGN KEY (id_receita) REFERENCES receitas(id_receita),
    FOREIGN KEY (id_ingrediente) REFERENCES ingredientes(id_ingrediente)
);
