# HarvestProject
# Grupi liikmed
Teet Triisa, Kertu Mikk, Grete Ojavere, Kärt Nigols
# Installijuhend
1. Installi ja sätesta PHP, MySQL ja Apache server
2. Lae repositooriumi sisu apache jaoks sätestatud kausta
3. Kasutades faili database.sql impordi tabelid
    1.2. Käsureale kirjuta : mysql -u username -p database_name < database.sql;
4. Täita config fail configExample.php järgi
# Kasutusjuhend
1. Uue kasutaja registreerimine
    1.1. Kommenteeri sisse controller.php faili read 43-52 1.2. Reale 45 kirjuta ülakomade vahele soovitud kasutajanimi ja reale 46 sulgudesse ülakomade vahele soovitud salasõna
    1.3. Mine lehele ../controller.php?action=register
    1.4. Kommenteeri uuesti välja controller.php read 43-52
2. Mängu loomiseks mine lehele ../host.html
3. Mängu mängimiseks mine lehele ../index.html