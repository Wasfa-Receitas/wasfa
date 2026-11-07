-- Atualiza imagens sem repetir os inserts. Requer imagem_url (migration 001).
USE wasfa;

START TRANSACTION;
UPDATE receitas SET imagem_url = '/images/receitas/panqueca-de-banana.jpg' WHERE nome = 'Panqueca de banana';
UPDATE receitas SET imagem_url = '/images/receitas/frango-com-arroz.jpg' WHERE nome = 'Arroz com frango';
UPDATE receitas SET imagem_url = '/images/receitas/salada-simples.jpg' WHERE nome = 'Salada simples';
UPDATE receitas SET imagem_url = '/images/receitas/omelete-de-queijo.jpg' WHERE nome = 'Omelete de queijo';
UPDATE receitas SET imagem_url = '/images/receitas/macarrao-ao-tomate.jpg' WHERE nome = 'Macarrao ao tomate';
UPDATE receitas SET imagem_url = '/images/receitas/pure-de-batata.jpg' WHERE nome = 'Pure de batata';
UPDATE receitas SET imagem_url = '/images/receitas/vitamina-de-banana.jpg' WHERE nome = 'Vitamina de banana';
UPDATE receitas SET imagem_url = '/images/receitas/sanduiche-natural.jpg' WHERE nome = 'Sanduiche natural';
UPDATE receitas SET imagem_url = '/images/receitas/salada-de-frutas.jpg' WHERE nome = 'Salada de frutas';
UPDATE receitas SET imagem_url = '/images/receitas/arroz-com-feijao.jpg' WHERE nome = 'Arroz com feijao';
COMMIT;
