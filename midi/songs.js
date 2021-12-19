﻿let midi_songs={0:["#2Маши","Босая"],1:["Adele","Hello"],2:["Adele","Rolling In The Deep"],3:["Adele","Rolling In The Deep"],4:["Alekseev","Океанами Стали"],5:["Alekseev","Пьяное солнце"],6:["Ariana Grande","7Rings"],7:["Ariana Grande","into you"],8:["Ariana Grande","One Last Time"],9:["Artik & Asti","Девочка Танцуй"],10:["Artik & Asti","Истеричка"],11:["Ava Max","So Am I"],12:["Ava Max","Sweet But Psyco"],13:["Bebe Rexha","I Got You"],14:["Bruno Mars","Grenade"],15:["Charlie Puth","Attention"],16:["Dabro","На часах ноль ноль"],17:["Dabro","Услышит Весь Район"],18:["Dabro","Юность"],19:["Doja Cat","Say So"],20:["Dotan","Numb"],21:["Dua Lipa","Break My Heart"],22:["Dua Lipa","Don't Start Now"],23:["Dua Lipa","Physical"],24:["Ed Sheeran","Afterglow"],25:["Ed Sheeran","Bad Habits"],26:["Ed Sheeran","Shape of You"],27:["Foushee","Deep End"],28:["Imagine Dragons","Believer"],29:["Inna","Flashbacks"],30:["Jason Derulo","it girl"],31:["Jason Derulo","Take You Dancing"],32:["Jonas Brothers","Sucker"],33:["Jony","Комета"],34:["Katy Perry","Hot N Cold"],35:["Katy Perry","I Kissed A Girl"],36:["Kazka","Плакала"],37:["Maroon 5","Animals"],38:["Maroon 5","She Will Be Loved"],39:["Mary Gu","Косички"],40:["Meghan Trainor","All About That Bass"],41:["Mozdi","Zavtra"],42:["Niletto","Любимка"],43:["Rita Ora","Anywhere"],44:["Rita Ora","I Will Never Let You..."],45:["Rita Ora","Let You Love Me"],46:["Sam Smith","Stay With Me"],47:["Sia","Cheap Thrills"],48:["Sia","Unstoppable"],49:["The Weeknd","Blinding Lights"],50:["The Weeknd","Save Your Tears"],51:["Tones And I "," Dance Monkey"],52:["Twenty One Pilots","Stressed Out"],53:["Years and Years","King"],54:["Years and Years","Shine"],55:["Zivert","Credo"],56:["Zivert","Life"],57:["Zivert","Тебе"],58:["Ани Лорак","Наполовину"],59:["Артур Пирожков","Зацепила"],60:["Баста","Сансара"],61:["Вера Брежнева","Розовый дым"],62:["Время и Стекло","Имя 505"],63:["Джарахов","Бегу По Кругу"],64:["Дима Билан","На Берегу Неба"],65:["Дима Билан","Не молчи"],66:["Дима Билан","Это была любовь"],67:["Егор Крид","Мне Нравится"],68:["Егор Крид","Потрачу"],69:["Егор Крид","Слеза"],70:["Елка","Около тебя"],71:["Елка","Ты Моя Звезда"],72:["Клава Кока","Ла Ла Ла"],73:["Лобода","Алло"],74:["Лобода","Новый Рим"],75:["Лобода","Родной"],76:["Лобода","Твои Глаза"],77:["Макс Барских","Лей Не Жалей"],78:["Макс Барских","Туманы"],79:["Мичелз","Хоть Убей"],80:["Мот","Август Это Ты"],81:["Мот","Капкан"],82:["Мэвл","Холодок"],83:["Сергей Лазарев ","Лови"],84:["Сергей Лазарев","В Самое Сердце"],85:["Сергей Лазарев","Шепотом"],86:["Серебро","Мало Тебя"],87:["Серебро","Между Нами Любовь"],88:["Серебро","Отпусти Меня"],89:["Хабиб","Ягодка Малинка"],90:["Валерий Меладзе","Красиво"],91:["Валерий Меладзе","Небеса"],92:["Kwabs","Walk"],93:["The Weeknd","Cant Feel My Face"],94:["Лобода","Пуля-Дура"],95:["Rihanna","Diamonds"],96:["Ханна","Омар Хаям"],97:["Дима Билан","Она Моя"],98:["Максим","Спасибо"],99:["Avicii","Wake Me Up"],100:["BTS","Dynamite"],101:["OneRepublic","If I Lose Myself"],102:["Dean Lewis","Be Alright"],103:["Юлия Савичева","Сияй"],104:["Hozier","Take Me To Church"],105:["Imagine Dragons","Thunder"],106:["Потап и Настя","Чумачечая Весна"],107:["IOWA","Маршрутка"],108:["Elvira T","Все Решено"],109:["Серебро","Перепутала"],110:["Dan Balan","Лишь До Утра"],111:["Алексей Воробьев","Я Тебя Люблю"],112:["John Legend","All Of Me"],113:["Shakira","Try Everything"],114:["Bruno Mars","It Will Rain"],115:["One Direction","Drag Me Down"],116:["Carly Rae Jepsen","I Really Like You"],117:["Максим","Золотыми Рыбками"],118:["Потап и Настя","Бумдиггибай"],119:["Ваня Дмитриенко","Венера-Юпитер"],120:["HammAli & Navai","Прятки"],121:["Artik & Asti","Под Гипнозом"],122:["OneRepublic","Counting Stars"],123:["Miley Cyrus","Wrecking Ball"],124:["Pink","Try"],125:["Flo Rida","Whistle"],126:["Artik & Asti","Грустный Дэнс"],127:["Люся Чеботина","Солнце Монако"],128:["Taylor Swift","Shake It Off"],129:["Hurts","Redemption"],130:["Юлианна Кара...","Внеорбитные"],131:["John Newman","Love Me Again"],132:["Taylor Swift","Blank Space"],133:["Shakira & Rihanna","Cant Remember To.."],134:["Fifth Harmony","Work"],135:["DEAD BLONDE","Мальчик на девятке"],136:["Alan Walker","Faded"],137:["The Weeknd","The Hills"],138:["Ava Max","Salt"],139:["Zivert","ЯТЛ"],140:["Nessa Barrett","La Di Die"],141:["Alvaro Soler","La Cintura"],142:["Miley Cyrus","We Cant Stop"],143:["Camila Cabello...","Senorita"],144:["Винтаж","Роман"],145:["Мумий тролль...","Башня"]};
