--
-- PostgreSQL database dump
--

\restrict pemIUZ8YC36XKN8fxqQgz83P0R8LdW3BoYsU2u5rPpSglEmN4l7Kji318Wyccg3

-- Dumped from database version 17.10
-- Dumped by pg_dump version 17.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: CekmeFoyu; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CekmeFoyu" (id, "testeGonderilmeTarihi", modelist, etiket, "modelKodu", "sapKodu", "kumasKodu", sezon, "createdAt", "updatedAt") FROM stdin;
aca75a9d-1361-4195-90b9-93e90d63064b	2026-07-17		Beymen Club	BCD8015	102415621	CLK13347-2	FW26	2026-07-17 21:12:13.646	2026-07-17 21:12:13.646
bedbe22b-2d9c-40e2-958d-838181cf74ce	2026-07-17		Beymen Collection	B1114	102409534	COK13098-10	FW26	2026-07-17 21:14:58.871	2026-07-17 21:14:58.871
07cc1d55-1705-4182-bc15-e0ad615441b4	2026-07-17		Academia	XE105F26	102420830	ACO13009	FW26	2026-07-17 22:20:11.033	2026-07-17 22:23:11.723
6aeec5a3-1414-4a69-a8ea-ef3508085c05	2026-07-16		Beymen Collection	AR105C26	424546345	ALK13099	FW26	2026-07-17 22:31:28.138	2026-07-17 22:31:28.138
2fdf9719-8ee5-4130-aa4c-bdb3a18431ba	2026-07-20		Academia	CSA123456	453453534	MZ7772	SS23	2026-07-20 15:02:00.118	2026-07-20 15:02:00.118
0136a624-7a1b-41ec-b8c8-0a3fd29f00c8	2026-07-20		Academia	CSA32	245356747	COK345-1	SS23	2026-07-20 15:09:23.93	2026-07-20 15:09:23.93
\.


--
-- Data for Name: CekmeFabric; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."CekmeFabric" (id, "cekmeFoyuId", "kumasIcerik", "kumasEn", "artikelAdi", "boyCekmeYuzde", "enCekmeYuzde", "gelenMetraj", "kullanildigiYer", tedarikci, "urunDptRenk") FROM stdin;
a4debdeb-d1c4-475a-b86e-cb07fd19aef6	aca75a9d-1361-4195-90b9-93e90d63064b	%100 POLYESTER	142		0	-1	362	ANA KUMAŞ	Es Teks	SIYAH
928ff895-0010-4ca9-841d-ccaf2516dd65	bedbe22b-2d9c-40e2-958d-838181cf74ce	%100 İPEK	132		-2	-2	475	ANA KUMAŞ	WINCHOICE	KIRIK BEYAZ
f884f47a-97d0-4d3d-a629-3771533be7a8	07cc1d55-1705-4182-bc15-e0ad615441b4	%57 POLIESTER, %24 VISKOZ, %18 KOYUN YÜNÜ, %1 ELASTAN	136		-1	0	290	ANA KUMAŞ	Moda KUMAŞ	SIYAH
3df5a170-d304-40b8-a8e9-cd00102dd69d	07cc1d55-1705-4182-bc15-e0ad615441b4	%100 POLYESTER	132		-1	0	230	ASTAR	Moda Astar	SIYAH
536e9688-cfb6-40e2-83ac-07fe9c7c91ec	6aeec5a3-1414-4a69-a8ea-ef3508085c05	%50 PAMUK, %50 POLYESTER	142		-2	2	333	ANA KUMAŞ	Zeki Kumaşçılık	KIRMIZI
add8a49d-05b8-444c-8207-1bac2e2589c5	2fdf9719-8ee5-4130-aa4c-bdb3a18431ba	%50 POLYESTER, %50 PAMUK	142		-2	2	217	ANA KUMAŞ	Ali Kumaşçılık	YEŞIL
ecf6c75f-c230-42a6-9a0a-4da75f03b822	0136a624-7a1b-41ec-b8c8-0a3fd29f00c8	%POLYESTER	132		1	1	220	ANA KUMAŞ	Melike Kumaş	KIRMIZI
\.


--
-- Data for Name: UretimSezon; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."UretimSezon" (id, ad, "createdAt", "updatedAt") FROM stdin;
ef98153b-4913-466c-88fa-3f4b24262106	FW26	2026-07-20 12:32:45.693	2026-07-20 12:32:45.693
bf326e51-76f7-46ba-ac56-a56b382ee765	SS23	2026-07-20 14:55:37.102	2026-07-20 14:55:37.102
\.


--
-- Data for Name: GenelUretimKayit; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."GenelUretimKayit" (id, "sezonId", "markaTipi", "siparisId", "sapKodu", "modelKodu", modelist, "butceAdet", "kumasGelisTarihi", "cekmeTesti", "fitKalibiGelis", "fitDikildi", "uretimPastali", "kesimiTamamlandi", "kaliteKontrol", "teslimTarihi", "satirRengi", "createdAt", "updatedAt", "hucreRenkleri") FROM stdin;
f117780a-81ef-445f-82e5-e1afe0d3c608	ef98153b-4913-466c-88fa-3f4b24262106	academia														none	2026-07-20 12:48:09.499	2026-07-20 14:44:36.877	\N
e73e78cf-33d8-45d2-a731-8ff9ad8813e8	ef98153b-4913-466c-88fa-3f4b24262106	academia	FW26-COK ELBISE 13239	102409613	D1116	Gönül GAZİLER	300	13.05.2026	14.05.2026	8.06.2026	9.06.2026	12.06.2026	16.06.2026	16.06.2026	16.06.2026	green	2026-07-20 12:45:18.208	2026-07-20 13:00:11.942	\N
02c0c32c-5d00-4644-86d8-463dfbe1d65d	ef98153b-4913-466c-88fa-3f4b24262106	academia	FW26-COK ELBISE 13180	102409604	D1103-1	Gönül GAZİLER	250	13.05.2026	13.05.2026	13.05.2026	13.05.2026	13.05.2026	13.05.2026	13.05.2026	13.05.2026	none	2026-07-20 12:45:20.846	2026-07-20 14:46:08.303	\N
f84bab04-a32e-4a76-a42e-fba09f2ed1cc	bf326e51-76f7-46ba-ac56-a56b382ee765	academia														\N	2026-07-20 14:55:39.707	2026-07-20 14:55:39.707	\N
7cbf5f37-9f67-487d-b453-378c64a5dbb5	bf326e51-76f7-46ba-ac56-a56b382ee765	beymen														\N	2026-07-20 14:55:41.098	2026-07-20 14:55:41.098	\N
759f4205-034c-4277-bf51-70046dbb24fc	ef98153b-4913-466c-88fa-3f4b24262106	academia														\N	2026-07-20 18:12:59.144	2026-07-20 18:12:59.144	\N
0e61d1bc-713e-4f72-b179-5b121642b15f	ef98153b-4913-466c-88fa-3f4b24262106	beymen														\N	2026-07-20 12:54:30.576	2026-07-20 12:54:30.576	\N
ac2c6e98-65d2-4561-844e-ea95cc2b5c92	ef98153b-4913-466c-88fa-3f4b24262106	beymen														\N	2026-07-20 12:54:30.708	2026-07-20 12:54:30.708	\N
f4fe2f6a-72e8-430a-9ef8-be3f88e0b570	ef98153b-4913-466c-88fa-3f4b24262106	academia														none	2026-07-20 12:45:21.971	2026-07-20 14:44:36.776	\N
9dc99e56-4370-4b11-9c8a-1e6070bfa5d7	ef98153b-4913-466c-88fa-3f4b24262106	academia														none	2026-07-20 12:48:09.012	2026-07-20 14:44:36.807	\N
8ed467fc-8c42-4f6c-952d-3dd02bda24a4	ef98153b-4913-466c-88fa-3f4b24262106	academia														none	2026-07-20 12:48:09.183	2026-07-20 14:44:36.831	\N
0abc94e5-a89d-417b-b774-2dd6bfb62b5c	ef98153b-4913-466c-88fa-3f4b24262106	academia														none	2026-07-20 12:48:09.334	2026-07-20 14:44:36.859	\N
435c53d8-dd8f-4566-890f-96cc1d0c5b1b	ef98153b-4913-466c-88fa-3f4b24262106	academia	FW26-COK GML 13060-2\t	102409520	B1100	Burcu DOBRUCALI\t	250									none	2026-07-20 12:45:21.476	2026-07-20 14:45:37.016	{"kumasGelisTarihi":"red","cekmeTesti":"red","fitKalibiGelis":"red","fitDikildi":"red","uretimPastali":"red","kesimiTamamlandi":"red","kaliteKontrol":"red","teslimTarihi":"red"}
d406373b-ce61-40eb-b135-4f5604a00f1a	ef98153b-4913-466c-88fa-3f4b24262106	academia														\N	2026-07-20 18:12:24.016	2026-07-20 18:12:24.016	\N
\.


--
-- Data for Name: KalanKumas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."KalanKumas" (id, "faturaNo", "malzemeKodu", "faturaTarih", "depoyaGirisTarihi", "kumasKodu", "kumasMetraji", "birimFiyat", "eklenmeTarihi", "updatedAt", "takipFoyuId", notlar) FROM stdin;
6f8fda15-4219-4399-9eec-1de693b4c166				2026-07-20	MZ7772	217,00 Mt	\N	2026-07-20 14:57:37.237	2026-07-20 15:02:00.172	f0d20691-6b28-4a33-9338-578958a87a36	null
30c74b6e-f183-4e02-9a6e-3b76a4fbab2b				2026-07-20	COK345-1	220,00 Mt	\N	2026-07-20 15:09:23.933	2026-07-20 15:10:07.627	d55ae88e-1ed4-4926-9def-93affe66284b	\N
4fb08a17-a9f0-49e5-bee5-7e72d22284c9	MZ02026358775	780111569001	2026-07-21	2026-07-17	ACO13009	290,00 Mt	156.728260869565	2026-07-17 22:28:36.747	2026-07-20 12:05:10.848	058281f5-2f4d-46e3-a199-bdff01138d4c	\N
91bb7c99-5000-43f9-8db8-799d86c456d7	MS02026358700	890111569001	2026-07-24	2026-07-17	ACO13010	230,00 Mt	156.728260869565	2026-07-17 22:28:36.733	2026-07-20 11:06:20.089	9777deca-9c60-4340-82ae-0eb6f3b39234	\N
55d49ab9-83ed-4b25-bfb8-3a961927af03	MS02026358775	700111569001	2026-07-20	2026-07-16	ALK13099	163,60 Mt	156.728260869565	2026-07-17 22:31:28.264	2026-07-20 13:09:20.844	33a4c6bf-47fc-4866-b39c-5efa033d7081	{"kalanMt": "50", "aciklama": "Deneme  ", "kesilenMt": "50"}
f108324e-a37f-4fa4-b629-62148cd4cc75	HZ02026358700	890111569045	2026-07-23	2026-07-17	CLK13347-2	362,00 Mt	156.728260869565	2026-07-17 21:26:15.647	2026-07-20 11:06:21.688	16c91fcd-179b-4a9d-b803-dc90ad86fb29	\N
d95cc37b-e971-4176-9829-6db5cf155b7b	MA02026358700	898111569001	2026-07-16	2026-07-17	COK13098-10	475,00 Mt	156.728260869565	2026-07-17 21:26:15.632	2026-07-20 11:06:24.142	21a47581-3c8d-4bfe-8b86-8d91e6236f63	\N
\.


--
-- Data for Name: KesimKontrolFoyu; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."KesimKontrolFoyu" (id, "modelKodu", "kesimTarihi", "sezonMarka", "sapKodu", notlar, kumaslar, bedenler, "eklenmeTarihi", "updatedAt") FROM stdin;
cfc0256a-6f51-4d57-81d1-a803928fde8b	AR105C26	21/07/2026	FW26	463563453	ADASDAGASHGADGHASFDFASDF	[{"kodu": "MZ3233", "birimMetre": "", "kullanimYeri": "ANA KUMAŞ", "kumasciFirma": "ZEKİ KUMAŞÇILIK"}, {"kodu": "", "birimMetre": "", "kullanimYeri": "", "kumasciFirma": ""}, {"kodu": "", "birimMetre": "", "kullanimYeri": "", "kumasciFirma": ""}, {"kodu": "", "birimMetre": "", "kullanimYeri": "", "kumasciFirma": ""}]	[{"l": "", "m": "", "s": "", "xl": "", "xs": "", "xxl": "", "kesilenMt": "", "kumasTuru": "", "toplamAdet": ""}, {"l": "", "m": "", "s": "", "xl": "", "xs": "", "xxl": "", "kesilenMt": "", "kumasTuru": "", "toplamAdet": ""}, {"l": "", "m": "", "s": "", "xl": "", "xs": "", "xxl": "", "kesilenMt": "", "kumasTuru": "", "toplamAdet": ""}, {"l": "", "m": "", "s": "", "xl": "", "xs": "", "xxl": "", "kesilenMt": "", "kumasTuru": "", "toplamAdet": ""}, {"l": "", "m": "", "s": "", "xl": "", "xs": "", "xxl": "", "kesilenMt": "", "kumasTuru": "", "toplamAdet": ""}, {"l": "", "m": "", "s": "", "xl": "", "xs": "", "xxl": "", "kesilenMt": "", "kumasTuru": "", "toplamAdet": ""}, {"l": "", "m": "", "s": "", "xl": "", "xs": "", "xxl": "", "kesilenMt": "", "kumasTuru": "", "toplamAdet": ""}, {"l": "", "m": "", "s": "", "xl": "", "xs": "", "xxl": "", "kesilenMt": "", "kumasTuru": "", "toplamAdet": ""}]	2026-07-18 18:56:20.602	2026-07-18 18:56:20.602
\.


--
-- Data for Name: KumasDeposu; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."KumasDeposu" (id, tarih, renk, firma, sezon, "kumasKodu", "gelenMetraj", "kesimTarihi", "baglananModel", "kesilenAdet", aciklama, "harcananMetraj", "netMetraj", "takipFoyuId", "parentId", "eklenmeTarihi", "updatedAt") FROM stdin;
01bcdafb-07a3-4419-8242-b92194e2c7a3	2026-07-17	KIRIK BEYAZ	WINCHOICE	FW26	COK13098-10	475,00 Mt		B1114 - ANA KUMAŞ				475,00 Mt	21a47581-3c8d-4bfe-8b86-8d91e6236f63	\N	2026-07-17 23:06:48.282	2026-07-17 23:41:51.531
517388c4-7c36-4aa1-b759-c0e876fb1a20	2026-07-17	SIYAH	Moda Astar	FW26	ACO13010	230,00 Mt		XE105F26 - ASTAR				230,00 Mt	9777deca-9c60-4340-82ae-0eb6f3b39234	\N	2026-07-17 23:06:48.29	2026-07-17 23:41:51.537
74fa59ba-a100-4960-a365-6aaa74fe9a1e	2026-07-17	SIYAH	Moda KUMAŞ	FW26	ACO13009	290,00 Mt		XE105F26 - ANA KUMAŞ				290,00 Mt	058281f5-2f4d-46e3-a199-bdff01138d4c	\N	2026-07-17 23:06:48.295	2026-07-17 23:41:51.538
1469501a-7849-4909-9d87-5ab07546ba3a	2026-07-16	KIRMIZI	Zeki Kumaşçılık	FW26	ALK13099	333,00 Mt		AR105C26 - ANA KUMAŞ				333,00 Mt	33a4c6bf-47fc-4866-b39c-5efa033d7081	\N	2026-07-17 23:06:48.297	2026-07-17 23:41:51.54
e2291e66-5f4e-4df1-9fe0-bc614c9373a9	2026-07-26	SIYAH	Es Teks	FW26	CLK13347-2	266,00 Mt		BCD8015 - ANA KUMAŞ				266,00 Mt	16c91fcd-179b-4a9d-b803-dc90ad86fb29	abd88193-a71f-4ef6-96b2-ad0ae6a7aaa5	2026-07-17 23:35:20.929	2026-07-17 23:41:51.541
abd88193-a71f-4ef6-96b2-ad0ae6a7aaa5	2026-07-17	SIYAH	Es Teks	FW26	CLK13347-2	362,00 Mt	2026-07-26	BCD8015 - ANA KUMAŞ	172	305 metre sarf edildi, deneme için açıklama girildi	96	266,00 Mt	16c91fcd-179b-4a9d-b803-dc90ad86fb29	\N	2026-07-17 23:06:48.223	2026-07-17 23:41:51.543
046dea83-110c-418c-9425-c012e4a62fdf	2026-07-20	YEŞIL	Ali Kumaşçılık	SS23	MZ7772	217,00 Mt		CSA123456 - ANA KUMAŞ				217,00 Mt	f0d20691-6b28-4a33-9338-578958a87a36	\N	2026-07-20 15:02:00.185	2026-07-20 15:02:00.185
b7d19afc-d76c-43ce-a3ed-333cc51b9198	2026-07-20	KIRMIZI	Melike Kumaş	SS23	COK345-1	220,00 Mt		CSA32 - ANA KUMAŞ				220,00 Mt	d55ae88e-1ed4-4926-9def-93affe66284b	\N	2026-07-20 15:09:24.061	2026-07-20 15:10:07.634
\.


--
-- Data for Name: KumasTakip; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."KumasTakip" (id, "kumasKodu", "gelenMetraj", "kumasciFirma", "geldigiTarih", sezon, "sapKodu", "baglandigiModel", etiket, "kullanildigiYer", "topAdedi", "kumasIcerik", "kumasRenk", "urunDptRenk", "kumasEn", "cekmeEn", "cekmeBoy", notlar, "createdAt", "updatedAt", birim) FROM stdin;
16c91fcd-179b-4a9d-b803-dc90ad86fb29	CLK13347-2	362	Es Teks	2026-07-17	FW26	102415621	BCD8015	Beymen Club	ANA KUMAŞ	5	%100 POLYESTER	SIYAH	\N	142	-1	0	\N	2026-07-17 21:12:13.637	2026-07-17 21:12:13.637	MT
21a47581-3c8d-4bfe-8b86-8d91e6236f63	COK13098-10	475	WINCHOICE	2026-07-17	FW26	102409534	B1114	Beymen Collection	ANA KUMAŞ	5	%100 İPEK	KIRIK BEYAZ	\N	132	-2	-2	\N	2026-07-17 21:14:58.864	2026-07-17 21:14:58.864	MT
9777deca-9c60-4340-82ae-0eb6f3b39234	ACO13010	230	Moda Astar	2026-07-17	FW26	102420831	XE105F26	Academia	ASTAR	4	%100 POLYESTER	SIYAH	\N	132	0	-1	\N	2026-07-17 22:22:15.735	2026-07-17 22:22:15.735	MT
058281f5-2f4d-46e3-a199-bdff01138d4c	ACO13009	290	Moda KUMAŞ	2026-07-17	FW26	102420830	XE105F26	Academia	ANA KUMAŞ	5	%57 POLIESTER, %24 VISKOZ, %18 KOYUN YÜNÜ, %1 ELASTAN	SIYAH	\N	136	0	-1	\N	2026-07-17 22:20:11.028	2026-07-17 22:23:11.722	MT
33a4c6bf-47fc-4866-b39c-5efa033d7081	ALK13099	333	Zeki Kumaşçılık	2026-07-16	FW26	424546345	AR105C26	Beymen Collection	ANA KUMAŞ	5	%50 PAMUK, %50 POLYESTER	KIRMIZI	\N	142	2	-2	\N	2026-07-17 22:31:28.129	2026-07-17 22:31:28.129	MT
f0d20691-6b28-4a33-9338-578958a87a36	MZ7772	217	Ali Kumaşçılık	2026-07-20	SS23	453453534	CSA123456	Academia	ANA KUMAŞ	5	%50 POLYESTER, %50 PAMUK	YEŞIL	\N	142	2	-2	\N	2026-07-20 14:57:37.203	2026-07-20 15:02:00.119	MT
d55ae88e-1ed4-4926-9def-93affe66284b	COK345-1	220	Melike Kumaş	2026-07-20	SS23	245356747	CSA32	Academia	ANA KUMAŞ	3	%POLYESTER	KIRMIZI	\N	132	1	1	\N	2026-07-20 15:09:23.903	2026-07-20 15:10:07.61	MT
\.


--
-- Data for Name: Roll; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Roll" (id, "kumasTakipId", "cikanMt", "eksikFazlaMetraj", "topUstundeYazanMt") FROM stdin;
14832192-53a2-492d-a2de-d309079880c6	16c91fcd-179b-4a9d-b803-dc90ad86fb29	\N	0	65
b7a85445-e9ed-44f1-8d62-a9729b00ca3a	16c91fcd-179b-4a9d-b803-dc90ad86fb29	\N	0	75
62ab77f2-3aa5-41a6-9f3f-c07c012c6772	16c91fcd-179b-4a9d-b803-dc90ad86fb29	\N	0	85
27e948ba-22d6-40ba-be60-624691bbdf74	16c91fcd-179b-4a9d-b803-dc90ad86fb29	\N	0	60
ac6e0000-31b5-44c5-ae65-e4343ca09a65	16c91fcd-179b-4a9d-b803-dc90ad86fb29	\N	0	77
8b48a772-a6c5-4898-8d4a-a5d8e4aa06b4	21a47581-3c8d-4bfe-8b86-8d91e6236f63	\N	0	60
3945af52-4d62-4111-b222-d1b473e01aa5	21a47581-3c8d-4bfe-8b86-8d91e6236f63	\N	0	115
76a0f71d-3bfc-4902-9ed2-bd65249406b5	21a47581-3c8d-4bfe-8b86-8d91e6236f63	\N	0	120
2e423fca-cdbb-4658-a150-ea6ef75ecd4a	21a47581-3c8d-4bfe-8b86-8d91e6236f63	\N	0	80
e7182e1c-dd94-407f-8fe5-a36eda1ab925	21a47581-3c8d-4bfe-8b86-8d91e6236f63	\N	0	100
67592218-395e-4554-918c-7b8a2028a722	9777deca-9c60-4340-82ae-0eb6f3b39234	\N	0	45
188b6095-e8d6-49d1-b9c6-fcfa42afbc0e	9777deca-9c60-4340-82ae-0eb6f3b39234	\N	0	50
0c795995-ffee-48dd-b0e7-5c5ad089625a	9777deca-9c60-4340-82ae-0eb6f3b39234	\N	0	100
6000a54d-16c5-4bdb-9ae4-55a3acd1910a	9777deca-9c60-4340-82ae-0eb6f3b39234	\N	0	35
6e6405ee-4909-429f-b76f-f6bbb1286b68	058281f5-2f4d-46e3-a199-bdff01138d4c	\N	0	30
36926c5f-58a9-469d-be23-6c8c6e0172dd	058281f5-2f4d-46e3-a199-bdff01138d4c	\N	0	40
3382259d-1a1c-475f-91aa-8b2f9913f3f9	058281f5-2f4d-46e3-a199-bdff01138d4c	\N	0	40
45e846a7-3aca-4fb3-953d-17cd14db6ac6	058281f5-2f4d-46e3-a199-bdff01138d4c	\N	0	60
d2fc5fce-d02b-49e0-b35f-d54bd55e9989	058281f5-2f4d-46e3-a199-bdff01138d4c	\N	0	120
73c829c8-4912-493b-9d55-ead0ea639eef	33a4c6bf-47fc-4866-b39c-5efa033d7081	\N	0	55
b6a9ff36-de13-4279-9596-4c65e3173362	33a4c6bf-47fc-4866-b39c-5efa033d7081	\N	0	58
6aec208d-b66b-4a54-8f46-e5d7de203a56	33a4c6bf-47fc-4866-b39c-5efa033d7081	\N	0	90
b61f9789-dcde-45c4-8bc5-2373feadd1fd	33a4c6bf-47fc-4866-b39c-5efa033d7081	\N	0	90
6413d2df-4f07-4484-ae4e-ccce063b5d77	33a4c6bf-47fc-4866-b39c-5efa033d7081	\N	0	40
08da45a7-a6b1-46e8-ab8c-9f5e2cde39bd	f0d20691-6b28-4a33-9338-578958a87a36	\N	0	50
402fc9e4-cd7f-4d63-ac02-84b3c098cf0e	f0d20691-6b28-4a33-9338-578958a87a36	\N	0	40
2e7d8fcc-90f5-4de9-876c-465895e1fea4	f0d20691-6b28-4a33-9338-578958a87a36	\N	0	45
74887619-ead4-428f-af96-9cb465b3b4aa	f0d20691-6b28-4a33-9338-578958a87a36	\N	0	45
29a0ff21-d458-40d3-8dd7-b7652afd7cae	f0d20691-6b28-4a33-9338-578958a87a36	\N	0	37
c0f5da17-8226-457d-bace-dc75a0c778c4	d55ae88e-1ed4-4926-9def-93affe66284b	40	-10	50
080c514b-9863-4996-9803-a44862aaeb0f	d55ae88e-1ed4-4926-9def-93affe66284b	20	-100	120
093dd8b9-7cb6-4c3b-ae52-06b8af4b89d1	d55ae88e-1ed4-4926-9def-93affe66284b	30	-20	50
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, email, password, name, role, "isActive", "createdAt", "updatedAt") FROM stdin;
00976be7-fdbe-4f53-b5e1-275f809b8264	yonetici@gzlaeo.com	admin	Yönetici	ADMIN	t	2026-07-20 14:54:11.588	2026-07-20 17:36:41.953
9c37d376-c9b0-46bb-885b-ff10be178145	superadmin@gzlaeo.com	superadmin	Süper Admin	SUPER_ADMIN	t	2026-07-20 17:36:41.965	2026-07-20 17:36:41.965
\.


--
-- Data for Name: Session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Session" (id, "userId", "expiresAt", "createdAt") FROM stdin;
\.


--
-- Data for Name: SystemSettings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SystemSettings" (id, "companyName", "logoUrl", "faviconUrl", theme, "primaryColor", "updatedAt", "systemStatus") FROM stdin;
global	GZL TEKSTİL	/logo.png	/uploads/1784569461803-GZLKurumsalLogo.png	light	\N	2026-07-20 18:14:39.609	AKTIF
\.


--
-- Data for Name: UretimTakipFoyu; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."UretimTakipFoyu" (id, "modelKodu", sezon, etiket, "sapKodu", "kumasKodu", "kumasIcerik", "kesimTarihi", "dikimBaslangicTarihi", "paketlemeTarihi", bedenler, "kesilenMetraj", "etiketBilgi", numara, "barkodTalimat", "fiyatSticker", "kkDurumu", "sevkDurumu", "notKritik", "eklenmeTarihi", "updatedAt") FROM stdin;
de0a176a-5547-438c-a447-fad31d0b1e69	D1103-1 NEFTİ	FW26 	COLLECTION	102409604	COK13006	%52 VISKOZ, %48 VIOZEL	18/07/2026			[{"beden": "34", "netAdet": "", "bedenAdi": "XS", "kesilenAdet": "", "ikiKaliteAdet": ""}, {"beden": "36", "netAdet": "", "bedenAdi": "S", "kesilenAdet": "", "ikiKaliteAdet": ""}, {"beden": "38", "netAdet": "", "bedenAdi": "M", "kesilenAdet": "", "ikiKaliteAdet": ""}, {"beden": "40", "netAdet": "", "bedenAdi": "L", "kesilenAdet": "", "ikiKaliteAdet": ""}, {"beden": "42", "netAdet": "", "bedenAdi": "XL", "kesilenAdet": "", "ikiKaliteAdet": ""}, {"beden": "44", "netAdet": "", "bedenAdi": "XXL", "kesilenAdet": "", "ikiKaliteAdet": ""}, {"beden": "46", "netAdet": "", "bedenAdi": "3XL", "kesilenAdet": "", "ikiKaliteAdet": ""}, {"beden": "48", "netAdet": "", "bedenAdi": "4XL", "kesilenAdet": "", "ikiKaliteAdet": ""}]									2026-07-20 11:01:08.385	2026-07-20 11:01:08.385
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
780bae68-4ef9-42eb-b82b-6e156947b752	609cb3817046359fc62b69f293e3903cd198aae0f3510bf462c59f9ad4035ff7	2026-07-17 20:49:36.707017+00	20260708185026_init	\N	\N	2026-07-17 20:49:36.701121+00	1
a4f8c630-440f-4e49-b026-c5c4ced0cd7a	e3cfeedcb9360d55d4965d20bd189355519226c904ae32241ddd507863d1c50d	2026-07-17 20:49:36.726083+00	20260717202312_init	\N	\N	2026-07-17 20:49:36.708159+00	1
4e83e7f0-29b6-4a61-bd8a-b79e9c850413	2dfa769f671c276634c4fecd3e2d0fb1a5e3d2d7e72e9d8ea0e10b50e0edb1a2	2026-07-17 20:49:36.734971+00	20260717204821_update_cekme_fabric	\N	\N	2026-07-17 20:49:36.727761+00	1
49e7d993-ded6-4210-8fe6-388063142a60	bb712e3efc3548e3033055a8c5cad215aed53411d9aab053969b11a6bf22ff02	2026-07-17 20:49:43.721412+00	20260717204943_update_roll_model	\N	\N	2026-07-17 20:49:43.715357+00	1
9757b014-6b04-48a7-876e-a597056c54d9	faa99b06ac74143e634db95ff49d26af893673c2322bef9d3225881321cb10f6	2026-07-17 21:25:41.887619+00	20260717212541_add_takip_foyu_id	\N	\N	2026-07-17 21:25:41.884351+00	1
9db86b9e-c7ef-42cb-988d-2756fbe0d6e7	72366cc2ac8cad55dfb4e42ae984afe8b1f4dd5e25c184bb7b81edb27b1ef6bf	2026-07-17 21:40:15.233689+00	20260717214015_add_birim_to_kumastakip	\N	\N	2026-07-17 21:40:15.229549+00	1
\.


--
-- PostgreSQL database dump complete
--

\unrestrict pemIUZ8YC36XKN8fxqQgz83P0R8LdW3BoYsU2u5rPpSglEmN4l7Kji318Wyccg3

