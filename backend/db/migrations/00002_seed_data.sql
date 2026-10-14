-- +goose Up
INSERT INTO categories (id, name, icon) VALUES
(1, 'Հոգեբանություն', 'brain'),
(2, 'Դետեկտիվ', 'search'),
(3, 'Ռոմանտիկա', 'heart'),
(4, 'Բիզնես', 'briefcase'),
(5, 'Պատմություն', 'columns'),
(6, 'Գիտություն', 'atom'),
(7, 'Փիլիսոփայություն', 'yin-yang'),
(8, 'Գեղարվեստական', 'palette'),
(9, 'Այլ ժանրեր', 'more');

INSERT INTO books (id, title, author, category_id, description, price, old_price, pages, rating, cover_url, file_url, is_popular, is_special, active) VALUES
(1, 'Դրակուլա', 'Բրեմ Սթոքեր', 8, 'Բրեմ Սթոքերի անմահ գոթական գլուխգործոցը՝ կոմս Դրակուլայի և վամպիրների խորհրդավոր աշխարհի մասին։', 1500, 2000, 418, 4.9, '/books/dracula_cover.jpg', '/books/pdf/dracula.pdf', true, true, true),
(2, 'Էգոն թշնամի է', 'Ռայան Հոլիդեյ', 1, 'Ռայան Հոլիդեյի ոգեշնչող գիրքը սեփական էգոն հաղթահարելու և հաջողության հասնելու ճանապարհի մասին։', 2500, 3000, 256, 4.8, '/books/ego_cover.jpg', '/books/pdf/ego.pdf', true, false, true),
(3, 'Իվան Իլյիչի մահը', 'Լև Տոլստոյ', 8, 'Լև Տոլստոյի խորիմաստ դասական վիպակը՝ մարդկային կյանքի իրական արժեքների և հոգևոր վերածննդի մասին։', 1200, 1500, 96, 4.7, '/books/ivan_ilyich_cover.jpg', '/books/pdf/ivan_ilyich.pdf', false, true, true),
(4, 'Կերպարանափոխություն', 'Ֆրանց Կաֆկա', 8, 'Ֆրանց Կաֆկայի հանրահայտ այլաբանական պատմվածքը Գրեգոր Զամզայի և մարդու օտարացման մասին։', 1000, 1500, 112, 4.6, '/books/metamorphosis_cover.jpg', '/books/pdf/metamorphosis.pdf', true, false, true),
(5, 'Պտուտակի շրջադարձը', 'Հենրի Ջեյմս', 2, 'Հենրի Ջեյմսի դասական միստիկ-հոգեբանական նովելը՝ լի լարվածությամբ և գաղտնիքներով։', 1300, 1800, 160, 4.5, '/books/screw_cover.jpg', '/books/pdf/screw.pdf', false, true, true),
(6, 'Տիրակալը', 'Նիկոլո Մաքիավելի', 7, 'Նիկոլո Մաքիավելիի քաղաքական մտքի և առաջնորդության համաշխարհային դասական աշխատությունը։', 1800, 2200, 144, 4.9, '/books/prince_cover.jpg', '/books/pdf/prince.pdf', true, true, true);

-- +goose Down
DELETE FROM books WHERE id IN (1, 2, 3, 4, 5, 6);
DELETE FROM categories WHERE id BETWEEN 1 AND 9;
