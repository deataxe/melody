var M_WIDTH = 450, M_HEIGHT = 800, game_platform="", app, gres, objects = {}, my_data = {}, game_tick = 0, state ="", audio_context;
var g_process = () => {};
var g_instrument ={};

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

var anim2= {
		
	c1: 1.70158,
	c2: 1.70158 * 1.525,
	c3: 1.70158 + 1,
	c4: (2 * Math.PI) / 3,
	c5: (2 * Math.PI) / 4.5,
		
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
	
	easeOutSine: function(x) {
		return Math.sin( x * Math.PI * 0.5);
	},
	
	easeOutCubic: function(x) {
		return 1 - Math.pow(1 - x, 3);
	},
	
	easeInBack: function(x) {
		return this.c3 * x * x * x - this.c1 * x * x;
	},
	
	easeInQuad: function(x) {
		return x * x;
	},
	
	ease2back : function(x) {
		return Math.sin(x*Math.PI);
	},
	
	easeInOutCubic: function(x) {
		return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
	},
	
	add : function(obj, params, vis_on_end, time, func, anim3_origin) {
				
		//если уже идет анимация данного спрайта то отменяем ее
		anim2.kill_anim(obj);
		if (anim3_origin === undefined)
			anim3.kill_anim(obj);


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
				
				//для возвратных функцие конечное значение равно начальному
				if (func === 'ease2back')
					for (let key in params)
						params[key][1]=params[key][0];					

					

				this.slot[i] = {
					obj: obj,
					params: params,
					vis_on_end: vis_on_end,
					func: this[func].bind(anim2),
					speed: 0.01818 / time,
					progress: 0
				};
				f = 1;
				break;
			}
		}
		
		if (f===0) {
			console.log("Кончились слоты анимации");	
			
			
			//сразу записываем конечные параметры анимации
			for (let key in params)				
				obj[key]=params[key][1];			
			obj.visible=vis_on_end;
			obj.alpha = 1;
			obj.ready=true;
			
			
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
					s.obj.alpha = 1;
					s.obj.ready=true;					
					s.p_resolve('finished');
					this.slot[i] = null;
				}
			}			
		}
		
	}
	
}

var anim3 = {
			
	slot: [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
	
	kill_anim: function(obj) {
		
		for (var i=0;i<this.slot.length;i++)
			if (this.slot[i]!==null)
				if (this.slot[i].obj===obj)
					this.slot[i]=null;		
	},
	
	add : function (obj, params, schedule, func = 0, repeat = 0) {
		
		//anim3.add(objects.header0,['x','y'],[{time:0,val:[0,0]},{time:1,val:[110,110]},{time:2,val:[0,0]}],'easeInOutCubic');	
		
		
		//если уже идет анимация данного спрайта то отменяем ее
		anim3.kill_anim(obj);
		
		
		//ищем свободный слот для анимации
		for (var i = 0; i < this.slot.length; i++) {

			if (this.slot[i] === null) {
				
				obj.ready = true;
				
				//если это точечная анимация то сразу устанавливаем первую точку
				if (func === 0)
					for (let i=0;i<params.length;i++)
						obj[params[i]]=schedule[0].val[i]
				
				this.slot[i] = {
					obj: obj,
					params: params,
					schedule: schedule,
					func: func,
					start_time : game_tick,
					cur_point: 0,
					next_point: 1,
					repeat: repeat
				};
				f = 1;
				break;
			}
		}		
	},
	
	process: function () {
		
		for (var i = 0; i < this.slot.length; i++)
		{
			if (this.slot[i] !== null) {
				
				let s=this.slot[i];
				
				//это точечная анимация
				if (s.func === 0) {
					
					let time_passed = game_tick - s.start_time;
					let next_point_time = s.schedule[s.next_point].time;
					
					//если пришло время следующей точки то устанавливаем параметры из нее
					if (time_passed > next_point_time) {
						
						for (let i=0;i<s.params.length;i++)
							s.obj[s.params[i]]=s.schedule[s.next_point].val[i]
											
						s.next_point++;		
												
						if (s.next_point === s.schedule.length) {							

							if (s.repeat === 1) {
								s.start_time = game_tick
								s.next_point = 1;
								
								
							}
							else
								this.slot[i]=null;							
						}
					}
					
					
				}
				else
				{
					//это вариант с твинами между контрольными точками
					
					if (s.obj.ready === true) {
												
						let p0 = s.schedule[s.cur_point];
						let p1 = s.schedule[s.next_point];
						let time = p1.time - p0.time;
						
						let cur_schedule={};	
						
						for (let i = 0 ; i < s.params.length ; i++) {						
							let p = s.params[i];
							cur_schedule[p]=[p0.val[i],p1.val[i]]						
						}
						
						
						anim2.add(s.obj,cur_schedule,true,time,s.func,1);		
						s.cur_point++;
						s.next_point++;
						
						//если больше нет контрольных точек то убираем слот или начинаем сначала
						if (s.next_point === s.schedule.length) {
							
							if (s.repeat === 1) {
								s.cur_point = 0;
								s.next_point = 1;
							}
							else
								this.slot[i]=null;						
						}
					}		
				}
			}			
		}		
	}
	

}

class song_opt_class extends PIXI.Container {
	
	constructor(id, w, h, bcg_col) {
		
		super();
		this.id = id;
		this.bcg=new PIXI.Sprite(gres.opt_bcg.texture);
		
		this.bcg.interactive=true;
		this.bcg.buttonMode = true;
		this.bcg.pointerover=function(){this.tint=0x55ffff};
		this.bcg.pointerout=function(){this.tint=0xffffff};		
		var cid = this.id;
		this.bcg.pointerdown = function(){game.opt_down(cid)};
		
		
		this.artist=new PIXI.BitmapText('-', {fontName: 'Century Gothic', fontSize: 25});		
		this.artist.anchor.set(0.5,0.5);
		this.artist.x = w/2;
		this.artist.y = 30;
		this.artist.tint =0xddbea9;
		
		this.song=new PIXI.BitmapText('-', {fontName: 'Century Gothic', fontSize: 20});		
		this.song.anchor.set(0.5,0.5);
		this.song.x = w/2;
		this.song.y = 60;
		this.song.tint =0x8da5a5;
		
		this.addChild(this.bcg,this.artist,this.song);	
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

var results_message = {
	
	p_resolve : 0,
	ready : 0,
		
	show: async function() {
				
		//еще полносью не загрузился далог		
		results_message.ready = 0;
		
		
		objects.bonus_line0.visible = false;
		objects.bonus_line1.visible = false;
		objects.bonus_line2.visible = false;
		objects.bonus_total.visible = false;
		
		//это основной бонус который показываем правильно или нет ответили
		let simple_bonus = game.correct_answers_row > 0 ?  1 : -10;
		
		//показываем надпись верно или нет
		if (simple_bonus === 1)
			objects.bonus_header.texture = gres.bonus_header.texture;			
		else
			objects.bonus_header.texture = gres.error_header.texture;			


		
		await anim2.add(objects.results_message_cont,{y:[-500, objects.results_message_cont.sy]}, true, 2,'easeOutBack');

		
		let speed_bonus = (game.notes_played<10 && simple_bonus === 1)? 9 - game.notes_played : 0;
		let combo_bonus = game.correct_answers_row > 1 ? game.correct_answers_row*2 : 0;
		combo_bonus = Math.min(combo_bonus,20);

		let total_bonus = simple_bonus + speed_bonus + combo_bonus;
		
		
		objects.bonus_line0.text = simple_bonus;
		objects.bonus_line1.text = speed_bonus;
		objects.bonus_line2.text = combo_bonus;
		objects.bonus_total.text = total_bonus;
		
		
		if (simple_bonus > 0) gres.bonus0.sound.play();		
		await anim2.add(objects.bonus_line0,{alpha:[0, 1]}, true, 1,'linear');	
		
		if (speed_bonus > 0) gres.bonus1.sound.play();	
		await anim2.add(objects.bonus_line1,{alpha:[0, 1]}, true, 1,'linear');
		
		if (combo_bonus > 0) gres.bonus2.sound.play();	
		await anim2.add(objects.bonus_line2,{alpha:[0, 1]}, true, 1,'linear');	
		
		await anim2.add(objects.bonus_total,{alpha:[0, 1]}, true, 1,'linear');
		
		results_message.ready = 1;	
		
		
		anim2.add(objects.results_exit,{scale_x:[0, 1]}, true, 1,'easeOutBack');
		anim2.add(objects.results_next,{scale_x:[0, 1]}, true, 1,'easeOutBack');
		

				
		return new Promise(function(resolve, reject){					
			results_message.p_resolve = resolve;	  		  
		});
	},
	
	exit_down : async () => {
		if (results_message.ready === 0 )
			return;
		game_res.resources.click.sound.play();
		await results_message.close();
		await game.close();
		main_menu.activate();
	},
	
	next_down : () => {
		
		if (results_message.ready === 0 )
			return;
		game_res.resources.click.sound.play();
		results_message.close();
		game.restart();		
		
	},

	close : async function() {
		
		if (objects.results_message_cont.ready===false)
			return;
		
		await anim2.add(objects.results_message_cont,{y:[objects.results_message_cont.sy,800]}, false, 1,'easeInBack');
		objects.bonus_line0.text='';
		objects.bonus_line1.text='';
		objects.bonus_line2.text='';
		objects.bonus_total.text='';
		objects.results_exit.visible=false;
		objects.results_next.visible=false;
		
		this.p_resolve("close");			
	}

}

var	show_ad = function(){
		
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

var lb = {
	
	add_game_to_vk_menu_shown:0,
	cards_pos: [[20,300],[20,355],[20,410],[20,465],[20,520],[20,575],[20,630]],
	
	activate: function() {
			
		
	
		anim2.add(objects.lb_cards_cont,{x:[450, 0]}, true, 1,'linear');
		
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
							
			
				
		anim2.add(objects.lb_1_cont,{x:[objects.lb_1_cont.x, -450]}, false, 1,'linear');
		anim2.add(objects.lb_2_cont,{x:[objects.lb_2_cont.x, -450]}, false, 1,'linear');
		anim2.add(objects.lb_3_cont,{x:[objects.lb_3_cont.x, -450]}, false, 1,'linear');
		anim2.add(objects.lb_cards_cont,{x:[objects.lb_cards_cont.x, -450]}, false, 1,'linear');			

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
					
					anim2.add(objects.lb_1_cont,{x:[450,objects.lb_1_cont.sx]}, false, 1,'linear');
					anim2.add(objects.lb_2_cont,{x:[450,objects.lb_1_cont.sx]}, false, 1,'linear');
					anim2.add(objects.lb_3_cont,{x:[450,objects.lb_1_cont.sx]}, false, 1,'linear');
					
					
					for (let i=3;i<10;i++)						
						objects.lb_cards[i-3].avatar.texture=resources['leaders_avatar_'+i].texture;

				});
			}

		});
		
	}
	
}

function init_game_env() {
			
		
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

	//создаем аудиоконтекст
	audio_context = new (window.AudioContext || window.webkitAudioContext)();	
	eval(gres.piano.data);
	instruments.prepare_buffer('acoustic_grand_piano');
	
	
	
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

		anim2.add(objects.id_cont,{y:[objects.id_cont.y,-200]}, false, 1,'easeInBack');
	}).catch(function(e){
		alert(e);
	});
		
	
	
	main_menu.activate();
	
    //запускаем главный цикл
    main_loop();
}

var calibration = {
	
	p_resolve : 0,
	finished : 0,
	value: 0,
	
	play_note : (note, time, duration) => {
		
		return new Promise(resolve => {		
		
			//это источник звука
			var source = audio_context.createBufferSource();
			source.buffer = instruments.buffers['acoustic_grand_piano'][noteToKey[note]];			
			source.connect(audio_context.destination);			
	
			source.gainNode = audio_context.createGain();
			source.gainNode.connect(audio_context.destination);		
			var gain = source.gainNode.gain;
			gain.value = 1;
			source.connect(source.gainNode);


			source.start(audio_context.currentTime + time,0,duration);		
			//source.stop(audio_context.currentTime + time + duration);
			source.onended = resolve;
			
		});		
		
	},
	
	start : async () => {

		
		if (calibration.finished === 1)
			return;
		
		
		await anim2.add(objects.c_cont,{alpha:[0,1]}, true, 1,'linear');	
		await new Promise(resolve => setTimeout(resolve, 2000));	

		let s_time =0;
		let dif = 0;
		let sum = 0;
		
		let start_time = 0;
		let duration_time =0.001;
		let calibration_length = 15;
		for (let i=0;i<calibration_length;i++) {
			
			s_time = audio_context.currentTime;
			await calibration.play_note(50+i,start_time,duration_time);
			dif = (audio_context.currentTime - s_time)-start_time-duration_time;
			objects.c_bar.width = objects.c_bar.base_width * i / (calibration_length - 1);
			sum += dif;
			await new Promise(resolve => setTimeout(resolve, 100));	
		}
		
		
		calibration.value = sum / (calibration_length - 1);
		objects.c_text.text = Math.round(calibration.value*10000)/10000;
		await new Promise(resolve => setTimeout(resolve, 1000));	
		objects.c_cont.visible = false;
		
		calibration.finished = 1;
		
		await anim2.add(objects.c_cont,{alpha:[1,0]}, false, 1,'linear');	
	}	
	
}

let keyToNote = {}; // C8  == 108
let noteToKey = {}; // 108 ==  C8

(function() {
	var A0 = 0x15; // first note
	var C8 = 0x6C; // last note
	var number2key = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
	for (var n = A0; n <= C8; n++) {
		var octave = (n - 12) / 12 >> 0;
		var name = number2key[n % 12] + octave;
		keyToNote[name] = n;
		noteToKey[n] = name;
	}
})();

function load_resources() {
	
		
    game_res = new PIXI.Loader();
		
	//короткая ссылка на ресурсы
	gres=game_res.resources;
	
	//let git_src="https://akukamil.github.io/melody/"
	let git_src=""
	
	game_res.add('piano',git_src+'soundfont/acoustic_grand_piano-ogg.js');
	
	
	game_res.add("m2_font", git_src+"m_font.fnt");

	game_res.add('message',git_src+'sounds/message.mp3');
	game_res.add('click',git_src+'sounds/click.wav');
	game_res.add('close',git_src+'sounds/close.mp3');
	game_res.add('lose',git_src+'sounds/lose.mp3');
	game_res.add('locked',git_src+'sounds/locked.mp3');
	game_res.add('applause',git_src+'sounds/applause.mp3');
	game_res.add('bonus0',git_src+'sounds/bonus0.wav');
	game_res.add('bonus1',git_src+'sounds/bonus1.mp3');
	game_res.add('bonus2',git_src+'sounds/bonus2.mp3');
	
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
	anim2.process();
	anim3.process();

	
    requestAnimationFrame(main_loop);
    game_tick += 0.01666666;
}

var instruments = {
	
	buffers : {},
	_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
	
	
	decodeArrayBuffer: function(input) {
		var bytes = Math.ceil( (3*input.length) / 4.0);
		var ab = new ArrayBuffer(bytes);
		instruments.decode(input, ab);

		return ab;
	},

	decode: function(input, arrayBuffer) {
		//get last chars to see if are valid
		var lkey1 = instruments._keyStr.indexOf(input.charAt(input.length-1));		 
		var lkey2 = instruments._keyStr.indexOf(input.charAt(input.length-1));		 

		var bytes = Math.ceil( (3*input.length) / 4.0);
		if (lkey1 == 64) bytes--; //padding chars, so skip
		if (lkey2 == 64) bytes--; //padding chars, so skip

		var uarray;
		var chr1, chr2, chr3;
		var enc1, enc2, enc3, enc4;
		var i = 0;
		var j = 0;

		if (arrayBuffer)
			uarray = new Uint8Array(arrayBuffer);
		else
			uarray = new Uint8Array(bytes);

		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

		for (i=0; i<bytes; i+=3) {	
			//get the 3 octects in 4 ascii chars
			enc1 = instruments._keyStr.indexOf(input.charAt(j++));
			enc2 = instruments._keyStr.indexOf(input.charAt(j++));
			enc3 = instruments._keyStr.indexOf(input.charAt(j++));
			enc4 = instruments._keyStr.indexOf(input.charAt(j++));

			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;

			uarray[i] = chr1;			
			if (enc3 != 64) uarray[i+1] = chr2;
			if (enc4 != 64) uarray[i+2] = chr3;
		}

		return uarray;	
	},
	
	
	loadScript : src => {
	  return new Promise((resolve, reject) => {
		const script = document.createElement('script')
		script.type = 'text/javascript'
		script.onload = resolve
		script.onerror = reject
		script.src = src
		document.head.appendChild(script)
	  })
	},	

	load_from_file : async (instrument) => {
		
		let file_name = 'soundfont/' + instrument + '-ogg.js'
		await instruments.loadScript(file_name);
		instruments.buffers[instrument] ={};
		
		for (let key in g_instrument.acoustic_grand_piano) {
			var base64 = g_instrument.acoustic_grand_piano[key].split(',')[1];
			var buffer = instruments.decodeArrayBuffer(base64);			
			instruments.buffers[instrument][key] = await audio_context.decodeAudioData(buffer)
		}		
		
	},
	
	prepare_buffer : async (instrument) => {
		
		instruments.buffers[instrument] ={};
		
		for (let key in g_instrument[instrument]) {
			var base64 = g_instrument[instrument][key].split(',')[1];
			var buffer = instruments.decodeArrayBuffer(base64);			
			instruments.buffers[instrument][key] = await audio_context.decodeAudioData(buffer)
		}			
	}
	
}

var game = {
	
	play_start : 0,
	last_play_event : 0,
	song_id : 0,
	total_notes : 0,
	faling_notes_shift : 0,
	song_length : 0,
	avr_dif : 0,
	correct_answers_row : 0,
	notes_played : 0,
	start_time : 0,
	songs_opt : [],
	player : {},
	my_shift : 0,
	audio_buffers :[],
	
	
	notes_buffer : {},
	note_id : 0,

	add_note : ( note_id, time, duration) => {
				
		//это источник звука
		var source = audio_context.createBufferSource();
		source.buffer = instruments.buffers['acoustic_grand_piano'][note_id];			
		source.connect(audio_context.destination);			
			
		
		source.gainNode = audio_context.createGain();
		source.gainNode.connect(audio_context.destination);		
		var gain = source.gainNode.gain;
		gain.value = 1;
		source.connect(source.gainNode);
		
		game.audio_buffers.push(source);
		
		gain.linearRampToValueAtTime(gain.value, audio_context.currentTime + time);
		gain.linearRampToValueAtTime(-1.0, audio_context.currentTime + time + duration+1);		

		source.start(audio_context.currentTime + time, 0, duration + 1.2);			
		
	},
	
	loadScript : src => {
	  return new Promise((resolve, reject) => {
		const script = document.createElement('script')
		script.type = 'text/javascript'
		script.onload = resolve
		script.onerror = reject
		script.src = src
		document.head.appendChild(script)
	  })
	},
	
	dec_shift : () => {
		
		game.my_shift -=0.01;
		objects.shift_t.text = game.my_shift;
		
	},
	
	inc_shift : () => {
		
		game.my_shift +=0.01;
		objects.shift_t.text = game.my_shift;
	},
	
	get_opt : () => {
		
		let cur_arr = [];
		
		let max_val = Object.keys(midi_songs).length;
		
		while (cur_arr.length !== 6) {			
			let id = irnd(0, max_val);
			if (cur_arr.includes(id) === false) {
				cur_arr.push(id);
			}		
		}
		
		return cur_arr;
		
	},
	
	opt_down: async (id) => {
		
		if (state!=="playing")
			return;
		
		
		game_res.resources.click.sound.play();
		
		game.audio_buffers.forEach(b=>{
			b.stop();
		});
		
		game.audio_buffers = [];
		
		if (game.song_id === id) {
			game.correct_answers_row++;
			game_res.resources.applause.sound.play();
			objects['opt_'+id].bcg.texture = gres.opt_correct.texture;
		}
		else {
			game.correct_answers_row = 0;
			game_res.resources.lose.sound.play();
			objects['opt_'+id].bcg.texture = gres.opt_wrong.texture;
			objects['opt_'+game.song_id].bcg.texture = gres.opt_correct.texture;
				
		}
		
		
		//убираем картинку
		anim2.add(objects.random_image,{alpha:[0.5, 0]}, false, 1,'linear');	
		
		//убираем падающие ноты
		await anim2.add(objects.faling_notes_cont,{alpha:[1,0]}, false, 1,'linear');	
		
		//убираем контейнер ответов
		await anim2.add(objects.opt_cont,{y:[objects.opt_cont.y,500]}, true, 1,'easeInBack');	
		
		game.stop();

		
	},
	
	stop : () => {
		
		state = "";
		g_process = function() {};
		results_message.show();		
	},
	
	set_random_image : async () => {
		
		let loader=new PIXI.Loader();
		
		await new Promise(function(resolve, reject) {			
			loader.add('puzzle_img', 'https://picsum.photos/400?id='+irnd(0,99999999),{loadType: PIXI.LoaderResource.LOAD_TYPE.IMAGE, timeout: 4000});						
			loader.load(function(l,r) {	resolve(l) });
		});
		
		
		objects.random_image.texture = loader.resources.puzzle_img.texture;
		await anim2.add(objects.random_image,{alpha:[0, 0.5]}, true, 1,'linear');	
		objects.random_image.alpha=0.5;
		
	},
	
	activate : async () => {
					
		
		objects.ready_note.text = "Слушаем..."
		await anim2.add(objects.ready_note,{alpha:[0, 1]}, true, 1,'linear');	
		await anim2.add(objects.ready_note,{alpha:[1, 0]}, false, 1,'linear');			
				
		
		//получаем набор вариантов
		game.songs_opt = game.get_opt();
		
		//выбираем случайную песню
		game.song_id = irnd(0, 6);
		
		//это сколько нот проиграно для бонуса
		game.notes_played = 0;
				
		//показываеми варианты ответов
		for (let i = 0 ; i < 6 ; i++) {			
			let obj = objects['opt_'+i];
			obj.artist.text = midi_songs[game.songs_opt[i]][0];
			obj.song.text = midi_songs[game.songs_opt[i]][1];
			obj.bcg.texture = gres.opt_bcg.texture;
		}
		
		//показыаем контейнер
		await anim2.add(objects.opt_cont,{y:[800,objects.opt_cont.sy]}, true, 1.5,'easeOutSine');	

		//устанавливаем случайную картинку на фон
		game.set_random_image();
		
		g_process = function() {game.process()};
		game.last_play_event = game_tick;
		game.play_midi();
	},
	
	play_midi : async () => {
				
		let artist = midi_songs[game.songs_opt[game.song_id]][0];
		let song = midi_songs[game.songs_opt[game.song_id]][1];
		console.log(`Играем: ${artist} - ${song} №${game.songs_opt[game.song_id]}`)
			
		game.audio_buffers =[];
		
		//загружаем миди файл
		let midi = await Midi.fromUrl("midi/"+game.songs_opt[game.song_id]+".mid")
		let track_num =0 ;
		if (midi.tracks.length === 2)
			track_num = 1;
		
		let notes = midi.tracks[track_num].notes;
				
		
		//создаем расписание нот для проигрывания
		notes.forEach(note => {
			game.add_note(noteToKey[note.midi], note.time, note.duration);
		})	

		game.start_time = Date.now();
		state = "playing";
				
		game.faling_notes_shift = 0;
		game.total_notes = 0;
		game.avr_dif = 0;
		let last_note_time = 0;
				
		//определяем параметры песни
		let min_note = 9999;
		let max_note = -9999;
		let unique_notes = {};
		for (let i = 0 ; i < notes.length ; i++) {
			
			game.song_length = notes[i].time;
			game.total_notes ++;		
			let note_num = notes[i].midi;
			unique_notes[note_num]=note_num;
			note_num > max_note && (max_note = note_num);
			note_num < min_note && (min_note = note_num);
			
		}
		
		//делаем ноты по порядку (по возрастанию)		
		let num_of_notes = Object.keys(unique_notes).length;
		let note_width = 450 / num_of_notes;
		let ind = 0;
		for (key in unique_notes) {			
			unique_notes[key] = ind;
			ind++;			
		}
			
		
		//убираем все падающие ноты
		objects.faling_notes.forEach(n=>{n.visible=false});
		
		//определяем падающие ноты
		let iter = 0;
		for (let i = 0 ; i < notes.length ; i++) {		
		
			let note_num = notes[i].midi;
			let note_height = 2000 * notes[i].duration / game.song_length;
			objects.faling_notes[iter].duration = notes[i].duration;
			objects.faling_notes[iter].height = note_height - 3;
			objects.faling_notes[iter].width = note_width-6;
			objects.faling_notes[iter].x = 3 + unique_notes[note_num] * note_width;
			objects.faling_notes[iter].sy = objects.faling_notes[iter].y = 350 - 2000 * notes[i].time / game.song_length;
			objects.faling_notes[iter].visible = true;
			objects.faling_notes[iter].alpha=0.5
			
			//let col =  rnd2(0.8,1);
			objects.faling_notes[iter].tint = PIXI.utils.rgb2hex([rnd2(0.8,1), rnd2(0.8,1), rnd2(0.8,1)]);
			objects.faling_notes[iter].played = 0;
			iter ++;
		}
		
		await anim2.add(objects.faling_notes_cont,{alpha:[0,1]}, true, 1,'linear');	
		
	},
	
	add_sparkle : (x, duration) => {
				
		for (let i =0 ; i<objects.sparkles.length ; i++ ) {
			if (objects.sparkles[i].visible === false) {				
			
				objects.sparkles[i].y = 350;
				objects.sparkles[i].x = x;				
					
				anim2.add(objects.sparkles[i],{alpha:[1, 0],scale_xy:[0, 4]}, false, 1,'linear');
				return;
			}			
		}
		
		
	},
	
	process : () => {
		
		
		if (state === "playing") {
			
			//сдесь секунды
			let dif = (Date.now() - game.start_time) * 0.001;
			let shift_y = (dif  - calibration.value*2 -  game.my_shift) / game.song_length;
			
			for (let i = 0 ; i < game.total_notes ; i++) {
				
				objects.faling_notes[i].y = objects.faling_notes[i].sy + shift_y * 2000;
				
				
				if (objects.faling_notes[i].y > 350 && objects.faling_notes[i].played === 0) {
					
					objects.faling_notes[i].played = 1;
					game.add_sparkle(objects.faling_notes[i].x + objects.faling_notes[i].width * 0.5, objects.faling_notes[i].duration );		
					game.notes_played++;
				}
				
				if (objects.faling_notes[i].visible === true && objects.faling_notes[i].ready !== false)
					if (objects.faling_notes[i].y - objects.faling_notes[i].height  > 350)
						anim2.add(objects.faling_notes[i],{alpha:[0.7, 0]}, false, 1,'linear');	
					
					
			}			
			
			if (dif > game.song_length + 3000) {
				//alert(game.avr_dif / game.total_notes)
				game.close("Не ответили");						
			}			

		}

	},
	
	close : async (result) => {
		
		state = "";
		g_process = function() {};
			
		
		
	},
	
	restart : async () => {
		
		//закрываем игру
		game.close();		
		
		//заново запускаем игру
		game.activate();
		
	}
			
	
}

var cat_menu = {
	
	activate : () => {
		
	
		anim2.add(objects.cat_menu_cont,{y:[800,objects.cat_menu_cont.sy]}, true, 1,'easeOutBack');	
		anim2.add(objects.header1,{y:[-400,objects.header1.sy]}, true, 1,'easeOutBack');	
		
		//калибруем миди
		calibration.start();
		
	},
	
	cat0_down: () => {
		
		game_res.resources.click.sound.play();
		cat_menu.close();
		game.activate();
		
		
		
	},
	
	close : () => {
		
		anim2.add(objects.cat_menu_cont,{y:[objects.cat_menu_cont.y,800]}, false, 1,'easeInBack');	
		anim2.add(objects.header1,{y:[objects.header1.y,-400]}, false, 1,'easeInBack');	
	}
	
	
}

var main_menu = {
		
	activate : async () => {

		anim2.add(objects.main_buttons_cont,{y:[800,objects.main_buttons_cont.sy]}, true, 1,'easeOutBack');	
		await anim2.add(objects.header0,{y:[-400,objects.header0.sy]}, true, 1,'easeOutBack');	

		anim3.add(objects.header0,['alpha'],[{time:0,val:[1]},{time:1.5,val:[0.2]},{time:3.1,val:[1]},{time:3.2,val:[0]},{time:3.3,val:[1]},{time:4,val:[0]},{time:4.2,val:[1]}],'linear',1);	

	},
	
	next_down : async () => {

		game_res.resources.click.sound.play();
		
		main_menu.close();		
		await new Promise(resolve => setTimeout(resolve, 1000));	
		
		//если калибровка не пройдена то проходим ее
		if (calibration.finished === 0)
			await calibration.start();		
		
		//запускаем меню выбора категории
		cat_menu.activate();
		
	},
	
	close : () => {
		
		anim2.add(objects.main_buttons_cont,{y:[objects.main_buttons_cont.sy,800]}, false, 1,'easeInBack');	
		anim2.add(objects.header0,{y:[objects.header0.y,-400]}, false, 1,'easeInBack');
	}
	
}

