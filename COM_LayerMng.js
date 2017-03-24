// AUTHOR       : 유경수
// CREATE DATE  : 2017-03-23
// DESCRIPTION  : 재사용 가능한 컨펌 레이어 
// HISTORY      : 
// 2017-03-24 유경수 - 레이어를 한화면에 여러개 띄울 감안하고 재 작성
// 2017-03-24 유경수 - confirm_title , confirm 항목을 하나의 오브젝트로 바꿈
// 2017-03-24 유경수 - html을 ajax로 가져오는 로직 삭제 , 텍스트로 html을 갖고있는다.

// ###################################### 
// 사용법 
// ###################################### 
// 1. HTML 
//  1) div / span 등 임의의 타입으로 html element를 원하는 
//     위치에 작성 후 id 값을 줌 (target으로 사용됨)
// 2. js
//  1) window['__LayerMng'].init(name , opt) 함수로 레이어를 
//     초기화, promise객체를 리턴한다. (option 명세 참고)
//  2) window['__LayerMng'].show(name) 함수로 레이어 출력

// ######################################
// 함수 명세 
// ######################################
// window['__LayerMng']
// .init(name , opt)            : 레이어를 초기화, promise객체를 리턴한다.
// .show(name)                  : 레이어를 출력
// .hide(name)                  : 레이어를 숨김 처리 
// .getObj(name)                : 해당 레이어의 객체를 가져옴
// .getDOM(name)                : 해당 레이어의 DOM 요소를 가져옴  

// ######################################
// option 명세 (* 표기된 항목은 필수값)
// ######################################
// title          * : string    레이어 제목
// content        * : html      레이어 내용
// target         * : string    덮어씌울 HTML요소의 ID
// confirm.text     : string    확인 버튼에 들어갈 문자열
// confirm.func   * : function  확인 버튼을 클릭했을때 실행되는 함수
// cancel.text      : string    취소 버튼에 들어갈 문자열
// cancel.func      : function  취소 버튼을 클릭했을때 실행되는 함수 
// onload           : function  init함수가 실행되고 난 뒤에 실행되는 함수 
// show             : function  레이어 보이기 처리 후 실행되는 함수 
// hide             : function  레이어 숨김 처리 후 실행되는 함수 
// css              : object    레이어 가장 바깥 부분의 CSS

// ## 유의 사항 
// - document가 모두 로드되고 렌더된 이후에 추가 함수가 실행되므로 비동기 처리시 주의

// 실행 예제 
/* 
    # HTML 
    <div id='layer1'></div> 
    # JS 
    // 초기화
    window['__LayerMng'].init('layer1' , {
        title : '레이어1번',
        content : '테스트테스트 <br/> 테스트테스트<br/>테스트',
        target : 'layer1',
        onload : function(){ console.log("[layer1] loaded") },
        confirm : {
            text : '확인',
            func : function(){ console.log('[layer1] confirmed'); }
        },
        cancel : {
            text : '취소',
            func : function(){ console.log('[layer2] canceled'); }
        },
        show : function(){ console.log('[layer1] show') },
        hide : function(){ console.log('[layer1] hide') },
        css : {
            "width" : "394px",
            "height" : "350px",
            "border" : "3px solid #42b7f6",
            "top"  : '50%',
            'left' : '50%',
            'margin-top' : '-175px',
            'margin-left' : '-197px',
            'position' : 'fixed'
        }
    })
    .then(function(){
        console.log('레이어 만들기 종료 !!!');
    });

    // 보여주기
    window['__LayerMng'].show('layer1');
*/

// 내부용 isblank함수 추가 
(function($){
  $.isBlank = function(obj){
    return(!obj || $.trim(obj) === "");
  };  
})(jQuery);

window['__LayerMng'] = {
    _url : './layer_layout.html',
    _layers : {},
    _mockup : { 
        _name : "",
        _ajax : {},
        _dom : {},
        _opt : {},
        _confirm : function(){ 
            if(!$.isFunction(this._opt['confirm']['func'])){
                throw new Error('확인 버튼을 눌렀을때 실행될 함수가 없습니다') 
            }
            this._opt['confirm']['func']();
            this.hide();
        },
        _cancel : function(){ 
            if($.isFunction(this._opt['cancel']['func'])){
                this._opt['cancel']['func']();
            }
            this.hide();
        },
        _generate : function(){
            if($.isBlank(this._opt['target'])){ throw new Error('대상 객체의 아이디가 없습니다') }
            if($.isBlank(this._opt['title'])){ throw new Error('대상 객체의 아이디가 없습니다') }
            if($.isBlank(this._opt['content'])){ throw new Error('레이어 내용이 공백입니다') }

            if(!$('#' + this._opt['target']).length){ throw new Error('대상 객체가 없습니다.') }

            this._dom.hide();
            
            this._dom.find('[id*=_title]').text(this._opt.title);
            this._dom.find('[id*=_desc]').html(this._opt.content);

            if(!$.isBlank(this._opt['confirm']['text'])){
                this._dom.find('[id*=__LayerMng_confirm]').text(this._opt['confirm']['text']);
            }
            if(!$.isBlank(this._opt['cancel']['text'])){
                this._dom.find('[id*=__LayerMng_cancel]').text(this._opt['cancel']['text']);
            }

            if(!$.isEmptyObject(this._opt.css)){
                for(key in this._opt.css){ this._dom.css(key , this._opt.css[key]); }
            }

            // html요소들 id를 변경 
            this._dom.attr('id' ,  "__" + this._name)
            this._dom.find('[id*=_title]').attr('id' , '__' + this._name + '_title'); 
            this._dom.find('[id*=_desc]').attr('id' ,  '__' + this._name + 'desc') 
            this._dom.find('[id*=__LayerMng_confirm]')
                .attr('id' , '__' + this._name + '_cancel')
                .click(this._confirm.bind(this))
            this._dom.find('[id*=__LayerMng_cancel]')
                .attr('id' , '__' + this._name + '__LayerMn_confirm')
                .click(this._cancel.bind(this))
            
            // document가 준비된 다음에 실행될 수 있으므로 해당함수 실행시 
            // document ready 함수로 감싸야
            $("#" + this._opt.target).replaceWith(this._dom);
        },
        // _init : function(opt){
        //     this._opt = opt;
        //     this._ajax = $.get({
        //         url : window['__LayerMng']._url,
        //         context : this
        //     })
        //     .done(function(dom){
        //         this._dom = $(dom);
        //         this._generate();
                
        //         if($.isFunction(this._opt['onload'])){
        //             this._opt['onload']();
        //         }
        //     })
        //     .fail(function(){
        //         throw new Error('레이아웃 html 파일의 위치를 확인해주세요 : [' + window['__LayerMng']._url + "]");
        //     });

        //     return this._ajax;
        // },
        _init : function(opt){
            var self = this;
            return $.Deferred(function(dfd){
                self._opt = opt;
                self._generate();
                if($.isFunction(self._opt[onload])){
                    self._opt['onload']()
                }
                dfd.resolve();
            })
        },
        show : function(){ 
            if(this._dom.is(":visible")){ console.log('['+ this._name +'] 레이어는 이미 열려있습니다'); return; }
            if($.isFunction(this._opt['show'])){
                this._opt['show']();
            }
            
            this._dom.show(); 
        },
        hide : function(){ 
            if(!this._dom.is(":visible")){ console.log('['+ this._name +'] 레이어는 이미 닫혀있습니다'); return; }
            if($.isFunction(this._opt['hide'])){
                this._opt['hide']();
            }
            this._dom.hide(); 
        }
    },
    getObj : function(name){ return this._layers[name] },
    getDOM : function(name){ return this._layers[name]._dom },
    show : function(name) { 
        var __flag = true;
        for(key in this._layers){
            if(key != name && this.getDOM(key).is(':visible')){
                __flag = false;
                console.log('['+ key +'] 레이어가 이미 출력되어 있습니다. 먼저 닫아주세요.');
                break;
            }
        }
        if(__flag){ this._layers[name].show();  }
    },
    hide : function(name) { 
        // 이름이 없으면 열림 처리되어있는 모든 레이어를 닫아버림
        if($.isBlank(name)){ 
            for(key in this._layers){
                if(this.getDOM(key).is(':visible')){ this._layers[key].hide(); }
            }
        }
        else{
            this._layers[name].hide(); 
        }
        
    },
    init : function(name , opt , callback){
        if($.isBlank(opt['title'])){     throw new Error('레이어 제목이 없습니다.') }
        if($.isBlank(opt['content'])){   throw new Error('레이어 내용이 없습니다.') }
        if($.isBlank(opt['target'])){    throw new Error('레이어 생성 대상이 없습니다.') }
        if($.isEmptyObject(opt['confirm'])){ throw new Error('확인 버튼 관련 객체가 없습니다.') }
        if(!$.isFunction(opt['confirm']['func'])){ throw new Error('확인 버튼 클릭시 실행될 함수가 없습니다.') }
        
        if($.isBlank(name)){ throw new Error('레이어 이름이 없습니다.') }

        for(key in this._layers){ 
            if(key == name){
                throw new Error('이미 존재하는 레이어 이름입니다.')
            } 
        }

        // 내용을 참조하지 않고 복사함
        this._layers[name] = jQuery.extend({} , window['__LayerMng']._mockup);
        this._layers[name]._name = name;

        return $.Deferred(function(dfd){
            //var self = this;
            $(document).ready(function(){
                window['__LayerMng']._layers[name]._init(opt)
                .done(function(){
                    dfd.resolve();
                })
            })
        })
    }
}

// html을 직접 텍스트로 만들어준다.
window['__LayerMng']._mockup._dom = $('<div id="__LayerMng" class="session_1" style=" max-width:394px; height:350px; border:3px solid #42b7f6; background-color: #fff;"><h1 id="__LayerMng_title" style="width:200px; height:30px; text-align:center; margin:auto; margin-bottom:40px; margin-top:40px;color:#0cacff; font-size:2.5em; letter-spacing:-2px; padding-bottom:10px; border-bottom:1px solid #0cacff;">세션종료안내</h1><p id="__LayerMng_desc" style="font-size:1.2em; letter-spacing:-1px; text-align:center; margin-bottom:10%;">일정 시간 동안 홈페이지 이용이 확인되지 않아 <br/>로그아웃 처리됩니다. <br/><br/>로그인 상태를 유지하시겠습니까?</p><div class="session_bt" style="width:100%; height:30%;margin:auto"><div style="width:80%; height:50%; margin:auto; text-align:center "><div style="width:48%; height:52px; background-color:#d4d4d4; border-radius:60px; float:left; margin-right:4%"><a id="__LayerMng_cancel" href="#" style="width:100%; height:100%; text-align:center; line-height: 52px; margin:auto; display:block; font-size:1.1em; font-weight:bold;">취소</a></div><div style="width:48%; height:52px; background-color:#42b7f6; border-radius:60px; float:left;"><a id="__LayerMng_confirm" href="#" style="width:100%; height:100%; text-align:center; line-height: 52px; margin:auto; display:block; font-size:1.1em; font-weight:bold; color:#fff;">확인</a></div></div></div></div>')
