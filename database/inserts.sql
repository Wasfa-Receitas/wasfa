USE wasfa;

-- Dados ficticios para testes. Execute uma vez apos schema.sql.
INSERT INTO usuarios (nome, email, senha) VALUES
('Ana Silva', 'ana@exemplo.com', 'hash_exemplo_1'),
('Bruno Costa', 'bruno@exemplo.com', 'hash_exemplo_2'),
('Carla Lima', 'carla@exemplo.com', 'hash_exemplo_3');
-- As senhas acima sao marcadores de teste, nao senhas reais.

INSERT INTO ingredientes (nome) VALUES
('Banana'), ('Ovo'), ('Aveia'), ('Leite'), ('Arroz'),
('Frango'), ('Cebola'), ('Tomate'), ('Alface'), ('Cenoura'),
('Batata'), ('Queijo'), ('Pao'), ('Macarrao'), ('Alho'),
('Farinha de trigo'), ('Maca'), ('Iogurte'), ('Feijao'), ('Azeite');

INSERT INTO receitas (nome, modo_preparo, tempo_preparo, dificuldade, imagem_url) VALUES
('Panqueca de banana', 'Amasse a banana, misture com ovo e aveia e doure na frigideira.', 15, 'Facil', '/images/receitas/panqueca-de-banana.jpg'),
('Arroz com frango', 'Cozinhe o arroz e o frango com cebola e alho.', 40, 'Medio', '/images/receitas/frango-com-arroz.jpg'),
('Salada simples', 'Lave e corte alface, tomate e cenoura; tempere com azeite.', 10, 'Facil', '/images/receitas/salada-simples.jpg'),
('Omelete de queijo', 'Bata os ovos, adicione queijo e cozinhe na frigideira.', 10, 'Facil', '/images/receitas/omelete-de-queijo.jpg'),
('Macarrao ao tomate', 'Cozinhe o macarrao e prepare molho de tomate, alho e azeite.', 25, 'Facil', '/images/receitas/macarrao-ao-tomate.jpg'),
('Pure de batata', 'Cozinhe e amasse as batatas, misturando com leite.', 30, 'Facil', '/images/receitas/pure-de-batata.jpg'),
('Vitamina de banana', 'Bata banana, leite e aveia no liquidificador.', 5, 'Facil', '/images/receitas/vitamina-de-banana.jpg'),
('Sanduiche natural', 'Recheie o pao com frango, alface e tomate.', 15, 'Facil', '/images/receitas/sanduiche-natural.jpg'),
('Salada de frutas', 'Corte banana e maca e misture com iogurte.', 10, 'Facil', '/images/receitas/salada-de-frutas.jpg'),
('Arroz com feijao', 'Cozinhe arroz e feijao separadamente, com alho.', 50, 'Medio', '/images/receitas/arroz-com-feijao.jpg');

-- Cada linha relaciona uma receita com um ingrediente e sua quantidade.
INSERT INTO receita_ingredientes (id_receita, id_ingrediente, quantidade) VALUES
(1,1,'1 unidade'),(1,2,'1 unidade'),(1,3,'2 colheres'),
(2,5,'1 xicara'),(2,6,'200 g'),(2,7,'1/2 unidade'),(2,15,'1 dente'),
(3,9,'3 folhas'),(3,8,'1 unidade'),(3,10,'1/2 unidade'),(3,20,'1 colher'),
(4,2,'2 unidades'),(4,12,'30 g'),
(5,14,'100 g'),(5,8,'2 unidades'),(5,15,'1 dente'),(5,20,'1 colher'),
(6,11,'2 unidades'),(6,4,'1/2 xicara'),
(7,1,'1 unidade'),(7,4,'200 ml'),(7,3,'1 colher'),
(8,13,'2 fatias'),(8,6,'80 g'),(8,9,'2 folhas'),(8,8,'2 fatias'),
(9,1,'1 unidade'),(9,17,'1 unidade'),(9,18,'1 pote'),
(10,5,'1 xicara'),(10,19,'1 concha'),(10,15,'1 dente');
