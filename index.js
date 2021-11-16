var M_WIDTH = 450, M_HEIGHT = 800, game_platform="", app, gres, objects = {}, my_data = {}, game_tick = 0, state ="";
var g_process = () => {};

let midi_songs=[["2Маши","Босая"],["Adele","Hello"],["Adele","Rolling In The Deep"],["Adele","Rolling In The Deep"],["ArianaGrande","7Rings"],["ArianaGrande","into you"],["ArianaGrande","One Last Time"],["Artik & Asti","Девочка Танцуй"],["Artik & Asti","Истеричка"],["Ava Max","So Am I"],["Ava Max","Sweet But Psyco"],["Bebe Rexha","I Got You"],["Bruno Mars","Grenade"],["Charlie Puth","Attention"],["Dabro","На часах ноль ноль"],["Dabro","Услышит Весь Район"],["Dabro","Юность"],["Doja Cat","Say So"],["Dotan","Numb"],["Dua Lipa","Break My Heart"],["Dua Lipa","Don't Start Now"],["Dua Lipa","Physical"],["Ed Sheeran","Afterglow"],["Ed Sheeran","Bad Habits"],["Ed Sheeran","Shape of You"],["Foushee","Deep End"],["Imagine Dragons","Believer"],["Inna","Flashbacks"],["Jason Derulo","it girl"],["Jason Derulo","Take You Dancing"],["Jonas Brothers","Sucker"],["Jony","Комета"],["Katy Perry","Hot N Cold"],["Katy Perry","I Kissed A Girl"],["Kazka","Плакала"],["Maroon 5","Animals"],["Maroon 5","She Will Be Loved"],["Mary Gu","Косички"],["Meghan Trainor","All About That Bass"],["Mozdi","Zavtra"],["Niletto","Любимка"],["Rita Ora","Anywhere"],["Rita Ora","I Will Never Let You Down"],["Rita Ora","Let You Love Me"],["Время и Стекло","Имя 505"],["Серебро","Мало Тебя"],["Серебро","Между Нами Любовь"],["Серебро","Отпусти Меня"]];

rnd= Math.random;
rnd2= function(min,max) {	
	let r=Math.random() * (max - min) + min
	return Math.round(r * 100) / 100
};
irnd=function(min,max) {	
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

var anim = {

	c1: 1.70158,
	c2: 1.70158 * 1.525,
	c3: 1.70158 + 1,
	c4: (2 * Math.PI) / 3,
	c5: (2 * Math.PI) / 4.5,

	slot: [null, null, null, null, null, null, null, null, null, null, null],
	linear: function(x) {
		return x
	},
	linear_and_back: function(x) {

		return x < 0.2 ? x * 5 : 1.25 - x * 1.25

	},
	easeOutElastic: function(x) {
		return x === 0 ?
			0 :
			x === 1 ?
			1 :
			Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * this.c4) + 1;
	},
	easeOutBounce: function(x) {
		const n1 = 7.5625;
		const d1 = 2.75;

		if (x < 1 / d1) {
			return n1 * x * x;
		} else if (x < 2 / d1) {
			return n1 * (x -= 1.5 / d1) * x + 0.75;
		} else if (x < 2.5 / d1) {
			return n1 * (x -= 2.25 / d1) * x + 0.9375;
		} else {
			return n1 * (x -= 2.625 / d1) * x + 0.984375;
		}
	},
	easeOutCubic: function(x) {
		return 1 - Math.pow(1 - x, 3);
	},
	easeOutQuart: function(x) {
		return 1 - Math.pow(1 - x, 4);
	},
	easeOutQuint: function(x) {
		return 1 - Math.pow(1 - x, 5);
	},
	easeInCubic: function(x) {
		return x * x * x;
	},
	easeInQuint: function(x) {
		return x * x * x * x * x;
	},	
	easeInOutQuad: function(x) {
		return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
	},	
	ease2back : function(x) {
		return Math.sin(x*Math.PI*2);
	},
	easeOutBack: function(x) {
		return 1 + this.c3 * Math.pow(x - 1, 3) + this.c1 * Math.pow(x - 1, 2);
	},
	easeInBack: function(x) {
		return this.c3 * x * x * x - this.c1 * x * x;
	},
	add_scl: function(params) {

		if (params.callback === undefined)
			params.callback = () => {};

		//ищем свободный слот для анимации
		for (var i = 0; i < this.slot.length; i++) {

			if (this.slot[i] === null) {

				params.obj.visible = true;
				params.obj.alpha = 1;
				params.obj.ready = false;

				var delta = params.val[1] - params.val[0];
				this.slot[i] = {
					obj: params.obj,
					param: params.param,
					vis_on_end: params.vis_on_end,
					delta,
					func: this[params.func].bind(anim),
					start_val: params.val[0],
					speed: params.speed,
					progress: 0,
					callback: params.callback
				};
				
				if (params.param === 'x')
					this.slot[i].process_func = this.process_scl_x.bind(this);
				if (params.param === 'y')
					this.slot[i].process_func = this.process_scl_y.bind(this);
				if (params.param === 'xy')
					this.slot[i].process_func = this.process_scl_xy.bind(this);
				
				return;
			}

		}

		console.log("Нет свободных слотов для анимации");

	},
	process: function() {
		for (var i = 0; i < this.slot.length; i++)
			if (this.slot[i] !== null)
				this.slot[i].process_func(i);
	},

	process_scl_x: function(i) {

		this.slot[i].obj.scale.x = this.slot[i].start_val + this.slot[i].delta * this.slot[i].func(this.slot[i].progress);

		if (this.slot[i].progress >= 1) {
			this.slot[i].callback();
			this.slot[i].obj.visible = this.slot[i].vis_on_end;
			this.slot[i].obj.ready = true;
			this.slot[i] = null;
			return;
		}

		this.slot[i].progress += this.slot[i].speed;
	},

	process_scl_y: function(i) {

		this.slot[i].obj.scale.y = this.slot[i].start_val + this.slot[i].delta * this.slot[i].func(this.slot[i].progress);

		if (this.slot[i].progress >= 1) {
			this.slot[i].callback();
			this.slot[i].obj.visible = this.slot[i].vis_on_end;
			this.slot[i].obj.ready = true;
			this.slot[i] = null;
			return;
		}

		this.slot[i].progress += this.slot[i].speed;
	},

	process_scl_xy: function(i) {

		let new_scl = this.slot[i].start_val + this.slot[i].delta * this.slot[i].func(this.slot[i].progress);
		this.slot[i].obj.scale.x = this.slot[i].obj.scale.y = new_scl;

		if (this.slot[i].progress >= 1) {
			this.slot[i].callback();
			this.slot[i].obj.visible = this.slot[i].vis_on_end;
			this.slot[i].obj.ready = true;
			this.slot[i] = null;
			return;
		}

		this.slot[i].progress += this.slot[i].speed;
	}
	
	
	
	
	

}

var anim2= {
		
	slot: [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
	
	linear: function(x) {
		return x
	},
	
	kill_anim: function(obj) {
		
		for (var i=0;i<this.slot.length;i++)
			if (this.slot[i]!==null)
				if (this.slot[i].obj===obj)
					this.slot[i]=null;		
	},
	
	easeOutBack: function(x) {
		return 1 + this.c3 * Math.pow(x - 1, 3) + this.c1 * Math.pow(x - 1, 2);
	},
	
	easeInBack: function(x) {
		return this.c3 * x * x * x - this.c1 * x * x;
	},
	
	easeInQuad: function(x) {
		return x * x;
	},
	
	easeInOutCubic: function(x) {
		return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
	},
	
	add : function(obj, params, vis_on_end, speed, func) {
				
		//если уже идет анимация данного спрайта то отменяем ее
		for (var i=0;i<this.slot.length;i++)
			if (this.slot[i]!==null)
				if (this.slot[i].obj===params.obj)
					this.slot[i]=null;
		
		let f=0;
		//ищем свободный слот для анимации
		for (var i = 0; i < this.slot.length; i++) {

			if (this.slot[i] === null) {

				obj.visible = true;
				obj.ready = false;

				//добавляем дельту к параметрам и устанавливаем начальное положение
				for (let key in params) {
					params[key][2]=params[key][1]-params[key][0];					
					obj[key]=params[key][0];		
				}


				this.slot[i] = {
					obj: obj,
					params: params,
					vis_on_end: vis_on_end,
					func: this[func].bind(anim),
					speed: 1.0 / Math.round( 1 / speed),
					progress: 0
				};
				f = 1;
				break;
			}
		}
		
		if (f===0) {
			console.log("Кончились слоты анимации");			
			return new Promise(function(resolve, reject){					
			  resolve();	  		  
			});	
		}
		else {
			return new Promise(function(resolve, reject){					
			  anim2.slot[i].p_resolve = resolve;	  		  
			});			
			
		}

		
		

	},
	
	process_func : function () {
		
		for (let key in params)
			params[key][2]=params[key][1]-params[key][0];
		
		
	},	
	
	process: function () {
		
		for (var i = 0; i < this.slot.length; i++)
		{
			if (this.slot[i] !== null) {
				
				let s=this.slot[i];
				
				s.progress+=s.speed;				
				for (let key in s.params)				
					s.obj[key]=s.params[key][0]+s.params[key][2]*s.func(s.progress);		

				
				//если анимация завершилась то удаляем слот
				if (s.progress>=0.999) {
					for (let key in s.params)				
						s.obj[key]=s.params[key][1];
					
					s.obj.visible=s.vis_on_end;
					s.obj.ready=true;					
					s.p_resolve('finished');
					this.slot[i] = null;
				}
			}			
		}
		
	}
	
}

class song_opt_class extends PIXI.Container {
	
	constructor(id, w, h) {
		
		super();
		this.id = id;
		this.visible = false;
		this.bcg=new PIXI.Sprite(gres.opt_bcg.texture);
		
		this.bcg.interactive=true;
		this.bcg.buttonMode = true;
		this.bcg.pointerover=function(){this.tint=0x55ffff};
		this.bcg.pointerout=function(){this.tint=0xffffff};		
		var cid = this.id;
		this.bcg.pointerdown = function(){game.opt_down(cid)};
		this.t=new PIXI.BitmapText('-', {fontName: 'Century Gothic', fontSize: 20});		
		this.t.anchor.set(0.5,0.5);
		this.t.maxWidth = w-30;
		this.t.x = w/2;
		this.t.y = h/2;
		this.addChild(this.bcg,this.t);	
	}	
	
}

class lb_player_card_class extends PIXI.Container{
	
	constructor(x,y,place) {
		super();

		this.bcg=new PIXI.Sprite(game_res.resources.lb_player_card_bcg.texture);
		this.bcg.interactive=true;
		this.bcg.pointerover=function(){this.tint=0x55ffff};
		this.bcg.pointerout=function(){this.tint=0xffffff};
				
		
		this.place=new PIXI.BitmapText("1", {fontName: 'Century Gothic', fontSize: 24});
		this.place.x=20;
		this.place.y=20;
		this.place.tint=0x220022;
		
		this.avatar=new PIXI.Sprite();
		this.avatar.x=40;
		this.avatar.y=10;
		this.avatar.width=this.avatar.height=48;
		
		
		this.name=new PIXI.BitmapText(' ', {fontName: 'Century Gothic', fontSize: 25});
		this.name.x=100;
		this.name.y=20;
		this.name.tint=0x002222;
		
	
		this.record=new PIXI.BitmapText(' ', {fontName: 'Century Gothic', fontSize: 30});
		this.record.x=340;
		this.record.tint=0x002222;
		this.record.y=20;		
		
		this.addChild(this.bcg,this.place, this.avatar, this.name, this.record);		
	}
	
	
}

var make_text = function (obj, text, max_width) {
		
	let sum_v=0;
	let f_size=obj.fontSize;
	
	for (let i=0;i<text.length;i++) {
		
		let code_id=text.charCodeAt(i);
		let char_obj=game_res.resources.m2_font.bitmapFont.chars[code_id];
		if (char_obj===undefined) {
			char_obj=game_res.resources.m2_font.bitmapFont.chars[83];			
			text = text.substring(0, i) + 'S' + text.substring(i + 1);
		}		

		sum_v+=char_obj.xAdvance*f_size/64;	
		if (sum_v>max_width) {
			obj.text =  text.substring(0,i-1);					
			return;
		}
	}
	
	obj.text =  text;	
}

var big_message = {
	
	p_resolve : 0,
		
	show: function(t1,t2) {
				
		if (t2!==undefined || t2!=="")
			objects.big_message_text2.text=t2;
		else
			objects.big_message_text2.text='**********';

		objects.big_message_text.text=t1;
			
		anim2.add(objects.big_message_cont,{y:[-180, objects.big_message_cont.sy]}, true, 0.02,'easeOutBack');
				
		return new Promise(function(resolve, reject){					
			big_message.p_resolve = resolve;	  		  
		});
	},

	close : function() {
		
		if (objects.big_message_cont.ready===false)
			return;

		game_res.resources.close.sound.play();
		anim2.add(objects.big_message_cont,{y:[objects.big_message_cont.sy,450]}, false, 0.02,'easeInBack');
		this.p_resolve("close");			
	}

}

var	show_ad=function(){
		
	if (game_platform==="YANDEX") {			
		//показываем рекламу
		window.ysdk.adv.showFullscreenAdv({
		  callbacks: {
			onClose: function() {}, 
			onError: function() {}
					}
		})
	}
	
	if (game_platform==="VK") {
				 
		vkBridge.send("VKWebAppShowNativeAds", {ad_format:"interstitial"})
		.then(data => console.log(data.result))
		.catch(error => console.log(error));	
	}		
}

function vis_change() {
	
	if (document.hidden===true) {
		//game.process_finish_game(1,0);
	}	
}

var auth = function() {
	
	return new Promise((resolve, reject)=>{

		let help_obj = {

			loadScript : function(src) {
			  return new Promise((resolve, reject) => {
				const script = document.createElement('script')
				script.type = 'text/javascript'
				script.onload = resolve
				script.onerror = reject
				script.src = src
				document.head.appendChild(script)
			  })
			},

			init: function() {

				g_process=function() { help_obj.process()};

				let s = window.location.href;

				//-----------ЯНДЕКС------------------------------------
				if (s.includes("yandex")) {
					game_platform="YANDEX";
					Promise.all([
						this.loadScript('https://yandex.ru/games/sdk/v2')
					]).then(function(){
						help_obj.yandex();
					}).catch(function(e){
						alert(e);
					});
					return;
				}


				//-----------ВКОНТАКТЕ------------------------------------
				if (s.includes("vk.com")) {
					game_platform="VK";
					Promise.all([
						this.loadScript('//ad.mail.ru/static/admanhtml/rbadman-html5.min.js'),
						this.loadScript('//vk.com/js/api/adman_init.js'),
						this.loadScript('https://unpkg.com/@vkontakte/vk-bridge/dist/browser.min.js')

					]).then(function(){
						help_obj.vk()
					}).catch(function(e){
						alert(JSON.stringify(e));
					});
					return;
				}

				//-----------ЛОКАЛЬНЫЙ СЕРВЕР--------------------------------
				if (s.includes("192.168")) {
					game_platform="debug";
					help_obj.debug();
					return;
				}

				//-----------НЕИЗВЕСТНОЕ ОКРУЖЕНИЕ---------------------------
				game_platform="unknown";
				help_obj.unknown();

			},

			yandex: function() {

				if(typeof(YaGames)==='undefined')
				{
					help_obj.local();
				}
				else
				{
					//если sdk яндекса найден
					YaGames.init({}).then(ysdk => {

						//фиксируем SDK в глобальной переменной
						window.ysdk=ysdk;

						//запрашиваем данные игрока
						return ysdk.getPlayer();


					}).then((_player)=>{

						my_data.name 	= _player.getName();
						my_data.uid 	= _player.getUniqueID().replace(/\//g, "Z");
						my_data.pic_url = _player.getPhoto('medium');

						//console.log(`Получены данные игрока от яндекса:\nимя:${my_data.name}\nid:${my_data.uid}\npic_url:${my_data.pic_url}`);

						//если личные данные не получены то берем первые несколько букв айди
						if (my_data.name=="" || my_data.name=='')
							my_data.name=my_data.uid.substring(0,5);

						help_obj.process_results();

					}).catch((err)=>{
						
						//загружаем из локального хранилища если нет авторизации в яндексе
						help_obj.local();

					})
				}
			},

			vk: function() {


				//vkBridge.subscribe((e) => this.vkbridge_events(e));
				vkBridge.send('VKWebAppInit').then(()=>{
					
					return vkBridge.send('VKWebAppGetUserInfo');
					
				}).then((e)=>{
					
					my_data.name 	= e.first_name + ' ' + e.last_name;
					my_data.uid 	= "vk"+e.id;
					my_data.pic_url = e.photo_100;

					help_obj.process_results();		
					
				}).catch(function(e){
					
					alert(JSON.stringify(e));
					
				});
				

			},

			debug: function() {

				let uid = prompt('Отладка. Введите ID', 100);

				my_data.name = my_data.uid = "debug" + uid;
				my_data.pic_url = "https://sun9-73.userapi.com/impf/c622324/v622324558/3cb82/RDsdJ1yXscg.jpg?size=223x339&quality=96&sign=fa6f8247608c200161d482326aa4723c&type=album";

				help_obj.process_results();

			},

			local: function(repeat = 0) {

				//ищем в локальном хранилище
				let local_uid = localStorage.getItem('uid');

				//здесь создаем нового игрока в локальном хранилище
				if (local_uid===undefined || local_uid===null) {

					//console.log("Создаем нового локального пользователя");

					let rnd_names=["Бегемот","Жираф","Зебра","Тигр","Ослик","Мамонт","Волк","Лиса","Мышь","Сова","Слон","Енот","Кролик","Бизон","Пантера"];
					let rnd_num=Math.floor(Math.random()*rnd_names.length)
					let rand_uid=Math.floor(Math.random() * 9999999);

					my_data.name 		=	rnd_names[rnd_num]+rand_uid;
					my_data.rating 		= 	1400;
					my_data.uid			=	"ls"+rand_uid;
					my_data.pic_url		=	'https://avatars.dicebear.com/v2/male/'+irnd(10,10000)+'.svg';

					localStorage.setItem('uid',my_data.uid);
					help_obj.process_results();
				}
				else
				{
					//console.log(`Нашли айди в ЛХ (${local_uid}). Загружаем остальное из ФБ...`);
					
					my_data.uid = local_uid;	
					
					//запрашиваем мою информацию из бд или заносим в бд новые данные если игрока нет в бд
					firebase.database().ref("players/"+my_data.uid).once('value').then((snapshot) => {		
									
						var data=snapshot.val();
						
						//если на сервере нет таких данных
						if (data === null) {
													
							//если повтоно нету данных то выводим предупреждение
							if (repeat === 1)
								alert('Какая-то ошибка');
							
							//console.log(`Нашли данные в ЛХ но не нашли в ФБ, повторный локальный запрос...`);	

							
							//повторно запускаем локальный поиск						
							localStorage.clear();
							help_obj.local(1);	
								
							
						} else {						
							
							my_data.pic_url = data.pic_url;
							my_data.name = data.name;
							help_obj.process_results();
						}

					})	

				}


			},

			unknown: function () {

				alert("Неизвестная платформа! Кто Вы?")

				//загружаем из локального хранилища
				help_obj.local();
			},

			process_results: function() {


				//отображаем итоговые данные
				//console.log(`Итоговые данные:\nПлатформа:${game_platform}\nимя:${my_data.name}\nid:${my_data.uid}\npic_url:${my_data.pic_url}`);

				//обновляем базовые данные в файербейс так могло что-то поменяться
				firebase.database().ref("players/"+my_data.uid+"/name").set(my_data.name);
				firebase.database().ref("players/"+my_data.uid+"/pic_url").set(my_data.pic_url);
				firebase.database().ref("players/"+my_data.uid+"/tm").set(firebase.database.ServerValue.TIMESTAMP);

				//вызываем коллбэк
				resolve("ok");
			},

			process : function () {

				objects.id_loup.x=20*Math.sin(game_tick*8)+90;
				objects.id_loup.y=20*Math.cos(game_tick*8)+110;
			}
		}

		help_obj.init();

	});	
	
}

var lb={
	
	add_game_to_vk_menu_shown:0,
	cards_pos: [[20,300],[20,355],[20,410],[20,465],[20,520],[20,575],[20,630]],
	
	activate: function() {
			
		
	
		anim2.add(objects.lb_cards_cont,{x:[450, 0]}, true, 0.03,'linear');
		
		objects.lb_cards_cont.visible=true;
		objects.lb_back_button.visible=true;
		
		for (let i=0;i<7;i++) {			
			objects.lb_cards[i].x=this.cards_pos[i][0];
			objects.lb_cards[i].y=this.cards_pos[i][1];	
			objects.lb_cards[i].place.text=(i+4)+".";			
		}		
		
		this.update();		
	},
	
	close: function() {
							
			
				
		anim2.add(objects.lb_1_cont,{x:[objects.lb_1_cont.x, -450]}, false, 0.03,'linear');
		anim2.add(objects.lb_2_cont,{x:[objects.lb_2_cont.x, -450]}, false, 0.03,'linear');
		anim2.add(objects.lb_3_cont,{x:[objects.lb_3_cont.x, -450]}, false, 0.03,'linear');
		anim2.add(objects.lb_cards_cont,{x:[objects.lb_cards_cont.x, -450]}, false, 0.03,'linear');			

		//gres.close.sound.play();
		
		
		//показываем меню по выводу игры в меню
		if (this.add_game_to_vk_menu_shown===1)
			return;
		
		if (game_platform==='VK')
			vkBridge.send('VKWebAppAddToFavorites');
		
		this.add_game_to_vk_menu_shown=1;
		
	},
	
	back_button_down: function() {
		
		if (any_dialog_active===1 || objects.lb_1_cont.ready===false) {
			game_res.resources.locked.sound.play();
			return
		};	
		
		
		game_res.resources.click.sound.play();
		
		this.close();
		main_menu.activate();
		
	},
	
	update: function () {
		
		
		firebase.database().ref("players").orderByChild('record').limitToLast(25).once('value').then((snapshot) => {
			
			if (snapshot.val()===null) {
			  console.log("Что-то не получилось получить данные о рейтингах");
			}
			else {				
				
				
				objects.lb_1_cont.cacheAsBitmap  = false;
				objects.lb_2_cont.cacheAsBitmap  = false;
				objects.lb_3_cont.cacheAsBitmap  = false;	
				
				var players_array = [];
				snapshot.forEach(players_data=> {			
					if (players_data.val().name!=="" && players_data.val().name!=='')
						players_array.push([players_data.val().name, players_data.val().record, players_data.val().pic_url]);	
				});
				

				players_array.sort(function(a, b) {	return b[1] - a[1];});
				
				
				//загружаем аватары
				var loader = new PIXI.Loader();
								
				var len=Math.min(10,players_array.length);
				
				//загружаем тройку лучших
				for (let i=0;i<3;i++) {
					let p = players_array[i];
					if (p === undefined)
						break;
					
					let fname=p[0];					
					make_text(objects['lb_'+(i+1)+'_name'],fname,180);
										
					//objects['lb_'+(i+1)+'_name'].text=fname;
					objects['lb_'+(i+1)+'_balance'].text = p[1];					
					
					
					let pic_url = p[2];
					
					//меняем адрес который невозможно загрузить
					if (pic_url==="https://vk.com/images/camera_100.png")
						pic_url = "https://i.ibb.co/fpZ8tg2/vk.jpg";					
					
					loader.add('leaders_avatar_'+i, pic_url, {loadType: PIXI.LoaderResource.LOAD_TYPE.IMAGE, timeout: 4000});
				};
				
				//загружаем остальных
				for (let i=3;i<10;i++) {
					
					let p = players_array[i];

					if (p === undefined)
						break;
					
					let fname=p[0];		
					
					make_text(objects.lb_cards[i-3].name,fname,200);
					
					objects.lb_cards[i-3].record.text=players_array[i][1]	;					
					loader.add('leaders_avatar_'+i, players_array[i][2],{loadType: PIXI.LoaderResource.LOAD_TYPE.IMAGE, timeout: 3000});					
					
				};
				
				
				
				loader.load((loader, resources) => {
					

					for (let i=0;i<3;i++)
						objects['lb_'+(i+1)+'_avatar'].texture=resources['leaders_avatar_'+i].texture;						

					objects.lb_1_cont.cacheAsBitmap  = true;
					objects.lb_2_cont.cacheAsBitmap  = true;
					objects.lb_3_cont.cacheAsBitmap  = true;		
					
					anim2.add(objects.lb_1_cont,{x:[450,objects.lb_1_cont.sx]}, false, 0.03,'linear');
					anim2.add(objects.lb_2_cont,{x:[450,objects.lb_1_cont.sx]}, false, 0.03,'linear');
					anim2.add(objects.lb_3_cont,{x:[450,objects.lb_1_cont.sx]}, false, 0.03,'linear');
					
					
					for (let i=3;i<10;i++)						
						objects.lb_cards[i-3].avatar.texture=resources['leaders_avatar_'+i].texture;

				});
			}

		});
		
	}
	
}

function init_game_env() {
			
			
	//загружаем звуковой шрифт
	MIDI.loadPlugin({
		soundfontUrl: "soundfont/",
		onprogress: function(state, progress) {
		},
		onsuccess: function() {
			console.log("Звуковой шрифт загружен")
		}
	});
			
	//инициируем файербейс
	if (firebase.apps.length===0) {
		firebase.initializeApp({
			apiKey: "AIzaSyBG9xnBLS3eGtn7gy58hNVJBSBVUymxA0I",
			authDomain: "melody-4ab2b.firebaseapp.com",
			databaseURL: "https://melody-4ab2b-default-rtdb.europe-west1.firebasedatabase.app",
			projectId: "melody-4ab2b",
			storageBucket: "melody-4ab2b.appspot.com",
			messagingSenderId: "950545734258",
			appId: "1:950545734258:web:bddf99bf8907891702c0eb"
		});
	}
						
	document.getElementById("m_bar").outerHTML = "";
    document.getElementById("m_progress").outerHTML = "";


    app = new PIXI.Application({width: M_WIDTH, height: M_HEIGHT, antialias: false, forceCanvas: false, backgroundAlpha:0.5});
    document.body.appendChild(app.view);

    var resize = function () {
        const vpw = window.innerWidth; // Width of the viewport
        const vph = window.innerHeight; // Height of the viewport
        let nvw; // New game width
        let nvh; // New game height

        if (vph / vpw < M_HEIGHT / M_WIDTH) {
            nvh = vph;
            nvw = (nvh * M_WIDTH) / M_HEIGHT;
        } else {
            nvw = vpw;
            nvh = (nvw * M_HEIGHT) / M_WIDTH;
        }
        app.renderer.resize(nvw, nvh);
        app.stage.scale.set(nvw / M_WIDTH, nvh / M_HEIGHT);
    }

    resize();
    window.addEventListener("resize", resize);

    //создаем спрайты и массивы спрайтов и запускаем первую часть кода
    for (var i = 0; i < load_list.length; i++) {
        const obj_class = load_list[i].class;
        const obj_name = load_list[i].name;
		console.log('Processing: ' + obj_name)
        switch (obj_class) {
        case "sprite":
            objects[obj_name] = new PIXI.Sprite(game_res.resources[obj_name].texture);
            eval(load_list[i].code0);
            break;

        case "block":
            eval(load_list[i].code0);
            break;

        case "cont":
            eval(load_list[i].code0);
            break;

        case "array":
			var a_size=load_list[i].size;
			objects[obj_name]=[];
			for (var n=0;n<a_size;n++)
				eval(load_list[i].code0);
            break;
        }
    }

    //обрабатываем вторую часть кода в объектах
    for (var i = 0; i < load_list.length; i++) {
        const obj_class = load_list[i].class;
        const obj_name = load_list[i].name;
		console.log('Processing2: ' + obj_name)
        switch (obj_class) {
        case "sprite":
            eval(load_list[i].code1);
            break;

        case "block":
            eval(load_list[i].code1);
            break;

        case "cont":	
			eval(load_list[i].code1);
            break;

        case "array":
			var a_size=load_list[i].size;
				for (var n=0;n<a_size;n++)
					eval(load_list[i].code1);	;
            break;
        }
    }
	
	//загружаем данные
    auth().then((val)=> {
		
		return new Promise(function(resolve, reject) {
			let loader=new PIXI.Loader();
			loader.add("my_avatar", my_data.pic_url,{loadType: PIXI.LoaderResource.LOAD_TYPE.IMAGE, timeout: 5000});						
			loader.load(function(l,r) {	resolve(l) });
		});
		
	}).then((loader)=> {		
		
		objects.id_avatar.texture=loader.resources.my_avatar.texture;		
		make_text(objects.id_name,my_data.name,150);
		
		return firebase.database().ref("players/"+my_data.uid).once('value');
		
	}).then((snapshot)=>{
		
		let data=snapshot.val();
				
		if (data.record === undefined)
			my_data.record = 0;
		else
			my_data.record = data.record;
						
		//обновляем данные в файербейс так как это мог быть новый игрок и у него должны быть занесены все данные
		firebase.database().ref("players/"+my_data.uid+"/record").set(my_data.record);
		
		//устанавливаем баланс в попап
		objects.id_record.text = my_data.record;	
		
					
		activity_on=0;	
		
		return new Promise((resolve, reject) => {
			setTimeout(resolve, 1500);
		});
		
	}).then(()=>{		

		anim2.add(objects.id_cont,{y:[objects.id_cont.y,-200]}, false, 0.03,'easeInBack');
	}).catch(function(e){
		alert(e);
	});
		
	

	
	
	main_menu.activate();
	
    //запускаем главный цикл
    main_loop();
}

function load_resources() {

    game_res = new PIXI.Loader();
		
	//короткая ссылка на ресурсы
	gres=game_res.resources;
	
	let git_src="https://akukamil.github.io/melody/"
	//let git_src=""
	
	game_res.add("m2_font", git_src+"m_font.fnt");


	game_res.add('message',git_src+'sounds/message.mp3');
	game_res.add('click',git_src+'sounds/click.wav');
	game_res.add('close',git_src+'sounds/close.mp3');
	game_res.add('lose',git_src+'sounds/lose.mp3');
	game_res.add('locked',git_src+'sounds/locked.mp3');
	game_res.add('applause',git_src+'sounds/applause.mp3');
	
    //добавляем из листа загрузки
    for (var i = 0; i < load_list.length; i++) {
		
        if (load_list[i].class === "sprite" )
            game_res.add(load_list[i].name, git_src+"res/" + load_list[i].name + "." +  load_list[i].image_format);		
		
        if (load_list[i].class === "image")
            game_res.add(load_list[i].name, git_src+"res/" + load_list[i].name + "." +  load_list[i].image_format);
		
	}

		
    game_res.load(init_game_env);
    game_res.onProgress.add(progress);

    function resize_screen() {
        const vpw = window.innerWidth; // Width of the viewport
        const vph = window.innerHeight; // Height of the viewport
        let nvw; // New game width
        let nvh; // New game height

        if (vph / vpw < M_HEIGHT / M_WIDTH) {
            nvh = vph;
            nvw = (nvh * M_WIDTH) / M_HEIGHT;
        } else {
            nvw = vpw;
            nvh = (nvw * M_HEIGHT) / M_WIDTH;
        }
        app.renderer.resize(nvw, nvh);
        app.stage.scale.set(nvw / M_WIDTH, nvh / M_HEIGHT);
    }

    function progress(loader, resource) {

        document.getElementById("m_bar").style.width = Math.round(loader.progress) + "%";
    }

}

function main_loop() {

    //глобальный процессинг
    g_process();
	
	//обработка анимаций
    anim.process();
	anim2.process();
	
	
    requestAnimationFrame(main_loop);
    game_tick += 0.01666666;
}

var game = {
	
	play_start : 0,
	last_play_event : 0,
	song_id : 0,
	songs_opt : [],
	player : {},

	
	get_opt : () => {
		
		let cur_arr = [];
		
		let max_val = midi_songs.length;
		
		while (cur_arr.length !== 6) {			
			let id = irnd(0, max_val);
			if (cur_arr.includes(id) === false) {
				cur_arr.push(id);
			}		
		}
		
		return cur_arr;
		
	},
	
	opt_down(id) {
		
		if (state!=="playing")
			return;
		
		if (game.song_id === id) {
			game_res.resources.applause.sound.play();
			game.close("Правильно");			
		}

		else {
			game_res.resources.lose.sound.play();
			game.close("Неправильно");				
		}

		
	},
	
	activate : async () => {
		
		objects.ready_note.text = "Внимание!"
		await anim2.add(objects.ready_note,{alpha:[0, 1]}, true, 0.01,'linear');	
		await anim2.add(objects.ready_note,{alpha:[1, 0]}, false, 0.01,'linear');	
		objects.ready_note.text = "Слушаем..."
		await anim2.add(objects.ready_note,{alpha:[0, 1]}, true, 0.01,'linear');	
		await anim2.add(objects.ready_note,{alpha:[1, 0]}, false, 0.01,'linear');	
		

		
		//получаем набор вариантов
		game.songs_opt = game.get_opt();
		
		//выбираем случайную песню
		game.song_id = irnd(0, 6);
				
		//показываеми варианты ответов
		for (let i = 0 ; i < 3 ; i++) {			
			let obj = objects['opt_'+i];
			obj.t.text = midi_songs[game.songs_opt[i]][0] + "-" +  midi_songs[game.songs_opt[i]][1];
			await anim2.add(obj,{x:[-200, obj.sx]}, true, 0.05,'easeOutBack');			
		}
		for (let i = 3 ; i < 6 ; i++) {			
			let obj = objects['opt_'+i];
			obj.t.text = midi_songs[game.songs_opt[i]][0] + "-" +  midi_songs[game.songs_opt[i]][1];
			await anim2.add(obj,{x:[450, obj.sx]}, true, 0.05,'easeOutBack');			
		}
		
		

		g_process = function() {game.process()};
		game.last_play_event = game_tick;
		game.play_midi();

		
	},
	
	play_midi : () => {
		
		
		//выбираем случайную песню
		game.player = MIDI.Player;
		game.player.timeWarp = 1.25; // speed the song is played back
		let total_notes = 0;
		let artist = midi_songs[game.songs_opt[game.song_id]][0];
		let song = midi_songs[game.songs_opt[game.song_id]][1];
		console.log(`Играем: ${artist} - ${song}`)
		
		game.player.loadFile("midi/"+game.songs_opt[game.song_id] +".mid", () =>{
			state = "playing";
			game.player.start();
		});			
		
		let fin_notes =0;
		game.player.removeListener(); // removes current listener.
		game.player.addListener(function(data) { // set it to your own function!
			var now = data.now; // where we are now
			var end = data.end; // time when song ends
			var channel = data.channel; // channel note is playing on
			var message = data.message; // 128 is noteOff, 144 is noteOn
			var note = data.note; // the note
			var velocity = data.velocity; // the velocity of the note
									
			game.last_play_event = game_tick;
			
			if (message === 144) {
				
				for (let i =0 ; i < 30 ; i++) {
					
					if (objects.stars[i].visible === false) {									
						
						objects.stars[i].tint = Math.random() * 0xFFFFFF;
						
						anim2.add(objects.stars[i],{
							x:[rnd2(100,350),225 + rnd2(-100,100)],
							y:[rnd2(100,400),250 + rnd2(-100,100)],
							alpha:[1,0],
				
							}, false, 0.005,'easeOutBack');		
					
						break;
					}						
				}					
			}
		});
			

		
	},
	
	process : () =>{
		
		if (game_tick > game.last_play_event +5)
			game.close("Не ответили");
	},
	
	close : async (result) => {
		
		state = "";
		game.player.stop();
		g_process = function() {};
		
		await big_message.show(result,')))');
		for (let i = 0 ; i < 3 ; i++) {			
			let obj = objects['opt_'+i];
			obj.t.text = midi_songs[game.songs_opt[i]][0] + "-" +  midi_songs[game.songs_opt[i]][1];
			await anim2.add(obj,{x:[ obj.sx,-200]}, false, 0.05,'easeOutBack');			
		}
		for (let i = 3 ; i < 6 ; i++) {			
			let obj = objects['opt_'+i];
			obj.t.text = midi_songs[game.songs_opt[i]][0] + "-" +  midi_songs[game.songs_opt[i]][1];
			await anim2.add(obj,{x:[obj.sx,450]}, false, 0.05,'easeInBack');			
		}
		
		main_menu.activate();
		
	}
			
	
}

var cat_menu = {
	
	activate : () => {
		
		anim2.add(objects.cat_menu_cont,{
			x:[450,objects.cat_menu_cont.sx],
			}, true, 0.05,'linear');	
		
	},
	
	cat0_down: () => {
		
		cat_menu.close();
		game.activate();
		
		
		
	},
	
	close : () => {
		
		anim2.add(objects.cat_menu_cont,{
			x:[objects.cat_menu_cont.x,-450],
			}, false, 0.05,'linear');	
	}
	
	
}

var main_menu = {
	
	
	activate : () => {
		
		anim2.add(objects.main_buttons_cont,{
			x:[450,objects.main_buttons_cont.sx],
			}, true, 0.05,'linear');	
		
	},
	
	next_down : () => {
		
		main_menu.close();		
		cat_menu.activate();
		
	},
	
	close : () => {
		
		anim2.add(objects.main_buttons_cont,{
			x:[objects.main_buttons_cont.x,-450],
			}, false, 0.05,'linear');	
	}
	
	
	
}