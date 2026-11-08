-- Classic public-domain paintings from Wikimedia Commons (97 total).
-- Each URL is a Special:FilePath link that redirects to a ~2560px+ copy of the image.
-- All files were confirmed to exist and be tagged Public domain or CC0 via the Commons API on 2026-11-08.
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
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Vincent_van_Gogh_-_Wheatfield_with_crows_-_Google_Art_Project.jpg?width=2560'),
  -- View of Delft — Johannes Vermeer, c.1661
  ('https://commons.wikimedia.org/wiki/Special:FilePath/View_of_Delft,_by_Johannes_Vermeer.jpg?width=2560'),
  -- Self-Portrait — Rembrandt, 1659
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Rembrandt_van_Rijn_-_Self-Portrait_-_Google_Art_Project.jpg?width=2560'),
  -- Haystacks, End of Summer — Claude Monet, 1891
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Claude_Monet_-_Haystacks,_end_of_Summer_-_Google_Art_Project.jpg?width=2560'),
  -- Bridge over a Pond of Water Lilies — Claude Monet, 1899
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Bridge_over_a_Pond_of_Water_Lilies_MET_DT1854.jpg?width=2560'),
  -- Poppy Field — Claude Monet, 1873
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Claude_Monet_-_Poppy_Field_-_Google_Art_Project.jpg?width=2560'),
  -- Wheat Field with Cypresses — Vincent van Gogh, 1889
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Vincent_van_Gogh_-_Wheat_Field_with_Cypresses_(National_Gallery_version).jpg?width=2560'),
  -- Self-Portrait — Vincent van Gogh, 1887
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Vincent_van_Gogh_-_Self-Portrait_-_Google_Art_Project_(454045).jpg?width=2560'),
  -- Olive Trees — Vincent van Gogh, 1889
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Vincent_van_Gogh_-_Olive_Trees_-_Google_Art_Project_(Minneapolis_Institute_of_Arts).jpg?width=2560'),
  -- The Night Café — Vincent van Gogh, 1888
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Van_Gogh_-_The_Night_Caf%C3%A9_(1888).jpg?width=2560'),
  -- Still Life with Apples — Paul Cézanne, c.1894
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Paul_C%C3%A9zanne_-_Still_Life_with_Apples_-_Google_Art_Project.jpg?width=2560'),
  -- Where Do We Come From? What Are We? Where Are We Going? — Paul Gauguin, 1897
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Gauguin_-_Where_Do_We_Come_From%3F_What_Are_We%3F_Where_Are_We_Going%3F_(1897-98).jpg?width=2560'),
  -- Tahitian Women on the Beach — Paul Gauguin, 1891
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Paul_Gauguin_056.jpg?width=2560'),
  -- Blue Dancers — Edgar Degas, 1898
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Edgar_Degas_-_Blue_Dancers_(1898_Pushkin_Museum).jpg?width=2560'),
  -- A Bar at the Folies-Bergère — Édouard Manet, 1882
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Edouard_Manet,_A_Bar_at_the_Folies-Berg%C3%A8re.jpg?width=2560'),
  -- The Boulevard Montmartre at Night — Camille Pissarro, 1897
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Camille_Pissarro_-_Boulevard_Montmartre_at_Night_-_c_1897_-_National_Gallery_UK.jpg?width=2560'),
  -- The Cradle — Berthe Morisot, 1872
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Berthe_Morisot_-_The_Cradle_-_Google_Art_Project.jpg?width=2560'),
  -- The Child's Bath — Mary Cassatt, 1893
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Mary_Cassatt_-_The_Child%27s_Bath_-_Google_Art_Project.jpg?width=2560'),
  -- Portrait of Adele Bloch-Bauer I — Gustav Klimt, 1907
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Gustav_Klimt_-_Portr%C3%A4t_der_Adele_Bloch-Bauer_I_(1907).jpg?width=2560'),
  -- Fine Wind, Clear Morning (Red Fuji) — Hokusai, c.1831
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Katsushika_Hokusai_-_Fine_Wind,_Clear_Morning_(Gaif%C5%AB_kaisei)_-_Google_Art_Project.jpg?width=2560'),
  -- Sudden Shower over Shin-Ōhashi Bridge — Hiroshige, 1857
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Hiroshige,_Sudden_shower_over_Shin-%C5%8Chashi_bridge_and_Atake,_1857.jpg?width=2560'),
  -- Plum Garden, Kameido — Hiroshige, 1857
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Ando_Hiroshige_-_Plum_Garden,_Kameido_-_Google_Art_Project.jpg?width=2560'),
  -- The Last Supper — Leonardo da Vinci, c.1498
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Leonardo_da_Vinci_-_The_Last_Supper_high_res.jpg?width=2560'),
  -- The Creation of Adam — Michelangelo, c.1512
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Michelangelo_-_Creation_of_Adam_(cropped).jpg?width=2560'),
  -- The School of Athens — Raphael, c.1511
  ('https://commons.wikimedia.org/wiki/Special:FilePath/%22The_School_of_Athens%22_by_Raffaello_Sanzio_da_Urbino.jpg?width=2560'),
  -- Bacchus and Ariadne — Titian, c.1522
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Titian_-_Bacchus_and_Ariadne_-_Google_Art_Project.jpg?width=2560'),
  -- Supper at Emmaus — Caravaggio, 1601
  ('https://commons.wikimedia.org/wiki/Special:FilePath/1602-3_Caravaggio,Supper_at_Emmaus_National_Gallery,_London.jpg?width=2560'),
  -- The Third of May 1808 — Francisco Goya, 1814
  ('https://commons.wikimedia.org/wiki/Special:FilePath/El_Tres_de_Mayo,_by_Francisco_de_Goya,_from_Prado_(cropped).jpg?width=2560'),
  -- Netherlandish Proverbs — Pieter Bruegel the Elder, 1559
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Pieter_Brueghel_the_Elder_-_The_Dutch_Proverbs_-_Google_Art_Project.jpg?width=2560'),
  -- The Peasant Wedding — Pieter Bruegel the Elder, c.1567
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Pieter_Bruegel_the_Elder_-_Peasant_Wedding_-_Google_Art_Project.jpg?width=2560'),
  -- The Haywain Triptych — Hieronymus Bosch, c.1516
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Bosch_-_Haywain_Triptych.jpg?width=2560'),
  -- Young Hare — Albrecht Dürer, 1502
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Albrecht_D%C3%BCrer_-_Hare,_1502_-_Google_Art_Project.jpg?width=2560'),
  -- The Ambassadors — Hans Holbein the Younger, 1533
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Hans_Holbein_the_Younger_-_The_Ambassadors_-_Google_Art_Project.jpg?width=2560'),
  -- Rain, Steam and Speed — J. M. W. Turner, 1844
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Turner_-_Rain,_Steam_and_Speed_-_National_Gallery_file.jpg?width=2560'),
  -- The Oxbow — Thomas Cole, 1836
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Cole_Thomas_The_Oxbow_(The_Connecticut_River_near_Northampton_1836).jpg?width=2560'),
  -- The Rocky Mountains, Lander's Peak — Albert Bierstadt, 1863
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Albert_Bierstadt_-_The_Rocky_Mountains,_Lander%27s_Peak.jpg?width=2560'),
  -- Heart of the Andes — Frederic Edwin Church, 1859
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Church_Heart_of_the_Andes.jpg?width=2560'),
  -- The Gulf Stream — Winslow Homer, 1899
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Winslow_Homer_-_The_Gulf_Stream_-_Metropolitan_Museum_of_Art.jpg?width=2560'),
  -- Carnation, Lily, Lily, Rose — John Singer Sargent, 1886
  ('https://commons.wikimedia.org/wiki/Special:FilePath/John_Singer_Sargent_-_Carnation,_Lily,_Lily,_Rose_-_Google_Art_Project.jpg?width=2560'),
  -- Madame X — John Singer Sargent, 1884
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Madame_X_(Madame_Pierre_Gautreau),_John_Singer_Sargent,_1884_(unfree_frame_crop).jpg?width=2560'),
  -- Nocturne in Black and Gold: The Falling Rocket — James McNeill Whistler, 1875
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Whistler-Nocturne_in_black_and_gold.jpg?width=2560'),
  -- Ophelia — John Everett Millais, 1852
  ('https://commons.wikimedia.org/wiki/Special:FilePath/John_Everett_Millais_-_Ophelia_-_Google_Art_Project.jpg?width=2560'),
  -- The Dream — Henri Rousseau, 1910
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Henri_Rousseau_-_Le_R%C3%AAve_-_Google_Art_Project.jpg?width=2560'),
  -- The Ninth Wave — Ivan Aivazovsky, 1850
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Aivazovsky,_Ivan_-_The_Ninth_Wave.jpg?width=2560'),
  -- Morning in a Pine Forest — Ivan Shishkin, 1889
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Shishkin,_Ivan_-_Morning_in_a_Pine_Forest.jpg?width=2560'),
  -- Barge Haulers on the Volga — Ilya Repin, 1873
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Ilya_Repin_-_Barge_Haulers_on_the_Volga_-_Google_Art_Project.jpg?width=2560'),
  -- Chalk Cliffs on Rügen — Caspar David Friedrich, 1818
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Caspar_David_Friedrich%27s_Chalk_Cliffs_on_R%C3%BCgen.jpg?width=2560'),
  -- Circus Sideshow — Georges Seurat, 1888
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Georges_Seurat,_Circus_Sideshow,_1887%E2%80%9388.jpg?width=2560'),
  -- The Port of Saint-Tropez — Paul Signac, 1901
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Paul_Signac_-_The_Port_of_Saint-Tropez_-_Google_Art_Project.jpg?width=2560'),
  -- Composition VII — Wassily Kandinsky, 1913
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Composition_VII_-_Wassily_Kandinsky,_GAC.jpg?width=2560'),
  -- The Seasons — Alphonse Mucha, 1896
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Four_Seasons_by_Alfons_Mucha,_circa_1896.jpg?width=2560'),
  -- The Swing — Jean-Honoré Fragonard, 1767
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Jean-Honor%C3%A9_Fragonard_-_The_Swing_-_Google_Art_Project.jpg?width=2560'),
  -- Pilgrimage to Cythera — Antoine Watteau, 1717
  ('https://commons.wikimedia.org/wiki/Special:FilePath/L%27Embarquement_pour_Cyth%C3%A8re,_by_Antoine_Watteau,_from_C2RMF_retouched.jpg?width=2560'),
  -- The Gleaners — Jean-François Millet, 1857
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Jean-Fran%C3%A7ois_Millet_-_Gleaners_-_Google_Art_Project.jpg?width=2560'),
  -- Two Sisters (On the Terrace) — Pierre-Auguste Renoir, 1881
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Pierre-Auguste_Renoir_-_Two_Sisters_(On_the_Terrace)_-_Google_Art_Project.jpg?width=2560'),
  -- The Floor Scrapers — Gustave Caillebotte, 1875
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Gustave_Caillebotte-Floor-scrapers_(1876).jpg?width=2560'),
  -- The Desperate Man — Gustave Courbet, c.1845
  ('https://commons.wikimedia.org/wiki/Special:FilePath/Gustave_Courbet_-_Le_D%C3%A9sesp%C3%A9r%C3%A9_(1843).jpg?width=2560');
