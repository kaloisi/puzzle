-- Classic public-domain paintings from Wikimedia Commons.
-- Each URL is a Special:FilePath link that redirects to a ~2560px+ copy of the image.
-- All files were confirmed to exist and be tagged "Public domain" via the Commons API on 2026-11-08.
--
-- Run with:
--   npx wrangler d1 execute <DB_NAME> --remote --file=cloudflare/seed-paintings.sql

INSERT INTO schedules (url) VALUES
  -- The Starry Night — Vincent van Gogh, 1889
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg?width=2560'),
  -- The Great Wave off Kanagawa — Hokusai, c.1831
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Tsunami_by_hokusai_19th_century.jpg?width=2560'),
  -- Girl with a Pearl Earring — Johannes Vermeer, c.1665
  ('https://commons.wikimedia.org/wiki/Special:FilePath/1665_Girl_with_a_Pearl_Earring.jpg?width=2560'),
  -- A Sunday on La Grande Jatte — Georges Seurat, 1884
  ('https://commons.wikimedia.org/wiki/Special:FilePath/A_Sunday_on_La_Grande_Jatte,_Georges_Seurat,_1884.jpg?width=2560'),
  -- Hunters in the Snow — Pieter Bruegel the Elder, 1565
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Pieter_Bruegel_the_Elder_-_Hunters_in_the_Snow_(Winter)_-_Google_Art_Project.jpg?width=2560'),
  -- The Birth of Venus — Sandro Botticelli, c.1485
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project_-_edited.jpg?width=2560'),
  -- Impression, Sunrise — Claude Monet, 1872
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Claude_Monet,_Impression,_soleil_levant.jpg?width=2560'),
  -- Wanderer above the Sea of Fog — Caspar David Friedrich, c.1818
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Caspar_David_Friedrich_-_Wanderer_above_the_sea_of_fog.jpg?width=2560'),
  -- Luncheon of the Boating Party — Pierre-Auguste Renoir, 1881
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Pierre-Auguste_Renoir_-_Luncheon_of_the_Boating_Party_-_Google_Art_Project.jpg?width=2560'),
  -- The Kiss — Gustav Klimt, 1908
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Gustav_Klimt_016.jpg?width=2560'),
  -- The Night Watch — Rembrandt, 1642
  ('https://commons.wikimedia.org/wiki/Special:FilePath/The_Night_Watch_-_HD.jpg?width=2560'),
  -- Café Terrace at Night — Vincent van Gogh, 1888
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Van_Gogh_-_Terrasse_des_Caf%C3%A9s_an_der_Place_du_Forum_in_Arles_am_Abend1.jpeg?width=2560'),
  -- The Garden of Earthly Delights — Hieronymus Bosch, c.1500
  ('https://commons.wikimedia.org/wiki/Special:FilePath/The_Garden_of_earthly_delights.jpg?width=2560'),
  -- Woman with a Parasol — Claude Monet, 1875
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Claude_Monet_-_Woman_with_a_Parasol_-_Madame_Monet_and_Her_Son_-_Google_Art_Project.jpg?width=2560'),
  -- The Tower of Babel — Pieter Bruegel the Elder, 1563
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Pieter_Bruegel_the_Elder_-_The_Tower_of_Babel_(Vienna)_-_Google_Art_Project_-_edited.jpg?width=2560'),
  -- The Milkmaid — Johannes Vermeer, c.1658
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Johannes_Vermeer_-_Het_melkmeisje_-_Google_Art_Project.jpg?width=2560'),
  -- Liberty Leading the People — Eugène Delacroix, 1830
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Eug%C3%A8ne_Delacroix_-_Le_28_Juillet._La_Libert%C3%A9_guidant_le_peuple.jpg?width=2560'),
  -- Irises — Vincent van Gogh, 1889
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Irises-Vincent_van_Gogh.jpg?width=2560'),
  -- The Fighting Temeraire — J. M. W. Turner, 1839
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Turner,_J._M._W._-_The_Fighting_T%C3%A9m%C3%A9raire_tugged_to_her_last_Berth_to_be_broken.jpg?width=2560'),
  -- Paris Street; Rainy Day — Gustave Caillebotte, 1877
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Gustave_Caillebotte_-_Paris_Street%3B_Rainy_Day_-_Google_Art_Project.jpg?width=2560'),
  -- Primavera — Sandro Botticelli, c.1480
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Botticelli-primavera.jpg?width=2560'),
  -- The Hay Wain — John Constable, 1821
  ('https://commons.wikimedia.org/wiki/Special:FilePath/John_Constable_The_Hay_Wain.jpg?width=2560'),
  -- Bal du moulin de la Galette — Pierre-Auguste Renoir, 1876
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Pierre-Auguste_Renoir,_Le_Moulin_de_la_Galette.jpg?width=2560'),
  -- The Raft of the Medusa — Théodore Géricault, 1819
  ('https://commons.wikimedia.org/wiki/Special:FilePath/JEAN_LOUIS_TH%C3%89ODORE_G%C3%89RICAULT_-_La_Balsa_de_la_Medusa_(Museo_del_Louvre,_1818-19).jpg?width=2560'),
  -- Sunflowers — Vincent van Gogh, 1888
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Vincent_Willem_van_Gogh_127.jpg?width=2560'),
  -- The Harvesters — Pieter Bruegel the Elder, 1565
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Pieter_Bruegel_the_Elder-_The_Harvesters_-_Google_Art_Project.jpg?width=2560'),
  -- The Scream — Edvard Munch, 1893
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Edvard_Munch,_1893,_The_Scream,_oil,_tempera_and_pastel_on_cardboard,_91_x_73_cm,_National_Gallery_of_Norway.jpg?width=2560'),
  -- The Magpie — Claude Monet, 1869
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Claude_Monet_-_The_Magpie_-_Google_Art_Project.jpg?width=2560'),
  -- Arnolfini Portrait — Jan van Eyck, 1434
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Van_Eyck_-_Arnolfini_Portrait.jpg?width=2560'),
  -- The Ballet Class — Edgar Degas, c.1874
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Edgar_Degas_-_The_Ballet_Class_-_Google_Art_Project.jpg?width=2560'),
  -- The Bedroom — Vincent van Gogh, 1888
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Vincent_van_Gogh_-_De_slaapkamer_-_Google_Art_Project.jpg?width=2560'),
  -- The Sea of Ice — Caspar David Friedrich, c.1824
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Caspar_David_Friedrich_-_Das_Eismeer_-_Hamburger_Kunsthalle_-_02.jpg?width=2560'),
  -- Le Déjeuner sur l'herbe — Édouard Manet, 1863
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Edouard_Manet_-_Luncheon_on_the_Grass_-_Google_Art_Project.jpg?width=2560'),
  -- Water Lilies — Claude Monet, 1906
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Claude_Monet_-_Water_Lilies_-_1906,_Ryerson.jpg?width=2560'),
  -- Mona Lisa — Leonardo da Vinci, c.1503
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Mona_Lisa,_by_Leonardo_da_Vinci,_from_C2RMF_retouched.jpg?width=2560'),
  -- Bathers at Asnières — Georges Seurat, 1884
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Baigneurs_a_Asnieres.jpg?width=2560'),
  -- Almond Blossom — Vincent van Gogh, 1890
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Vincent_van_Gogh_-_Almond_blossom_-_Google_Art_Project.jpg?width=2560'),
  -- The Battle of Alexander at Issus — Albrecht Altdorfer, 1529
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Albrecht_Altdorfer_-_Schlacht_bei_Issus_(Alte_Pinakothek,_M%C3%BCnchen)_-_Google_Art_Project.jpg?width=2560'),
  -- Whistler's Mother — James McNeill Whistler, 1871
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Whistlers_Mother_high_res.jpg?width=2560'),
  -- The Death of Marat — Jacques-Louis David, 1793
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Death_of_Marat_by_David.jpg?width=2560'),
  -- Wheatfield with Crows — Vincent van Gogh, 1890
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Vincent_van_Gogh_-_Wheatfield_with_crows_-_Google_Art_Project.jpg?width=2560');
