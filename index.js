var M_WIDTH = 450, M_HEIGHT = 800, game_platform="", app, gres, objects = {}, my_data = {}, game_tick = 0, state ="", audio_context, git_src, last_com_time=0;
var g_process = () => {};
var g_instrument ={};
var instruments_names = ['acoustic_grand_piano','acoustic_guitar_nylon','acoustic_guitar_steel','electric_guitar_jazz','electric_piano_2','pad_1_new_age','koto','fx_1_rain','fx_3_crystal','fx_4_atmosphere','synth_brass_1','harpsichord','vibraphone'];
var some_process = [null,null,null,null,null,null,null,null];
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

class chat_record_class extends PIXI.Container {
	
	constructor() {
		
		super();
		
		this.tm = 0;
		this.msg_id = 0;
		this.msg_index=0;
		
		
		this.msg_bcg = new PIXI.Sprite(gres.msg_bcg.texture);
		//this.msg_bcg.width=400;
		//this.msg_bcg.height=50;
		this.msg_bcg.x=0;
		this.msg_bcg.anchor.set(0.5);

		
		this.msg = new PIXI.BitmapText('Имя Фамил124124214', {fontName: 'Century Gothic',fontSize: 20,align: 'left'}); 
		this.msg.x=225;
		this.msg.maxWidth=400;
		this.msg.anchor.set(0.5,0.5);
		this.msg.tint = 0x111111;
		
		this.visible = false;
		this.addChild(this.msg_bcg,this.msg);
		
	}
	
	async set(msg, y, inv) {
						
		this.y=y;
		
		if (inv) {
			this.msg.x=this.msg_bcg.x=225-irnd(0,50);
			this.msg_bcg.scale_x=1			
		}

		else {
			this.msg.x=this.msg_bcg.x=225+irnd(0,50);
			this.msg_bcg.scale_x=-1			
		}
		
		//получаем pic_url из фб

		//this.tm = tm;
					
		this.msg.text=msg;
	
		this.visible = true;	
		
	}	
	
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
		return Math.sin(x*Math.PI*2);
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
		let f=0;
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
		
		if (f===1) {			
			return new Promise(function(resolve, reject){					
			  anim3.slot[i].p_resolve = resolve;	  		  
			});				
		} else {
			
			return new Promise(function(resolve, reject){					
			  resolve();	  		  
			});	
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
					
					//если пришло время следующей точки
					if (time_passed > next_point_time) {
						
						//устанавливаем параметры точки
						for (let i=0;i<s.params.length;i++)
							s.obj[s.params[i]]=s.schedule[s.next_point].val[i];
												
						s.next_point++;		
						
						//начинаем опять отчет времени
						s.start_time = game_tick;	
						
						//если следующая точка - не существует
						if (s.next_point === s.schedule.length) {							

							if (s.repeat === 1) {
								s.start_time = game_tick
								s.next_point = 1;
							}
							else {								
								s.p_resolve('finished');
								this.slot[i]=null;									
							}
						
						}
					}					
				}
				else
				{
					//это вариант с твинами между контрольными точками
					
					m_lable : if (s.obj.ready === true) {						
						
						//если больше нет контрольных точек то убираем слот или начинаем сначала
						if (s.next_point === s.schedule.length) {
							
							if (s.repeat === 1) {
								s.cur_point = 0;
								s.next_point = 1;
							}
							else {
								s.p_resolve('finished');
								this.slot[i]=null;	
								break m_lable;
							}			
						}					

							
						let p0 = s.schedule[s.cur_point];
						let p1 = s.schedule[s.next_point];
						let time = p1.time;
						
						//заполняем расписание для анимации №2
						let cur_schedule={};							
						for (let i = 0 ; i < s.params.length ; i++) {						
							let p = s.params[i];
							cur_schedule[p]=[p0.val[i],p1.val[i]]						
						}					
						
						//активируем анимацию
						anim2.add(s.obj,cur_schedule,true,time,s.func,1);	
						
						s.cur_point++;
						s.next_point++;							
							
					
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
		
		
		this.artist=new PIXI.BitmapText('-', {fontName: 'Century Gothic', fontSize: 28});		
		this.artist.anchor.set(0.5,0.5);
		this.artist.x = w/2;
		this.artist.y = 30;
		this.artist.tint =0xddbea9;
		
		this.song=new PIXI.BitmapText('-', {fontName: 'Century Gothic', fontSize: 23});		
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
		this.place.tint=0xffc000;
		
		this.avatar=new PIXI.Sprite();
		this.avatar.x=40;
		this.avatar.y=10;
		this.avatar.width=this.avatar.height=48;
		
		
		this.name=new PIXI.BitmapText(' ', {fontName: 'Century Gothic', fontSize: 25});
		this.name.x=100;
		this.name.y=20;
		this.name.tint=0xffc000;
		
	
		this.balance=new PIXI.BitmapText(' ', {fontName: 'Century Gothic', fontSize: 30});
		this.balance.x=340;
		this.balance.tint=0xffc000;
		this.balance.y=20;		
		
		this.addChild(this.bcg,this.place, this.avatar, this.name, this.balance);		
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
		let simple_bonus = game.correct_answers_row > 0 ?  1 : -Math.round(my_data.record * 0.2);
		
		//показываем надпись верно или нет
		if (simple_bonus === 1) {			
			objects.bonus_header.texture = gres.bonus_header.texture;	
			anim2.add(objects.win_anim,{scale_xy:[0.3, 1.5],alpha:[0,1],rotation:[0,rnd2(1,2)]}, true, 3,'easeOutBack');
		}		
		else {			
			objects.bonus_header.texture = gres.error_header.texture;			
		}		
		
		await anim2.add(objects.results_message_cont,{y:[-500, objects.results_message_cont.sy]}, true, 1.5,'easeOutBack');
		
		
		
		
		let speed_bonus = (game.notes_played<10 && simple_bonus === 1)? 13 - game.notes_played : 0;
		let combo_bonus = game.correct_answers_row > 1 ? game.correct_answers_row*2 : 0;
		combo_bonus = Math.min(combo_bonus,20);

		let total_bonus = simple_bonus + speed_bonus + combo_bonus;
						
		objects.bonus_line0.text = simple_bonus;
		objects.bonus_line1.text = speed_bonus;
		objects.bonus_line2.text = combo_bonus;
		objects.bonus_total.text = total_bonus;		
		
		if (simple_bonus > 0)
			gres.bonus0.sound.play();		
		else
			gres.nobonus.sound.play();
		await anim3.add(objects.bonus_line0,['scale_xy'],[{time:0,val:[0]},{time:0.25,val:[2]},{time:0.5,val:[1]}],'easeInOutCubic');	

		
		if (speed_bonus > 0)
			gres.bonus1.sound.play();	
		else
			gres.nobonus.sound.play();
		await anim3.add(objects.bonus_line1,['scale_xy'],[{time:0,val:[0]},{time:0.25,val:[2]},{time:0.5,val:[1]}],'easeInOutCubic');	
		
		if (combo_bonus > 0)
			gres.bonus2.sound.play();	
		else
			gres.nobonus.sound.play();
		await anim3.add(objects.bonus_line2,['scale_xy'],[{time:0,val:[0]},{time:0.25,val:[2]},{time:0.5,val:[1]}],'easeInOutCubic');	
		
		
		
		if (total_bonus > 0)
			gres.total_bonus.sound.play();
		else
			gres.nobonus.sound.play();		
		await anim3.add(objects.bonus_total,['scale_xy'],[{time:0,val:[0]},{time:0.25,val:[2]},{time:0.5,val:[1]}],'easeInOutCubic');	
		
		results_message.ready = 1;	
		
		//записываем в базу новый рекорд
		my_data.record = my_data.record + total_bonus
		firebase.database().ref("players/"+my_data.uid+"/record").set(my_data.record);
		
		//обновляем мой рекорд
		objects.record_note.text = my_data.record;
		
		anim2.add(objects.results_exit,{scale_x:[0, 1]}, true, 1,'easeOutBack');
		anim2.add(objects.results_next,{scale_x:[0, 1]}, true, 1,'easeOutBack');	
		
		if (game_platform === 'VK') {			
			anim2.add(objects.vk_share_button,{scale_x:[0, 1]}, true, 1,'easeOutBack');
			anim2.add(objects.vk_invite_button,{scale_x:[0, 1]}, true, 1,'easeOutBack');		
		}
						
		return new Promise(function(resolve, reject){					
			results_message.p_resolve = resolve;	  		  
		});
	},
	
	exit_down : async () => {
		
		if (objects.results_exit.ready === false  || objects.results_message_cont.ready === false)
			return;
		game_res.resources.click.sound.play();
		

		await results_message.close();
		await game.close();
		await show_ad();		
		main_menu.activate();
		
		
	},
	
	next_down : async () => {
		
		if (objects.results_next.ready === false || objects.results_message_cont.ready === false)
			return;
		
		game_res.resources.click.sound.play();
		

		results_message.close();
		await show_ad();		
		game.restart();		
		
		
	},

	close : async function() {
		
		if (objects.results_message_cont.ready===false)
			return;
		
		if (objects.win_anim.visible === true)
		anim2.add(objects.win_anim,{scale_xy:[1.5, 0.3],alpha:[1,0],rotation:[objects.win_anim.rotation,0]}, false, 3,'easeInBack');
		
		await anim2.add(objects.results_message_cont,{y:[objects.results_message_cont.sy,800]}, false, 1,'easeInBack');
		objects.bonus_line0.text='';
		objects.bonus_line1.text='';
		objects.bonus_line2.text='';
		objects.bonus_total.text='';
		objects.results_exit.visible=false;
		objects.results_next.visible=false;
		objects.vk_share_button.visible=false;
		objects.vk_invite_button.visible=false;
		
		this.p_resolve("close");			
	},
	
	vk_invite_down: function() {
		
        if (objects.vk_invite_button.ready === false)
            return;
		
		if (game_platform==='VK')
			vkBridge.send('VKWebAppShowInviteBox');
	},
	
	vk_share_down: function() {
		
        if (objects.vk_share_button.ready === false)
            return;
		
		if (game_platform==='VK')
			vkBridge.send('VKWebAppShowWallPostBox', {"message": `Мой рекорд в игре Угадай Песню ${my_data.record}! А сколько наберешь ты?`,
			"attachments": "https://vk.com/app8027093"});
	}
	

}

var	show_ad = async function(){
	
	let time_since_last_com = (Date.now() - last_com_time)*0.001
	if (time_since_last_com < 90)
		return;
	last_com_time = Date.now();
	
		
	if (game_platform==="YANDEX") {	
	
		//показываем рекламу
		await new Promise(function(resolve, reject){	
			
			setTimeout(resolve, 5000);	
			window.ysdk.adv.showFullscreenAdv({
				  callbacks: {
					onClose: resolve, 
					onError: resolve
				}
			})		
		})


	}
	
	if (game_platform==="VK") {		

			await vkBridge.send("VKWebAppShowNativeAds", {ad_format:"interstitial"})
	}		
}

function vis_change() {
	
	if (document.hidden===true && state === 'playing') {
		game.no_answer();
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
						this.loadScript('https://unpkg.com/@vkontakte/vk-bridge/dist/browser.min.js')
					]).then(function(){
						help_obj.vk()
					}).catch(function(e){
						alert('650 ' + JSON.stringify(e));
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
					
					alert('650 ' + JSON.stringify(e));
					
				});
				

			},

			debug: function() {

				let uid = prompt('Отладка. Введите ID', 100);

				my_data.name = my_data.uid = "debug" + uid;
				my_data.pic_url = "https://sun9-73.userapi.com/impf/c622324/v622324558/3cb82/RDsdJ1yXscg.jpg?size=223x339&quality=96&sign=fa6f8247608c200161d482326aa4723c&type=album";

				help_obj.process_results();

			},

			local: function(repeat = 0) {

				game_platform="YANDEX";
				
				//ищем в локальном хранилище
				let local_uid = null;
				try {
					local_uid = localStorage.getItem('uid');
				} catch (e) {
					console.log(e);
				}

				//здесь создаем нового игрока в локальном хранилище
				if (local_uid===undefined || local_uid===null) {

					//console.log("Создаем нового локального пользователя");

					let rnd_names=["Бегемот","Жираф","Зебра","Тигр","Ослик","Мамонт","Волк","Лиса","Мышь","Сова","Слон","Енот","Кролик","Бизон","Пантера"];
					let rnd_num=Math.floor(Math.random()*rnd_names.length)
					let rand_uid=Math.floor(Math.random() * 9999999);

					my_data.name 		=	rnd_names[rnd_num]+rand_uid;
					my_data.record 		= 	0;
					my_data.uid			=	"ls"+rand_uid;
					my_data.pic_url		=	'https://avatars.dicebear.com/v2/male/'+irnd(10,10000)+'.svg';


					try {
						localStorage.setItem('uid',my_data.uid);
					} catch (e) {
						console.log(e);
					}

					
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
		
		if (objects.lb_1_cont.ready===false) {
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
			  //console.log("Что-то не получилось получить данные о рейтингах");
			}
			else {

				var players_array = [];
				snapshot.forEach(players_data=> {
					if (players_data.val().name!=="" && players_data.val().name!=='' && players_data.val().name!==undefined)
						players_array.push([players_data.val().name, players_data.val().record, players_data.val().pic_url]);
				});


				players_array.sort(function(a, b) {	return b[1] - a[1];});

				//создаем загрузчик топа
				var loader = new PIXI.Loader();

				var len=Math.min(10,players_array.length);
				
				objects.lb_1_cont.cacheAsBitmap=false;
				objects.lb_2_cont.cacheAsBitmap=false;
				objects.lb_3_cont.cacheAsBitmap=false;

				//загружаем тройку лучших
				for (let i=0;i<3;i++) {
					
					objects['lb_'+(i+1)+'_cont'].cacheAsBitmap=false;
					
					if (i >= len) break;		
					if (players_array[i][0] === undefined) break;	
					
					let fname = players_array[i][0];
					make_text(objects['lb_'+(i+1)+'_name'],fname,180);					
					objects['lb_'+(i+1)+'_balance'].text=players_array[i][1];
					loader.add('leaders_avatar_'+i, players_array[i][2],{loadType: PIXI.LoaderResource.LOAD_TYPE.IMAGE, timeout: 3000});
				};

				//загружаем остальных
				for (let i=3;i<10;i++) {
					
					if (i >= len) break;	
					if (players_array[i][0] === undefined) break;	
					
					let fname=players_array[i][0];

					make_text(objects.lb_cards[i-3].name,fname,180);

					objects.lb_cards[i-3].balance.text=players_array[i][1];
					loader.add('leaders_avatar_'+i, players_array[i][2],{loadType: PIXI.LoaderResource.LOAD_TYPE.IMAGE});
				};

				loader.load();

				//показываем аватар как только он загрузился
				loader.onProgress.add((loader, resource) => {
					let lb_num=Number(resource.name.slice(-1));
					if (lb_num<3) {
						let cont_num = lb_num + 1;
						objects['lb_'+cont_num+'_avatar'].texture=resource.texture;
						objects['lb_'+cont_num+'_cont'].cacheAsBitmap=true;	
						anim2.add(objects['lb_'+cont_num+'_cont'],{x:[-150,objects['lb_'+cont_num+'_cont'].sx]},true,1,'linear');
					}
					else {						
						objects.lb_cards[lb_num-3].avatar.texture=resource.texture;						
					}

				});

			}

		});
		
	}
	
}

var rules = {
	
	activate : () => {
		
		anim2.add(objects.rules_cont,{y:[800,objects.rules_cont.sy]}, true, 1,'easeOutBack');		
		
	},
	
	
	close : async () => {
		
		if (objects.rules_cont.ready === false)
			return;
		game_res.resources.click.sound.play();
		
		await anim2.add(objects.rules_cont,{y:[objects.rules_cont.sy, 800]}, false, 1,'easeInBack');
		main_menu.activate();
		
	}	
	
}

keyboard={
	
	p_resolve : 0,
	
	rus_keys : [[20,220,150,260,'<'],[20,70,47.45,110,'Й'],[56.6,70,84.05,110,'Ц'],[93.2,70,120.65,110,'У'],[129.8,70,157.25,110,'К'],[166.4,70,193.85,110,'Е'],[203,70,230.45,110,'Н'],[239.6,70,267.05,110,'Г'],[276.2,70,303.65,110,'Ш'],[312.8,70,340.25,110,'Щ'],[349.4,70,376.85,110,'З'],[386,70,413.45,110,'Х'],[422.6,70,450.05,110,'Ъ'],[38.3,120,65.75,160,'Ф'],[74.9,120,102.35,160,'Ы'],[111.5,120,138.95,160,'В'],[148.1,120,175.55,160,'А'],[184.7,120,212.15,160,'П'],[221.3,120,248.75,160,'Р'],[257.9,120,285.35,160,'О'],[294.5,120,321.95,160,'Л'],[331.1,120,358.55,160,'Д'],[367.7,120,395.15,160,'Ж'],[404.3,120,431.75,160,'Э'],[56.6,170,84.05,210,'Я'],[93.2,170,120.65,210,'Ч'],[129.8,170,157.25,210,'С'],[166.4,170,193.85,210,'М'],[203,170,230.45,210,'И'],[239.6,170,267.05,210,'Т'],[276.2,170,303.65,210,'Ь'],[312.8,170,340.25,210,'Б'],[349.4,170,376.85,210,'Ю'],[171,220,301,260,'_'],[321.9,220,449.99,260,'ПРОВЕРИТЬ']],	
	
	open: function(){
				
		//anim2.add(objects.keyboard_cont,{y:[950, objects.keyboard_cont.sy]}, true, 1,'linear');
				
		return new Promise(function(resolve, reject){					
			keyboard.p_resolve = resolve;	  		  
		});
		
	},
		
	close:function(){
		
		//anim2.add(objects.keyboard_cont,{y:[objects.keyboard_cont.y,950]}, false, 1,'linear');
		
	},
	
	keydown:function(){
				
		
		
	},
	
	pointerdown:function(e){
		
		let key = -1;
		let key_x = 0;
		let key_y = 0;	
		
		let mx = e.data.global.x/app.stage.scale.x - objects.keyboard.x;
		let my = e.data.global.y/app.stage.scale.y - objects.keyboard.y;
		
		let margin = 5;
		for (let k of this.rus_keys) {			
			if (mx > k[0] - margin && mx <k[2] + margin  && my > k[1] - margin && my < k[3] + margin) {
				key = k[4];
				key_x = k[0];
				key_y = k[1];
				break;
			}
		}	
				
				
				
		if (key === -1) return;	
		
		//подсвечиваем клавишу
		objects.hl_key.x = objects.keyboard.x+key_x - 10;
		objects.hl_key.y = objects.keyboard.y+key_y - 10;		
		if (key === 'ПРОВЕРИТЬ' || key === '_' || key === '<')
			objects.hl_key.texture = gres.hl_key1.texture;
		else
			objects.hl_key.texture = gres.hl_key0.texture;	
		
		anim2.add(objects.hl_key,{alpha:[1, 0]}, false, 0.5,'linear');
		
		if (key === 'ПРОВЕРИТЬ') {
			
			if (objects.song_name.text === '') return;
			quiz.check_song(objects.song_name.text);
			objects.song_name.text='';
			return;	
		}			
		
		if (objects.song_name.text.length>20) return;	
				
		if (key === '<') {
			objects.song_name.text=objects.song_name.text.slice(0, -1);
			key ='';
		}	
		if (key === '_') key=' ';
			

		
		if (key === 'ЗАКРЫТЬ') {
			
			//this.close();
			//this.p_resolve('');	
			//return;	
		}	

		objects.song_name.text += key;	
	
		
	}
	
	
}

async function get_midi_stats() {
	
	for (let i = 0 ; i < Object.keys(midi_songs).length ; i++) {
		
		
		let midi = await Midi.fromUrl("midi/"+i+".mid")
		let track_num =0 ;
		if (midi.tracks.length === 2)
			track_num = 1;
		
		let notes = midi.tracks[track_num].notes;				
		
		console.log('№'+i,' ' , notes.length)
	
	}
	
}

async function init_game_env() {
			
    //запускаем главный цикл
    main_loop();
	
	
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

	//это событие когда меняется видимость приложения
	document.addEventListener("visibilitychange", vis_change);

	//создаем аудиоконтекст и загружаем аудиобуффер
	audio_context = new (window.AudioContext || window.webkitAudioContext)();	
	eval(gres.instrument_res.data);
	instruments.prepare_buffer();
		
	
    app = new PIXI.Application({width: M_WIDTH, height: M_HEIGHT, antialias: false, forceCanvas: false, backgroundAlpha:0.5});
    document.body.appendChild(app.view);
	
	let c = document.body.appendChild(app.view);
	c.style["boxShadow"] = "0 0 15px #000000";
	document.body.style.backgroundColor = 'rgb(' + 12 + ',' + 66 + ',' + 60 + ')';



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
	
	//мини процесс вращения лупы
	some_process[0]=function () {

		objects.id_loup.x=20*Math.sin(game_tick*8)+90;
		objects.id_loup.y=20*Math.cos(game_tick*8)+110;
	};
	
	//загружаем данные игрока	
	await auth();
	let pic_loader=new PIXI.Loader();
	
	//загружаем аватарку
	await new Promise(function(resolve, reject) {			
		pic_loader.add("my_avatar", my_data.pic_url,{loadType: PIXI.LoaderResource.LOAD_TYPE.IMAGE, timeout: 5000});						
		pic_loader.load(function(l,r) {	resolve(l) });
	});		
	
	objects.id_avatar.texture=pic_loader.resources.my_avatar.texture;		
	make_text(objects.id_name,my_data.name,150);
	
	//получаем данные из файербейс
	let snapshot = await firebase.database().ref("players/"+my_data.uid).once('value');
		
	let data=snapshot.val();			
	if (data.record === undefined)
		my_data.record = 0;
	else
		my_data.record = data.record;
					
	//обновляем данные в файербейс так как это мог быть новый игрок и у него должны быть занесены все данные
	firebase.database().ref("players/"+my_data.uid+"/record").set(my_data.record);
	
	//устанавливаем баланс в попап
	objects.id_record.text = my_data.record;	
	
	//устанавливаем баланс в заголовок
	objects.record_note.text = my_data.record;
						
	activity_on=0;			

	anim2.add(objects.id_cont,{y:[objects.id_cont.y,-200]}, false, 1,'easeInBack');
	some_process[0]=null;
	
	main_menu.activate();
	

}

var calibration = {
	
	p_resolve : 0,
	finished : 0,
	value: 0,
	
	play_note : (note, time, duration) => {
		
		return new Promise(resolve => {		
		
			//это источник звука
			var source = audio_context.createBufferSource();
			source.buffer = instruments.buffers[noteToKey[note]];			
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

var instruments_dialog = {
		
	selected_id : 4,
	
	activate : async () => {	
			
		//восстанавливаем текстуру	
		objects.instruments_ok_button.texture = gres.instruments_ok_button.texture;
		objects.instruments_ok_button.interactive=true;
		objects.instruments_ok_button.rotation = 0;
		
		objects.selected_frame.y = 120 + instruments_dialog.selected_id * 32 - 22; 
		anim2.add(objects.instruments_dialog_cont,{y:[800,objects.instruments_dialog_cont.sy]}, true, 1,'easeOutBack');			
	},
	
	close : () => {
		
		anim2.add(objects.instruments_dialog_cont,{y:[objects.instruments_dialog_cont.y,800]}, false, 1,'easeInBack');	
		
	},
	
	clicked : function(e) {
		
		if (objects.instruments_dialog_cont.ready === false)
			return;
		game_res.resources.click2.sound.play();
		
		//координаты указателя
		var my = e.data.global.y/app.stage.scale.y;
		
		instruments_dialog.selected_id = Math.floor(13* ( my - 170 ) / 420);
		if (instruments_dialog.selected_id <0) instruments_dialog.selected_id = 0;
		if (instruments_dialog.selected_id >12) instruments_dialog.selected_id = 12;		
		
		objects.selected_frame.y = 120 + instruments_dialog.selected_id * 32 - 22; 
		
	},
	
	update_instrument : async () => {
		
		let instrument_loader = new PIXI.Loader();
		instrument_loader.add('instrument_res','https://akukamil.github.io/melody/soundfont/' +  instruments_names[instruments_dialog.selected_id] + '-ogg.js',{timeout: 5000});
		
		//показываем кнопку перезагрузки
		objects.instruments_ok_button.interactive = false;
		objects.instruments_ok_button.texture = gres.reload_image.texture;
		
		anim3.add(objects.instruments_ok_button,['rotation'],[{time:0,val:[0]},{time:5,val:[3.15]},{time:10,val:[3.8]}],'linear');
		
		await new Promise(function(resolve, reject) {			
			instrument_loader.load(function(l,r) {	resolve(l) });
		});		
		
		anim3.kill_anim(objects.instruments_ok_button);
		anim2.kill_anim(objects.instruments_ok_button);
		
		eval(instrument_loader.resources.instrument_res.data);
		instruments.prepare_buffer();
		
	},
	
	ok_down: async () => {
		
		if (objects.instruments_dialog_cont.ready === false)
			return;
		game_res.resources.click.sound.play();
		
		await instruments_dialog.update_instrument();
		instruments_dialog.close();
		main_menu.activate();		
		
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
	

	//get_midi_stats();
	//return;
		
    game_res = new PIXI.Loader();
		
	//короткая ссылка на ресурсы
	gres=game_res.resources;
	
	git_src="https://akukamil.github.io/melody/"
	//git_src=""
	
	game_res.add('instrument_res',git_src+'soundfont/electric_piano_2-ogg.js');
	
	
	game_res.add("m2_font", git_src+"fonts/MS_Comic_Sans/font.fnt");

	game_res.add('message',git_src+'sounds/message.mp3');
	game_res.add('click',git_src+'sounds/click.mp3');
	game_res.add('click2',git_src+'sounds/click2.mp3');
	game_res.add('close',git_src+'sounds/close.mp3');
	game_res.add('lose',git_src+'sounds/lose.mp3');
	game_res.add('locked',git_src+'sounds/locked.mp3');
	game_res.add('applause',git_src+'sounds/applause.mp3');
	game_res.add('bonus0',git_src+'sounds/bonus0.mp3');
	game_res.add('bonus1',git_src+'sounds/bonus1.mp3');
	game_res.add('bonus2',git_src+'sounds/bonus2.mp3');
	game_res.add('nobonus',git_src+'sounds/nobonus.wav');
	game_res.add('total_bonus',git_src+'sounds/total_bonus.mp3');
	
	
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
	
	for (let i = 0 ; i < 5 ; i++)
		if (some_process[i]!==null)
			some_process[i]();

	
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
		
	prepare_buffer : async () => {
		
		instruments.buffers ={};
		
		for (let key in g_instrument) {
			var base64 = g_instrument[key].split(',')[1];
			var buffer = instruments.decodeArrayBuffer(base64);			
			instruments.buffers[key] = await audio_context.decodeAudioData(buffer)
		}			
	}
	
}

var game = {
	
	play_start : 0,
	last_play_event : 0,
	song_id : 0,
	correct_opt_id : 0,
	total_notes : 0,
	song_length : 0,
	recently_played : [],
	return_penalty : 0,	
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
		source.buffer = instruments.buffers[note_id];			
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
	
	show_lights: async() => {
		
				
		await Promise.all([		
		
			anim3.add(objects.dir_light_0,['rotation','alpha'],[
			{time:0,val:[0,0]},
			{time:0.7,val:[-1.5,1]},
			{time:0.9,val:[-0.1,1]},
			{time:0.4,val:[-1.4,1]},
			{time:0.6,val:[-0.2,1]},
			{time:0.9,val:[-1.4,1]},
			{time:0.7,val:[0,1]}
			],'easeInOutCubic'),
			
			anim3.add(objects.dir_light_1,['rotation','alpha'],[
			{time:0,val:[0,0]},
			{time:0.3,val:[-0.7,1]},
			{time:0.6,val:[0.7,1]},
			{time:0.4,val:[-0.7,1]},
			{time:0.6,val:[0.7,1]},
			{time:0.3,val:[-0.7,1]},
			{time:0.7,val:[0,1]}
			],'easeInOutCubic'),
			
			anim3.add(objects.dir_light_2,['rotation','alpha'],[
			{time:0,val:[0,0]},
			{time:0.3,val:[1.4,1]},
			{time:0.7,val:[0.3,1]},
			{time:0.4,val:[1.3,1]},
			{time:0.8,val:[0.1,1]},
			{time:0.4,val:[1.3,1]},
			{time:0.7,val:[0,1]}]
			,'easeInOutCubic'),	
		
		])
		
		anim2.add(objects.dir_light_0,{alpha:[1, 0]}, false, 1,'linear');
		anim2.add(objects.dir_light_1,{alpha:[1, 0]}, false, 1,'linear');
		anim2.add(objects.dir_light_2,{alpha:[1, 0]}, false, 1,'linear');


		
		
	},
	
	opt_down: async (id) => {
		
		if (state!=="playing")
			return;
				
		game_res.resources.click.sound.play();
				
		if (game.correct_opt_id === id) {
			
			//запускаем анимацию правильного ответа
			game.show_lights();
			
			
			game.correct_answers_row++;
			game_res.resources.applause.sound.play();
			objects['opt_'+id].bcg.texture = gres.opt_correct.texture;
			firebase.database().ref("songs_stat/"+game.song_id+"/" + "correct").set(firebase.database.ServerValue.increment(1));
		}
		else {
			
			game.correct_answers_row = 0;
			game_res.resources.lose.sound.play();
			objects['opt_'+id].bcg.texture = gres.opt_wrong.texture;
			objects['opt_'+game.correct_opt_id].bcg.texture = gres.opt_correct.texture;	
			firebase.database().ref("songs_stat/"+game.song_id+"/" + "incorrect").set(firebase.database.ServerValue.increment(1));
			
		}

		//останавливаем игру
		game.stop();	
	},
	
	no_answer : () => {
		
		game.correct_answers_row = 0;
		game_res.resources.lose.sound.play();
		game.stop();	
		
	},
	
	stop : async () => {
		
		state = "";
		g_process = function() {};
		
		//останавливаем и удаляем звуки
		game.audio_buffers.forEach(b=>{
			b.stop();
		});		
		game.audio_buffers = [];
		
		//убираем картинку
		anim2.add(objects.random_image,{alpha:[0.5, 0]}, false, 1,'linear');		

		
		//убираем падающие ноты
		await anim2.add(objects.faling_notes_cont,{alpha:[1,0]}, false, 1,'linear');			
		
		//убираем контейнер ответов
		await anim2.add(objects.opt_cont,{y:[objects.opt_cont.y,500]}, true, 1,'easeInBack');			
		
		//убираем год
		anim2.kill_anim(objects.song_year);
		objects.song_year.visible=false;
		
		results_message.show();		
	},
	
	set_random_image : async () => {
		
	
		
		//если картинка уже есть то не спешим ее менять а просто показываем старую
		if (objects.random_image.texture.width!==1) {
			let r_val = rnd();
			if (r_val>0.2) {
				await anim2.add(objects.random_image,{alpha:[0, 0.5]}, true, 1,'linear');	
				objects.random_image.alpha=0.5;
				return;	
			}		
		}				
		
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
		
		//для отметки
		firebase.database().ref("players/"+my_data.uid+"/tm").set(firebase.database.ServerValue.TIMESTAMP);
					
					
		//устанавливаем "выходной" рейтинг
		let exit_rating = my_data.record - Math.round(my_data.record * 0.2);
		firebase.database().ref("players/"+my_data.uid+"/record").set(exit_rating);
				
		objects.ready_note.text = "Слушаем..."
		await anim2.add(objects.ready_note,{alpha:[0, 1]}, true, 1,'linear');	
		await anim2.add(objects.ready_note,{alpha:[1, 0]}, false, 1,'linear');			
				
		
		//получаем набор вариантов
		let songs_len = Object.keys(midi_songs).length;
		
		
		//получаем 5 вариантов неправильных
		game.songs_opt = [];		
		for (let s = 0 ; s < 5 ; s++) {			
			for ( let z = 0 ; z < 10000 ; z ++ ) {
				let _song = irnd(0, songs_len);	
				if (game.songs_opt.includes(_song)===false) {
					game.songs_opt.push(_song);
					break;					
				}
			}			
		}		

		
		//выбираем случайную песню которая не играла в последнее время и не соответствует неправильным вариантам
		for ( let z = 0 ; z < 10000 ; z ++ ) {			
			
			game.song_id = irnd(0, songs_len);	
			if (game.recently_played.includes(game.song_id) === false && game.songs_opt.includes(game.song_id) === false)
				break;
		}
		
		//game.song_id = 230;
		
		//добавляем в список недавно прослушанных
		game.recently_played.push(game.song_id);
		if (game.recently_played.length>70)
			game.recently_played.shift();		
		
		
		//console.log(game.recently_played);

		
		//добавляем правильный ответ в случайную позицию
		game.correct_opt_id = irnd(0, 6);		
		game.songs_opt.splice( game.correct_opt_id, 0, game.song_id );	
				
		//это сколько нот проиграно для бонуса
		game.notes_played = 0;
		
		//будут ли показаны исполнители
		let show_artist = 1
		if (my_data.rating > 100)
			if (rnd() > 0.5)
				show_artist = 0;
				
		//показываеми варианты ответов
		for (let i = 0 ; i < 6 ; i++) {			
			let obj = objects['opt_'+i];
			if (show_artist === 1)
				obj.artist.text = midi_songs[game.songs_opt[i]][0];
			else
				obj.artist.text = "???";
			
			obj.song.text = midi_songs[game.songs_opt[i]][1];
			obj.bcg.texture = gres.opt_bcg.texture;
		}
		
		//показыаем контейнер
		await anim2.add(objects.opt_cont,{y:[800,objects.opt_cont.sy]}, true, 1.5,'easeOutSine');	

		//показываем год и статистику песни
		game.show_year(midi_songs[game.song_id][2]);

		//показываем картинку
		game.set_random_image();
		
		g_process = function() {game.process()};
		game.last_play_event = game_tick;
		game.play_midi();
	},
	
	show_year : async (y) => {
		
		objects.song_year.text = y +' год';
		await anim2.add(objects.song_year,{alpha:[0,1]}, true, 5,'linear');	
		await anim2.add(objects.song_year,{alpha:[1,0]}, false, 4,'linear');	
		
		let song_stat = await firebase.database().ref("songs_stat/"+game.song_id).once('value');
		song_stat = song_stat.val();		
		if (song_stat === null || song_stat === undefined)
			return;
		
		

		let correct = song_stat.correct || 0;
		let incorrect = song_stat.incorrect || 0;
		let guesses = correct + incorrect;
		if (guesses > 0) {
			
			let cor_rate = 	Math.round(100 * correct / guesses);
			objects.song_year.text = 'Угадывают ' + cor_rate + '%';
			if (state!=="playing")	return;
			await anim2.add(objects.song_year,{alpha:[0,1]}, true, 5,'linear');	
			if (state!=="playing")	return;
			await anim2.add(objects.song_year,{alpha:[1,0]}, false, 4,'linear');	
			
		}


		
		
	},
	
	play_midi : async () => {
				
				
		//отображаем исполнителя и песню в консоли
		let artist = midi_songs[game.song_id][0];
		let song = midi_songs[game.song_id][1];
		console.log(`Играем: ${artist} - ${song} №${game.song_id}`)
			
		game.audio_buffers =[];
		
		//загружаем миди файл
		let midi = await Midi.fromUrl(git_src+"midi/"+game.song_id+".mid")
		let track_num =0 ;
		if (midi.tracks.length === 2)
			track_num = 1;
		
		let notes = midi.tracks[track_num].notes;				
		
		//создаем расписание нот в аудиобуффер
		notes.forEach(note => {
			game.add_note(noteToKey[note.midi], note.time, note.duration);
		})	

		
		game.start_time = Date.now();
		state = "playing";
				
		game.total_notes = notes.length;
		let last_note_time = 0;
				
		//определяем параметры песни		
		let unique_notes = {};
		for (let i = 0 ; i < notes.length ; i++) {
			let note_num = notes[i].midi;
			unique_notes[note_num]=note_num;
		}
		
		//это время всей песни (когда кончается последняя нота)
		let last_note_id = notes.length - 1;
		game.song_time = notes[last_note_id].time + notes[last_note_id].duration;
				
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
		
		//определяем координаты падающих нот
		let i = 0;
		for (i = 0 ; i < notes.length ; i++) {		
		
			//определяем положение ноты по X
			let note_num = notes[i].midi;
			objects.faling_notes[i].x = 3 + unique_notes[note_num] * note_width;			
			
			
			let note_height = 2000 * notes[i].duration / game.song_time;
			objects.faling_notes[i].duration = notes[i].duration;
			objects.faling_notes[i].height = note_height - 3;
			objects.faling_notes[i].width = note_width-6;

			//начальное положение нот по Y
			objects.faling_notes[i].sy = objects.faling_notes[i].y = 350 - 2000 * notes[i].time / game.song_time;
			objects.faling_notes[i].visible = true;
			objects.faling_notes[i].alpha=0.5
			
			objects.faling_notes[i].tint = PIXI.utils.rgb2hex([rnd2(0.8,1), rnd2(0.8,1), rnd2(0.8,1)]);
			objects.faling_notes[i].played = 0;
		}
		
		//надпись о конце песни через 3 секунды после окончания песни
		objects.game_end_note.sy = 350 - 2000 - 2000 * 3 / game.song_time;
		
		
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
			let shift_y = (dif  - calibration.value * 2 -  game.my_shift) / game.song_time;
			
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

			//надпись о конце игры
			objects.game_end_note.y = objects.game_end_note.sy + shift_y * 2000;
			
			
			
			if (objects.game_end_note.y > 360) {
				//alert(game.avr_dif / game.total_notes)
				//game.no_answer();						
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

quiz={
	
	notes_data:[],
	start_time:0,
	quiz_data:{},
		
	activate:async function(){
		
		objects.record_note_cont.visible=false;
		

		
		await this.read_quiz_info();
		
		objects.quiz_cont.visible=true;		
		
		this.show_last_messages();
		
		this.play_song();
		
		keyboard.open();

	},
	
	check_song:function(song_name){
		
		if (song_name===this.quiz_data.song_name){
			
			
			game_res.resources.applause.sound.play();
			objects.winner_plot.texture=gres.quiz_winner_bcg.texture;
			
			objects.quiz_winner_cont.visible=true;
			
			if (this.quiz_data.winner_id==='not_defined_yet'){
				this.quiz_data.winner_id=my_data.uid;
				this.add_message('Верно! Вы выиграли конкурс!\n'+this.quiz_data.artist+'-'+this.quiz_data.song_name);				
				firebase.database().ref("quiz_data/winner_id").set(my_data.uid);
				objects.winner_name.text=my_data.name;		
				
			}else{
				
				this.add_message('Верно! Но конкурс уже завершен!\n'+this.quiz_data.artist+'-'+this.quiz_data.song_name);				
			}

				
		}else{
			
			this.add_message('Неверно!');
			game_res.resources.locked.sound.play();
			anim2.add(objects.quiz_cont,{x:[0, 10]}, true, 0.25,'ease2back');
			
			firebase.database().ref("quiz_chat/"+irnd(0,50)).set({song_name:objects.song_name.text,name:my_data.name,tm:firebase.database.ServerValue.TIMESTAMP});			
		}
		
		
	},
	
	add_message:function(msg){
		
		objects.quiz_message.text=msg;
		anim2.add(objects.quiz_message,{alpha:[1, 0]}, false, 5,'linear');
		
		
	},
	
	read_quiz_info:async function(){
		
		this.quiz_data=await firebase.database().ref("quiz_data").once('value');
		this.quiz_data=this.quiz_data.val();

		if (this.quiz_data.winner_id==='not_defined_yet' ){
			objects.quiz_winner_cont.visible=false;
			objects.winner_plot.texture=gres.no_quiz_winner_bcg.texture;
			objects.winner_name.text=''			
		}else{
			objects.winner_plot.texture=gres.quiz_winner_bcg.texture;
			objects.quiz_winner_cont.visible=true;
			let winner_data=await firebase.database().ref("players/"+this.quiz_data.winner_id).once('value');
			winner_data=winner_data.val();
			objects.winner_name.text=winner_data.name;			
			const winner_avatar=await this.get_texture(winner_data.pic_url);
			objects.quiz_winner_avatar.texture=winner_avatar;

		}
		
	},
	
	show_last_messages:async function(){
		
		let chat_data=await firebase.database().ref("quiz_chat").once('value');
		chat_data=chat_data.val();
		chat_data=Object.values(chat_data);
		chat_data = chat_data.sort((a, b) => b.tm-a.tm);
		console.log(chat_data);
		
		for (let i=0;i<5;i++)
		  objects.chat_records[i].set(chat_data[i].song_name,i*40+300,i % 2 == 0);

		
	},
	
	get_texture : function (pic_url) {
		
		return new Promise((resolve,reject)=>{
			

			//сначала смотрим на загруженные аватарки в кэше
			if (PIXI.utils.TextureCache[pic_url]===undefined || PIXI.utils.TextureCache[pic_url].width===1) {

				//загружаем аватарку игрока
				//console.log(`Загружаем url из интернети или кэша браузера ${pic_url}`)	
				let loader=new PIXI.Loader();
				loader.add("pic", pic_url,{loadType: PIXI.LoaderResource.LOAD_TYPE.IMAGE, timeout: 5000});
				loader.load(function(l,r) {	resolve(l.resources.pic.texture)});
			}
			else
			{
				//загружаем текустуру из кэша
				//console.log(`Текстура взята из кэша ${pic_url}`)	
				resolve (PIXI.utils.TextureCache[pic_url]);
			}
		})
		
	},
	
	play_song:async function(){
		
		//отображаем исполнителя и песню в консоли
			
		game.audio_buffers =[];
		
		//загружаем миди файл
		const midi = await Midi.fromUrl(git_src+"quiz/"+this.quiz_data.file_name)
		let track_num =0 ;
		if (midi.tracks.length === 2)
			track_num = 1;
		
		const notes = midi.tracks[track_num].notes;	
				
		//это время всей песни (когда кончается последняя нота)
		let last_note_id = notes.length - 1;
		game.song_time = notes[last_note_id].time + notes[last_note_id].duration;
				
		//создаем расписание нот в аудиобуффер
		this.notes_data=[]		
		notes.forEach(note => {
			game.add_note(noteToKey[note.midi], note.time, note.duration);	
			this.notes_data.push({play_time:note.time,played:false})			
		})	
				
		state='quiz_playing';
		this.start_time = Date.now();
		objects.quiz_replay_button.visible=false;
		g_process=this.process.bind(quiz);
	},
	
	play_down:function(){
		
		if (state==='quiz_playing')
			return;
		
		this.play_song();
	},
	
	add_sparkle : () => {
				
		for (let i =0 ; i<objects.sparkles.length ; i++ ) {
			if (objects.sparkles[i].visible === false) {				
			
				objects.sparkles[i].y = irnd(0,540);
				objects.sparkles[i].x = irnd(0,450);				
					
				anim2.add(objects.sparkles[i],{alpha:[1, 0],scale_xy:[0, 4]}, false, 1,'linear');
				return;
			}			
		}
		
		
	},
	
	process:async function(){
		

		let dif = (Date.now() - this.start_time) * 0.001;
		
		let all_played=true;
		for (let note of this.notes_data) {		
			if (note.played ===false){
				
				if (dif>note.play_time) {
					//console.log('played');
					this.add_sparkle();
					note.played=true;					
				}				
				all_played=false;
			}
		}	

		if (all_played===true){
			
			state='';
			objects.quiz_replay_button.visible=true;
			g_process=function(){};
			
			
			
		}
		
	},
	
	back_down:function(){
		
		
		
		
		this.close();
		main_menu.activate();
		
	},
	
	close:function(){
		
		//останавливаем и удаляем звуки
		game.audio_buffers.forEach(b=>{
			b.stop();
		});		
		game.audio_buffers = [];
		g_process=function(){};
		
		objects.record_note_cont.visible=true;
		keyboard.close();
		
		objects.quiz_cont.visible=false;

		
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
		
		if (objects.cat_menu_cont.ready === false)
			return;
		
		game_res.resources.click.sound.play();
		cat_menu.close();
		game.activate();
		
		
		
	},
	
	quiz_down:function() {
		
		if (objects.cat_menu_cont.ready === false)
			return;
		
		game_res.resources.click.sound.play();
		cat_menu.close();
		quiz.activate();
		
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

		anim3.add(objects.header0,['alpha'],[
		{time:0.0,val:[1]},
		{time:0.3,val:[0.5]},
		{time:0.2,val:[0.4]},
		{time:0.3,val:[0.7]},
		{time:0.5,val:[1]},
		{time:0.2,val:[0.4]},
		{time:0.3,val:[1]}]
		,0,1);	

	},
	
	next_down : async () => {
		
		if (objects.main_buttons_cont.ready === false)
			return;
		game_res.resources.click.sound.play();
		
		main_menu.close();		
		await new Promise(resolve => setTimeout(resolve, 1000));	
		
		//если калибровка не пройдена то проходим ее
		if (calibration.finished === 0)
			await calibration.start();		
		
		//запускаем меню выбора категории
		cat_menu.activate();
		
	},
	
	lb_down : async () => {
		
		if (objects.main_buttons_cont.ready === false)
			return;
		game_res.resources.click.sound.play();
		
		main_menu.close();
		lb.activate();	
		
	},
	
	rules_button_down : async () => {
		
		
		if (objects.main_buttons_cont.ready === false)
			return;
		game_res.resources.click.sound.play();
		
		main_menu.close();
		rules.activate();	
		
		
	},
	
	instruments_button_down : async () => {
		
		
		if (objects.main_buttons_cont.ready === false)
			return;
		game_res.resources.click.sound.play();
		
		await main_menu.close();
		instruments_dialog.activate();		
	},
	
	close : async () => {
		await Promise.all([			
			anim2.add(objects.main_buttons_cont,{y:[objects.main_buttons_cont.sy,800]}, false, 1,'easeInBack'),
			anim2.add(objects.header0,{y:[objects.header0.y,-400]}, false, 1,'easeInBack')		
		]);
	}
	
}

