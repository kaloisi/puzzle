-- More classic public-domain paintings from Wikimedia Commons (batch 2).
-- Same format as seed-paintings.sql; no overlap with it, so both files can be run.
-- All files were confirmed to exist and be tagged Public domain or CC0 via the Commons API on 2026-11-08.
--
-- Run with:
--   npx wrangler d1 execute <DB_NAME> --remote --file=cloudflare/seed-paintings-2.sql

INSERT INTO schedules (url) VALUES
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
