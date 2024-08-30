
-- Adminer 4.8.1 PostgreSQL 16.3 (Debian 16.3-1.pgdg120+1) dump
TRUNCATE "blocked_users", "users" CASCADE;
TRUNCATE "profile_sexual_preferences", "genders" CASCADE;
TRUNCATE "profiles", "locations" CASCADE;
TRUNCATE "profiles", "photos" CASCADE;
TRUNCATE "profile_sexual_preferences", "profiles" CASCADE;
TRUNCATE "profile_tag", "tags" CASCADE;
TRUNCATE "users", "sso_type" CASCADE;


INSERT INTO "users" ("id", "username", "last_name", "first_name", "email", "password", "created_at", "sso_type") VALUES
(1,	'Ben3D',	'DUCROCQ',	'Benjamin',	'bducrocq42@gmail.com',	'81dc9bdb52d04dc20036dbd8313ed055',	'2024-08-30 10:10:02.474665',	NULL),
(2,	'brunoFun',	'Funky',	'Bruno',	'bruno.fun@gmail.com',	'81dc9bdb52d04dc20036dbd8313ed055',	'2024-08-30 10:10:57.759031',	NULL),
(3,	'Celine63',	'OUIOUI',	'Céline',	'celine.ouioui@gmail.com',	'81dc9bdb52d04dc20036dbd8313ed055',	'2024-08-30 10:11:48.656352',	NULL),
(4,	'Lulu84',	'NONNON',	'Lucienne',	'lucienne.nonnon@gmail.com',	'81dc9bdb52d04dc20036dbd8313ed055',	'2024-08-30 10:12:38.816452',	NULL),
(5,	'FakeLucia',	'Fake',	'Lucia',	'lucia.fake@gmail.com',	'81dc9bdb52d04dc20036dbd8313ed055',	'2024-08-30 13:37:13.263763',	NULL);

-- Mettre à jour la séquence après insertion dans "users"
SELECT setval(pg_get_serial_sequence('public.users', 'id'), COALESCE(MAX(id), 1)) FROM public.users;


INSERT INTO "fake_user_repoting" ("id", "user_who_reported", "reported_user", "reported_at") VALUES
(2,	1,	5,	'2024-08-30 13:57:26.768062'),
(1,	2,	5,	'2024-08-30 13:57:44.598757');

-- Mettre à jour la séquence après insertion dans "fake_user_repoting"
SELECT setval(pg_get_serial_sequence('public.fake_user_repoting', 'id'), COALESCE(MAX(id), 1)) FROM public.fake_user_repoting;


INSERT INTO "genders" ("gender_id", "name", "description") VALUES
(5,	'Male',	'Identifies as male'),
(6,	'Female',	'Identifies as female'),
(7,	'Non-binary',	'Does not fit exclusively as male or female'),
(8,	'Gender fluid',	'A gender identity that changes over time'),
(9,	'Agender',	'No gender identity or genderless'),
(10,	'Genderqueer',	'Non-binary gender identity, challenges traditional gender norms'),
(11,	'Gender non-conforming',	'Does not conform to societal gender expectations'),
(12,	'Transgender (MTF)',	'Assigned male at birth, identifies as female'),
(13,	'Transgender (FTM)',	'Assigned female at birth, identifies as male'),
(14,	'Questioning',	'Exploring or questioning their gender identity');

-- Mettre à jour la séquence après insertion dans "genders"
SELECT setval(pg_get_serial_sequence('public.genders', 'gender_id'), COALESCE(MAX(gender_id), 1)) FROM public.genders;


INSERT INTO "likes" ("like_id", "user", "user_liked") VALUES
(1,	1,	3),
(3,	1,	4),
(4,	3,	1);

-- Mettre à jour la séquence après insertion dans "likes"
SELECT setval(pg_get_serial_sequence('public.likes', 'like_id'), COALESCE(MAX(like_id), 1)) FROM public.likes;


INSERT INTO "locations" ("location_id", "latitude", "longitude", "city_name") VALUES
(1,	45.764043,	4.835659,	'Lyon'),
(2,	45.725137,	4.805528,	'Oullins'),
(3,	45.771944,	4.880278,	'Villeurbanne'),
(4,	45.5845,	5.2735,	'Bourgoin-Jallieu'),
(5,	45.695727,	4.938801,	'Genas'),
(6,	45.726752,	4.872246,	'Bron'),
(7,	45.590401,	4.765579,	'Givors'),
(8,	45.69601,	4.791272,	'Saint-Priest'),
(9,	45.6168,	5.1477,	'Vienne'),
(10,	45.683444,	4.76162,	'Saint-Genis-Laval'),
(11,	45.823789,	4.876972,	'Caluire-et-Cuire'),
(12,	45.696,	4.9031,	'Chassieu'),
(13,	45.568237,	4.845326,	'Saint-Etienne'),
(14,	45.5601,	4.8657,	'Brignais'),
(15,	45.5515,	4.6785,	'Tarare'),
(16,	45.8692,	4.2989,	'Roanne'),
(17,	45.909193,	4.921142,	'Mâcon'),
(18,	45.5786,	5.1069,	'Vénissieux'),
(19,	45.711,	4.9144,	'Mions'),
(20,	45.7042,	4.9722,	'Décines-Charpieu'),
(28,	48.856613,	2.352222,	'Paris'),
(30,	43.604652,	1.444209,	'Toulouse'),
(31,	43.296482,	5.369780,	'Marseille'),
(32,	44.837789,	-0.579180,	'Bordeaux'),
(33,	47.218371,	-1.553621,	'Nantes'),
(34,	49.443232,	1.099971,	'Rouen'),
(35,	45.188529,	5.724524,	'Grenoble'),
(36,	50.629250,	3.057256,	'Lille'),
(37,	48.573405,	7.752111,	'Strasbourg'),
(38,	48.692055,	6.184417,	'Nancy'),
(39,	47.322047,	5.041480,	'Dijon'),
(40,	43.610769,	3.876716,	'Montpellier'),
(41,	45.777222,	3.087025,	'Clermont-Ferrand'),
(42,	49.258329,	4.031696,	'Reims'),
(43,	43.949317,	4.805528,	'Avignon'),
(44,	49.494370,	0.107929,	'Le Havre'),
(45,	43.836699,	4.360054,	'Nîmes'),
(46,	47.280694,	5.927803,	'Besançon'),
(47,	48.390394,	-4.486076,	'Brest'),
(48,	50.632970,	3.058580,	'Villeneuve-d''Ascq'),
(49,	50.367928,	3.081649,	'Valenciennes'),
(50,	50.728443,	1.614700,	'Dunkerque'),
(51,	49.894067,	2.295753,	'Amiens'),
(52,	47.902733,	1.909020,	'Orléans');

-- Mettre à jour la séquence après insertion dans "locations"
SELECT setval(pg_get_serial_sequence('public.locations', 'location_id'), COALESCE(MAX(location_id), 1)) FROM public.locations;


INSERT INTO "matches" ("match_id", "user_1", "user_2", "matched_at") VALUES
(1,	1,	3,	'2024-08-30 13:35:14.181296');

-- Mettre à jour la séquence après insertion dans "matches"
SELECT setval(pg_get_serial_sequence('public.matches', 'match_id'), COALESCE(MAX(match_id), 1)) FROM public.matches;


INSERT INTO "notifications" ("notification_id", "target_user", "has_read", "notified_at", "type", "source_user") VALUES
(1,	3,	'f',	'2024-08-30 14:25:23.631109',	'LIKE',	1);

-- Mettre à jour la séquence après insertion dans "notifications"
SELECT setval(pg_get_serial_sequence('public.notifications', 'notification_id'), COALESCE(MAX(notification_id), 1)) FROM public.notifications;


INSERT INTO "photos" ("photo_id", "url", "description", "owner_user_id") VALUES
(1,	'https://example.com/photos/profile1_photo1.jpg',	NULL,	1),
(2,	'https://example.com/photos/profile1_photo2.jpg',	NULL,	1),
(3,	'https://example.com/photos/profile1_photo3.jpg',	NULL,	1),
(4,	'https://example.com/photos/profile1_photo4.jpg',	NULL,	1),
(5,	'https://example.com/photos/profile1_photo5.jpg',	NULL,	1),
(6,	'https://example.com/photos/profile2_photo1.jpg',	NULL,	2),
(7,	'https://example.com/photos/profile2_photo2.jpg',	NULL,	2),
(8,	'https://example.com/photos/profile2_photo3.jpg',	NULL,	2),
(9,	'https://example.com/photos/profile2_photo4.jpg',	NULL,	2),
(10,	'https://example.com/photos/profile2_photo5.jpg',	NULL,	2),
(11,	'https://example.com/photos/profile3_photo1.jpg',	NULL,	3),
(12,	'https://example.com/photos/profile3_photo2.jpg',	NULL,	3),
(13,	'https://example.com/photos/profile3_photo3.jpg',	NULL,	3),
(14,	'https://example.com/photos/profile3_photo4.jpg',	NULL,	3),
(15,	'https://example.com/photos/profile3_photo5.jpg',	NULL,	3),
(16,	'https://example.com/photos/profile4_photo1.jpg',	NULL,	4),
(17,	'https://example.com/photos/profile4_photo2.jpg',	NULL,	4),
(18,	'https://example.com/photos/profile4_photo3.jpg',	NULL,	4),
(19,	'https://example.com/photos/profile4_photo4.jpg',	NULL,	4),
(20,	'https://example.com/photos/profile4_photo5.jpg',	NULL,	4);

-- Mettre à jour la séquence après insertion dans "photos"
SELECT setval(pg_get_serial_sequence('public.photos', 'photo_id'), COALESCE(MAX(photo_id), 1)) FROM public.photos;


INSERT INTO "profiles" ("profile_id", "onwer_user_id", "biography", "gender", "age", "main_picture", "location", "last_connection") VALUES
(2,	2,	'Ouuep je mappel Bruno',	5,	25,	6,	NULL,	NULL),
(4,	4,	'HOlaaaaaaa',	6,	29,	17,	NULL,	NULL),
(1,	1,	'je mappel ben bonjour blablabal bal abla bla',	5,	34,	2,	1,	NULL),
(3,	3,	'Bonjour a tous :)',	6,	24,	13,	2,	NULL);

-- Mettre à jour la séquence après insertion dans "profiles"
SELECT setval(pg_get_serial_sequence('public.profiles', 'profile_id'), COALESCE(MAX(profile_id), 1)) FROM public.profiles;


INSERT INTO "profile_sexual_preferences" ("id", "profile_id", "gender_id") VALUES
(2,	1,	6),
(3,	2,	6),
(4,	3,	5),
(5,	3,	6),
(6,	3,	7),
(7,	4,	5),
(8,	4,	13);

-- Mettre à jour la séquence après insertion dans "profile_sexual_preferences"
SELECT setval(pg_get_serial_sequence('public.profile_sexual_preferences', 'id'), COALESCE(MAX(id), 1)) FROM public.profile_sexual_preferences;


INSERT INTO "tags" ("tag_id", "tag_name") VALUES
(1,	'Adventurous'),
(2,	'Animal lover'),
(3,	'Artistic'),
(4,	'Athletic'),
(5,	'Bookworm'),
(6,	'Career-focused'),
(7,	'Cat lover'),
(8,	'Cooking enthusiast'),
(9,	'Coffee lover'),
(10,	'Creative'),
(11,	'Dancer'),
(12,	'Dog lover'),
(13,	'Environmentalist'),
(14,	'Family-oriented'),
(15,	'Fashionable'),
(16,	'Fitness enthusiast'),
(17,	'Foodie'),
(18,	'Free spirit'),
(19,	'Gamer'),
(20,	'Gardener'),
(21,	'Geek'),
(22,	'Health-conscious'),
(23,	'Homebody'),
(24,	'Intellectual'),
(25,	'Introverted'),
(26,	'LGBTQ+ ally'),
(27,	'Life of the party'),
(28,	'Music lover'),
(29,	'Nature lover'),
(30,	'Night owl'),
(31,	'Outdoor enthusiast'),
(32,	'Pet lover'),
(33,	'Photographer'),
(34,	'Political'),
(35,	'Spiritual'),
(36,	'Sports fan'),
(37,	'Tech-savvy'),
(38,	'Traveler'),
(39,	'Vegan'),
(40,	'Vegetarian'),
(41,	'Volunteer'),
(42,	'Wine enthusiast'),
(43,	'Yogi'),
(44,	'Movie buff'),
(45,	'DIY lover'),
(46,	'Minimalist'),
(47,	'Social butterfly'),
(48,	'Workaholic'),
(49,	'Adrenaline junkie'),
(50,	'Blogger'),
(51,	'Cyclist'),
(52,	'Entrepreneur'),
(53,	'Fitness trainer'),
(54,	'History buff'),
(55,	'Journalist'),
(56,	'Marathon runner'),
(57,	'Musician'),
(58,	'Painter'),
(59,	'Photographer'),
(60,	'Reader'),
(61,	'Rock climber'),
(62,	'Sculptor'),
(63,	'Singer'),
(64,	'Surfer'),
(65,	'Teacher'),
(66,	'Traveler'),
(67,	'Writer'),
(68,	'Yoga instructor'),
(69,	'Zoologist'),
(70,	'Anime fan'),
(71,	'Board gamer'),
(72,	'Comic book fan'),
(73,	'Cosplayer'),
(74,	'Fantasy lover'),
(75,	'Manga reader'),
(76,	'Movie geek'),
(77,	'PC gamer'),
(78,	'Role-playing gamer'),
(79,	'Sci-fi enthusiast'),
(80,	'Streamer'),
(81,	'Tabletop gamer'),
(82,	'Tech innovator'),
(83,	'Tech startup'),
(84,	'VR enthusiast'),
(85,	'Retro gamer'),
(86,	'E-sports fan'),
(87,	'Programmer'),
(88,	'Hacker'),
(89,	'Robotics enthusiast'),
(90,	'Gadget lover'),
(91,	'App developer'),
(92,	'Web developer'),
(93,	'Cybersecurity'),
(94,	'Data scientist'),
(95,	'AI enthusiast'),
(96,	'Blockchain enthusiast'),
(97,	'Cryptocurrency trader'),
(98,	'Piano lover'),
(99,	'Guitarist'),
(100,	'Drummer'),
(101,	'Violinist'),
(102,	'DJ'),
(103,	'Classical music lover'),
(104,	'Jazz enthusiast'),
(105,	'Rock music fan'),
(106,	'Pop music lover'),
(107,	'Hip-hop fan'),
(108,	'Electronic music fan'),
(109,	'Blues lover'),
(110,	'Country music fan'),
(111,	'Opera enthusiast'),
(112,	'Folk music lover'),
(113,	'Heavy metal fan'),
(114,	'Singer-songwriter'),
(115,	'Karaoke enthusiast'),
(116,	'Band member'),
(117,	'Choir singer'),
(118,	'R&B lover'),
(119,	'Reggae fan'),
(120,	'Saxophonist'),
(121,	'Flutist'),
(122,	'Cellist'),
(123,	'Ukulele player'),
(124,	'Bass guitarist'),
(125,	'Music producer'),
(126,	'Sound engineer'),
(127,	'Composer'),
(128,	'Songwriter'),
(129,	'Music teacher'),
(130,	'Football player'),
(131,	'Basketball player'),
(132,	'Tennis player'),
(133,	'Runner'),
(134,	'Swimmer'),
(135,	'Cyclist'),
(136,	'Boxer'),
(137,	'Martial artist'),
(138,	'Yoga practitioner'),
(139,	'Pilates enthusiast'),
(140,	'CrossFit athlete'),
(141,	'Gymnast'),
(142,	'Weightlifter'),
(143,	'Skier'),
(144,	'Snowboarder'),
(145,	'Skater'),
(146,	'Hiker'),
(147,	'Mountain climber'),
(148,	'Soccer fan'),
(149,	'Baseball fan'),
(150,	'Rugby player'),
(151,	'Cricket player'),
(152,	'Golf enthusiast'),
(153,	'Volleyball player'),
(154,	'Table tennis player'),
(155,	'Badminton player'),
(156,	'Fencer'),
(157,	'Rowing enthusiast'),
(158,	'Sailor'),
(159,	'Horse rider'),
(160,	'Scuba diver'),
(161,	'Triathlete'),
(162,	'Trail runner'),
(163,	'Dance fitness lover'),
(164,	'Zumba enthusiast'),
(165,	'Parkour athlete'),
(166,	'Archery enthusiast'),
(167,	'Fishing'),
(168,	'Kayaker'),
(169,	'Canoeist'),
(170,	'Surfing'),
(171,	'Paddleboarding'),
(172,	'Ultimate frisbee player'),
(173,	'Handball player'),
(174,	'Hockey player'),
(175,	'Bowling'),
(176,	'Lacrosse player'),
(177,	'Softball player'),
(178,	'Cheerleader');

-- Mettre à jour la séquence après insertion dans "tags"
SELECT setval(pg_get_serial_sequence('public.tags', 'tag_id'), COALESCE(MAX(tag_id), 1)) FROM public.tags;


INSERT INTO "profile_tag" ("id", "profile_id", "profile_tag") VALUES
(1,	1,	19),
(2,	1,	21),
(3,	1,	84),
(4,	1,	98),
(5,	3,	98);

-- Mettre à jour la séquence après insertion dans "profile_tag"
SELECT setval(pg_get_serial_sequence('public.profile_tag', 'id'), COALESCE(MAX(id), 1)) FROM public.profile_tag;


INSERT INTO "visited_profile_history" ("id", "visiter", "visited") VALUES
(1,	1,	3),
(3,	3,	1),
(4,	2,	3),
(5,	4,	1);

-- Mettre à jour la séquence après insertion dans "visited_profile_history"
SELECT setval(pg_get_serial_sequence('public.visited_profile_history', 'id'), COALESCE(MAX(id), 1)) FROM public.visited_profile_history;


INSERT INTO "blocked_users" ("id", "blocker_id", "blocked_id", "blocked_at") VALUES
(1,	1,	5,	'2024-08-30 16:23:50.336874');

-- Mettre à jour la séquence après insertion dans "blocked_users"
SELECT setval(pg_get_serial_sequence('public.blocked_users', 'id'), COALESCE(MAX(id), 1)) FROM public.blocked_users;

-- 2024-08-30 15:59:48.920113+00